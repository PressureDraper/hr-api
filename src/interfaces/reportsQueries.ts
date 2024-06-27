export interface PropsEmployeeType {
    id: number;
    nombre: string;
    clave: string;
}

export interface PropsReporteChecadas {
    fec_inicio: string;
    fec_final: string;
    mat_inicio: string;
    mat_final: string;
    tipo_empleado: string;
}

export interface PropsAttendances {
    biometric: number;
    dateReg: string;
    horaReg: string;
    mat: number;
}

export interface PropsAttendancesInterface {
    attendances: PropsAttendances[]
}

export interface PropsCmp_PersonaSQLQuery {
    nombres: string;
    primer_apellido: string;
    segundo_apellido: string;
    rfc: string;
}

export interface PropsCat_Tipos_EmpleadoSQLQuery {
    nombre: string;
}

export interface ReqEmployeeTypeSQLQuery {
    find(arg0: (obj: ReqEmployeeTypeSQLQuery) => any): ReqEmployeeTypeSQLQuery;
    length(length: any): unknown;
    map(arg0: (data: ReqEmployeeTypeSQLQuery) => void): unknown;
    forEach(arg0: (element: any) => void): unknown;
    filter(arg0: (data: ReqEmployeeTypeSQLQuery) => void): unknown;
    matricula: string;
    hora_entrada: string;
    hora_salida: string;
    guardias: string;
    cmp_persona: PropsCmp_PersonaSQLQuery;
    cat_tipos_empleado: PropsCat_Tipos_EmpleadoSQLQuery;
}

export interface HeaderExcelJSBookElement {
    header: string;
    key: string;
    width: number;
}