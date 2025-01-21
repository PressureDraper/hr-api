import { Response } from "express";
import tempfile from "tempfile";
import { PropsAttendancesInterface, PropsFormatoEstrategia, PropsReporteChecadas, PropsReporteIMSS } from "../interfaces/reportsQueries";
import { calculateQuint, formatAttendancesReport, getAttendancesReport, getEmployeeTypeQuery, getFirmaById, getIMSSN420Employees, getVacationIMSSReport, headerListaChecadasExcel } from "../helpers/reportsQueries";
import exceljs from 'exceljs';
import path from 'path';
import puppeteer from "puppeteer";
import format from 'string-template';
import fs from 'fs';
import _ from 'lodash';
import { addIncidents, debugWorkingDays, filterByTimeRange, getAllApartments, htmlParams, parseIncidents, parseWorkingDays, templateEstrategia, isComingOrOut, classifyEventType } from '../helpers/reportsHelpers';
import { imsReportMainContent } from "../assets/ims/mainContent";
import moment from "moment";
import { imsWrapperReportContent } from "../assets/ims/wrapperContentIms";
import { getAttendanceClassify } from "../helpers/attendanceClassify";
import { getRangeHolidaysQuery } from "../helpers/holidaysQueries";
import { getEmployeesPermissionsQuery } from "../helpers/permissionsQueries";

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
        const { mat_final, mat_inicio, fec_final, fec_inicio }: PropsReporteIMSS = req.query;
        const fecha_ini = fec_inicio;
        const fecha_fin = fec_final;
        const attendancesReport: PropsAttendancesInterface = await getAttendancesReport(mat_inicio, mat_final, fec_inicio, fec_final);
        const employeesType: any = await getIMSSN420Employees({ mat_final, mat_inicio, fec_final, fec_inicio });
        const grouped_attendeances = _.groupBy(attendancesReport.attendances, 'mat');
        const quin = calculateQuint(fec_inicio, fec_final);
        /* const ids_employees = employeesType.map((item: any) => item.id); */
        /* const incidences = await addIncidents(ids_employees, fec_inicio, fec_final); */
        const festivos = await getRangeHolidaysQuery({ fecha_ini, fecha_fin });
        let vacaciones: any = await getVacationIMSSReport(employeesType[0].id, fec_inicio, fec_final);
        const permisos: any = await getEmployeesPermissionsQuery({ employee_id: employeesType[0].id, fecha_ini: fec_inicio, fecha_fin: fec_final });
        const deparments = employeesType.map((item: any) => item['cat_departamentos']['nombre']);
        const bossByAppartment = await getAllApartments(deparments);
        const firma1 = await getFirmaById(5);

        let employees = employeesType.map((employee: any) => {
            let { hora_entrada, hora_salida, matricula } = employee;
            const attendances = grouped_attendeances[employee.matricula] || [];
            const { nombre: aparment } = employee['cat_departamentos'] ?? {};
            hora_entrada = moment(hora_entrada).utc().format('HH:mm:ss');
            hora_salida = moment(hora_salida).utc().format('HH:mm:ss');

            //1. OBTENER DE LAS CHECADAS LA PRIMERA DE CADA HORA EN CADA DIA
            // Agrupar los elementos por la fecha (sin la hora)
            const groupedByDate = _.groupBy(attendances, (item) => new Date(item.dateReg).toDateString());

            // Obtener la primer checada de cada hora dentro de cada grupo de fecha
            const result = _.flatMap(groupedByDate, (items) => {
                return _.uniqBy(items, (item) => item.horaReg.split(':')[0]); // Filtrar por hora única
            });

            //2. CLASIFICAR CADA CHECADA COMO ENTRADA O SALIDA AGREGANDO LA PROPIEDAD 'TYPE' AL OBJETO
            const endOutAttendances = isComingOrOut(hora_entrada, result, employee);

            //3. CLASIFICAR LA CHECADA DEPENDIENDO DEL EVENTO AGREGANDO LA PROPIEDAD 'EVENT'
            const classifiedAttendances = classifyEventType(endOutAttendances, vacaciones, permisos, employee, fec_inicio, fec_final, hora_entrada);

            let finalAttendances = {
                '0': [
                    {
                        biometric: 1,
                        dateReg: 'Sun, 22 Dec 2024 00:00:00 GMT',
                        horaReg: '01:00:04',
                        mat: 5492,
                        hora: 1,
                        min: 0
                    },
                    {
                        biometric: 1,
                        dateReg: 'Sun, 22 Dec 2024 00:00:00 GMT',
                        horaReg: '13:14:36',
                        mat: 5492,
                        hora: 13,
                        min: 14
                    }
                ],
                '1': [
                    {
                        biometric: 1,
                        dateReg: 'Sun, 29 Dec 2024 00:00:00 GMT',
                        horaReg: '01:00:07',
                        mat: 5492,
                        hora: 1,
                        min: 0
                    },
                    {
                        biometric: 7,
                        dateReg: 'Sun, 29 Dec 2024 00:00:00 GMT',
                        horaReg: '13:23:25',
                        mat: 5492,
                        hora: 13,
                        min: 23
                    }
                ],
                'Mon, 16 Dec 2024 00:00:00 GMT': [
                    null,
                    {
                        biometric: 1,
                        dateReg: 'Mon, 16 Dec 2024 00:00:00 GMT',
                        horaReg: '01:00:21',
                        mat: 5492,
                        hora: 1,
                        min: 0
                    }
                ],
                'Sat, 21 Dec 2024 00:00:00 GMT': [
                    {
                        biometric: 7,
                        dateReg: 'Sat, 21 Dec 2024 00:00:00 GMT',
                        horaReg: '13:14:59',
                        mat: 5492,
                        hora: 13,
                        min: 14
                    },
                    {
                        biometric: 1,
                        dateReg: 'Mon, 23 Dec 2024 00:00:00 GMT',
                        horaReg: '01:03:43',
                        mat: 5492,
                        hora: 1,
                        min: 3
                    }
                ],
                'Sat, 28 Dec 2024 00:00:00 GMT': [
                    {
                        biometric: 1,
                        dateReg: 'Sat, 28 Dec 2024 00:00:00 GMT',
                        horaReg: '12:57:46',
                        mat: 5492,
                        hora: 12,
                        min: 57
                    },
                    {
                        biometric: 1,
                        dateReg: 'Mon, 30 Dec 2024 00:00:00 GMT',
                        horaReg: '01:00:04',
                        mat: 5492,
                        hora: 1,
                        min: 0
                    }
                ]
            }


            //Proceso para añadir dias laborales que no tienen checadas dependiendo del turno del empleado
            //SOLO SE NECESITA finalAttendances
            //4. Obtener los dias laborales del empleado y parsearlos al rango seleccionado de los dias del mes
            const workingDays: string[] = JSON.parse(decodeURIComponent(employee.guardias));
            const parsedWorkingDays = parseWorkingDays(workingDays, fec_inicio, fec_final, festivos);

            //5. Eliminar festivos (aquellos que no laboran festivos), dias donde ya haya checadas y permisos asignados
            const debuggedDays = debugWorkingDays(parsedWorkingDays, festivos, classifiedAttendances, JSON.parse(decodeURIComponent(employee.guardias)));

            console.log(classifiedAttendances, debuggedDays);

            //6. Dar formato al array para anexarlo a finalAttendances
            /* const missingData = _.groupBy(debuggedDays, 'dateReg');
            finalAttendances = {
                ...finalAttendances,
                ...missingData
            }; */

            //OrderyBy date ascendant - hotfix para permisos que aparecen hasta abajo de tabla sin respetar el orden cronologico
            let finalfinalAttendances = {};

            const allItems = _.values(finalAttendances);

            const sortedData = _.sortBy(allItems, item => {
                return item[0] ? new Date(item[0].dateReg) : new Date(item[1]!.dateReg);
            });

            sortedData.map((item: any) => {
                const date = item[0] ? item[0].dateReg : item[1].dateReg;
                finalfinalAttendances = {
                    ...finalfinalAttendances,
                    [date]: [
                        ...item
                    ]
                }
            });

            //TO DO: give better format to attendance object this way:
            /* {
                biometric: 1,
                dateReg: 'Sun, 01 Dec 2024 00:00:00 GMT',
                horaReg: '01:04:32',
                type: 'ENTRADA', //OR SALIDA
                event: INCIDENCIA, //OR ANY PERMISSION
                mat: 5492
            } */

            //THIS IS FINALFINALATTENDANCES
            /* {
                'Sun, 01 Dec 2024 00:00:00 GMT': [
                  {
                    biometric: 1,
                    dateReg: 'Sun, 01 Dec 2024 00:00:00 GMT',
                    horaReg: '01:04:32',
                    mat: 5492,
                    hora: 1,
                    min: 4
                  },
                  {
                    biometric: 7,
                    dateReg: 'Sun, 01 Dec 2024 00:00:00 GMT',
                    horaReg: '13:22:00',
                    mat: 5492,
                    hora: 13,
                    min: 22
                  }
                ],
                'Mon, 02 Dec 2024 00:00:00 GMT': [
                  null,
                  {
                    biometric: 1,
                    dateReg: 'Mon, 02 Dec 2024 00:00:00 GMT',
                    horaReg: '01:02:10',
                    mat: 5492,
                    hora: 1,
                    min: 2
                  }
                ],
                'Sat, 07 Dec 2024 00:00:00 GMT': [
                  {
                    biometric: 7,
                    dateReg: 'Sat, 07 Dec 2024 00:00:00 GMT',
                    horaReg: '13:10:40',
                    mat: 5492,
                    hora: 13,
                    min: 10
                  },
                  {
                    biometric: 1,
                    dateReg: 'Mon, 09 Dec 2024 00:00:00 GMT',
                    horaReg: '01:05:32',
                    mat: 5492,
                    hora: 1,
                    min: 5
                  }
                ],
                'Sun, 08 Dec 2024 00:00:00 GMT': [
                  {
                    biometric: 1,
                    dateReg: 'Sun, 08 Dec 2024 00:00:00 GMT',
                    horaReg: '01:02:57',
                    mat: 5492,
                    hora: 1,
                    min: 2
                  },
                  {
                    biometric: 1,
                    dateReg: 'Sun, 08 Dec 2024 00:00:00 GMT',
                    horaReg: '13:16:41',
                    mat: 5492,
                    hora: 13,
                    min: 16
                  }
                ],
                'Sat, 14 Dec 2024 00:00:00 GMT': [
                  {
                    biometric: 7,
                    dateReg: 'Sat, 14 Dec 2024 00:00:00 GMT',
                    horaReg: '13:14:59',
                    mat: 5492,
                    hora: 13,
                    min: 14
                  },
                  {
                    biometric: 1,
                    dateReg: 'Mon, 16 Dec 2024 00:00:00 GMT',
                    horaReg: '01:00:21',
                    mat: 5492,
                    hora: 1,
                    min: 0
                  }
                ],
                'Sun, 15 Dec 2024 00:00:00 GMT': [
                  {
                    biometric: 1,
                    dateReg: 'Sun, 15 Dec 2024 00:00:00 GMT',
                    horaReg: '01:05:18',
                    mat: 5492,
                    hora: 1,
                    min: 5
                  },
                  {
                    biometric: 7,
                    dateReg: 'Sun, 15 Dec 2024 00:00:00 GMT',
                    horaReg: '13:13:23',
                    mat: 5492,
                    hora: 13,
                    min: 13
                  }
                ]
              } */

            return {
                ...employee,
                hora_entrada,
                hora_salida,
                final: finalfinalAttendances,
                boss: bossByAppartment[aparment] || ''
            }
        });

        let mainContent = '';

        employees.map((item: any) => {
            const { matricula = 0, guardias = '', hora_entrada, hora_salida, cmp_persona = {}, cat_turnos = {}, boss: jefe, cat_departamentos = {}, cat_tipos_empleado = {}, final = {}, incidences = {}, cat_tipos_recurso = {} } = item || {};
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

                if (item1) {
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
                        <td>${''}</td>
                    </tr>
                    `;
                }

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
                        <td>${''}</td>
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
