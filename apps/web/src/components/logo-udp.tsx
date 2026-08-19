/* Marca UDP en línea: sustituye la palabra «UDP» allí donde el sitio la escribe,
   con las tres letras del logotipo institucional y nada más — sin el nombre
   desplegado al lado, que era redundante junto a un texto que ya decía UDP.

   Recortada de UDP_LogoRGB_2lineas_Color_SinFondo.png y de su variante Blanco,
   descargadas del sitio de la universidad. El recorte se calculó por la caja de
   los píxeles rojos: 193x115 px, justo las letras.

   Se pinta como fondo de un <span>, no como <img>, y esa es la razón: con dos
   imágenes superpuestas y una oculta por CSS, ambas llegaban a verse a la vez
   mientras la hoja cargaba. Como fondo solo se descarga y se pinta la que
   corresponde al tema. Se dimensiona en `em`, así que sigue el tamaño del texto
   que la rodea. */

export function MarcaUdp({ className = "" }: { className?: string }) {
  return (
    <span className={`udp ${className}`.trim()} role="img" aria-label="UDP" />
  );
}

/** El nombre del sitio con la marca en el lugar de las tres letras. */
export function NombreSitio({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      Hub Negocios <MarcaUdp />
    </span>
  );
}
