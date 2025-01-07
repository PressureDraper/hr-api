import { Response } from "express";
import tempfile from "tempfile";
import { PropsAttendancesInterface, PropsFormatoEstrategia, PropsReporteChecadas } from "../interfaces/reportsQueries";
import { calculateQuint, formatAttendancesReport, getAttendancesReport, getEmployeeTypeQuery, getFirmaById, getIMSSN420Employees, headerListaChecadasExcel } from "../helpers/reportsQueries";
import exceljs from 'exceljs';
import path from 'path';
import puppeteer from "puppeteer";
import format from 'string-template';
import fs from 'fs';
import _ from 'lodash';
import { addIncidents, debugWorkingDays, filterByTimeRange, getAllApartments, htmlParams, parseIncidents, parseWorkingDays, templateEstrategia } from "../helpers/reportsHelpers";
import { imsReportMainContent } from "../assets/ims/mainContent";
import moment from "moment";
import { imsWrapperReportContent } from "../assets/ims/wrapperContentIms";
import { getAttendanceClassify } from "../helpers/attendanceClassify";
import { getRangeHolidaysQuery } from "../helpers/holidaysQueries";

export const getExcelChecadas = async (req: any, res: Response) => {
    try {
        const params: PropsReporteChecadas = req.query;

        const attendancesReport: PropsAttendancesInterface = await getAttendancesReport(params.mat_inicio, params.mat_final, params.fec_inicio, params.fec_final);

        const employeesType: any = await getEmployeeTypeQuery(params);

        const attendancesDiff: any = formatAttendancesReport(attendancesReport.attendances, employeesType);

        const workBook = new exceljs.Workbook();
        const workSheet = workBook.addWorksheet(`CHECADAS ${params.mat_inicio} - ${params.mat_final}`);
        workSheet.columns = headerListaChecadasExcel;

        //map rows to excel sheet
        attendancesDiff.map((attendance: any) => workSheet.addRow(attendance));

        // WorkSheet styles
        workSheet.getRow(1).eachCell((cel) => cel.font = { bold: true, });
        workSheet.getColumn('A').alignment = { horizontal: 'left' };
        workSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ffffff08' }
        }

        const tempFileXlsPath = tempfile('.xlsx');

        await workBook.xlsx.writeFile(tempFileXlsPath);
        res.sendFile(tempFileXlsPath);
    }

    catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const getPdfEstrategia = async (req: any, res: Response) => {
    try {
        //load html template (just for editing template with formatting helpers)
        /* const dir = path.join(__dirname, '../../src/assets/templateEstrategia.html'); */

        //get params from front-end
        const stringParams: any = req.query;
        const params: PropsFormatoEstrategia = JSON.parse(decodeURIComponent(stringParams.encodedURI));

        //get params to substitute inside html template
        const templateParams = htmlParams(params);

        const browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
        });

        const page = await browser.newPage();

        //get html template loading params
        /* const template = format(fs.readFileSync(dir, 'utf8'), templateParams); */ //(just for editing template with formatting helpers)
        const template = format(templateEstrategia, templateParams);

        await page.setContent(template);
        const pdfBuffer = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: {
                top: 10,
                left: 20,
                right: 20
            },
            scale: 0.95
        });

        await browser.close();

        res.contentType("application/pdf");
        res.send(pdfBuffer);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: err
        });
    }
}

