import request from 'supertest';
import TestAgent from "supertest/lib/agent";

let app: any;
let api: TestAgent;

beforeAll(async () => {
    if (!app) {
        app = (await import('../../../app')).default;
        api = request(app);
    }
});

describe('GET /api/rh/reports/ims_report', () => {
    let response: any;
    let badResponse: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/reports/ims_report').query({
            fec_inicio: '2026-02-01',
            fec_final: '2026-02-15',
            mat_inicio: '5806',
            mat_final: '5806',
            id_admin: '{"id_persona":35407,"nombre":"RUBEN VAZQUEZ RASGADO"}',
            id_director: '{"id_persona":1680,"nombre":"RAFAEL NORBERTO HERNANDEZ GOMEZ"}'
        });

        badResponse = await api.get('/api/rh/reports/ims_report').query('invalidData');
    });

    test('Debe retornar status 200', () => {
        expect(response.status).toBe(200);
    });

    test('Debe generar un PDF válido', () => {
        const signature = response.body.slice(0, 4).toString();
        expect(signature).toBe('%PDF');
    });

    test('Debe retornar error 500 para datos inválidos', () => {
        expect(badResponse.status).toBe(500);
    });

    test('Debe retornar false en la respuesta para datos inválidos', () => {
        expect(badResponse.body.ok).toBe(false);
    });
});