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

export interface Cmp_Persona {
    nombres: string;
    primer_apellido: string;
    segundo_apellido: string;
}

export interface Cat_Departamentos {
    nombre: string;
}

export interface Cat_Tipos_Empleado {
    nombre: string;
}

export interface Cat_Turnos {
    nombre: string;
}

export interface ReqHistorialHorario {
    length: any;
    fecha_inicio: string;
    hora_entrada: string;
    hora_salida: string;
}

export interface ReqKardexEmpleado {
    id: number;
    matricula: number;
    hora_entrada: string;
    hora_salida: string;
    guardias: string;
    cmp_persona: Cmp_Persona;
    cat_departamentos: Cat_Departamentos;
    cat_tipos_empleado: Cat_Tipos_Empleado;
    cat_turnos: Cat_Turnos;
    cat_categorias: Cat_Tipos_Empleado;
    historial: ReqHistorialHorario;
}

export interface PropsFormatoEstrategia {
    dateInit: string;
    dateFin: string | null;
    titular: ReqKardexEmpleado;
    suplente: ReqKardexEmpleado;
    titularHoraEntrada: string | null;
    titularHoraSalida: string | null;
    substituteHoraEntrada: string | null;
    substituteHoraSalida: string | null;
    type: string;
}