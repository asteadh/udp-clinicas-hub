import { IngresoFormulario } from "@/components/ingreso-formulario";

/* Estática: el ingreso ya no depende de qué clínica venga preseleccionada,
   porque el formulario lo sirve Google y la clínica se elige dentro de él. */
export const revalidate = 60;

export const metadata = {
  title: "Ingreso — Hub Negocios UDP",
};

export default function IngresoPage() {
  return (
    <section className="seccion" id="ingreso" style={{ borderBottom: 0 }}>
      <div className="envoltura">
        <div className="seccion__cabeza">
          <div>
            <p className="etiqueta etiqueta--rojo">Ingreso</p>
            <h1>Formulario de ingreso</h1>
          </div>
        </div>
        <IngresoFormulario />
      </div>
    </section>
  );
}
