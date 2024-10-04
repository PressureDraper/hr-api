import mysql.connector

if __name__ == "__main__":
    # PUT FOLIO DEFAULT NULL
    # ---Connection---
    database = mysql.connector.connect(
        host="db.ssaver.gob.mx", user="root", passwd="siscae1035", database="db_sica")
    """ database = mysql.connector.connect(
        host="10.30.0.8", user="root", passwd="X2gF$/uB", database="db_sica", port=3376) """

    # host="10.30.0.10", user="krloz1003", passwd="krloz1003", database="db_sica")

    # ---Create cursor to manipulate consults---
    cursor2 = database.cursor(buffered=True)

    # -------INSERTS ced_especialidades-------
    c = 1

    while c <= 14:
        print(f"UPDATE cat_permisos SET deleted_at = NOW() WHERE id = {c}")
        cursor2.execute(
            f"UPDATE cat_permisos SET deleted_at = NOW() WHERE id = {c}")
        c += 1

    # add id_suplente field for strategies permission
    print("ALTER TABLE rch_permisos ADD id_suplente INT(10) UNSIGNED AFTER `id_empleado`;")
    cursor2.execute(
        "ALTER TABLE rch_permisos ADD id_suplente INT(10) UNSIGNED AFTER `id_empleado`;")

    # add id_blame field for user that perfomed an action
    print("ALTER TABLE rch_permisos ADD id_blame INT(10) UNSIGNED AFTER `id_suplente`;")
    cursor2.execute(
        "ALTER TABLE rch_permisos ADD id_blame INT(10) UNSIGNED AFTER `id_suplente`;")

    print("ALTER TABLE rch_permisos ADD CONSTRAINT rch_permisos_id_suplente_foreign FOREIGN KEY (id_suplente) REFERENCES rch_empleados(id);")
    cursor2.execute(
        "ALTER TABLE rch_permisos ADD CONSTRAINT rch_permisos_id_suplente_foreign FOREIGN KEY (id_suplente) REFERENCES rch_empleados(id);")

    print("ALTER TABLE rch_permisos ADD CONSTRAINT rch_permisos_id_blame_foreign FOREIGN KEY (id_blame) REFERENCES rch_empleados(id);")
    cursor2.execute(
        "ALTER TABLE rch_permisos ADD CONSTRAINT rch_permisos_id_blame_foreign FOREIGN KEY (id_blame) REFERENCES rch_empleados(id);")

    # add updated permission catalog
    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PASE DE SALIDA', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PASE DE SALIDA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('RETARDO MENOR', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('RETARDO MENOR', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('FALTA INJUSTIFICADA', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('FALTA INJUSTIFICADA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PERMISO ECONÓMICO', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PERMISO ECONÓMICO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA SIN GOCE DE SUELDO', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA SIN GOCE DE SUELDO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PREJUBILATORIO', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('PREJUBILATORIO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA MEDICA', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA MEDICA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('RETARDO MAYOR 41 AUTORIZADO', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('RETARDO MAYOR 41 AUTORIZADO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('SUSPENSION', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('SUSPENSION', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('BECA CON GOCE DE SUELDO', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('BECA CON GOCE DE SUELDO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('BECA SIN GOCE DE SUELDO', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('BECA SIN GOCE DE SUELDO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('COMISION OFICIAL', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('COMISION OFICIAL', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('COMISION SINDICAL', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('COMISION SINDICAL', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA CON GOCE CUIDADOS MATERNOS', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA CON GOCE CUIDADOS MATERNOS', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DESCANSO OBLIGATORIO POR CUMPLEAÑOS', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DESCANSO OBLIGATORIO POR CUMPLEAÑOS', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ESTRATEGIA', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ESTRATEGIA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA MEDICA PREPOSNATAL', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LICENCIA MEDICA PREPOSNATAL', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('REPOSICION DE DIAS FESTIVOS', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('REPOSICION DE DIAS FESTIVOS', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DISFRUTE POR DIA DE LAS MADRES', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('DISFRUTE POR DIA DE LAS MADRES', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('VACACIONES', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('VACACIONES', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('AUTORIZACIÓN DE SALIDA', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('AUTORIZACIÓN DE SALIDA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('AUTORIZACIÓN DE ENTRADA', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('AUTORIZACIÓN DE ENTRADA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('J91 RETARDO MENOR', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('J91 RETARDO MENOR', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ONOMÁSTICO', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ONOMÁSTICO', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('GUARDERIA', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('GUARDERIA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LACTANCIA', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('LACTANCIA', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ART. 138', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ART. 138', now(), now(), NULL)")

    print(f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ART. 160', now(), now(), NULL)")
    cursor2.execute(
        f"INSERT INTO cat_permisos(nombre, created_at, updated_at, deleted_at) VALUES('ART. 160', now(), now(), NULL)")

    # -------FIN MIGRACIÓN - APLICAR CAMBIOS-------
    database.commit()
    print('Fin changes')
