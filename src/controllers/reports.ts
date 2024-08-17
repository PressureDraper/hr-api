import { Response } from "express";
import tempfile from "tempfile";
import { PropsAttendancesInterface, PropsFormatoEstrategia, PropsReporteChecadas } from "../interfaces/reportsQueries";
import { formatAttendancesReport, getAttendancesReport, getEmployeeTypeQuery, headerListaChecadasExcel } from "../helpers/reportsQueries";
import exceljs from 'exceljs';
import path from 'path';
import puppeteer from "puppeteer";
import format from 'string-template';
import fs from 'fs';
import { htmlParams, templateEstrategia } from "../helpers/reportsHelpers";

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
        //load html template (just for editing template with)
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
