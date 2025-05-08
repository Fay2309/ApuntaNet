from flask import Flask,jsonify,request
import mysql.connector
from flask_cors import CORS
import random
import string
import jwt
#Se genera la Api
SECRET_KEY = 'UnaDeCasaParaElGaelPlis'
Api = Flask(__name__)
CORS(Api, resources={r"/*": {"origins": "http://localhost:4200"}}, 
     supports_credentials=True)

conexion = mysql.connector.connect(user='root',
                                   password='root',
                                   host='localhost',
                                   database='apuntanet_db')

#esta ruta sirve para iniciar sesion
@Api.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    usuario = data.get('usuario')
    password = data.get('password')
    
    cursor = conexion.cursor()
    cursor.execute("""SELECT id,usuario, password 
                   FROM usuarios 
                   WHERE usuario = %s AND password = %s"""
                   , (usuario, password))
    resultado = cursor.fetchone()
    cursor.close()

    if resultado:
        token = jwt.encode({
            'usuario': usuario,
            'id_usuario': resultado[0]
        },
        SECRET_KEY, algorithm='HS256')

        return jsonify({"status": "Correcto", "message": "Inicio de sesión exitoso", "token": token}), 200
    else:
        return jsonify({"status": "error", "message": "Credenciales incorrectas"}), 401

#esta ruta sirve para registrar un nuevo usuario en la base de datos
#se le pasa el nombre de usuario, la contraseña, el correo y el telefono. la fecha de creacion se le asigna automaticamente la fecha actual 
@Api.route("/registro", methods=['POST'])
def registro ():
    data = request.get_json()
    usuario = data.get('usuario')
    password = data.get('password')
    correo = data.get('correo')
    telefono = data.get('telefono')

    try:
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO usuarios (usuario, password, correo, telefono)
            VALUES (%s, %s, %s, %s)""", 
            (usuario, password, correo, telefono))
        conexion.commit()  # Confirma los cambios en la base de datos
        return jsonify({"status": "Correcto", "message": "Usuario registrado exitosamente"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al registrar usuario: {err}"}), 500
    finally:
        cursor.close()

#esta ruta sirve para crear un hogar en la base de datos
#se le pasa el nombre del hogar, la descripcion y el id del usuario. la fecha de creacion se le asigna automaticamente la fecha actual
@Api.route("/hogar/crear", methods=['POST'])
def crear_hogar():
    data = request.get_json()
    nombre_hogar = data.get('nombre_hogar')
    descripcion = data.get('descripcion_hogar')
    codigo = crearcodigo()
    try:
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO hogar (nombre, descripcion, creador, fecha_creacion, codigo)
            VALUES (%s, %s, %s, NOW(), %s)""", 

            (nombre_hogar, descripcion, codigo))
        conexion.commit()  # Confirma los cambios en la base de datos
        return jsonify({"status": "Correcto", "message": "Hogar creado exitosamente"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al crear hogar: {err}"}), 500
    finally:
        cursor.close()


#sirve para unirse a un hogar existente, 
# se le pasa el token y el codigo del hogar. la fecha de creacion se le asigna automaticamente la fecha actual
@Api.route("/hogar/unirse", methods=['POST'])
def unirse_hogar():
    data = request.get_json()
    codigo = data.get('codigo')
    token = request.get_json('token').split(" ")[1]
    decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])

    id_usuario = decoded_token['id_usuario']

    try:
        cursor = conexion.cursor()
        cursor.execute("""
            INSERT INTO casas_usuarios (id_usuario, id_hogar)
            VALUES (%s,(SELECT id from hogar Where codigo =%s),now())"""
            ,(id_usuario, codigo))
        
        conexion.commit()  # Confirma los cambios en la base de datos
        return jsonify({"status": "Correcto", "message": "Hogar creado exitosamente"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al crear hogar: {err}"}), 500
    finally:
        cursor.close()

#esta ruta sirve para crear una categoria en la base de datos
#se le pasa el id del hogar, el nombre de la categoria, la descripcion y el grado de privilegio. la fecha de creacion se le asigna automaticamente la fecha actual
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
            INSERT INTO categoria (id_hogar,nombre, descripcion, grado_privilegio, fecha_creacion)
            VALUES (%s, %s, %s, %s, NOW(), %s)""", 
            (id_hogar, nombre, descripcion, grado_privilegio, fecha_creacion))
        conexion.commit()  # Confirma los cambios en la base de datos
        return jsonify({"status": "Correcto", "message": "Categoria creada exitosamente"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al crear categoria: {err}"}), 500
    finally:
        cursor.close()

#retorna el monto total y el nombre de la categoria, tomando en cuenta el mes y el año actual
#se le pasa id del usuario y el id del hogar
@Api.route("/Desglose", methods=['GET'])
def desglose():
    cursor = conexion.cursor()
    usuario = request.args.get('usuario')
    hogar_id = request.args.get('hogar_id')
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

#sirve para obtener los tickets de los hogares al que pertenece el usuario
#se le pasa el id del hogar y el id del usuario
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
                        monto_individual.id_hogar = %s AND
                        ticket.estado = "XPG"
                    ORDER BY 
                        monto_individual.fecha_expiracion ASC;
""",(usuario, hogar_id))
    resultado = cursor.fetchall()
    cursor.close()
    if resultado:
        tickets = [{"nombre": row[0], "descripcion": row[1], "monto_abonado": row[2], "monto_total": row[3], "fecha_expiracion": row[4]} for row in resultado]
        return jsonify({"status": "success", "tickets": tickets}), 200
    else:
        return jsonify({"status": "error", "message": "No se encontraron datos"}), 404

#funcion utulizada para crear un codigo aleatorio de 6 caracteres, el cual se utiliza para agregar usuarios a los hogares
def crearcodigo():
    codigo = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    cursor = conexion.cursor()
    cursor.execute("SELECT COUNT(*) FROM hogar WHERE codigo = %s", (codigo,))
    resultado = cursor.fetchone()[0]
    cursor.close()
    
    if resultado > 0:
        return crearcodigo()  # Genera un nuevo código si ya existe uno igual
    else:
        return codigo


#se ejecuta la api
if __name__ == '__main__':
    Api.run(debug=True)