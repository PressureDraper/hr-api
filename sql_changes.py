import mysql.connector

if __name__ == "__main__":
    #PUT FOLIO DEFAULT NULL
    # ---Connection---
    database = mysql.connector.connect(
        host="127.0.0.1", user="root", passwd="siscae1035", database="db_sica")

    # ---Create cursor to manipulate consults---
    cursor2 = database.cursor(buffered=True)
    
    # -------INSERTS ced_especialidades-------
    c = 1

    while c <= 14:
        print(f"UPDATE cat_permisos SET deleted_at = NOW() WHERE id = {c}")
        cursor2.execute(f"UPDATE cat_permisos SET deleted_at = NOW() WHERE id = {c}")
        c+=1

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PASE DE SALIDA', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PASE DE SALIDA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('OMISION DE ENTRADA', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('OMISION DE ENTRADA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('OMISION DE SALIDA', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('OMISION DE SALIDA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('RETARDO MENOR', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('RETARDO MENOR', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('FALTA INJUSTIFICADA', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('FALTA INJUSTIFICADA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PERMISO ECONÓMICO', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PERMISO ECONÓMICO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA SIN GOCE DE SUELDO', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA SIN GOCE DE SUELDO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PREJUBILATORIO', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PREJUBILATORIO', now(), now(), NULL)")
    
    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA MEDICA', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA MEDICA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('RETARDO MAYOR 41 AUTORIZADO', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('RETARDO MAYOR 41 AUTORIZADO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('SUSPENSION', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('SUSPENSION', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('BECA CON GOCE DE SUELDO', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('BECA CON GOCE DE SUELDO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('BECA SIN GOCE DE SUELDO', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('BECA SIN GOCE DE SUELDO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('COMISION OFICIAL', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('COMISION OFICIAL', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('COMISION SINDICAL', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('COMISION SINDICAL', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA CON GOCE CUIDADOS MATERNOS', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA CON GOCE CUIDADOS MATERNOS', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA CON GOCE POR MATRIMONIO', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA CON GOCE POR MATRIMONIO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA AUTORIZACIONES ESPECIALES', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA AUTORIZACIONES ESPECIALES', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DESCANSO OBLIGATORIO POR CUMPLEAÑOS', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DESCANSO OBLIGATORIO POR CUMPLEAÑOS', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DEFUNCION FAM. 1ER Y 2DO GRADO', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DEFUNCION FAM. 1ER Y 2DO GRADO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ESTRATEGIA', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ESTRATEGIA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA MEDICA PREPOSNATAL', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA MEDICA PREPOSNATAL', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('REPOSICION DE DIAS FESTIVOS', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('REPOSICION DE DIAS FESTIVOS', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DISFRUTE POR DIA DE LAS MADRES', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DISFRUTE POR DIA DE LAS MADRES', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('VACACIONES', now(), now(), NULL)")
    cursor2.execute(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('VACACIONES', now(), now(), NULL)")

    # -------FIN MIGRACIÓN - APLICAR CAMBIOS-------
    database.commit()
    print('Fin changes')
