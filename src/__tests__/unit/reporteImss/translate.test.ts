import { translateDays } from "../../../helpers/ImssReport"

describe('Traducir', () => {
    
    test('Debe retornar datos cuando se le proporciona un array de días', () => {
        const mockDays = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
        const res = translateDays(mockDays);
        expect(res.length).toBeGreaterThan(0);
    });

    test('Debe traducir todos los días de la semana', () => {
        const mockDays = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
        const res = translateDays(mockDays);
        expect(res).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    });

    
    test('Debe traducir una semana parcial', () => {
        const mockDays = ['LUNES', 'MIERCOLES', 'VIERNES'];
        const res = translateDays(mockDays);
        expect(res).toEqual(['Monday', 'Wednesday', 'Friday']);
    });

    
    test('Debe retornar un array vacío cuando no hay datos', () => {
        const mockDays: string[] = [];
        const res = translateDays(mockDays);
        expect(res.length).toBe(0);
    });

    test('Debe retornar el evento "Festivos" cuando un dia no es válido', () => {
        const mockDays = ['MARTES', 'Festivo', 'JUEVES'];
        const res = translateDays(mockDays);
        expect(res).toEqual(['Tuesday', 'Festivos', 'Thursday']);
    });

});