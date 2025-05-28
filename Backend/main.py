from flask import Flask,jsonify,request
import mysql.connector
from flask_cors import CORS
import random
import string
import jwt #<-- Instalar Pip install PyJWT
#Se genera la Api
SECRET_KEY = 'UnaDeCasaParaElGaelPlis'
Api = Flask(__name__)
CORS(Api, resources={r"/*": {"origins": "http://localhost:4200"}}, 
     supports_credentials=True)

conexion = mysql.connector.connect(user='root',
                                   password='hola12',
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

@Api.route("/bienvenida", methods=['POST'])
def bienvenida():
    data = request.get_json()
    accion = data.get('accion')

    if accion == 'crear':
        return crear_hogar(data)
    elif accion == 'unirse':
        return unirse_hogar(data)
    else:
        return jsonify({"status": "error", "message": "Acción no válida"}), 400

def crear_hogar(data):
    nombre_hogar = data.get('nombre_hogar')
    descripcion = data.get('descripcion_hogar')
    id_usuario = data.get('id_usuario')
    codigo = crearcodigo()

    try:
        cursor = conexion.cursor()
        cursor.execute("SELECT estado FROM usuarios WHERE Id = %s", (id_usuario,))
        estado = cursor.fetchone()
        if estado and estado[0] == 'A':
            return jsonify({"status": "error", "message": "No puedes crear un hogar porque ya perteneces a uno"}), 400

        cursor.execute("""
            INSERT INTO hogar (nombre, descripcion, id_usuario, fecha_creacion, codigo)
            VALUES (%s, %s, %s, NOW(), %s)
        """, (nombre_hogar, descripcion, id_usuario, codigo))
        cursor.execute("UPDATE usuarios SET estado = 'A' WHERE Id = %s", (id_usuario,))
        conexion.commit()
        return jsonify({"status": "Correcto", "message": "Hogar creado exitosamente"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al crear hogar: {err}"}), 500
    finally:
        cursor.close()

def unirse_hogar(data):
    raw_token = data.get('token')
    if not raw_token or not raw_token.startswith("Bearer "):
        return jsonify({"status": "error", "message": "Token no proporcionado o malformado"}), 401

    token = raw_token.split(" ")[1]
    codigo = data.get('codigo')
    cursor = conexion.cursor()
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        id_usuario = decoded_token['id_usuario']

        cursor.execute("SELECT estado FROM usuarios WHERE Id = %s", (id_usuario,))
        estado = cursor.fetchone()
        if estado and estado[0] == 'A':
            return jsonify({"status": "error", "message": "No puedes pertenecer a dos hogares al mismo tiempo"}), 400

        cursor.execute("""
            INSERT INTO casas_usuarios (id_usuario, id_hogar, fecha_ingreso)
            VALUES (%s, (SELECT id FROM hogar WHERE codigo = %s), NOW())
        """, (id_usuario, codigo))
        cursor.execute("UPDATE usuarios SET estado = 'A' WHERE Id = %s", (id_usuario,))
        conexion.commit()
        return jsonify({"status": "Correcto", "message": "Ingreso exitoso"}), 201
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al ingresar al hogar: {err}"}), 500
    except jwt.ExpiredSignatureError:
        return jsonify({"status": "error", "message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"status": "error", "message": "Token inválido"}), 401
    finally:
        cursor.close()

#esta ruta sirve para consultar los usuarios de un hogar
#se le pasa el id del hogar, el cual se utiliza para obtener los usuarios de ese hogar
@Api.route("/salirHogar", methods=['POST'])
def salirse_hogar():
    data = request.get_json()

    raw_token = data.get('token')
    if not raw_token or not raw_token.startswith("Bearer "):
        return jsonify({"status": "error", "message": "Token no proporcionado o malformado"}), 401

    token = raw_token.split(" ")[1]
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        id_usuario = decoded_token['id_usuario']
        
        cursor = conexion.cursor()

        # 1. Verificar si el usuario es el creador
        cursor.execute("SELECT id FROM hogar WHERE id_usuario = %s", (id_usuario,))
        creador_hogar = cursor.fetchone()

        if creador_hogar:
            id_hogar = creador_hogar[0]
            cursor.execute("UPDATE usuarios SET estado = '' WHERE Id IN (SELECT id_usuario FROM casas_usuarios WHERE id_hogar = %s)", (id_hogar,))
            cursor.execute("DELETE FROM casas_usuarios WHERE id_hogar = %s", (id_hogar,))
            cursor.execute("DELETE FROM hogar WHERE id = %s", (id_hogar,))
            cursor.execute("UPDATE usuarios SET estado = '' WHERE Id = %s", (id_usuario,))
            conexion.commit()
            return jsonify({"status": "Correcto", "message": "Hogar disuelto exitosamente"}), 200

        cursor.execute("SELECT id_hogar FROM casas_usuarios WHERE id_usuario = %s", (id_usuario,))
        miembro_hogar = cursor.fetchone()

        if miembro_hogar:
            id_hogar = miembro_hogar[0]
            cursor.execute("DELETE FROM casas_usuarios WHERE id_usuario = %s AND id_hogar = %s", (id_usuario, id_hogar))
            cursor.execute("UPDATE usuarios SET estado = '' WHERE Id = %s", (id_usuario,))
            conexion.commit()
            return jsonify({"status": "Correcto", "message": "Has salido del hogar"}), 200

        return jsonify({"status": "error", "message": "No perteneces a ningún hogar"}), 400

    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error: {err}"}), 500
    except jwt.ExpiredSignatureError:
        return jsonify({"status": "error", "message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"status": "error", "message": "Token inválido"}), 401
    finally:
        cursor.close()



#esta ruta sirve para consultar los hogares a los que pertenece el usuario
#se le pasa el token del usuario, el cual se utiliza para obtener el id del usuario.
@Api.route("/consultarHogar", methods=['POST'])
def consultar_hogar():
    data = request.get_json()
    token = data.get('token')

    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        id_usuario = decoded_token['id_usuario']
        cursor = conexion.cursor()

        hogares = []

        # Hogares donde el usuario es el creador
        cursor.execute("""
            SELECT hogar.id, hogar.nombre, hogar.descripcion, hogar.codigo, hogar.fecha_creacion
            FROM hogar
            WHERE hogar.id_usuario = %s
        """, (id_usuario,))
        for row in cursor.fetchall():
            hogares.append({
                'id': row[0],
                'nombre': row[1],
                'descripcion': row[2],
                'codigo': row[3],
                'fecha_creacion': row[4].strftime('%Y-%m-%d %H:%M:%S'),
                'es_creador': True
            })

        # Hogares donde el usuario solo está unido
        cursor.execute("""
            SELECT hogar.id, hogar.nombre, hogar.descripcion, hogar.codigo, hogar.fecha_creacion
            FROM hogar
            INNER JOIN casas_usuarios ON hogar.id = casas_usuarios.id_hogar
            WHERE casas_usuarios.id_usuario = %s
        """, (id_usuario,))
        for row in cursor.fetchall():
            hogares.append({
                'id': row[0],
                'nombre': row[1],
                'descripcion': row[2],
                'codigo': row[3],
                'fecha_creacion': row[4].strftime('%Y-%m-%d %H:%M:%S'),
                'es_creador': False
            })

        return jsonify({"status": "Correcto", "hogares": hogares}), 200

    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al consultar hogares: {err}"}), 500
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

#esta ruta sirve para consultar las categorias de un hogar
#se le pasa el id del hogar, el cual se utiliza para obtener las categorias de ese hogar
@Api.route("/categoria/consultar", methods=['POST'])
def consultar_categoria():
    data = request.get_json()
    id_hogar = data.get('id_hogar')
    try:
        cursor = conexion.cursor()
        cursor.execute("""
            SELECT id, nombre, descripcion, grado_privilegio, fecha_creacion
            FROM categoria
            WHERE id_hogar = %s""", (id_hogar,))

        resultados = cursor.fetchall()
        categorias = []
        for row in resultados:
            categorias.append({
                'id': row[0],
                'nombre': row[1],
                'descripcion': row[2],
                'grado_privilegio': row[3],
                'fecha_creacion': row[4].strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return jsonify({"status": "Correcto", "categorias": categorias}), 200
    except mysql.connector.Error as err:
        return jsonify({"status": "error", "message": f"Error al consultar categorias: {err}"}), 500
    finally:
        cursor.close()


#retorna el monto total y el nombre de la categoria, tomando en cuenta el mes y el año actual
#se le pasa id del usuario y el id del hogar
@Api.route("/DesgloseMensual", methods=['GET'])
def desglose():
    cursor = conexion.cursor()
    token = request.get_json('token').split(" ")[1]
    decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    usuario = decoded_token['id_usuario']
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
@Api.route("/ticketsIndividual/consultar", methods=['GET'])
def tickets():
    cursor = conexion.cursor()
    token = request.get_json('token').split(" ")[1]
    decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    usuario = decoded_token['id_usuario']
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
