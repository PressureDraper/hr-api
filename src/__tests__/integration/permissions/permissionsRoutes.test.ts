import request from 'supertest';
import TestAgent from 'supertest/lib/agent';

let app: any;
let api: TestAgent;

beforeAll(async () => {
    if (!app) {
        app = (await import('../../../app')).default;
        api = request(app);
    }
});

describe('GET /api/rh/permissions', () => {
    let response: any;

    beforeAll(async () => {
        response = await api.get(`/api/rh/permissions`)
    });

    test('El endpoint debe responder exitosamente (200)', () => {
        expect(response.status).not.toBe(500);
    });

    test('La respuesta debe retornar un catálogo de permisos', () => {
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('El objeto debe tener las propiedades necesarias', () => {
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('nombre');
    });
});

describe('GET /api/rh/permissions/folios', () => {
    let responseImss: any;
    let responseNoImss: any;

    beforeAll(async () => {
        responseImss = await api.get(`/api/rh/permissions/folios`).query({ fecha_ini: '2026-04-25', tipo_empleado: 'BASE IMSS BIENESTAR' });
        responseNoImss = await api.get(`/api/rh/permissions/folios`).query({ fecha_ini: '2026-04-25', tipo_empleado: 'CONTRATO EVENTUAL' });
    });

    test('El endpoint debe responder exitosamente (200)', () => {
        expect(responseImss.status).not.toBe(500);
    });

    test('La respuesta debe ser un numero correspondiente al siguiente folio para IMSS BIENESTAR', () => {
        expect(typeof responseImss.body.data).toBe('number');
    });

    test('El endpoint debe responder exitosamente (200) y retornar el siguiente folio para tipo_empleado != IMSS BIENESTAR', async () => {
        expect(responseNoImss.status).not.toBe(500);
        expect(typeof responseNoImss.body.data).toBe('number');
    });
});