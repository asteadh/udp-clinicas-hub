import Image from "next/image";

/* Logotipo institucional de la Universidad Diego Portales, descargado de su
   propio sitio: UDP_LogoRGB_2lineas_Color_SinFondo.png y su variante Blanco.
   Verificados por análisis de píxeles: el de color usa exactamente el rojo y el
   gris institucionales, que son los mismos valores de los que sale la paleta del
   sitio (ver hubColors en packages/ui/src/tokens.ts).

   Se cargan las dos versiones y se alternan por CSS: el gris del logotipo a
   color desaparecería sobre el papel oscuro, y en el pie —que es oscuro en
   ambos temas— siempre va el blanco. */

export function LogoUdp({
  className = "",
  variante = "auto",
}: {
  className?: string;
  /** "auto" alterna con el tema. "blanco" fuerza la versión invertida. */
  variante?: "auto" | "blanco";
}) {
  const alt = "Universidad Diego Portales";

  if (variante === "blanco") {
    return (
      <Image className={`logo-udp ${className}`.trim()} src="/udp-blanco.png" alt={alt} width={540} height={132} />
    );
  }

  return (
    <span className={`logo-udp ${className}`.trim()}>
      <Image className="logo-udp__claro" src="/udp-color.png" alt={alt} width={534} height={130} />
      <Image className="logo-udp__oscuro" src="/udp-blanco.png" alt="" aria-hidden width={540} height={132} />
    </span>
  );
}
