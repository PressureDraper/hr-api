import { AxiosError, AxiosResponse } from "axios";
import { HeaderExcelJSBookElement, PropsAttendances, PropsAttendancesInterface, PropsEmployeeType, PropsReporteChecadas, ReqEmployeeTypeSQLQuery, checadasIndividualInterface } from "../interfaces/reportsQueries";
import { db } from "../utils/db";
import { biometricosApi } from "../apis/biometricosApi";
import moment from "moment";
import crypto from 'crypto';

export const headerListaChecadasExcel: Array<HeaderExcelJSBookElement> = [
    { header: 'MATRICULA', key: 'mat', width: 13 },
    { header: 'NOMBRE DEL TRABAJADOR', key: 'name', width: 40 },
    { header: 'TIPO EMPLEADO', key: 'type', width: 30 },
    { header: 'TIPO JORNADA', key: 'turn', width: 30 },
    { header: 'RFC ', key: 'rfc', width: 30 },
    { header: 'HORARIO', key: 'schedule', width: 20 },
    { header: 'GUARDIAS', key: 'guards', width: 55 },
    { header: 'FECHA', key: 'dateReg', width: 15 },
    { header: 'CHECADA1', key: 'horaReg1', width: 20 },
    { header: 'CHECADA2', key: 'horaReg2', width: 20 },
    { header: 'CHECADA3', key: 'horaReg3', width: 20 },
    { header: 'CHECADA4', key: 'horaReg4', width: 20 },
    { header: 'CHECADA5', key: 'horaReg5', width: 20 },
    { header: 'CHECADA6', key: 'horaReg6', width: 20 },
    { header: 'CHECADA7', key: 'horaReg7', width: 20 },
    { header: 'CHECADA8', key: 'horaReg8', width: 20 },
    { header: 'CHECADA9', key: 'horaReg9', width: 20 },
    { header: 'CHECADA10', key: 'horaReg10', width: 20 },
    { header: 'CHECADA11', key: 'horaReg11', width: 20 },
    { header: 'CHECADA12', key: 'horaReg12', width: 20 },
    { header: 'CHECADA13', key: 'horaReg13', width: 20 },
    { header: 'CHECADA14', key: 'horaReg14', width: 20 },
    { header: 'CHECADA15', key: 'horaReg15', width: 20 },
];

export const getEmployeeTypeQuery = ({ ...params }: PropsReporteChecadas) => {
    return new Promise(async (resolve, reject) => {
        const tipo_emp: PropsEmployeeType = JSON.parse(decodeURIComponent(params.tipo_empleado));

        try {
            const infoEmployeeType = await db.rch_empleados.findMany({
                where: {
                    id_tipoempleado: tipo_emp.nombre !== "NO APLICA" ? tipo_emp.id : {},
                    matricula: {
                        lte: parseInt(params.mat_final),
                        gte: parseInt(params.mat_inicio)
                    },
                    deleted_at: null,
                    activo: true,
                },
                select: {
                    id: true,
                    cmp_persona: {
                        select: {
                            nombres: true,
                            primer_apellido: true,
                            segundo_apellido: true,
                            rfc: true,
                            curp: true
                        }
                    },
                    cat_tipos_empleado: {
                        select: {
                            nombre: true
                        }
                    },
                    cat_turnos: {
                        select: { nombre: true }
                    },
                    cat_tipos_recurso: {
                        select: { nombre: true }
                    },
                    hora_entrada: true,
                    hora_salida: true,
                    guardias: true,
                    matricula: true,
                    cat_departamentos: true
                }
            });

            resolve(infoEmployeeType);
        } catch (error) {
            reject(error);
        }
    })
}

export const getAttendancesReport = (mat_ini: string, mat_final: string, fec_ini: string, fec_fin: string): Promise<PropsAttendancesInterface> => {
    return new Promise(async (resolve, reject) => {
        biometricosApi.get(`get_attendances_report?matricula_inicial=${mat_ini}&matricula_final=${mat_final}&fecha_ini=${fec_ini}&fecha_fin=${fec_fin}`, {})
            .then((res: AxiosResponse) => {
                resolve(res.data)
            }).catch((err: AxiosError) => {
                console.log('err', err);
                reject([]);
            })
    })
}

export const getChecadaEmpleadoRange = (matricula: string | number, fecha_ini: string, fecha_fin: string): Promise<checadasIndividualInterface> => {
    return new Promise(async (resolve, reject) => {
        biometricosApi.get('/get_employee_attendance_range', { params: { matricula: matricula, fecha_ini: fecha_ini, fecha_fin: fecha_fin } })
            .then((res: AxiosResponse) => {
                resolve(res.data);
            })
            .catch((err: AxiosError) => {
                reject([]);
            });
    });
};

