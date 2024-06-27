import { Response } from "express";
import tempfile from "tempfile";
import { PropsAttendancesInterface, PropsReporteChecadas } from "../interfaces/reportsQueries";
import { formatAttendancesReport, getAttendancesReport, getEmployeeTypeQuery, headerListaChecadasExcel } from "../helpers/reportsQueries";
import exceljs from 'exceljs';

export const getExcelChecadas = async (req: any, res: Response) => {
    try {
        const params: PropsReporteChecadas = req.query;

        const attendancesReport: PropsAttendancesInterface = await getAttendancesReport(params.mat_inicio, params.mat_final, params.fec_inicio, params.fec_final);

        const employeesType: any = await getEmployeeTypeQuery(params);

        const attendancesDiff: any = formatAttendancesReport(attendancesReport.attendances, employeesType);

        /* const exceljs = (await import('exceljs')).default; */
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
