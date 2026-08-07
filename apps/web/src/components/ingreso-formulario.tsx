import Image from "next/image";

/* El ingreso se recoge en un formulario de Google que mantiene la Facultad, no
   en el formulario propio del repo. Aquí solo se enlaza y se ofrece el código
   para escanearlo desde el teléfono.

   El QR es un SVG estático en public/: se generó una vez a partir del enlace, así
   que no hay dependencia en tiempo de ejecución ni llamada a ningún servicio
   externo para dibujarlo. Si el enlace del formulario cambia, hay que regenerar
   ese archivo — el código no lo deduce solo. */

export const FORMULARIO_URL = "https://forms.gle/46mccK2wThTUe7nT6";

export function IngresoFormulario() {
  return (
    <div className="ingreso">
      <div className="expediente">
        <div className="expediente__encabezado">
          <h3>Solicitud de atención</h3>
          <span className="etiqueta">Formulario de la Facultad</span>
        </div>

        <div className="ingreso__qr">
          <a href={FORMULARIO_URL} target="_blank" rel="noreferrer" className="ingreso__codigo">
            <Image
              src="/qr-formulario-ingreso.svg"
              alt={`Código QR del formulario de ingreso: ${FORMULARIO_URL}`}
              width={512}
              height={512}
            />
          </a>

          <div className="ingreso__acceso">
            <p>
              Escanea el código con la cámara del teléfono, o abre el formulario directamente si
              estás en un computador.
            </p>
            <a href={FORMULARIO_URL} target="_blank" rel="noreferrer" className="boton">
              Abrir el formulario
            </a>
            <p className="ingreso__enlace">{FORMULARIO_URL}</p>
          </div>
        </div>
      </div>

      <aside className="proceso">
        <h4>¿Qué pasa después?</h4>

        <div className="paso">
          <span className="paso__n">01</span>
          <div>
            <p className="paso__t">Completas el formulario</p>
            <p className="paso__d">Nos cuentas tu caso indicando la clínica correspondiente.</p>
          </div>
        </div>

        <div className="paso">
          <span className="paso__n">02</span>
          <div>
            <p className="paso__t">Un equipo revisa tu caso</p>
            <p className="paso__d">
              Un integrante de la clínica evalúa tu solicitud y confirma si puede ser atendida.
            </p>
          </div>
        </div>

        <div className="paso">
          <span className="paso__n">03</span>
          <div>
            <p className="paso__t">Te contactamos</p>
            <p className="paso__d">Coordinamos contigo los siguientes pasos de tu asesoría.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
