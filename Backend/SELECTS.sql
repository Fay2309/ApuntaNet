SELECT 
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
    monto_individual.id_usuario = 1 AND
    hogar.id = 1
GROUP BY 
    categoria.nombre;
;

SELECT 
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
    monto_individual.id_usuario = 1 AND
    monto_individual.estado = "XPG" #por pagar 
ORDER BY 
	monto_individual.fecha_expiracion ASC
;

#de esta manera se pueden ver los datos que no han sido encriptados pero si esten en una columna de tipo BLOB 
SELECT id, usuario ,cast(password AS CHAR) as password,cast(correo AS CHAR) as correo,cast(telefono AS CHAR) as telefono FROM usuarios;

#de esta manera se desencripta y da formato
SELECT
	id,
	usuario ,
	cast(aes_decrypt(password,'UnaDeCasaParaElGaelPlis') AS CHAR) as password,
	cast(aes_decrypt(correo,'UnaDeCasaParaElGaelPlis') AS CHAR) as correo,
	cast(aes_decrypt(telefono,'UnaDeCasaParaElGaelPlis') AS CHAR) as telefono
FROM usuarios;
;

SET FOREIGN_KEY_CHECKS = 1; #sirve para desctivar las foreing keys

ALTER TABLE usuarios AUTO_INCREMENT =8; # actualizar el auto incrementable de una tabla