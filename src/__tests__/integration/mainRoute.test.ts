import request from 'supertest';
import app from '../../app';

describe('GET /', () => {
    let response: any;

    beforeAll(async () => {
        response = await request(app).get('/');
    })

    test('Debe retornar respuesta exitosa indicando que la api funciona correctamente (200)', () => {
        expect(response.status).toBe(200);
    });
});