export const formatAttendancesReport = (attendances: PropsAttendances[], employeesType: ReqEmployeeTypeSQLQuery) => {
    const test: any = employeesType.map((data: ReqEmployeeTypeSQLQuery) => {
        const aux = attendances.filter((obj: PropsAttendances) => parseInt(data.matricula) === obj.mat);

        return aux;
    });

    //combinar todos los objetos filtrados en un solo array de objetos
    const filteredArray = test.reduce((accumulator: any, currentArray: any) => {
        return [...accumulator, ...currentArray];
    }, []);

    const structuredArray = filteredArray.map((data: PropsAttendances) => {
        const employee: ReqEmployeeTypeSQLQuery = employeesType.find((obj: ReqEmployeeTypeSQLQuery) => parseInt(obj.matricula) === data.mat);

        return {
            "mat": data.mat,
            "name": employee.cmp_persona.nombres + ' ' + employee.cmp_persona.primer_apellido + ' ' + employee.cmp_persona.segundo_apellido,
            "type": employee.cat_tipos_empleado.nombre,
            "turn": employee.cat_turnos.nombre,
            "rfc": employee.cmp_persona.rfc,
            "schedule": moment.utc(employee.hora_entrada).format('HH:mm:ss') + ' - ' + moment.utc(employee.hora_salida).format('HH:mm:ss'),
            "guards": employee.guardias != 'null' && employee.guardias != null ? JSON.parse(decodeURIComponent(employee.guardias)).join(',') : '-',
            "dateReg": moment.utc(data.dateReg).format('YYYY-MM-DD'),
            "horaReg": 'B' + data.biometric + ' ' + data.horaReg
        };
    });

    //begins ChatGPT code
    const groupedData: any = {};

    structuredArray.sort((a: any, b: any) => a.mat - b.mat).forEach((obj: any) => {
        // Construir una clave única para cada combinación de dateReg y mat
        const key = `${obj.dateReg}_${obj.mat}`;

        // Si es la primera vez que encontramos esta combinación, inicializamos el objeto
        if (!groupedData[key]) {
            groupedData[key] = {
                mat: obj.mat,
                name: obj.name,
                type: obj.type,
                turn: obj.turn,
                rfc: obj.rfc,
                schedule: obj.schedule,
                guards: obj.guards,
                dateReg: obj.dateReg,
            };
        }

        // Contador para las horas registradas
        let count = Object.keys(groupedData[key]).filter(k => k.startsWith('horaReg')).length + 1;

        // Agregar horaReg al objeto agrupado con nombre numerado
        groupedData[key][`horaReg${count}`] = obj.horaReg;
    });
    //ends ChatGPT code

    return Object.values(groupedData); //Quitamos la clave única y nos quedamos con los valores en un nuevo array
}

export const getBosByAppartment = async (term: string) => {
    try {
        const notFilters = ['DEL', 'DE'];
        let spllitedTerm = term.split(' ');
        spllitedTerm = spllitedTerm.filter((term) => term.length > 2);
        spllitedTerm = spllitedTerm.filter((term) => !notFilters.includes(term));
        
        const filters = spllitedTerm.map((term) => ({
            nombre: { contains: term }, 
        }));

        const results = await db.cat_puestos.findMany({
            where: {
                jefatura: true,
                deleted_at: null,
                OR: filters,
              
            },
        });

        const rankedResults = results
        .map((result) => {
            const matchCount = spllitedTerm.reduce((count, term) => {
            const regex = new RegExp(`\\b${term}\\b`, 'i'); 
            return count + (regex.test(result.nombre) ? 1 : 0);
            }, 0);

            return { ...result, matchCount };
        })
        .sort((a, b) => b.matchCount - a.matchCount); 
        if(rankedResults.length == 0) return '';
        const {id} = rankedResults[0];
        const nameBoos = await db.rch_empleados.findFirst({
            where: {
                id_puesto: id,
                deleted_at: null,
                activo: true ,
            },
            select: {
                cmp_persona: {
                    select: {
                        id: true,
                        primer_apellido: true,
                        nombres: true,
                        segundo_apellido: true,
                    },
                   
                }
            }
        });

        const {cmp_persona = {}} : any = nameBoos || {};
        const {nombres = '', primer_apellido = '', segundo_apellido = ''} = cmp_persona;
        return `${nombres} ${primer_apellido} ${segundo_apellido}`;
    } catch(err) {
        console.log(err)
        return null;
    }
}

export const calculateQuint = (fec_inicio = '', fec_final = '') => {
    const inicio = new Date(fec_inicio);
    const final = new Date(fec_final);

    if (inicio.getUTCFullYear() !== final.getUTCFullYear()) {
        throw new Error("Ambas fechas deben estar en el mismo año para calcular una quincena");
    }

    const anio = inicio.getUTCFullYear();

    function obtenerQuincena(fecha = new Date()) {
        const mes = fecha.getUTCMonth(); 
        const dia = fecha.getUTCDate();
        return mes * 2 + (dia <= 15 ? 1 : 2); 
    }

    const quincenaInicio = obtenerQuincena(inicio);
    const quincenaFinal = obtenerQuincena(final);

    if (quincenaInicio === quincenaFinal) {
        return `QNA ${quincenaInicio} / ${anio}`;
    } else {
        return `QNA ${quincenaInicio} a QNA ${quincenaFinal} / ${anio}`;
    }
}
function descifrarAES(encryptedText = '', secretKey = '', iv = '') {
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), Buffer.from(iv));
        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        return '';
    }
}

export const getFirmaById = async (id: number) => {
    try {
        let desc = ''
        const firma = await db.cmp_firmas_manuscritas.findFirst({where: {id}});
        if(!firma) return '';
        desc = descifrarAES(firma.firma, '12345678901234567890123456789012', '1234567890123456');
        return desc;
    } catch(err) {
        return '';
    }
};