export interface PropsGetVacationQueries {
    limit: string;
    page: string;
    matricula: string;
    empleado: string;
    tipo: string;
    departamento: string;
    rol: string;
    fec_inicial: string;
    fec_final: string;
}

export interface PropsCreateVacationQueries {
    empleado: any
    fec_inicial: string;
    fec_final: string;
    rol: string;
}

export interface PropsGetTotalVacationQueries {
    matricula: string;
    empleado: string;
    rol: string;
    fec_inicial: string;
}

export interface PropsUpdateVacationQueries {
    id: number;
    fec_inicial: string;
    fec_final: string;
}

export interface PropsGetVacationEmployeeIdInterface {
    id: string;
    fecha_ini: string;
    fecha_fin: string;
}