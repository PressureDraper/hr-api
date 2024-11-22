import { Response } from "express";
import tempfile from "tempfile";
import { PropsAttendancesInterface, PropsFormatoEstrategia, PropsReporteChecadas } from "../interfaces/reportsQueries";
import { calculateQuint, formatAttendancesReport, getAttendancesReport, getBosByAppartment, getEmployeeTypeQuery, headerListaChecadasExcel } from "../helpers/reportsQueries";
import exceljs from 'exceljs';
import path from 'path';
import puppeteer from "puppeteer";
import format from 'string-template';
import fs from 'fs';
import _, { first } from 'lodash';
import { htmlParams, templateEstrategia } from "../helpers/reportsHelpers";
import { imsReportMainContent } from "../assets/ims/mainContent";
import moment from "moment";
import { imsWrapperReportContent } from "../assets/ims/wrapperContentIms";
import {v4 as uuid} from 'uuid';
import { execFile } from 'child_process';


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
                bottom: 10,
                left: 20,
                right: 20
            }
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
        const { mat_final, mat_inicio, fec_final, fec_inicio, tipo_empleado } : PropsReporteChecadas = req.query;
        const attendancesReport: PropsAttendancesInterface = await getAttendancesReport(mat_inicio, mat_final, fec_inicio, fec_final);
        const employeesType: any = await getEmployeeTypeQuery({ mat_final, mat_inicio, fec_final, fec_inicio, tipo_empleado });
        const grouped_attendeances = _.groupBy(attendancesReport.attendances, 'mat');
        const arrPromises: any = [];
        const quin = calculateQuint(fec_inicio, fec_final);
        let employees = employeesType.map((employee: any) => {
            const attendances = grouped_attendeances[employee.matricula] || [];
            const {nombre} = employee['cat_departamentos'] ?? {};
            arrPromises.push(getBosByAppartment(nombre));
            return {
                ...employee,
                attendances,
            }
        });

        const boos = await Promise.all(arrPromises);
        employees =  employees.map((employee: any, i: number) => {
            return {
                ...employee,
                jefe: boos[i]
            }
        });

        let mainContent = '';

        employees.map((item: any) => {
            const {matricula = 0, guardias = '', hora_entrada, hora_salida, cmp_persona = {}, cat_turnos = {}, jefe, cat_departamentos = {}, attendances = {}, cat_tipos_empleado = {}} = item || {};
            const {nombres = '', primer_apellido = '', segundo_apellido = '', rfc = '', curp = ''} = cmp_persona;
            const {nombre: name_apartment = ''} = cat_departamentos || {};
            const {nombre: name_turn = ''} = cat_turnos;
            const {nombre: name_cat = ''} = cat_tipos_empleado;
            let guard = JSON.parse(guardias) || [];
            guard = guard.join(', ');

            let body = '<tbody style="font-size: 12px;">';

            let groupByDate : any = _.groupBy(attendances, 'dateReg');

            let fistArray: any = [];
            Object.keys(groupByDate).map((key: any) => {
                const attendances = groupByDate[key];
                fistArray.push(attendances[0]);
                
            });
            fistArray = _.chunk(fistArray, 2);

            fistArray.map((item: any) => {
                body += `
                <tr>
                    <td>${matricula}</td>
                    <td>${nombres} ${primer_apellido} ${segundo_apellido}</td>
                    <td>${name_cat}</td>
                    <td>${rfc}</td>
                    <td>${moment(hora_entrada).format('hh:ss')} - ${moment(hora_salida).format('hh:ss')}</td>
                    <td>${guard}</td>
                    <td>${moment.utc(new Date(item[0]['dateReg'])).format('DD/MM/YYYY')}</td>
                    <td>${item[0]['horaReg']}</td>
                    <td>${''}</td>
                    <td></td>
                </tr>
                `;

                if(item[1]) {
                    body += `
                    <tr>
                        <td>${matricula}</td>
                        <td>${nombres} ${primer_apellido} ${segundo_apellido}</td>
                        <td>${name_cat}</td>
                        <td>${rfc}</td>
                        <td>${moment(hora_entrada).format('hh:ss')} - ${moment(hora_salida).format('hh:ss')}</td>
                        <td>${guard}</td>
                        <td>${moment.utc(new Date(item[1]['dateReg'])).format('DD/MM/YYYY')}</td>
                        <td>${''}</td>
                        <td>${item[1]['horaReg']}</td>
                        <td></td>
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
                nom: 'BASIFICADO E201',
                turno: name_turn,
                hour: `${moment(hora_entrada).format('hh:ss')} - ${moment(hora_salida).format('hh:ss')}`,
                guards: guard,
                cat: name_cat,
                booss: `${jefe}`.trim().length > 1 ? jefe : '____________________',
                area: name_apartment,
                table_body: body,
                quince: quin
            });

            mainContent += content;
        });

        let final_content = format(imsWrapperReportContent, {
            all_content: mainContent,
        });
        const browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
        });

        const page = await browser.newPage();

        await page.setContent(final_content);
        const pdfBuffer = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: {
                top: 10,
                bottom: 10,
                left: 20,
                right: 20
            },
            preferCSSPageSize: true,
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