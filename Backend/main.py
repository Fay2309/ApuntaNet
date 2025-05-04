from flask import Flask,jsonify,request
import mysql.connector
from flask_cors import CORS

#Se genera la Api
Api = Flask(__name__)
CORS(Api, resources={r"/*": {"origins": "http://localhost:4200"}}, 
     supports_credentials=True)

conexion = mysql.connector.connect(user='root',
                                   password='hola12',
                                   host='localhost',
                                   database='apuntanet_db')


@Api.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    usuario = data.get('usuario')
    password = data.get('password')
    
    cursor = conexion.cursor()
    cursor.execute("SELECT usuario, password FROM apuntanet_db.usuarios WHERE usuario = %s AND password = %s", (usuario, password))
    resultado = cursor.fetchone()
    cursor.close()

    if resultado:
        return jsonify({"status": "success", "message": "Inicio completado"}), 200
    else:
        return jsonify({"status": "error", "message": "Credenciales incorrectas"}), 401
    
@Api.rout("/registro", methods=['POST'])
def registro ():
    data = request.get_json()
    usuario = data.get('usuario')
    contraseña = data.get('contraseña')
    correo = data.get('correo')
    telefono = data.get('telefono')

    try:
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO usuarios (usuario, contraseña, correo, telefono)
            VALUES (%s, %s, %s, %s)""", 
            (usuario, contraseña, correo, telefono))
        conexion.commit()  # Confirma los cambios en la base de datos
        return jsonify({"status": "Correcto", "message": "Usuario registrado exitosamente"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al registrar usuario: {err}"}), 500
    finally:
        cursor.close()

@Api.route("/hogar/crear", methods=['POST'])
def crear_hogar():
    data = request.get_json()
    nombre_hogar = data.get('nombre_hogar')
    usuario = data.get('usuario')

    try:
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO hogar (nombre, descripcion, creador, fecha_creacion, codigo)
            VALUES (%s, %s, %s, NOW(), %s)""", 
            (nombre_hogar, None, usuario, codigo))
        conexion.commit()  # Confirma los cambios en la base de datos
        return jsonify({"status": "Correcto", "message": "Hogar creado exitosamente"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al crear hogar: {err}"}), 500
    finally:
        cursor.close()

@Api.route("/categoria/crear", methods=['POST'])
def crear_categoria():
    data = request.get_json()
    id_hogar = data.get('id_hogar')
    nombre = data.get('nombre_categoria')
    descripcion = data.get('descripcion_categoria')
    grado_privilegio = data.get('grado_privilegio')
    fecha_creacion = data.get('fecha_creacion')

    try:
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO categoria (nombre, id_hogar, descripcion, grado_privilegio, fecha_creacion, usuario)
            VALUES (%s, %s, %s, %s, NOW(), %s)""", 
            (nombre, id_hogar, descripcion, grado_privilegio, fecha_creacion, usuario))
        conexion.commit()  # Confirma los cambios en la base de datos
        return jsonify({"status": "Correcto", "message": "Categoria creada exitosamente"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al crear categoria: {err}"}), 500
    finally:
        cursor.close()

@Api.route("/Desglose", methods=['GET'])
def desglose():
    cursor = conexion.cursor()
    usuario = request.args.get('usuario')
    cursor.execute("""SELECT 
                        categoria.nombre AS categoria,
                        SUM(monto_individual.monto_abonado) AS total_abonado
                    FROM 
                        monto_individual
                        INNER JOIN ticket ON monto_individual.id_ticket = ticket.id
                        INNER JOIN categoria ON ticket.id_categoria = categoria.id
                        INNER JOIN hogar ON categoria.id_hogar = hogar.id
                    WHERE 
                        MONTH(monto_individual.fecha_pago) = MONTH(CURRENT_DATE()) AND
                        YEAR(monto_individual.fecha_pago) = YEAR(CURRENT_DATE()) AND
                        monto_individual.id_usuario = %s AND
                        hogar.id = %s
                    GROUP BY 
                        categoria.nombre;
                    ;
""", (usuario, hogar_id))
    resultado = cursor.fetchall()
    conexion.close()
    if resultado:
        desglose = [{"categoria": row[0], "total_abonado": row[1]} for row in resultado]
        return jsonify({"status": "success", "desglose": desglose}), 200
    else:
        return jsonify({"status": "error", "message": "No se encontraron datos"}), 404

@Api.route("/Tickets", methods=['GET'])
def tickets():
    cursor = conexion.cursor()
    usuario = request.args.get('usuario')
    hogar_id = request.args.get('hogar_id')
    cursor.execute("""SELECT 
                        ticket.nombre,
                        ticket.descripcion,
                        monto_individual.monto_abonado,
                        monto_individual.monto_total,
                        monto_individual.fecha_expiracion
                    FROM
                        monto_individual
                    INNER JOIN  ticket ON monto_individual.id_ticket = ticket.id
                    WHERE
                        monto_individual.fecha_expiracion >= now() AND
                        monto_individual.id_usuario = %s AND
                        ticket.estado = "XPG"
                    ORDER BY 
                        monto_individual.fecha_expiracion ASC;
""",(usuario))
    resultado = cursor.fetchall()
    cursor.close()
    if resultado:
        tickets = [{"nombre": row[0], "descripcion": row[1], "monto_abonado": row[2], "monto_total": row[3], "fecha_expiracion": row[4]} for row in resultado]
        return jsonify({"status": "success", "tickets": tickets}), 200
    else:
        return jsonify({"status": "error", "message": "No se encontraron datos"}), 404


#se ejecuta la api
if __name__ == "__main__":
    Api.run(debug=True)