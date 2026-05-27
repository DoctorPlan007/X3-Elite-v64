import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const CARGAS = ["Solo yo", "Yo + cónyuge", "Yo + 1 hijo", "Yo + 2 hijos", "Familia completa (4+)"];
const RANGOS_INGRESO = ["Menos de $800.000", "$800.000 - $1.500.000", "$1.500.000 - $2.500.000", "$2.500.000 - $4.000.000", "Más de $4.000.000"];
const CONDICIONES = ["Ninguna", "Hipertensión", "Diabetes", "Enfermedad cardíaca", "Cáncer (historial)", "Enfermedad crónica", "Otra"];

export default function AnalisisIsapre() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    isapre: "",
    plan: "",
    cargas: "",
    ingreso: "",
    condicion: "",
    antiguedad: "",
    copago_mensual: "",
    ultima_hospitalizacion: "No",
    objetivo: "Reducir costos",
  });
  const [informe, setInforme] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos reales desde el servidor
  const isapresQuery = trpc.isapres.getAll.useQuery();
  const isapresData = isapresQuery.data ?? [];

  const planesDisponibles = useMemo(() => {
    const found = isapresData.find((i: any) => i.nombre === form.isapre);
    return found ? found.planes : [];
  }, [isapresData, form.isapre]);

  const planSeleccionado = useMemo(() => {
    return planesDisponibles.find((p: any) => p.nombre === form.plan) ?? null;
  }, [planesDisponibles, form.plan]);

  const analyzeIsapre = trpc.chat.send.useMutation();

  const handleAnalizar = async () => {
    setLoading(true);
    setError(null);
    try {
      const planInfo = planSeleccionado
        ? `Precio: ${planSeleccionado.precio_uf} UF/mes, Cobertura ambulatoria: ${planSeleccionado.cobertura_ambulatorio}, Cobertura hospitalaria: ${planSeleccionado.cobertura_hospitalario}, Tope anual: ${planSeleccionado.tope_anual_uf} UF, Dental: ${planSeleccionado.cobertura_dental ? "Incluido" : "No incluido"}`
        : "datos no disponibles";

      const prompt = `ANÁLISIS FORENSE DE PLAN DE SALUD — INFORME X3 ÉLITE

DATOS DEL PLAN (DATOS REALES DEL SISTEMA):
- Isapre: ${form.isapre}
- Plan: ${form.plan}
- ${planInfo}

DATOS DEL CLIENTE:
- Cargas familiares: ${form.cargas}
- Rango de ingreso: ${form.ingreso}
- Condición preexistente: ${form.condicion || "Ninguna"}
- Antigüedad en la Isapre: ${form.antiguedad || "No informado"} años
- Copago mensual estimado: ${form.copago_mensual || "No informado"}
- Última hospitalización: ${form.ultima_hospitalizacion}
- Objetivo principal: ${form.objetivo}

Genera un INFORME FORENSE COMPLETO con:

## 1. DIAGNÓSTICO DEL PLAN ACTUAL
Evalúa el plan ${form.plan} de ${form.isapre} con los datos reales entregados arriba. Calcula el precio mensual en pesos chilenos (UF × valor UF actual ~$38.500).

## 2. BRECHAS DE COBERTURA DETECTADAS
Lista las 3-5 principales vulnerabilidades de este plan. Usa cifras reales en pesos chilenos.

## 3. ESCENARIOS DE QUIEBRE
Calcula el impacto económico real en 3 escenarios: hospitalización estándar (5 días), cirugía mayor, enfermedad catastrófica (cáncer/UCI). Muestra: costo total, cobertura Isapre, gasto de bolsillo.

## 4. ANÁLISIS LEGAL (Ley 21.350 / Circular 356)
Identifica si el plan cumple con los requisitos mínimos legales vigentes. Señala derechos del afiliado.

## 5. RECOMENDACIÓN ESTRATÉGICA X3
Propón la combinación óptima: Isapre + Seguro Catastrófico + APV. Incluye costo total mensual en UF y ahorro proyectado.

## 6. VEREDICTO FINAL
Calificación del plan actual (1-10) y acción recomendada: MANTENER / OPTIMIZAR / CAMBIAR URGENTE.

Formato: profesional, con cifras reales, directo. Incluye tabla comparativa donde sea relevante.`;

      const result = await analyzeIsapre.mutateAsync({
        message: prompt,
        conversationId: undefined,
      });
      setInforme(result.content as string);
      setStep(3);
    } catch {
      setError("Error al generar el análisis. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const downloadInforme = () => {
    if (!informe) return;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Informe X3 — ${form.isapre} ${form.plan}</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
<style>body{background:#060912;color:#e0e8f0;font-family:'Inter',sans-serif;max-width:900px;margin:0 auto;padding:40px 20px}
h1{font-family:'Orbitron',sans-serif;color:#00e5ff;font-size:1.4rem;margin-bottom:4px}
h2{font-family:'Orbitron',sans-serif;color:#00e5ff;font-size:1rem;margin:24px 0 8px;border-bottom:1px solid rgba(0,229,255,0.2);padding-bottom:6px}
.badge{background:rgba(0,229,255,0.1);border:1px solid rgba(0,229,255,0.3);border-radius:20px;padding:4px 14px;font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#00e5ff;display:inline-block;margin-bottom:20px}
.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px}
.meta-item label{font-size:0.6rem;color:rgba(255,255,255,0.4);font-family:'Share Tech Mono',monospace;text-transform:uppercase;display:block;margin-bottom:2px}
.meta-item span{font-size:0.85rem;color:#e0e8f0;font-weight:500}
.plan-data{background:rgba(0,229,255,0.05);border:1px solid rgba(0,229,255,0.2);border-radius:10px;padding:14px;margin:16px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.plan-data label{font-size:0.58rem;color:rgba(0,229,255,0.6);font-family:'Share Tech Mono',monospace;text-transform:uppercase;display:block;margin-bottom:2px}
.plan-data span{font-size:0.85rem;color:#00e5ff;font-weight:600}
pre{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px;white-space:pre-wrap;font-family:'Inter',sans-serif;font-size:0.85rem;line-height:1.6}
.firma{margin-top:40px;text-align:center;font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:rgba(0,229,255,0.4);border-top:1px solid rgba(0,229,255,0.1);padding-top:20px}
</style></head><body>
<div class="badge">INFORME FORENSE X3 ÉLITE · ${new Date().toLocaleDateString('es-CL')}</div>
<h1>ANÁLISIS DE PLAN DE SALUD</h1>
<div class="meta">
<div class="meta-item"><label>Isapre</label><span>${form.isapre}</span></div>
<div class="meta-item"><label>Plan</label><span>${form.plan}</span></div>
<div class="meta-item"><label>Cargas</label><span>${form.cargas}</span></div>
<div class="meta-item"><label>Ingreso</label><span>${form.ingreso}</span></div>
<div class="meta-item"><label>Antigüedad</label><span>${form.antiguedad || "N/A"} años</span></div>
<div class="meta-item"><label>Objetivo</label><span>${form.objetivo}</span></div>
</div>
${planSeleccionado ? `<div class="plan-data">
<div><label>Precio</label><span>${planSeleccionado.precio_uf} UF/mes</span></div>
<div><label>Cob. Ambulatoria</label><span>${planSeleccionado.cobertura_ambulatorio}</span></div>
<div><label>Cob. Hospitalaria</label><span>${planSeleccionado.cobertura_hospitalario}</span></div>
<div><label>Tope Anual</label><span>${planSeleccionado.tope_anual_uf} UF</span></div>
<div><label>Dental</label><span>${planSeleccionado.cobertura_dental ? "Incluido" : "No incluido"}</span></div>
</div>` : ""}
<pre>${informe}</pre>
<div class="firma">Analizado, protegido y respaldado. Estamos contigo antes, durante y después. — X3 ÉLITE</div>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `X3-Analisis-${form.isapre.replace(/\s/g, "-")}-${Date.now()}.html`;
    a.click();
  };

  return (
    <div style={{ background: "#060912", minHeight: "100vh", color: "#e0e8f0", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(0,229,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.03) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto", padding: "20px 16px 60px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => navigate("/")} style={btnSecondary}>← VOLVER</button>
          <div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.9rem", fontWeight: 800, color: "#00e5ff" }}>ANÁLISIS DE PLAN ISAPRE</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.55rem", color: "rgba(0,229,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Motor Forense X3 Élite · Datos Reales</div>
          </div>
        </div>

        {/* STEPS */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: "3px", borderRadius: "2px", background: step >= s ? "#00e5ff" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
          ))}
        </div>

        {/* STEP 1: DATOS BÁSICOS */}
        {step === 1 && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "20px", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Paso 1 de 2 — Datos del plan</p>
            <div style={{ display: "grid", gap: "14px" }}>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Isapre actual *</span>
                <select style={selectStyle} value={form.isapre} onChange={e => setForm(f => ({ ...f, isapre: e.target.value, plan: "" }))} disabled={isapresQuery.isLoading}>
                  <option value="">{isapresQuery.isLoading ? "Cargando Isapres..." : "Selecciona tu Isapre"}</option>
                  {isapresData.map((i: any) => <option key={i.nombre} value={i.nombre}>{i.nombre}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Plan contratado *</span>
                <select style={selectStyle} value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} disabled={!form.isapre}>
                  <option value="">Selecciona el plan</option>
                  {planesDisponibles.map((p: any) => (
                    <option key={p.nombre} value={p.nombre}>{p.nombre} — {p.precio_uf} UF/mes</option>
                  ))}
                </select>
              </label>

              {/* Datos reales del plan seleccionado */}
              {planSeleccionado && (
                <div style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "10px", padding: "12px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
                  <div><div style={{ fontSize: "0.55rem", color: "rgba(0,229,255,0.6)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" }}>Precio</div><div style={{ fontSize: "0.82rem", color: "#00e5ff", fontWeight: 600 }}>{planSeleccionado.precio_uf} UF/mes</div></div>
                  <div><div style={{ fontSize: "0.55rem", color: "rgba(0,229,255,0.6)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" }}>Cob. Amb.</div><div style={{ fontSize: "0.82rem", color: "#00e5ff", fontWeight: 600 }}>{planSeleccionado.cobertura_ambulatorio}</div></div>
                  <div><div style={{ fontSize: "0.55rem", color: "rgba(0,229,255,0.6)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" }}>Cob. Hosp.</div><div style={{ fontSize: "0.82rem", color: "#00e5ff", fontWeight: 600 }}>{planSeleccionado.cobertura_hospitalario}</div></div>
                  <div><div style={{ fontSize: "0.55rem", color: "rgba(0,229,255,0.6)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" }}>Tope Anual</div><div style={{ fontSize: "0.82rem", color: "#00e5ff", fontWeight: 600 }}>{planSeleccionado.tope_anual_uf} UF</div></div>
                  <div><div style={{ fontSize: "0.55rem", color: "rgba(0,229,255,0.6)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" }}>Dental</div><div style={{ fontSize: "0.82rem", color: planSeleccionado.cobertura_dental ? "#00ff88" : "#ff4444", fontWeight: 600 }}>{planSeleccionado.cobertura_dental ? "✓ Incluido" : "✗ No incluido"}</div></div>
                </div>
              )}

              <label style={labelStyle}>
                <span style={labelTextStyle}>Cargas familiares *</span>
                <select style={selectStyle} value={form.cargas} onChange={e => setForm(f => ({ ...f, cargas: e.target.value }))}>
                  <option value="">Selecciona</option>
                  {CARGAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Rango de ingreso mensual *</span>
                <select style={selectStyle} value={form.ingreso} onChange={e => setForm(f => ({ ...f, ingreso: e.target.value }))}>
                  <option value="">Selecciona</option>
                  {RANGOS_INGRESO.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Antigüedad en la Isapre (años)</span>
                <input style={inputStyle} type="number" min="0" max="40" placeholder="Ej: 5" value={form.antiguedad} onChange={e => setForm(f => ({ ...f, antiguedad: e.target.value }))} />
              </label>
            </div>
            <button
              style={{ ...btnPrimary, marginTop: "24px", opacity: (!form.isapre || !form.plan || !form.cargas || !form.ingreso) ? 0.4 : 1 }}
              disabled={!form.isapre || !form.plan || !form.cargas || !form.ingreso}
              onClick={() => setStep(2)}
            >CONTINUAR →</button>
          </div>
        )}

        {/* STEP 2: PERFIL DE SALUD */}
        {step === 2 && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "20px", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Paso 2 de 2 — Perfil de salud</p>
            <div style={{ display: "grid", gap: "14px" }}>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Condición preexistente</span>
                <select style={selectStyle} value={form.condicion} onChange={e => setForm(f => ({ ...f, condicion: e.target.value }))}>
                  <option value="">Selecciona</option>
                  {CONDICIONES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Copago mensual estimado (CLP)</span>
                <input style={inputStyle} type="text" placeholder="Ej: $150.000" value={form.copago_mensual} onChange={e => setForm(f => ({ ...f, copago_mensual: e.target.value }))} />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>¿Ha sido hospitalizado en los últimos 2 años?</span>
                <select style={selectStyle} value={form.ultima_hospitalizacion} onChange={e => setForm(f => ({ ...f, ultima_hospitalizacion: e.target.value }))}>
                  <option value="No">No</option>
                  <option value="Sí, 1 vez">Sí, 1 vez</option>
                  <option value="Sí, 2+ veces">Sí, 2 o más veces</option>
                </select>
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>Objetivo principal del análisis</span>
                <select style={selectStyle} value={form.objetivo} onChange={e => setForm(f => ({ ...f, objetivo: e.target.value }))}>
                  <option value="Reducir costos">Reducir costos mensuales</option>
                  <option value="Mejorar cobertura">Mejorar cobertura</option>
                  <option value="Evaluar cambio de Isapre">Evaluar cambio de Isapre</option>
                  <option value="Preparar caso legal">Preparar caso legal</option>
                  <option value="Optimizar para familia">Optimizar para familia</option>
                </select>
              </label>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button style={btnSecondary} onClick={() => setStep(1)}>← ATRÁS</button>
              <button style={{ ...btnPrimary, flex: 1 }} onClick={handleAnalizar} disabled={loading}>
                {loading ? "⚡ ANALIZANDO..." : "🔍 GENERAR ANÁLISIS FORENSE"}
              </button>
            </div>
            {error && <p style={{ color: "#ff4444", fontSize: "0.75rem", marginTop: "12px", textAlign: "center" }}>{error}</p>}
          </div>
        )}

        {/* STEP 3: INFORME */}
        {step === 3 && informe && (
          <div style={{ animation: "fadeIn 0.4s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.6rem", color: "rgba(0,229,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Informe generado</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.85rem", color: "#00e5ff", fontWeight: 700 }}>{form.isapre} — {form.plan}</div>
              </div>
              <button style={btnPrimary} onClick={downloadInforme}>⬇ Descargar HTML</button>
            </div>
            {/* Datos del plan en el resultado */}
            {planSeleccionado && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "8px", marginBottom: "14px" }}>
                {[
                  { label: "Precio", value: `${planSeleccionado.precio_uf} UF` },
                  { label: "Ambulatorio", value: planSeleccionado.cobertura_ambulatorio },
                  { label: "Hospitalario", value: planSeleccionado.cobertura_hospitalario },
                  { label: "Tope", value: `${planSeleccionado.tope_anual_uf} UF` },
                  { label: "Dental", value: planSeleccionado.cobertura_dental ? "✓" : "✗" },
                ].map(d => (
                  <div key={d.label} style={{ background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.5rem", color: "rgba(0,229,255,0.5)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" }}>{d.label}</div>
                    <div style={{ fontSize: "0.8rem", color: "#00e5ff", fontWeight: 600, marginTop: "2px" }}>{d.value}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: "12px", padding: "20px", fontSize: "0.82rem", lineHeight: "1.7", whiteSpace: "pre-wrap", maxHeight: "55vh", overflowY: "auto" }}>
              {informe}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button style={btnSecondary} onClick={() => { setStep(1); setInforme(null); setForm({ isapre: "", plan: "", cargas: "", ingreso: "", condicion: "", antiguedad: "", copago_mensual: "", ultima_hospitalizacion: "No", objetivo: "Reducir costos" }); }}>🔄 Nuevo análisis</button>
              <button style={{ ...btnSecondary, flex: 1 }} onClick={() => navigate("/comparativo")}>⚖️ Comparar con otro plan</button>
            </div>
            <p style={{ textAlign: "center", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.6rem", color: "rgba(0,229,255,0.3)", marginTop: "20px" }}>Analizado, protegido y respaldado. Estamos contigo antes, durante y después.</p>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "5px" };
const labelTextStyle: React.CSSProperties = { fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" as const, letterSpacing: "0.08em" };
const selectStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#e0e8f0", padding: "10px 12px", fontSize: "0.82rem", fontFamily: "'Inter',sans-serif", outline: "none", cursor: "pointer" };
const inputStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "#e0e8f0", padding: "10px 12px", fontSize: "0.82rem", fontFamily: "'Inter',sans-serif", outline: "none" };
const btnPrimary: React.CSSProperties = { background: "linear-gradient(135deg,rgba(0,212,255,0.2),rgba(0,212,255,0.1))", border: "1px solid rgba(0,212,255,0.5)", borderRadius: "10px", color: "#00d4ff", padding: "12px 20px", fontSize: "0.75rem", fontFamily: "'Orbitron',sans-serif", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.2s" };
const btnSecondary: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "rgba(255,255,255,0.6)", padding: "12px 16px", fontSize: "0.72rem", fontFamily: "'Share Tech Mono',monospace", cursor: "pointer", transition: "all 0.2s" };
