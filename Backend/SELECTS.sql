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
;45

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




###corregir BK con encriptacion
UPDATE usuarios
SET password = AES_ENCRYPT('HOLA12', 'UnaDeCasaParaElGaelPlis'),
correo = aes_encrypt('gaelvalenzuela2309@gmail.com','UnaDeCasaParaElGaelPlis'),
telefono=aes_encrypt('6682272112','UnaDeCasaParaElGaelPlis')
WHERE id = 3;

UPDATE usuarios
SET password = AES_ENCRYPT('UnaMotomamiPlis1', 'UnaDeCasaParaElGaelPlis'),
correo = aes_encrypt('filiberogalvez@gmail.com','UnaDeCasaParaElGaelPlis'),
telefono=aes_encrypt('6688858358','UnaDeCasaParaElGaelPlis')
WHERE id = 4;


UPDATE usuarios
SET password = AES_ENCRYPT('hola12', 'UnaDeCasaParaElGaelPlis'),
correo = aes_encrypt('jorge@gmail.com','UnaDeCasaParaElGaelPlis'),
telefono=aes_encrypt('6682542660','UnaDeCasaParaElGaelPlis')
WHERE id = 5;


UPDATE usuarios
SET password = AES_ENCRYPT('tarea03', 'UnaDeCasaParaElGaelPlis'),
correo = aes_encrypt('angul0alan@gmail.com','UnaDeCasaParaElGaelPlis'),
telefono=aes_encrypt('6674473565','UnaDeCasaParaElGaelPlis')
WHERE id = 6;

SET FOREIGN_KEY_CHECKS = 1;SET FOREIGN_KEY_CHECKS = 1; #sirve para desctivar las foreing keys

ALTER TABLE usuarios AUTO_INCREMENT =8; # actualizar el auto incrementable de una tabla



##################CAMBIOS categoria ##################
ALTER TABLE `apuntanet_db`.`categoria` 
DROP FOREIGN KEY `CasaPertenece`;
ALTER TABLE `apuntanet_db`.`categoria` 
DROP COLUMN `id_hogar`,
DROP INDEX `CasaPertenece_idx` ;
;

##################CREAR hogar_detalles ##################
CREATE TABLE `apuntanet_db`.`categorias_hogar` (
  `id` INT NOT NULL,
  `id_casa` INT NOT NULL,
  `id_categoria` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Casa_idx` (`id_casa` ASC) VISIBLE,
  INDEX `Categoria_idx` (`id_categoria` ASC) VISIBLE,
  CONSTRAINT `hogar`
    FOREIGN KEY (`id_casa`)
    REFERENCES `apuntanet_db`.`hogar` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `Categoria`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `apuntanet_db`.`categoria` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

##################CAMBIO TICKET##################
ALTER TABLE `apuntanet_db`.`ticket` 
DROP FOREIGN KEY `CategoriaPertenece`;
ALTER TABLE `apuntanet_db`.`ticket` 
CHANGE COLUMN `id_categoria` `id_detalleHogar` INT NOT NULL ,
ADD INDEX `CategoriaPertenece_idx` (`id_detalleHogar` ASC) VISIBLE,
DROP INDEX `CategoriaPertenece_idx` ;
;
ALTER TABLE `apuntanet_db`.`ticket` 
ADD CONSTRAINT `CategoriaPertenece`
  FOREIGN KEY (`id_detalleHogar`)
  REFERENCES `apuntanet_db`.`categorias_hogar` (`id`);

##################renombre a plural##################
ALTER TABLE `apuntanet_db`.`ticket` 
DROP FOREIGN KEY `CreadorDelTicket`;
ALTER TABLE `apuntanet_db`.`ticket` 
CHANGE COLUMN `id_usuarios` `id_usuario` INT NOT NULL ;
ALTER TABLE `apuntanet_db`.`ticket` 
ADD CONSTRAINT `CreadorDelTicket`
  FOREIGN KEY (`id_usuario`)
  REFERENCES `apuntanet_db`.`usuarios` (`Id`);
