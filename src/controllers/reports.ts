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
import { debugWorkingDays, getAllApartments, parseWorkingDays, isComingOrOut, classifyEventType, generateRow } from '../helpers/ImssReport';
import { imsReportMainContent } from "../assets/ims/mainContent";
import moment from "moment";
import { imsWrapperReportContent } from "../assets/ims/wrapperContentIms";
import { getRangeHolidaysQuery } from "../helpers/holidaysQueries";
import { getEmployeesPermissionsQuery } from "../helpers/permissionsQueries";
import { htmlParams, templateEstrategia } from "../helpers/strategyReport";

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
        const festivos = await getRangeHolidaysQuery({ fecha_ini, fecha_fin });
        const deparments = employeesType.map((item: any) => item['cat_departamentos']['nombre']);
        const bossByAppartment = await getAllApartments(deparments);
        const firma1 = await getFirmaById(5);

        const employees: any = await Promise.all(
            employeesType.map(async (employee: any) => {
                let { hora_entrada, hora_salida } = employee;
                const attendances = grouped_attendeances[employee.matricula] || [];
                const { nombre: aparment } = employee['cat_departamentos'] ?? {};
                const vacaciones: any = await getVacationIMSSReport(employee.id, fec_inicio, fec_final);
                const permisos: any = await getEmployeesPermissionsQuery({ employee_id: employee.id, fecha_ini: fec_inicio, fecha_fin: fec_final });
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

                //Proceso para añadir dias laborales que no tienen checadas dependiendo del turno del empleado
                //3. Obtener los dias laborales del empleado y parsearlos al rango seleccionado de los dias del mes
                const workingDays: string[] = JSON.parse(decodeURIComponent(employee.guardias));
                const parsedWorkingDays = parseWorkingDays(workingDays, fec_inicio, fec_final, festivos);

                //4. CLASIFICAR LA CHECADA DEPENDIENDO DEL EVENTO AGREGANDO LA PROPIEDAD 'EVENT'
                const classifiedAttendances = classifyEventType(endOutAttendances, vacaciones, permisos, employee, fec_inicio, fec_final, hora_entrada, parsedWorkingDays);

                //5. Eliminar festivos (aquellos que no laboran festivos), dias donde ya haya checadas y permisos asignados
                const debuggedDays = debugWorkingDays(parsedWorkingDays, festivos, classifiedAttendances, JSON.parse(decodeURIComponent(employee.guardias)));

                //6. finalmente ordenar el array ascendentemente por dateReg
                const sortedData = debuggedDays.sort((a: any, b: any) => new Date(a.dateReg).getTime() - new Date(b.dateReg).getTime());

                return {
                    ...employee,
                    hora_entrada,
                    hora_salida,
                    final: sortedData,
                    boss: bossByAppartment[aparment] || ''
                }
            })
        );

        let mainContent = '';

        employees.forEach((item1: any) => {
            let body = '<tbody style="font-size: 12px;">';

            item1.final.forEach((item2: any) => {
                body += generateRow(item1, item2);
            })

            body += '</tbody>';
            
            let content = format(imsReportMainContent, {
                name: `${item1.cmp_persona.nombres} ${item1.cmp_persona.primer_apellido} ${item1.cmp_persona.segundo_apellido}`,
                rfc: item1.cmp_persona.rfc,
                curp: item1.cmp_persona.curp,
                mat: `${item1.matricula}`,
                nom: `${item1.cat_tipos_recurso.nombre}`,
                turno: item1.cat_turnos.nombre,
                hour: `${item1.hora_entrada} - ${item1.hora_salida}`,
                guards: item1.guardias === 'null' ? '-' : JSON.parse(item1.guardias).join(', '),
                cat: item1.cat_tipos_empleado.nombre,
                area: item1.cat_departamentos.nombre,
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
