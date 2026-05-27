import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const CARGAS = ["Solo yo", "Yo + cónyuge", "Yo + 1 hijo", "Yo + 2 hijos", "Familia completa (4+)"];
const PRIORIDADES = ["Menor costo mensual", "Mayor cobertura hospitalaria", "Mejor cobertura dental", "Red de clínicas premium", "Mejor tope catastrófico", "Mejor cobertura ambulatoria"];

export default function ComparativoIsapres() {
  const [, navigate] = useLocation();
  const [isapraA, setIsapreA] = useState("");
  const [planA, setPlanA] = useState("");
  const [isapraB, setIsapreB] = useState("");
  const [planB, setPlanB] = useState("");
  const [cargas, setCargas] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [veredicto, setVeredicto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isapresQuery = trpc.isapres.getAll.useQuery();
  const isapresData = isapresQuery.data ?? [];

  const planesA = useMemo(() => (isapresData.find((i: any) => i.nombre === isapraA) as any)?.planes ?? [], [isapresData, isapraA]);
  const planesB = useMemo(() => (isapresData.find((i: any) => i.nombre === isapraB) as any)?.planes ?? [], [isapresData, isapraB]);
  const planDataA = useMemo(() => planesA.find((p: any) => p.nombre === planA) ?? null, [planesA, planA]);
  const planDataB = useMemo(() => planesB.find((p: any) => p.nombre === planB) ?? null, [planesB, planB]);

  const compareMutation = trpc.chat.send.useMutation();

  const handleComparar = async () => {
    setLoading(true);
    setError(null);
    try {
      const infoA = planDataA
        ? `Precio: ${planDataA.precio_uf} UF/mes, Cob. ambulatoria: ${planDataA.cobertura_ambulatorio}, Cob. hospitalaria: ${planDataA.cobertura_hospitalario}, Tope anual: ${planDataA.tope_anual_uf} UF, Dental: ${planDataA.cobertura_dental ? "Sí" : "No"}`
        : "datos no disponibles";
      const infoB = planDataB
        ? `Precio: ${planDataB.precio_uf} UF/mes, Cob. ambulatoria: ${planDataB.cobertura_ambulatorio}, Cob. hospitalaria: ${planDataB.cobertura_hospitalario}, Tope anual: ${planDataB.tope_anual_uf} UF, Dental: ${planDataB.cobertura_dental ? "Sí" : "No"}`
        : "datos no disponibles";

      const prompt = `COMPARATIVO FORENSE DE PLANES DE SALUD — X3 ÉLITE

PLAN A (DATOS REALES):
- Isapre: ${isapraA}
- Plan: ${planA}
- ${infoA}

PLAN B (DATOS REALES):
- Isapre: ${isapraB}
- Plan: ${planB}
- ${infoB}

PERFIL DEL CLIENTE:
- Cargas familiares: ${cargas}
- Prioridad principal: ${prioridad}

Genera un COMPARATIVO FORENSE COMPLETO:

## 1. ANÁLISIS DE ESCENARIOS REALES
Para cada plan, calcula el gasto de bolsillo real en:
- Consulta médica simple (3 veces al mes)
- Hospitalización 5 días
- Cirugía electiva mayor
- Enfermedad catastrófica (cáncer/UCI 30 días)

## 2. ANÁLISIS DE COSTO-BENEFICIO
¿Cuál plan entrega más cobertura por peso invertido? Calcula el índice de eficiencia (cobertura / precio).

## 3. ANÁLISIS SEGÚN PRIORIDAD: ${prioridad}
¿Cuál plan gana en la prioridad declarada? Argumenta con cifras.

## 4. VEREDICTO X3
Recomendación clara: PLAN A (${isapraA}) o PLAN B (${isapraB}). Justificación en 3 puntos. Nivel de confianza (%).
Si ninguno es óptimo, propón la combinación ideal con seguro complementario.

Formato: directo, con cifras reales en pesos chilenos y UF.`;

      const result = await compareMutation.mutateAsync({ message: prompt, conversationId: undefined });
      setVeredicto(result.content as string);
    } catch {
      setError("Error al generar el comparativo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const downloadComparativo = () => {
    if (!veredicto) return;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Comparativo X3 — ${isapraA} vs ${isapraB}</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
<style>body{background:#060912;color:#e0e8f0;font-family:'Inter',sans-serif;max-width:900px;margin:0 auto;padding:40px 20px}
h1{font-family:'Orbitron',sans-serif;color:#ffb400;font-size:1.4rem;margin-bottom:4px}
h2{font-family:'Orbitron',sans-serif;color:#ffb400;font-size:1rem;margin:24px 0 8px;border-bottom:1px solid rgba(255,180,0,0.2);padding-bottom:6px}
.vs-grid{display:grid;grid-template-columns:1fr auto 1fr;gap:20px;margin:20px 0;align-items:start}
.plan-box{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px}
.plan-name{font-family:'Orbitron',sans-serif;font-size:0.9rem;font-weight:700;margin-bottom:12px;text-align:center}
.plan-a .plan-name{color:#00e5ff}.plan-b .plan-name{color:#a855f7}
.vs-label{font-family:'Orbitron',sans-serif;font-size:1.4rem;color:#ffb400;text-align:center;padding-top:40px}
.metric{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.8rem}
.metric label{color:rgba(255,255,255,0.5);font-size:0.65rem;font-family:'Share Tech Mono',monospace;text-transform:uppercase}
.metric span{font-weight:600}
pre{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px;white-space:pre-wrap;font-family:'Inter',sans-serif;font-size:0.85rem;line-height:1.6}
.firma{margin-top:40px;text-align:center;font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:rgba(0,229,255,0.4);border-top:1px solid rgba(0,229,255,0.1);padding-top:20px}
</style></head><body>
<h1>COMPARATIVO FORENSE DE PLANES</h1>
<div class="vs-grid">
<div class="plan-box plan-a">
<div class="plan-name">${isapraA}</div>
${planDataA ? `<div class="metric"><label>Plan</label><span>${planDataA.nombre}</span></div>
<div class="metric"><label>Precio</label><span>${planDataA.precio_uf} UF/mes</span></div>
<div class="metric"><label>Cob. Ambulatoria</label><span>${planDataA.cobertura_ambulatorio}</span></div>
<div class="metric"><label>Cob. Hospitalaria</label><span>${planDataA.cobertura_hospitalario}</span></div>
<div class="metric"><label>Tope Anual</label><span>${planDataA.tope_anual_uf} UF</span></div>
<div class="metric"><label>Dental</label><span>${planDataA.cobertura_dental ? "✓ Incluido" : "✗ No incluido"}</span></div>` : ""}
</div>
<div class="vs-label">VS</div>
<div class="plan-box plan-b">
<div class="plan-name">${isapraB}</div>
${planDataB ? `<div class="metric"><label>Plan</label><span>${planDataB.nombre}</span></div>
<div class="metric"><label>Precio</label><span>${planDataB.precio_uf} UF/mes</span></div>
<div class="metric"><label>Cob. Ambulatoria</label><span>${planDataB.cobertura_ambulatorio}</span></div>
<div class="metric"><label>Cob. Hospitalaria</label><span>${planDataB.cobertura_hospitalario}</span></div>
<div class="metric"><label>Tope Anual</label><span>${planDataB.tope_anual_uf} UF</span></div>
<div class="metric"><label>Dental</label><span>${planDataB.cobertura_dental ? "✓ Incluido" : "✗ No incluido"}</span></div>` : ""}
</div>
</div>
<pre>${veredicto}</pre>
<div class="firma">Analizado, protegido y respaldado. Estamos contigo antes, durante y después. — X3 ÉLITE</div>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `X3-Comparativo-${isapraA.replace(/\s/g, "-")}-vs-${isapraB.replace(/\s/g, "-")}.html`;
    a.click();
  };

  const canCompare = isapraA && planA && isapraB && planB && cargas && prioridad;

  return (
    <div style={{ background: "#060912", minHeight: "100vh", color: "#e0e8f0", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,180,0,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,180,0,.02) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => navigate("/")} style={btnSecondary}>← VOLVER</button>
          <div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.9rem", fontWeight: 800, color: "#ffb400" }}>COMPARATIVO DE PLANES</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.55rem", color: "rgba(255,180,0,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Análisis Forense X3 Élite · Datos Reales</div>
          </div>
        </div>

        {!veredicto ? (
          <>
            {/* PLANES LADO A LADO */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "start", marginBottom: "20px" }}>
              {/* PLAN A */}
              <div style={{ background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", color: "#00e5ff", marginBottom: "12px", textAlign: "center" }}>PLAN A</div>
                <div style={{ display: "grid", gap: "10px" }}>
                  <label style={labelStyle}><span style={labelTextStyle}>Isapre</span>
                    <select style={selectStyle} value={isapraA} onChange={e => { setIsapreA(e.target.value); setPlanA(""); }} disabled={isapresQuery.isLoading}>
                      <option value="">{isapresQuery.isLoading ? "Cargando..." : "Selecciona"}</option>
                      {isapresData.map((i: any) => <option key={i.nombre} value={i.nombre}>{i.nombre}</option>)}
                    </select>
                  </label>
                  <label style={labelStyle}><span style={labelTextStyle}>Plan</span>
                    <select style={selectStyle} value={planA} onChange={e => setPlanA(e.target.value)} disabled={!isapraA}>
                      <option value="">Selecciona</option>
                      {planesA.map((p: any) => <option key={p.nombre} value={p.nombre}>{p.nombre} — {p.precio_uf} UF</option>)}
                    </select>
                  </label>
                  {/* Datos reales del Plan A */}
                  {planDataA && (
                    <div style={{ background: "rgba(0,229,255,0.06)", borderRadius: "8px", padding: "10px", display: "grid", gap: "5px" }}>
                      {[
                        { l: "Precio", v: `${planDataA.precio_uf} UF/mes` },
                        { l: "Ambulatorio", v: planDataA.cobertura_ambulatorio },
                        { l: "Hospitalario", v: planDataA.cobertura_hospitalario },
                        { l: "Tope Anual", v: `${planDataA.tope_anual_uf} UF` },
                        { l: "Dental", v: planDataA.cobertura_dental ? "✓ Incluido" : "✗ No incluido" },
                      ].map(d => (
                        <div key={d.l} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                          <span style={{ color: "rgba(0,229,255,0.6)", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.58rem" }}>{d.l}</span>
                          <span style={{ color: "#00e5ff", fontWeight: 600 }}>{d.v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* VS */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "40px" }}>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.2rem", fontWeight: 900, color: "#ffb400", textShadow: "0 0 20px rgba(255,180,0,0.5)" }}>VS</div>
              </div>

              {/* PLAN B */}
              <div style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", color: "#a855f7", marginBottom: "12px", textAlign: "center" }}>PLAN B</div>
                <div style={{ display: "grid", gap: "10px" }}>
                  <label style={labelStyle}><span style={labelTextStyle}>Isapre</span>
                    <select style={selectStyle} value={isapraB} onChange={e => { setIsapreB(e.target.value); setPlanB(""); }} disabled={isapresQuery.isLoading}>
                      <option value="">{isapresQuery.isLoading ? "Cargando..." : "Selecciona"}</option>
                      {isapresData.map((i: any) => <option key={i.nombre} value={i.nombre}>{i.nombre}</option>)}
                    </select>
                  </label>
                  <label style={labelStyle}><span style={labelTextStyle}>Plan</span>
                    <select style={selectStyle} value={planB} onChange={e => setPlanB(e.target.value)} disabled={!isapraB}>
                      <option value="">Selecciona</option>
                      {planesB.map((p: any) => <option key={p.nombre} value={p.nombre}>{p.nombre} — {p.precio_uf} UF</option>)}
                    </select>
                  </label>
                  {/* Datos reales del Plan B */}
                  {planDataB && (
                    <div style={{ background: "rgba(168,85,247,0.06)", borderRadius: "8px", padding: "10px", display: "grid", gap: "5px" }}>
                      {[
                        { l: "Precio", v: `${planDataB.precio_uf} UF/mes` },
                        { l: "Ambulatorio", v: planDataB.cobertura_ambulatorio },
                        { l: "Hospitalario", v: planDataB.cobertura_hospitalario },
                        { l: "Tope Anual", v: `${planDataB.tope_anual_uf} UF` },
                        { l: "Dental", v: planDataB.cobertura_dental ? "✓ Incluido" : "✗ No incluido" },
                      ].map(d => (
                        <div key={d.l} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                          <span style={{ color: "rgba(168,85,247,0.7)", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.58rem" }}>{d.l}</span>
                          <span style={{ color: "#a855f7", fontWeight: 600 }}>{d.v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TABLA COMPARATIVA UI (cuando ambos planes están seleccionados) */}
            {planDataA && planDataB && (
              <div style={{ background: "rgba(255,180,0,0.04)", border: "1px solid rgba(255,180,0,0.15)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                <p style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.6rem", color: "rgba(255,180,0,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Tabla comparativa directa</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0" }}>
                  {/* Header */}
                  {["Métrica", isapraA, isapraB].map((h, i) => (
                    <div key={i} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.05)", fontSize: "0.62rem", fontFamily: "'Share Tech Mono',monospace", color: i === 0 ? "rgba(255,255,255,0.4)" : i === 1 ? "#00e5ff" : "#a855f7", textTransform: "uppercase", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</div>
                  ))}
                  {/* Filas */}
                  {[
                    { label: "Precio/mes", a: `${planDataA.precio_uf} UF`, b: `${planDataB.precio_uf} UF`, winner: planDataA.precio_uf < planDataB.precio_uf ? "a" : planDataA.precio_uf > planDataB.precio_uf ? "b" : "tie" },
                    { label: "Cob. Ambulatoria", a: planDataA.cobertura_ambulatorio, b: planDataB.cobertura_ambulatorio, winner: "tie" },
                    { label: "Cob. Hospitalaria", a: planDataA.cobertura_hospitalario, b: planDataB.cobertura_hospitalario, winner: "tie" },
                    { label: "Tope Anual", a: `${planDataA.tope_anual_uf} UF`, b: `${planDataB.tope_anual_uf} UF`, winner: planDataA.tope_anual_uf > planDataB.tope_anual_uf ? "a" : planDataA.tope_anual_uf < planDataB.tope_anual_uf ? "b" : "tie" },
                    { label: "Dental", a: planDataA.cobertura_dental ? "✓ Sí" : "✗ No", b: planDataB.cobertura_dental ? "✓ Sí" : "✗ No", winner: planDataA.cobertura_dental && !planDataB.cobertura_dental ? "a" : !planDataA.cobertura_dental && planDataB.cobertura_dental ? "b" : "tie" },
                  ].map((row, ri) => (
                    <>
                      <div key={`l${ri}`} style={{ padding: "7px 10px", fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Share Tech Mono',monospace", borderBottom: "1px solid rgba(255,255,255,0.05)", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>{row.label}</div>
                      <div key={`a${ri}`} style={{ padding: "7px 10px", fontSize: "0.75rem", color: row.winner === "a" ? "#00ff88" : "#00e5ff", fontWeight: row.winner === "a" ? 700 : 400, borderBottom: "1px solid rgba(255,255,255,0.05)", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>{row.a}{row.winner === "a" ? " ★" : ""}</div>
                      <div key={`b${ri}`} style={{ padding: "7px 10px", fontSize: "0.75rem", color: row.winner === "b" ? "#00ff88" : "#a855f7", fontWeight: row.winner === "b" ? 700 : 400, borderBottom: "1px solid rgba(255,255,255,0.05)", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>{row.b}{row.winner === "b" ? " ★" : ""}</div>
                    </>
                  ))}
                </div>
              </div>
            )}

            {/* PERFIL */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              <label style={labelStyle}><span style={labelTextStyle}>Cargas familiares *</span>
                <select style={selectStyle} value={cargas} onChange={e => setCargas(e.target.value)}>
                  <option value="">Selecciona</option>
                  {CARGAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label style={labelStyle}><span style={labelTextStyle}>Prioridad principal *</span>
                <select style={selectStyle} value={prioridad} onChange={e => setPrioridad(e.target.value)}>
                  <option value="">Selecciona</option>
                  {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
            </div>

            <button style={{ ...btnPrimary, width: "100%", opacity: canCompare ? 1 : 0.4 }} disabled={!canCompare || loading} onClick={handleComparar}>
              {loading ? "⚡ ANALIZANDO..." : "⚖️ GENERAR VEREDICTO X3"}
            </button>
            {error && <p style={{ color: "#ff4444", fontSize: "0.75rem", marginTop: "12px", textAlign: "center" }}>{error}</p>}
          </>
        ) : (
          <>
            {/* RESULTADO */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem", color: "#00e5ff" }}>{isapraA}</span>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1rem", color: "#ffb400" }}>VS</span>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.8rem", color: "#a855f7" }}>{isapraB}</span>
              </div>
              <button style={btnPrimary} onClick={downloadComparativo}>⬇ Descargar</button>
            </div>

            {/* Tabla comparativa en el resultado */}
            {planDataA && planDataB && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0", marginBottom: "16px", border: "1px solid rgba(255,180,0,0.15)", borderRadius: "10px", overflow: "hidden" }}>
                {["Métrica", `${isapraA} · ${planA}`, `${isapraB} · ${planB}`].map((h, i) => (
                  <div key={i} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.06)", fontSize: "0.6rem", fontFamily: "'Share Tech Mono',monospace", color: i === 0 ? "rgba(255,255,255,0.4)" : i === 1 ? "#00e5ff" : "#a855f7", textTransform: "uppercase", fontWeight: 600 }}>{h}</div>
                ))}
                {[
                  { label: "Precio/mes", a: `${planDataA.precio_uf} UF`, b: `${planDataB.precio_uf} UF`, winnerA: planDataA.precio_uf < planDataB.precio_uf, winnerB: planDataB.precio_uf < planDataA.precio_uf },
                  { label: "Cob. Ambulatoria", a: planDataA.cobertura_ambulatorio, b: planDataB.cobertura_ambulatorio, winnerA: false, winnerB: false },
                  { label: "Cob. Hospitalaria", a: planDataA.cobertura_hospitalario, b: planDataB.cobertura_hospitalario, winnerA: false, winnerB: false },
                  { label: "Tope Anual", a: `${planDataA.tope_anual_uf} UF`, b: `${planDataB.tope_anual_uf} UF`, winnerA: planDataA.tope_anual_uf > planDataB.tope_anual_uf, winnerB: planDataB.tope_anual_uf > planDataA.tope_anual_uf },
                  { label: "Dental", a: planDataA.cobertura_dental ? "✓ Sí" : "✗ No", b: planDataB.cobertura_dental ? "✓ Sí" : "✗ No", winnerA: planDataA.cobertura_dental && !planDataB.cobertura_dental, winnerB: planDataB.cobertura_dental && !planDataA.cobertura_dental },
                ].map((row, ri) => (
                  <>
                    <div key={`l${ri}`} style={{ padding: "7px 10px", fontSize: "0.63rem", color: "rgba(255,255,255,0.45)", fontFamily: "'Share Tech Mono',monospace", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>{row.label}</div>
                    <div key={`a${ri}`} style={{ padding: "7px 10px", fontSize: "0.75rem", color: row.winnerA ? "#00ff88" : "#00e5ff", fontWeight: row.winnerA ? 700 : 400, background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>{row.a}{row.winnerA ? " ★" : ""}</div>
                    <div key={`b${ri}`} style={{ padding: "7px 10px", fontSize: "0.75rem", color: row.winnerB ? "#00ff88" : "#a855f7", fontWeight: row.winnerB ? 700 : 400, background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>{row.b}{row.winnerB ? " ★" : ""}</div>
                  </>
                ))}
              </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,180,0,0.15)", borderRadius: "12px", padding: "20px", fontSize: "0.82rem", lineHeight: "1.7", whiteSpace: "pre-wrap", maxHeight: "50vh", overflowY: "auto" }}>
              {veredicto}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button style={btnSecondary} onClick={() => { setVeredicto(null); setIsapreA(""); setPlanA(""); setIsapreB(""); setPlanB(""); setCargas(""); setPrioridad(""); }}>🔄 Nuevo comparativo</button>
              <button style={{ ...btnSecondary, flex: 1 }} onClick={() => navigate("/analisis-isapre")}>🔍 Análisis individual</button>
            </div>
            <p style={{ textAlign: "center", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.6rem", color: "rgba(0,229,255,0.3)", marginTop: "20px" }}>Analizado, protegido y respaldado. Estamos contigo antes, durante y después.</p>
          </>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "4px" };
const labelTextStyle: React.CSSProperties = { fontSize: "0.58rem", color: "rgba(255,255,255,0.45)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" as const, letterSpacing: "0.06em" };
const selectStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#e0e8f0", padding: "8px 10px", fontSize: "0.78rem", fontFamily: "'Inter',sans-serif", outline: "none", cursor: "pointer" };
const btnPrimary: React.CSSProperties = { background: "linear-gradient(135deg,rgba(255,180,0,0.2),rgba(255,180,0,0.1))", border: "1px solid rgba(255,180,0,0.5)", borderRadius: "10px", color: "#ffb400", padding: "12px 20px", fontSize: "0.75rem", fontFamily: "'Orbitron',sans-serif", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" };
const btnSecondary: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "rgba(255,255,255,0.6)", padding: "12px 16px", fontSize: "0.72rem", fontFamily: "'Share Tech Mono',monospace", cursor: "pointer" };
