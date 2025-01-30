import mysql.connector
import xlsxwriter
import sys
from datetime import datetime

if __name__ == "__main__":
    # ---Connection---
    database = mysql.connector.connect(
        host="127.0.0.1", user="root", passwd="siscae1035", database="db_sica")

    # ---Create cursor to manipulate consults---
    cursor = database.cursor(buffered=True, dictionary=True)

    cursor.execute(""" SELECT per.folio, per.fecha_inicio, per.fecha_fin, emp.matricula AS mat_titular, 
    CONCAT_WS(' ', pers.nombres,pers.primer_apellido,pers.segundo_apellido) AS titular,
    emp2.matricula AS mat_suplente,
    CONCAT_WS(' ', pers2.nombres,pers2.primer_apellido,pers2.segundo_apellido) AS suplente,
    per.created_at
    FROM rch_permisos per INNER JOIN rch_empleados emp
    ON per.id_empleado = emp.id INNER JOIN cmp_persona pers
    ON pers.id = emp.id_persona INNER JOIN rch_empleados emp2
    ON per.id_suplente = emp2.id INNER JOIN cmp_persona pers2
    ON pers2.id = emp2.id_persona
    WHERE per.folio <= 0 AND per.deleted_at IS NULL; """)

    data = cursor.fetchall()

    # ---Close connections---
    cursor.close()
    database.close()

    workbook = xlsxwriter.Workbook('/home/desarrollo/Escritorio/folios.xlsx')
    worksheet = workbook.add_worksheet()

    column = 0
    for reg in data:
        folio = reg['folio']
        fec_ini = str(reg['fecha_inicio']).split(' ')[0]
        fec_fin = str(reg['fecha_fin']).split(' ')[0]
        mat_titular = reg['mat_titular']
        titular = reg['titular']
        mat_suplente = reg['mat_suplente']
        suplente = reg['suplente']
        created_at = reg['created_at'].strftime('%Y-%m-%d %H:%M:%S')

        worksheet.write(column, 0, folio)
        worksheet.write(column, 1, fec_ini)
        worksheet.write(column, 2, fec_fin)
        worksheet.write(column, 3, mat_titular)
        worksheet.write(column, 4, titular)
        worksheet.write(column, 5, mat_suplente)
        worksheet.write(column, 6, suplente)
        worksheet.write(column, 7, created_at)
        column += 1

    workbook.close()

    # -------FIN MIGRACIÓN - APLICAR CAMBIOS-------
    """ database.commit()
    print("Migración finalizada\n") """
