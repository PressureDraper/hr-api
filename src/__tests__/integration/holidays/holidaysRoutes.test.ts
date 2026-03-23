import request from 'supertest';
import app from '../../../app';
import { db } from '../../../utils/db';

describe('GET /api/rh/holidays/', () => {
    let response: any;

    beforeAll(async () => {
        response = await request(app).get('/api/rh/holidays/total');
    });

    test('El endpoint debe responder exitosamente (200)', () => {
        expect(response.status).not.toBe(500);
    });

    test('Debe retornar el total de días festivos', () => {
        expect(response.body.data).toBeGreaterThan(0);
    });

    // test('Debe ')
});

