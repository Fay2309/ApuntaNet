from flask import Flask,jsonify,request
import mysql.connector

#Se genera la Api
Api = Flask(__name__)

conexion = mysql.connector.connect(user='root',
                                   password='201614',
                                   host='localhost',
                                   database='apuntanet_db')


@Api.route("/login", methods=['GET'])
def login():
    usuario = request.args.get('usuario')
    password = request.args.get('password')
    cursor = conexion.cursor()
    cursor.execute("SELECT usuario, contraseña FROM apuntanet_db.usuarios WHERE usuario = %s AND contraseña = %s", (usuario, password))
    resultado = cursor.fetchone()
    conexion.close()
    if resultado:
        return jsonify({"status": "success", "message": "Inicio completado"}), 200
    else:
        return jsonify({"status": "error", "message": "Credenciales incorrectas"}), 401

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
    conexion.close()
    if resultado:
        tickets = [{"nombre": row[0], "descripcion": row[1], "monto_abonado": row[2], "monto_total": row[3], "fecha_expiracion": row[4]} for row in resultado]
        return jsonify({"status": "success", "tickets": tickets}), 200
    else:
        return jsonify({"status": "error", "message": "No se encontraron datos"}), 404


#se ejecuta la api
if __name__ == "__main__":
    Api.run(debug=True)