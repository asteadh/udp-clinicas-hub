"use client";

import type { Clinic } from "@hubnegocios/api-client";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

/* Formulario de ingreso con el marcado de la pieza de diseño: expediente,
   campos con rótulo propio, acuse de recibo y la barra lateral con el proceso.
   No usa los componentes hub-*, que traen su propio lenguaje redondeado.

   Los nombres de campo respetan el contrato de IntakeRequestInput: clinicSlug,
   fullName, rut, email, caseDescription obligatorios; phone, caseType y
   hasDocumentation opcionales. */

export function IntakeExpediente({ clinics }: { clinics: Clinic[] }) {
  const [clinicSlug, setClinicSlug] = useState("");
  const [fullName, setFullName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [caseType, setCaseType] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [hasDocumentation, setHasDocumentation] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const completo =
    clinicSlug !== "" &&
    fullName.trim() !== "" &&
    rut.trim() !== "" &&
    email.trim() !== "" &&
    caseDescription.trim() !== "";

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!completo || enviando) return;
    setEnviando(true);
    setError("");
    try {
      await api.intake({
        clinicSlug,
        fullName,
        rut,
        email,
        caseDescription,
        phone: phone || undefined,
        caseType: caseType || undefined,
        hasDocumentation: hasDocumentation || undefined,
      });
      setEnviado(true);
    } catch {
      setError("No pudimos enviar tu solicitud. Revisa los datos e inténtalo otra vez.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="ingreso">
      <div className="expediente">
        <div className="expediente__encabezado">
          <h3>Solicitud de atención</h3>
          <span className="etiqueta">Los campos con · son obligatorios</span>
        </div>

        {!enviado && (
          <form className="campos" onSubmit={enviar} noValidate>
            <div className="campo">
              <label htmlFor="clinica">Clínica ·</label>
              <select
                id="clinica"
                name="clinicSlug"
                required
                value={clinicSlug}
                onChange={(e) => setClinicSlug(e.target.value)}
              >
                <option value="">Selecciona una clínica</option>
                {clinics.map((clinic) => (
                  <option key={clinic.slug} value={clinic.slug}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo--par">
              <div className="campo">
                <label htmlFor="nombre">Nombre completo ·</label>
                <input
                  type="text"
                  id="nombre"
                  name="fullName"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="campo">
                <label htmlFor="rut">RUT ·</label>
                <input
                  type="text"
                  id="rut"
                  name="rut"
                  inputMode="text"
                  placeholder="12.345.678-9"
                  required
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                />
              </div>
            </div>

            <div className="campo--par">
              <div className="campo">
                <label htmlFor="email">Email ·</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="campo">
                <label htmlFor="telefono">
                  Teléfono <span className="campo__opcional">(opcional)</span>
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="phone"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="campo">
              <label htmlFor="tipoCaso">
                Tipo de caso <span className="campo__opcional">(opcional)</span>
              </label>
              <input
                type="text"
                id="tipoCaso"
                name="caseType"
                placeholder="Ej: despido injustificado, renegociación de deudas, observación del SII…"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="descripcion">Describe tu caso ·</label>
              <textarea
                id="descripcion"
                name="caseDescription"
                rows={6}
                required
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
              />
              <span className="campo__ayuda">
                Cuéntanos qué pasó, cuándo, y qué has hecho hasta ahora. Mientras más concreto,
                mejor podremos evaluarlo.
              </span>
            </div>

            <div className="campo">
              <label htmlFor="documentacion">
                ¿Cuentas con documentación de respaldo?{" "}
                <span className="campo__opcional">(opcional)</span>
              </label>
              <textarea
                id="documentacion"
                name="hasDocumentation"
                rows={3}
                placeholder="Ej: contrato de trabajo, liquidaciones de sueldo, notificaciones del SII…"
                value={hasDocumentation}
                onChange={(e) => setHasDocumentation(e.target.value)}
              />
            </div>

            <div className="envio">
              <button type="submit" className="boton" id="enviar" disabled={!completo || enviando}>
                {enviando ? "Enviando…" : "Enviar solicitud"}
              </button>
              <p className="envio__nota">
                {error ||
                  "Tu información solo será compartida con la clínica seleccionada y se usará únicamente para evaluar tu solicitud de ingreso."}
              </p>
            </div>
          </form>
        )}

        {enviado && (
          <div className="acuse" role="status" tabIndex={-1}>
            <strong>Recibimos tu solicitud de ingreso.</strong>
            La clínica seleccionada revisará tu caso y te contactará a la brevedad.
          </div>
        )}
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
