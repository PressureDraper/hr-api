import { calcIncidencias } from "../../../helpers/ImssReport";

const mockData = {
    final: [
        {
            dateReg: 'Thu, 05 Feb 2026 00:00:00 GMT',
            horaReg: '',
            type: 'EVENTO',
            event: 'DEFUNCION',
            schedule: '13:00:00 - 21:00:00',
            guardias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
        },
        {
            dateReg: 'Fri, 06 Feb 2026 00:00:00 GMT',
            horaReg: '',
            type: 'EVENTO',
            event: 'SUSPENSION',
            schedule: '13:00:00 - 21:00:00',
            guardias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
        },
        {
            dateReg: 'Mon, 09 Feb 2026 00:00:00 GMT',
            horaReg: '',
            type: 'EVENTO',
            event: 'OMISION',
            schedule: '13:00:00 - 21:00:00',
            guardias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
        },
        {
            biometric: 7,
            dateReg: 'Tue, 10 Feb 2026 00:00:00 GMT',
            horaReg: '12:59:43',
            mat: 5806,
            label: 'TxT 5806 STHEFANIA HUESCA SANCHEZ',
            ini_horario_titular: '',
            fin_horario_titular: '',
            type: 'ENTRADA',
            schedule: '13:00:00 - 21:00:00',
            guardias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
            event: 'TxT 5806 STHEFANIA HUESCA SANCHEZ'
        },
        {
            biometric: 9,
            dateReg: 'Tue, 10 Feb 2026 00:00:00 GMT',
            horaReg: '21:03:34',
            mat: 5806,
            label: 'TxT 5806 STHEFANIA HUESCA SANCHEZ',
            ini_horario_titular: '',
            fin_horario_titular: '',
            type: 'SALIDA',
            schedule: '13:00:00 - 21:00:00',
            guardias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
            event: 'TxT 5806 STHEFANIA HUESCA SANCHEZ'
        },
        {
            biometric: 7,
            dateReg: 'Wed, 11 Feb 2026 00:00:00 GMT',
            horaReg: '12:48:00',
            mat: 5806,
            label: 'TxT 5806 STHEFANIA HUESCA SANCHEZ',
            ini_horario_titular: '',
            fin_horario_titular: '',
            type: 'ENTRADA',
            schedule: '13:00:00 - 21:00:00',
            guardias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
            event: 'FALTA'
        },
        {
            biometric: 4,
            dateReg: 'Thu, 12 Feb 2026 00:00:00 GMT',
            horaReg: '12:57:35',
            mat: 5806,
            label: 'TxT 5806 STHEFANIA HUESCA SANCHEZ',
            ini_horario_titular: '',
            fin_horario_titular: '',
            type: 'ENTRADA',
            schedule: '13:00:00 - 21:00:00',
            guardias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
            event: 'FALTA'
        }
    ]
}

const mockData2 = {
    final: [
        {
            biometric: 7,
            dateReg: 'Tue, 10 Feb 2026 00:00:00 GMT',
            horaReg: '12:59:43',
            mat: 5806,
            label: 'TxT 5806 STHEFANIA HUESCA SANCHEZ',
            ini_horario_titular: '',
            fin_horario_titular: '',
            type: 'ENTRADA',
            schedule: '13:00:00 - 21:00:00',
            guardias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
            event: 'TxT 5806 STHEFANIA HUESCA SANCHEZ'
        },
        {
            biometric: 9,
            dateReg: 'Tue, 10 Feb 2026 00:00:00 GMT',
            horaReg: '21:03:34',
            mat: 5806,
            label: 'TxT 5806 STHEFANIA HUESCA SANCHEZ',
            ini_horario_titular: '',
            fin_horario_titular: '',
            type: 'SALIDA',
            schedule: '13:00:00 - 21:00:00',
            guardias: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'],
            event: 'TxT 5806 STHEFANIA HUESCA SANCHEZ'
        }
    ]
}

describe('Incidencias Separadas', () => {

    describe('diasDescuento', () => {
        test("Debe retornar datos cuando hay eventos de 'FALTA'", () => {
            const result = calcIncidencias(mockData);

            expect(result.diasDescuento.length).toBeGreaterThan(0);
        });

        test("Debe retornar fechas cuando hay eventos de 'FALTA'", () => {
            const result = calcIncidencias(mockData);

            expect(result.diasDescuento).toEqual('11/02/2026, 12/02/2026');
        });

        test("Debe retornar un string vacío cuando no hay eventos de 'FALTA'", () => {
            const result = calcIncidencias(mockData2);

            expect(result.diasDescuento).toEqual('');
        });
    });

    describe('omisiones', () => {
        test("Debe retornar datos cuando hay eventos de 'OMISION'", () => {
            const result = calcIncidencias(mockData);

            expect(result.diasOmision.length).toBeGreaterThan(0);
        });

        test("Debe retornar fechas cuando hay eventos de 'OMISION'", () => {
            const result = calcIncidencias(mockData);

            expect(result.diasOmision).toEqual('09/02/2026');
        });

        test("Debe retornar un string vacío cuando no hay eventos de 'OMISION'", () => {
            const result = calcIncidencias(mockData2);

            expect(result.diasOmision).toEqual('');
        });
    });

    describe('suspensiones', () => {
        test("Debe retornar datos cuando hay eventos de 'SUSPENSION'", () => {
            const result = calcIncidencias(mockData);

            expect(result.diasSuspension.length).toBeGreaterThan(0);
        });

        test("Debe retornar fechas cuando hay eventos de 'SUSPENSION'", () => {
            const result = calcIncidencias(mockData);

            expect(result.diasSuspension).toEqual('06/02/2026');
        });

        test("Debe retornar un string vacío cuando no hay eventos de 'SUSPENSION'", () => {
            const result = calcIncidencias(mockData2);

            expect(result.diasSuspension).toEqual('');
        });
    });
});

describe('Incidencias completas', () => {
    test('Debe retornar 2 faltas, 1 omision y 1 suspension', () => {
        const result = calcIncidencias(mockData);

        expect(result).toEqual({
            diasDescuento: '11/02/2026, 12/02/2026',
            diasOmision: '09/02/2026',
            diasSuspension: '06/02/2026'
        });
    });

    test('Debe retornar un string vacío para todas las incidencias cuando no hay eventos', () => {
        const result = calcIncidencias(mockData2);
        expect(result).toEqual({
            diasDescuento: '',
            diasOmision: '',
            diasSuspension: ''
        });
    });
});