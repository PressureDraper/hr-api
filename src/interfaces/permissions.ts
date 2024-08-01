export interface CreatePermissionQueries {
    dateInit: string;
    dateFin: string | null;
    observations: string | null;
    permission_id: number;
    employee_id: number;
}