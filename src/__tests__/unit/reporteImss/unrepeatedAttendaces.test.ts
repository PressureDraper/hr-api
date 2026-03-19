import { getUnrepeatedAttendances } from "../../../helpers/ImssReport";

describe('Asistencias', () => {

    test('Debe eliminar duplicados por horaReg en el mismo minuto', () => {
        const mockData1 = [
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:31',
                mat: 5806
            },
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:42',
                mat: 5806
            },
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '14:36:18',
                mat: 5806
            }
        ];

        const result = getUnrepeatedAttendances(mockData1);

        expect(result).toEqual([
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:31',
                mat: 5806
            },
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '14:36:18',
                mat: 5806
            }
        ]);
    });

    test('Debe retornar los mismos datos cuando hay fechas diferentes', () => {
        const mockData2 = [
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:31',
                mat: 5806
            },
            {
                biometric: 7,
                dateReg: 'Thu, 05 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:42',
                mat: 5806
            },
            {
                biometric: 7,
                dateReg: 'Fri, 06 Feb 2026 00:00:00 GMT',
                horaReg: '14:36:18',
                mat: 5806
            }
        ];
        
        const result = getUnrepeatedAttendances(mockData2);

        expect(result).toEqual(mockData2);
    });

    test('Debe retornar solo el primer objeto cuando todos tienen el mismo minuto en horaReg', () => {
        const mockData3 = [
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:31',
                mat: 5806
            },
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:42',
                mat: 5806
            },
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:51',
                mat: 5806
            },
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:58',
                mat: 5806
            }
        ];

        const result = getUnrepeatedAttendances(mockData3);

        expect(result).toEqual([
            {
                biometric: 7,
                dateReg: 'Wed, 04 Feb 2026 00:00:00 GMT',
                horaReg: '06:24:31',
                mat: 5806
            }
        ]);
    });

    test('Debe retornar un array vacío cuando no hay datos', () => {
        const mockData4: any[] = [];

        const result = getUnrepeatedAttendances(mockData4);

        expect(result).toEqual([]);
    });
});