import request from 'supertest';
import { ShiftsHistoryQueries } from '../../../interfaces/employeesQueries';
import { db } from '../../../utils/db';
import TestAgent from 'supertest/lib/agent';

let app: any;
let api: TestAgent;

beforeAll(async () => {
    if (!app) {
        app = (await import('../../../app')).default;
        api = request(app);
    }
});

describe('GET /api/rh/employee', () => {
    let response: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/employee/').query({ data: '[6634, 6635, 6636, 6637]' });
    });

    test('Debe retornar un código de respuesta éxitoso (200)', () => {
        expect(response.status).toBe(200);
    });

    test('Debe retornar un array de objetos', () => {
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Debe retornar exactamente 4 empleados', () => {
        expect(response.body.data.length).toBe(4);
    });

    test('Cada empleado debe tener las propiedades esperadas', () => {
        response.body.data.forEach((employee: any) => {
            expect(employee).toHaveProperty('id');
            expect(employee).toHaveProperty('matricula');
            expect(employee).toHaveProperty('cmp_persona');
        });
    });
});

describe('GET /api/rh/employee/filter', () => {
    let response: any;
    let emptyResponse: any;
    let badRequestResponse: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/employee/filter').query({ enrollmentFilter: '7004' });
        emptyResponse = await api.get('/api/rh/employee/filter').query({ enrollmentFilter: '090909' });
        badRequestResponse = await api.get('/api/rh/employee/filter');
    });

    test('Debe retornar un código de respuesta éxitoso (200)', () => {
        expect(response.status).toBe(200);
    });

    test('Debe retornar un array de objetos', () => {
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Debe contener al menos 1 registro', () => {
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('Los resultados deben corresponder a la matrícula buscada', () => {
        expect(response.body.data[0].matricula).toBe(7004);
    });

    test('Debe retornar array vacío si la matrícula no existe', async () => {
        expect(emptyResponse.body.data.length).toBe(0);
    });

    test('Debe retornar 400 si no se envía enrollmentFilter', async () => {
        expect(badRequestResponse.status).toBe(400);
    });
});

describe('GET /api/rh/employee/kardex', () => {
    let response: any;
    let serverErrorResponse: any;
    let badRequestResponse: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/employee/kardex').query({ id: 5772 });
        serverErrorResponse = await api.get('/api/rh/employee/kardex').query({ id: '07070707' });
        badRequestResponse = await api.get('/api/rh/employee/kardex');
    });

    test('Debe retornar un código de respuesta éxitoso (200)', () => {
        expect(response.status).toBe(200);
    });

    test('La respuesta debe retornar información de los empleados', () => {
        expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
    });

    test('La respuesta debe contener las propiedades esperadas', () => {
        expect(Object.keys(response.body.data)).toContain('id');
        expect(Object.keys(response.body.data)).toContain('matricula');
        expect(Object.keys(response.body.data)).toContain('hora_entrada');
        expect(Object.keys(response.body.data)).toContain('hora_salida');
        expect(Object.keys(response.body.data)).toContain('guardias');
        expect(Object.keys(response.body.data)).toContain('cmp_persona');
        expect(Object.keys(response.body.data)).toContain('historial');
    });

    test('Debe retornar 500 si el id no existe', async () => {
        expect(serverErrorResponse.status).toBe(500);
    });

    test('Debe retornar 400 si no se manda el parámetro id', async () => {
        expect(badRequestResponse.status).toBe(400);
    });
});

describe('GET /api/rh/employee/types', () => {
    let response: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/employee/types');
    });

    test('Debe retornar un código de respuesta éxitoso (200)', () => {
        expect(response.status).toBe(200);
    });

    test('La respuesta debe retornar información del catálogo de tipos de empleado', () => {
        expect(response.body.data.length).toBeGreaterThan(0);
    });
});

const mockData: ShiftsHistoryQueries = {
    id_empleado: 5772,
    id_registro: 5772,
    turno: { id: 1, nombre: 'MATUTINO' },
    fec_inicio: '2026-03-20',
    hora_entrada: '13:00',
    hora_salida: '21:00',
    guardias: [
        { title: 'LUNES' },
        { title: 'MARTES' },
        { title: 'MIERCOLES' },
        { title: 'JUEVES' },
        { title: 'VIERNES' }
    ],
    observaciones: 'sfsdfs'
}

describe('POST /api/rh/employee/shiftHistory', () => {
    let response: any;
    let ephemeralId: number;

    beforeAll(async () => {
        response = await api.post('/api/rh/employee/shiftHistory').send(mockData);
        ephemeralId = response.body.data.id;
    });

    afterAll(async () => {
        await db.rch_empleados_historial_horarios.delete({
            where: { id: ephemeralId }
        });
    });

    test('Debe retornar respuesta exitosa (200)', () => {
        expect(response.status).toBe(200);
    });

    test('La respuesta debe retornar los datos del registro insertado', () => {
        expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
    });
});
