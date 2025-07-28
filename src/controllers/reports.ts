import { Response } from "express";
import tempfile from "tempfile";
import { PropsAttendancesInterface, PropsChecadasEstrategias, PropsFormatoEstrategia, PropsPersonSign, PropsReporteChecadas, PropsReqIMSS } from "../interfaces/reportsQueries";
import { calculateQuint, formatAttendancesReport, getAttendancesReport, getEmployeeTypeQuery, getIMSSN420Employees, getVacationIMSSReport, headerListaChecadasExcel } from "../helpers/reportsQueries";
import exceljs from 'exceljs';
import puppeteer from "puppeteer";
import format from 'string-template';
import _, { parseInt } from 'lodash';
import { debugWorkingDays, parseWorkingDays, isComingOrOut, classifyEventType, generateRow, getEmployeeDataPerDateRange, getUnrepeatedAttendances, getAttendancesPerPermissionDateRange } from '../helpers/ImssReport';
import { imsReportMainContent } from "../assets/ims/mainContent";
import moment from "moment";
import { imsWrapperReportContent } from "../assets/ims/wrapperContentIms";
import { getRangeHolidaysQuery } from "../helpers/holidaysQueries";
import { SignService } from './presentation/services/sign.service';
import { getEmployeesPermissionsQuery, getLastFoliumFromYear, getStrategiesInfoPerId } from "../helpers/permissionsQueries";
import { htmlParams, htmlParamsIMSS, templateEstrategia, templateEstrategiaIMSS } from "../helpers/strategyReport";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import { sello_cae } from "../helpers/images";
import { getEmployeeShiftQuery } from "../helpers/employeesQueries";
import { parse } from "dotenv";
import fs from 'fs';
import path from "path";

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

