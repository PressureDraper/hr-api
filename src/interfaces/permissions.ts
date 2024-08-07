export interface CreatePermissionQueries {
    dateInit: string;
    dateFin: string | null;
    observations: string | null;
    permission_id: number;
    employee_id: number;
    substitute_id: number;
}

export interface PropsEmployeePermissionsQueries {
    employee_id: string;
    fecha_ini: string;
    fecha_fin: string;
}