export const generareReportIms = async (req: any, res: Response) => {
    try {
        const { mat_final, mat_inicio, fec_final, fec_inicio, tipo_empleado }: PropsReporteChecadas = req.query;
        const fecha_ini = fec_inicio;
        const fecha_fin = fec_final;
        const attendancesReport: PropsAttendancesInterface = await getAttendancesReport(mat_inicio, mat_final, fec_inicio, fec_final);
        const employeesType: any = await getIMSSN420Employees({ mat_final, mat_inicio, fec_final, fec_inicio, tipo_empleado });
        const grouped_attendeances = _.groupBy(attendancesReport.attendances, 'mat');
        const quin = calculateQuint(fec_inicio, fec_final);
        const ids_employees = employeesType.map((item: any) => item.id);
        const incidences = await addIncidents(ids_employees, fec_inicio, fec_final);
        const festivos = await getRangeHolidaysQuery({ fecha_ini, fecha_fin });
        const deparments = employeesType.map((item: any) => item['cat_departamentos']['nombre']);
        const bossByAppartment = await getAllApartments(deparments);
        const firma1 = await getFirmaById(5);

        let employees = employeesType.map((employee: any) => {
            let { hora_entrada, hora_salida, matricula } = employee;
            const attendances = grouped_attendeances[employee.matricula] || [];
            const { nombre: aparment } = employee['cat_departamentos'] ?? {};

            hora_entrada = moment(hora_entrada).utc().format('HH:mm');
            hora_salida = moment(hora_salida).utc().format('HH:mm');
            let diff = moment.utc(moment(hora_salida, "HH:mm").diff(moment(hora_entrada, "HH:mm"))).hours();

            const grupByDate = _.groupBy(attendances, 'dateReg');

            let filteresAttendances: any = {};

            Object.keys(grupByDate).map(key => {
                const assistencedFiltered = filterByTimeRange(grupByDate[key], matricula);
                filteresAttendances = {
                    ...filteresAttendances,
                    [key]: assistencedFiltered

                }
            });

            let specialCases: any = [];
            let twoAttendances: any = [];

            Object.keys(filteresAttendances).map((key: string) => {
                if (filteresAttendances[key].length == 1) {
                    specialCases.push(filteresAttendances[key]);
                } else {
                    // This case is just when have 2 asistencias
                    twoAttendances.push(filteresAttendances[key]);
                }
            });

            const plainSpecialCases = specialCases.map((item: any) => {
                let plain = item.map((aux: any) => aux);
                return plain[0];
            });

            let finalSpecial: any = {};
            let finalIncidents: any = {};

            if (diff >= 12 && specialCases.length > 0) {
                let removeValue = null;
                // Horario de 12 horas
                const diff_first_element = moment.utc(moment(plainSpecialCases[0].horaReg, "HH:mm:ss").diff(moment(hora_entrada, "HH:mm"))).minutes();
                // TODO Validar si la diferencia es menor a 60 minutos y valida
                if (diff_first_element > 60) {
                    removeValue = plainSpecialCases.shift();
                }

                const groupPlainCases = _.chunk(plainSpecialCases, 2);
                if (removeValue) groupPlainCases.unshift([removeValue]);

                if (groupPlainCases.length > 0) {
                    groupPlainCases.map((item: any) => {
                        const [item1, item2] = item;
                        finalSpecial[item1['dateReg']] = [
                            item1,
                            item2
                        ]
                    });
                }
            } else {
                specialCases.map((item: any) => {
                    let [element] = item;
                    finalIncidents[element['dateReg']] = [
                        element,
                        undefined
                    ];
                });
            }

            let finalAttendances: any = {
            }

            Object.keys(twoAttendances).map((key: any) => {
                finalAttendances = {
                    ...finalAttendances,
                    [key]: [
                        ...twoAttendances[key]
                    ]
                }
            })

            Object.keys(finalIncidents).map((key: any) => {
                finalAttendances = {
                    ...finalAttendances,
                    [key]: [
                        ...finalIncidents[key]
                    ]
                }
            })

            Object.keys(finalSpecial).map((key: any) => {
                finalAttendances = {
                    ...finalAttendances,
                    [key]: [
                        ...finalSpecial[key]
                    ]
                }
            })

            finalAttendances = Object.fromEntries(
                _.sortBy(Object.entries(finalAttendances), ([key]) => new Date(key))
            );

            //Proceso para añadir dias laborales que no tienen checadas dependiendo del turno del empleado
            //1. Obtener los dias laborales del empleado y parsearlos al rango seleccionado de los dias del mes
            const workingDays: string[] = JSON.parse(decodeURIComponent(employee.guardias));
            const parsedWorkingDays = parseWorkingDays(workingDays, fec_inicio, fec_final);

            //2. Eliminar festivos y dias donde ya haya checadas
            const debuggedDays = debugWorkingDays(parsedWorkingDays, festivos, finalAttendances);

            //3. Dar formato al array para anexarlo a finalAttendances
            const missingData = _.groupBy(debuggedDays, 'dateReg');
            finalAttendances = {
                ...finalAttendances,
                ...missingData
            };

            //OrderyBy date ascendant - hotfix para permisos que aparecen hasta abajo de tabla sin respetar el orden cronologico
            let finalfinalAttendances = {};
            const allItems = _.values(finalAttendances);
            const sortedData = _.sortBy(allItems, item => new Date(item[0].dateReg));

            sortedData.map((item: any) => {
                finalfinalAttendances = {
                    ...finalfinalAttendances,
                    [item[0].dateReg]: [
                        ...item
                    ]
                }
            });

            return {
                ...employee,
                attendances,
                diff,
                hora_entrada,
                hora_salida,
                final: finalfinalAttendances,
                incidences: incidences[employee.id] || {},
                boss: bossByAppartment[aparment] || ''
            }
        });

        let mainContent = '';

        employees.map((item: any) => {
            const { id, matricula = 0, guardias = '', hora_entrada, hora_salida, cmp_persona = {}, cat_turnos = {}, boss: jefe, cat_departamentos = {}, attendances = {}, cat_tipos_empleado = {}, final = {}, incidences = {}, cat_tipos_recurso = {} } = item || {};
            const { nombres = '', primer_apellido = '', segundo_apellido = '', rfc = '', curp = '' } = cmp_persona;
            const { nombre: name_apartment = '' } = cat_departamentos || {};
            const { nombre: name_turn = '' } = cat_turnos;
            const { nombre: name_cat = '' } = cat_tipos_empleado;
            const { nombre: name_recurso = '' } = cat_tipos_recurso;
            let guard = JSON.parse(guardias) || [];
            guard = guard.join(', ');

            let body = '<tbody style="font-size: 12px;">';

            Object.keys(final).map((key: any) => {
                let [item1, item2] = final[key]; //CHECADAS ENTRADA=ITEM1 SALIDA=ITEM2
                let dateItem1 = moment.utc(new Date(item1['dateReg'])).format('DD/MM/YYYY');// CAMPO FECHA

                body += `
                <tr>
                    <td>${matricula}</td>
                    <td>${nombres} ${primer_apellido} ${segundo_apellido}</td>
                    <td>${name_cat}</td>
                    <td>${rfc}</td>
                    <td>${hora_entrada} - ${hora_salida}</td>
                    <td>${guard}</td>
                    <td>${dateItem1}</td>
                    <td>${item1['horaReg']}</td>
                    <td>${''}</td>
                    <td>${parseIncidents(incidences, dateItem1)}</td>
                </tr>
                `;

                if (item2) {
                    let dateItem2 = moment.utc(new Date(item2['dateReg'])).format('DD/MM/YYYY');
                    body += `
                    <tr>
                        <td>${matricula}</td>
                        <td>${nombres} ${primer_apellido} ${segundo_apellido}</td>
                        <td>${name_cat}</td>
                        <td>${rfc}</td>
                        <td>${hora_entrada} - ${hora_salida}</td>
                        <td>${guard}</td>
                        <td>${dateItem2}</td>
                        <td>${''}</td>
                        <td>${item2['horaReg']}</td>
                        <td>${parseIncidents(incidences, dateItem2)}</td>
                    </tr>
                    `;
                }
            })

            body += '</tbody>';

            let content = format(imsReportMainContent, {
                name: `${nombres} ${primer_apellido} ${segundo_apellido}`,
                rfc: rfc,
                curp: curp,
                mat: `${matricula}`,
                nom: `${name_recurso}`,
                turno: name_turn,
                hour: `${hora_entrada} - ${hora_salida}`,
                guards: guard,
                cat: name_cat,
                booss: `${jefe}`.trim().length > 1 ? jefe : 'NO ESPECIFICADO',
                area: name_apartment,
                table_body: body,
                quince: quin,
                firma1: firma1
            });

            mainContent += content;
        });

        /* const dir = path.join(__dirname, '../../src/assets/ims/auc.html');

        const template = fs.readFileSync(dir, 'utf8'); */

        let final_content = format(imsWrapperReportContent, {
            all_content: mainContent,
            /* html_footer: template */
        });

        const browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setContent(final_content);

        const pdfBuffer = await page.pdf({
            format: 'Letter',
            landscape: true,
            printBackground: true,
            scale: 0.85,
            margin: {
                top: 10,
                right: 65
            }
        });

        await browser.close();

        res.contentType("application/pdf");
        res.send(pdfBuffer);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}

export const getIncidencias = async (req: any, res: Response) => {
    try {
        const data: { dateInit: string, dateFin: string, id: string } = req.query;
        const queryData = await getAttendanceClassify({ ...data });

        res.status(200).json({
            ok: true,
            msg: 'Ok',
            data: queryData
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Server error contact the administrator'
        });
    }
}