export const testPDF = async (req: any, res: Response) => {
    try {
        //load html template (just for editing template with formatting helpers)
        /* const dir = path.join(__dirname, '../../src/assets/templateEstrategia.html'); */

        //get params to substitute inside html template
        const browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
        });

        const page = await browser.newPage();

        // Construir la ruta absoluta del archivo HTML
        const filePath = path.join(__dirname, '..', 'assets', 'templateEstrategiaIMSS.html');
        const htmlString = fs.readFileSync(filePath, 'utf8');

        const template = format(htmlString);

        await page.setContent(template);
        const pdfBuffer = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: {
                top: 20,
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

export const getPdfEstrategia = async (req: any, res: Response) => { //func para generar estrategia cuando se captura desde PERMISOS
    try {
        //load html template (just for editing template with formatting helpers)
        /* const dir = path.join(__dirname, '../../src/assets/templateEstrategia.html'); */

        //get params from front-end
        const stringParams: any = req.query;
        let params: PropsFormatoEstrategia = JSON.parse(decodeURIComponent(stringParams.encodedURI));

        //get last folium captured from table to update pdf report
        const permissionYear = moment.utc(params.dateInit.split('-')[0]).toISOString();
        const permissionNextYear = (parseInt(permissionYear) + 1).toString();
        let foliumList: any = await getLastFoliumFromYear(permissionYear, permissionNextYear, { id: 'desc' }, params.titular.cat_tipos_empleado.nombre);
        params.folium = (foliumList[0].folio).toString(); //update folium

        let templateParams: any = {};
        let template: string = '';

        //get params to substitute inside html template
        if (params.titular.cat_tipos_empleado.nombre === 'BASE IMSS BIENESTAR') {
            templateParams = await htmlParamsIMSS(params);
            template = format(templateEstrategiaIMSS, templateParams);
        } else {
            templateParams = htmlParams(params);
            template = format(templateEstrategia, templateParams);
        }

        //get html template loading params
        /* const template = format(fs.readFileSync(dir, 'utf8'), templateParams); */ //(just for editing template with formatting helpers)

        const browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
        });

        const page = await browser.newPage();

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

export const printPdfEstrategia = async (req: any, res: Response) => { //func para generar estrategia desde el apartado del calendario
    try {
        //get params from front-end
        const { id }: any = req.query;
        const params: PropsFormatoEstrategia = await getStrategiesInfoPerId(parseInt(id));
        let templateParams: any = {};
        let template: string = '';

        //get params to substitute inside html template
        if (params.titular.cat_tipos_empleado.nombre === 'BASE IMSS BIENESTAR') {
            templateParams = await htmlParamsIMSS(params);
            template = format(templateEstrategiaIMSS, templateParams);
        } else {
            templateParams = htmlParams(params);
            template = format(templateEstrategia, templateParams);
        }

        const browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
        });

        const page = await browser.newPage();

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
        const { mat_final, mat_inicio, fec_final, fec_inicio, id_rh, id_admin, id_director }: PropsReqIMSS = req.query;
        const fecha_ini = dayjs.utc(fec_inicio).subtract(1, 'day').format('YYYY-MM-DD');
        const fecha_fin = dayjs.utc(fec_final).add(1, 'day').format('YYYY-MM-DD');

        const attendancesReport: PropsAttendancesInterface = await getAttendancesReport(mat_inicio, mat_final, fecha_ini, fecha_fin);
        const employeesType: any = await getIMSSN420Employees({ mat_final, mat_inicio, fec_final, fec_inicio });
        const grouped_attendeances = _.groupBy(attendancesReport.attendances, 'mat');
        const quin = calculateQuint(fec_inicio, fec_final);
        const festivos = await getRangeHolidaysQuery({ fecha_ini, fecha_fin });

        const sings = new SignService();
        const id_rh_json: PropsPersonSign = JSON.parse(decodeURIComponent(id_rh));
        const id_admin_json: PropsPersonSign = JSON.parse(decodeURIComponent(id_admin));
        const id_director_json: PropsPersonSign = JSON.parse(decodeURIComponent(id_director));

        let firma1: any = await sings.getLastSingByUserId(id_rh_json.id_persona);
        let firma2: any = await sings.getLastSingByUserId(id_admin_json.id_persona);
        let firma3: any = await sings.getLastSingByUserId(id_director_json.id_persona);

        firma1 ? firma1 = firma1[0].firma : firma1 = '';
        firma2 ? firma2 = firma2[0].firma : firma2 = '';
        firma3 ? firma3 = firma3[0].firma : firma3 = '';

        let employees: any = await Promise.all(
            employeesType.map(async (employee: any) => {
                let { hora_entrada, hora_salida } = employee;
                const attendances = grouped_attendeances[employee.matricula] || [];
                const vacaciones: any = await getVacationIMSSReport(employee.id, fecha_ini, fecha_fin);
                const permisos: any = await getEmployeesPermissionsQuery({ employee_id: employee.id, fecha_ini: fecha_ini, fecha_fin: fecha_fin });
                const historial_horario: any = await getEmployeeShiftQuery(employee.id);
                let checadasSuplente: PropsChecadasEstrategias[] = [];

                //obtener checadas de suplentes en estrategias para empleados IMSS BIENESTAR
                //PENDIENTE: verificar falla en el reporte cuando le cambian el horario al suplente
                if (employee.cat_tipos_empleado.nombre === 'BASE IMSS BIENESTAR') {
                    const estrategias = permisos.filter((permiso: any) => permiso.cat_permisos.nombre === 'ESTRATEGIA' && permiso.rch_empleados_rch_permisos_id_suplenteTorch_empleados.matricula !== employee.matricula);
                    

                    if (estrategias.length > 0) {
                        checadasSuplente = await Promise.all(
                            estrategias.map(async (estrategia: any) => {
                                let nombre: string = estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.cmp_persona.nombres + ' ' + estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.cmp_persona.primer_apellido + ' ' + estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.cmp_persona.segundo_apellido;

                                const data = await getAttendancesReport(
                                    estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.matricula,
                                    estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.matricula,
                                    fecha_ini,
                                    fecha_fin
                                );

                                const substituteAttendances = getUnrepeatedAttendances(data.attendances);
                                const strategyAttendances = getAttendancesPerPermissionDateRange(substituteAttendances, estrategia.fecha_inicio, estrategia.fecha_fin);

                                const strategyAttendancesWithLabel = strategyAttendances.map((attendance) => {
                                    return {
                                        ...attendance,
                                        label: `TxT ${estrategia.rch_empleados_rch_permisos_id_suplenteTorch_empleados.matricula} ${nombre}`,
                                        ini_horario_titular: estrategia.ini_horario_titular,
                                        fin_horario_titular: estrategia.fin_horario_titular
                                    }
                                })

                                return {
                                    data: strategyAttendancesWithLabel,
                                };
                            })
                        );
                    }
                }

                //procesar el historial de los horarios de cada empleado
                const { historial, horario_actual } = getEmployeeDataPerDateRange(historial_horario, fecha_ini, fecha_fin, hora_entrada, hora_salida, employee);
                hora_entrada = horario_actual.hora_entrada;
                hora_salida = horario_actual.hora_salida;

                //1. OBTENER DE LAS CHECADAS LA PRIMERA DE CADA HORA EN CADA DIA
                const result = getUnrepeatedAttendances(attendances);

                //2. CLASIFICAR CADA CHECADA COMO ENTRADA O SALIDA AGREGANDO LA PROPIEDAD 'TYPE', 'SCHEDULE' AL OBJETO Y 'LABEL' PARA IDENTIFICAR LAS ESTRATEGIAS
                const endOutAttendances = isComingOrOut(hora_entrada, result, employee, historial, checadasSuplente);

                //Proceso para añadir dias laborales que no tienen checadas dependiendo del turno del empleado
                //3. Obtener los dias laborales del empleado y parsearlos al rango seleccionado de los dias del mes
                const parsedWorkingDays = parseWorkingDays(fecha_ini, fecha_fin, festivos, employee, vacaciones, historial);

                //4. CLASIFICAR LA CHECADA DEPENDIENDO DEL EVENTO AGREGANDO LA PROPIEDAD 'EVENT'
                const classifiedAttendances = classifyEventType(endOutAttendances, vacaciones, permisos, employee, fecha_ini, fecha_fin, historial);

                //5. Eliminar festivos (aquellos que no laboran festivos), dias donde ya haya checadas y permisos asignados
                const debuggedDays = debugWorkingDays(parsedWorkingDays, festivos, classifiedAttendances, horario_actual.guardias);

                //6. Ordenar el array ascendentemente por dateReg
                let sortedData = debuggedDays.sort((a: any, b: any) => new Date(a.dateReg).getTime() - new Date(b.dateReg).getTime());

                //7. Eliminar primer dia por el rango de fechas -1 y +1 para la evaluación de las checadas y dejar los dias +1 para aquellos donde hay eventos de OMISION DE ENTRADA PARA JORNADA ACUMULADA
                let finalData: any[] = [];
                sortedData.forEach((item: any) => {
                    if (dayjs.utc(item.dateReg).format('YYYY-MM-DD') >= fec_inicio && dayjs.utc(item.dateReg).format('YYYY-MM-DD') <= fec_final) {
                        finalData.push(item);
                    }

                    if (dayjs.utc(item.dateReg).format('YYYY-MM-DD') > fec_final && item.event.includes('OMISIÓN DE ENTRADA')) {
                        finalData.push(item);
                    }
                });

                //8. Eliminar eventos de FALTA donde el siguiente día tenga como evento OMISION DE ENTRADA para JORNADA ACUMULADA
                finalData.forEach((item: any, index: number) => {
                    if (index === finalData.length - 1) {
                        return;
                    } else {
                        if (item.event.includes('FALTA') && finalData[index + 1].event.includes('OMISIÓN DE ENTRADA')) {
                            finalData.splice(index, 1);
                        }
                    }
                });

                //9. Para permiso de lactancia, agregar falta a aquellos registros donde no hay hora de checada
                finalData = finalData.map((item: any) => {
                    if (item.event === 'LACTANCIA' && item.horaReg === '') {
                        return { ...item, event: item.event + ', FALTA' }
                    } else {
                        return item;
                    }
                });

                return {
                    ...employee,
                    parseHora_entrada: hora_entrada,
                    parseHora_salida: hora_salida,
                    final: finalData,
                    historial
                }
            })
        );

        let mainContent = '';

        employees.forEach((item1: any) => {
            let body = '<tbody style="font-size: 12px;">';
            let randomRotate = Math.floor(Math.random() * 21) - 10;
            let randomLeft = Math.floor(Math.random() * (220 - 180 + 1)) + 180;
            let randomUpDown = Math.floor(Math.random() * (300 - 250 + 1)) - 300;
            let headerHorario = '';
            let headerGuardias = '';
            let horarioActual = `${item1.parseHora_entrada} - ${item1.parseHora_salida}`;
            let isHorarioVariado = item1.final.filter((item: any) => item.schedule !== horarioActual);

            if (isHorarioVariado.length > 1) {
                headerHorario = 'VARIADO'
                headerGuardias = 'VARIADO'
            } else {
                headerHorario = `${item1.parseHora_entrada} - ${item1.parseHora_salida}`
                headerGuardias = item1.guardias === 'null' ? '-' : JSON.parse(item1.guardias).join(', ')
            }

            item1.final.forEach((item2: any, index: number) => {
                body += generateRow(item1, item2, index);
            });

            body += '</tbody>';

            let content = format(imsReportMainContent, {
                sello: sello_cae,
                rotateX: randomRotate,
                moveLeft: randomLeft,
                moveUpDown: randomUpDown,
                name: `${item1.cmp_persona.nombres} ${item1.cmp_persona.primer_apellido} ${item1.cmp_persona.segundo_apellido}`,
                rfc: item1.cmp_persona.rfc,
                curp: item1.cmp_persona.curp,
                mat: `${item1.matricula}`,
                nom: `${item1.cat_tipos_recurso.nombre}`,
                turno: item1.cat_turnos.nombre,
                hour: headerHorario,
                guards: headerGuardias,
                cat: item1.cat_tipos_empleado.nombre,
                area: item1.cat_departamentos.nombre,
                table_body: body,
                quince: quin,
                firma1: firma1,
                jefe_rh: id_rh_json.nombre,
                firma2: firma2,
                admin_cae: id_admin_json.nombre,
                firma3: firma3,
                director_cae: id_director_json.nombre
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
            scale: 0.70,
            margin: {
                top: 10,
                right: 0,
                left: 0
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
