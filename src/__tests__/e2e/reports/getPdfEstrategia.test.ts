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

const mockData = {
    encodedURI: '%7B%22dateInit%22%3A%222026-04-06%22%2C%22dateFin%22%3A%222026-04-08%22%2C%22folium%22%3A%222181%22%2C%22titular%22%3A%7B%22id%22%3A3401%2C%22matricula%22%3A4827%2C%22hora_entrada%22%3A%221970-01-01T14%3A30%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%2C%22guardias%22%3A%22%5B%5C%22LUNES%5C%22%2C%5C%22MARTES%5C%22%2C%5C%22MIERCOLES%5C%22%2C%5C%22JUEVES%5C%22%2C%5C%22VIERNES%5C%22%5D%22%2C%22cmp_persona%22%3A%7B%22id%22%3A3402%2C%22nombres%22%3A%22ARACELI%22%2C%22primer_apellido%22%3A%22RUIZ%22%2C%22segundo_apellido%22%3A%22CARPINTEYRO%22%2C%22rfc%22%3A%22RUCA750924AV9%22%2C%22curp%22%3A%22RUCA750924MVZZRR07%22%7D%2C%22cat_tipos_empleado%22%3A%7B%22nombre%22%3A%22BASE%22%7D%2C%22cat_departamentos%22%3A%7B%22nombre%22%3A%22UNIDAD%20DE%20SISTEMATIZACION%22%7D%2C%22cat_turnos%22%3A%7B%22nombre%22%3A%22VESPERTINO%22%7D%2C%22cat_categorias%22%3A%7B%22nombre%22%3A%22APOYO%20ADMINISTRATIVO%20EN%20SALUD%20-%20A6%22%7D%2C%22cat_tipos_recurso%22%3A%7B%22nombre%22%3A%22CAE%20FED%22%7D%2C%22historial%22%3A%5B%7B%22fecha_inicio%22%3A%222013-06-13T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T14%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222022-12-07T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T14%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222022-12-07T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T14%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T20%3A30%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222023-03-01T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T14%3A30%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222023-12-22T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T14%3A30%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222023-12-22T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T14%3A30%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222024-11-05T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T14%3A30%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%5D%7D%2C%22suplente%22%3A%7B%22id%22%3A5772%2C%22matricula%22%3A7004%2C%22hora_entrada%22%3A%221970-01-01T13%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%2C%22guardias%22%3A%22%5B%5C%22LUNES%5C%22%2C%5C%22MARTES%5C%22%2C%5C%22MIERCOLES%5C%22%2C%5C%22JUEVES%5C%22%2C%5C%22VIERNES%5C%22%5D%22%2C%22cmp_persona%22%3A%7B%22id%22%3A102776%2C%22nombres%22%3A%22OMAR%20SAHIB%22%2C%22primer_apellido%22%3A%22MIRON%22%2C%22segundo_apellido%22%3A%22HERNANDEZ%22%2C%22rfc%22%3A%22MIHO001029IX8%22%2C%22curp%22%3A%22MIHO001029HVZRRMA4%22%7D%2C%22cat_tipos_empleado%22%3A%7B%22nombre%22%3A%22CONTRATO%20EVENTUAL%22%7D%2C%22cat_departamentos%22%3A%7B%22nombre%22%3A%22UNIDAD%20DE%20SISTEMATIZACION%22%7D%2C%22cat_turnos%22%3A%7B%22nombre%22%3A%22MATUTINO%22%7D%2C%22cat_categorias%22%3A%7B%22nombre%22%3A%22APOYO%20ADMINISTRATIVO%20EN%20SALUD%20-%20A1%22%7D%2C%22cat_tipos_recurso%22%3A%7B%22nombre%22%3A%22ESTATAL%22%7D%2C%22historial%22%3A%5B%7B%22fecha_inicio%22%3A%222023-12-22T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T13%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222024-01-30T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T07%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T16%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222024-01-01T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T08%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T16%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222024-03-13T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T08%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T16%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222024-06-04T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T13%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222025-01-01T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T13%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222025-06-05T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T13%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T21%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222025-08-08T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T09%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T17%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222025-11-26T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T11%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T19%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222025-11-27T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T09%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T17%3A00%3A00.000Z%22%7D%2C%7B%22fecha_inicio%22%3A%222026-03-11T00%3A00%3A00.000Z%22%2C%22hora_entrada%22%3A%221970-01-01T09%3A00%3A00.000Z%22%2C%22hora_salida%22%3A%221970-01-01T17%3A00%3A00.000Z%22%7D%5D%7D%2C%22titularHoraEntrada%22%3Anull%2C%22titularHoraSalida%22%3Anull%2C%22substituteHoraEntrada%22%3Anull%2C%22substituteHoraSalida%22%3Anull%2C%22id_blame%22%3A5772%2C%22type%22%3A%22ESTRATEGIA%22%7D'
}

describe('GET /api/rh/reports/formatoEstrategia', () => {
    let response: any;
    let badResponse: any;

    beforeAll(async () => {
        response = await api.get('/api/rh/reports/formatoEstrategia').query(mockData);
        badResponse = await api.get('/api/rh/reports/formatoEstrategia').query({ encodedURI: 'invalidData' });
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