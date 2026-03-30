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

describe('GET /api/rh/reports/checadas', () => {
    let response: any;
    let badResponse: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/reports/checadas').query({ fec_inicio: '2024-01-01', fec_final: '2024-01-31', mat_inicio: '7004', mat_final: '7004', tipo_empleado: '{"id":1,"nombre":"NO APLICA","clave":"1"}' });
        badResponse = await api.get('/api/rh/reports/checadas').query('invalidData');
    });

    test('Debe retornar status 200', () => {
        expect(response.status).toBe(200);
    });

    test('Debe generar un Excel válido', () => {
        const signature = response.text.slice(0, 2).toString();
        expect(signature).toBe('PK');
    });

    test('Debe retornar error 500 para datos inválidos', () => {
        expect(badResponse.status).toBe(500);
    });

    test('Debe retornar false en la respuesta para datos inválidos', () => {
        expect(badResponse.body.ok).toBe(false);
    });
});