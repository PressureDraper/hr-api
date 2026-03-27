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

describe('GET /api/rh/holidays', () => {
    let response: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/holidays').query({ fecha_ini: '2026-04-01', fecha_fin: '2026-04-10' });
    });

    test('El endpoint debe responder exitosamente (200)', () => {
        expect(response.status).not.toBe(500);
    });

    test('La respuesta debe contener las propiedades esperadas', () => {
        response.body.data.forEach((festivo: any) => {
            expect(festivo).toHaveProperty('id');
            expect(festivo).toHaveProperty('descripcion');
            expect(festivo).toHaveProperty('fecha');
        });
    });
});

describe('GET /api/rh/holidays/total', () => {
    let response: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/holidays/total');
    });

    test('El endpoint debe responder exitosamente (200)', () => {
        expect(response.status).not.toBe(500);
    });

    test('Debe retornar el total de días festivos', () => {
        expect(response.body.data).toBeGreaterThan(0);
    });
});

