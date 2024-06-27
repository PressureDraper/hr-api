export interface PropsGetEmployeeQueries {
    data: string;
}

export interface SicaEmployeeQueries {
    limit: string;
    page: string;
    enrollmentFilter: string;
    nameFilter: string;
}

export interface ShiftsInterface {
    id: number;
    nombre: string;
}

export interface GuardsInterface {
    map(arg0: (data: string) => void): unknown;
    title: string;
}

export interface ShiftsHistoryQueries {
    id_empleado: number;
    id_registro: number;
    fec_inicio: string;
    hora_entrada: string;
    hora_salida: string;
    observaciones: string;
    guardias: GuardsInterface[];
    turno: ShiftsInterface;
}