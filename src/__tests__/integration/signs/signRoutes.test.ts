import request from 'supertest';
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

describe('GET /api/rh/sing/:id', () => {
    let response: any;

    beforeAll(async () => {
        response = await api.get(`/api/rh/sing/${1680}`)
    });

    test('El endpoint debe responder exitosamente (200)', () => {
        expect(response.status).not.toBe(500);
    });

    test('La respuesta debe retornar exactamente 1 objeto', () => {
        expect(response.body).toBeInstanceOf(Object);
        expect(Array.isArray(response.body)).toBe(false);
    });

    test('La respuesta debe contener las propiedades esperadas', () => {
        expect(Object.keys(response.body)).toContain('id');
        expect(Object.keys(response.body)).toContain('id_persona');
        expect(Object.keys(response.body)).toContain('firma');
    });
});

describe('POST /api/rh/sing', () => {
    let response: any;

    beforeAll(async () => {
        const minimalPng = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
        );

        response = await api
            .post('/api/rh/sing')
            .field('id_persona', '102776')
            .attach('file', minimalPng, {
                filename: 'test.png',
                contentType: 'image/png',
            });
    });

    afterAll(async () => {
        await db.cmp_firmas_manuscritas.deleteMany({
            where: { id_persona: 102776 }
        });
    });

    test('El endpoint debe responder exitosamente (200)', () => {
        expect(response.status).not.toBe(500);
    });

    test('La respuesta debe regresa el estado true', () => {
        expect(response.body.ok).toBe(true);
    });
});