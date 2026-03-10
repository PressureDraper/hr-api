import { translateDays } from "../../../helpers/ImssReport"

describe('Translate', () => {
    
    test('Contains data', () => {
        const mockDays = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
        const res = translateDays(mockDays);
        expect(res.length).toBeGreaterThan(0);
    });

    test('A full week', () => {
        const mockDays = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
        const res = translateDays(mockDays);
        expect(res).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    });

    
    test('Partial week', () => {
        const mockDays = ['LUNES', 'MIERCOLES', 'VIERNES'];
        const res = translateDays(mockDays);
        expect(res).toEqual(['Monday', 'Wednesday', 'Friday']);
    });

    
    test('Empty array', () => {
        const mockDays: string[] = [];
        const res = translateDays(mockDays);
        expect(res.length).toBe(0);
    });

    test('Holiday on a specific day', () => {
        const mockDays = ['MARTES', 'Festivo', 'JUEVES'];
        const res = translateDays(mockDays);
        expect(res).toEqual(['Tuesday', 'Festivos', 'Thursday']);
    });

});