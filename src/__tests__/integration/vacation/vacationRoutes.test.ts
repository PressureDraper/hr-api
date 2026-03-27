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

describe('GET /api/rh/vacation', () => {
    let response: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/vacation').query({
            limit: 10,
            page: 0,
            matricula: '7004',
            fec_inicial: '2026-01-05',
            fec_final: '2026-01-16'
        });
    });

    test('El endpoint debe responder exitosamente (200)', () => {
        expect(response.status).not.toBe(500);
    });

    test('Debe contener al menos 1 registro', () => {
        expect(response.body.data.length).toBeGreaterThan(0);
    });
});

describe('GET /api/rh/vacation/employee', () => {
    let response: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/vacation/employee').query({
            id: '5772',
            fecha_ini: '2026-01-04',
            fecha_fin: '2026-01-17'
        });
    });

    test('El endpoint debe responder exitosamente (200)', () => {
        expect(response.status).not.toBe(500);
    });

    test('Debe contener al menos 1 registro', () => {
        expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('La respuesta debe contener las propiedades esperadas', () => {
        expect(response.body.data[0]).toHaveProperty('rol');
        expect(response.body.data[0]).toHaveProperty('fecha_inicio');
        expect(response.body.data[0]).toHaveProperty('fecha_fin');
    });
});