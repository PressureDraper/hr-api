export interface PropsGetEmployeeQueries {
    data: string;
}

export interface SicaEmployeeQueries {
    limit: string;
    page: string;
    enrollmentFilter: string;
    nameFilter: string;
}

export interface shiftsInterface {
    id: number;
    nombre: string;
}

export interface guardsInterface {
    map(arg0: (data: string) => void): unknown;
    title: string;
}

export interface shiftsHistoryQueries {
    id_empleado: number;
    id_registro: number;
    fec_inicio: string;
    hora_entrada: string;
    hora_salida: string;
    observaciones: string;
    guardias: guardsInterface[];
    turno: shiftsInterface;
}