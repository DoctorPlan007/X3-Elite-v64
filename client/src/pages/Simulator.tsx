import { useState } from "react";

interface SimResult {
  scenario: string;
  costoTotal: number;
  copago: number;
  cobertura: number;
  riesgo: "CRÍTICO" | "ALTO" | "MEDIO" | "BAJO";
  blindajeCopago: number;
  blindajeCobertura: number;
  ahorro: number;
}

const ISAPRES = ["Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Vida Tres", "Nueva Masvida", "Fonasa"];
const PLANES = ["Plan Básico (60%)", "Plan Médium (70%)", "Plan Premium (80%)", "Plan Élite (90%)"];
const PLAN_COBERTURA: Record<string, number> = {
  "Plan Básico (60%)": 60,
  "Plan Médium (70%)": 70,
  "Plan Premium (80%)": 80,
  "Plan Élite (90%)": 90,
};
const ESCENARIOS = [
  { id: "uci", label: "UCI / Cuidados Intensivos", icon: "🏥", dias: 10, costoBase: 4500000 },
  { id: "cancer", label: "Cáncer (quimioterapia)", icon: "🎗️", dias: 30, costoBase: 8000000 },
  { id: "cirugia", label: "Cirugía Mayor (corazón/columna)", icon: "⚕️", dias: 7, costoBase: 6000000 },
  { id: "farmacos", label: "Fármacos de Alto Costo", icon: "💊", dias: 90, costoBase: 3000000 },
  { id: "parto", label: "Parto con complicaciones", icon: "👶", dias: 5, costoBase: 2500000 },
  { id: "trasplante", label: "Trasplante de órganos", icon: "❤️", dias: 30, costoBase: 15000000 },
];
const BLINDAJE_EFICIENCIA = 0.92;

export default function Simulator() {
  const [isapre, setIsapre] = useState(ISAPRES[0]);
  const [plan, setPlan] = useState(PLANES[2]);
  const [topeCopago, setTopeCopago] = useState(3000000);
  const [results, setResults] = useState<SimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [showBlindaje, setShowBlindaje] = useState(true);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const ufValue = 37000;
  const coberturaPlan = PLAN_COBERTURA[plan] ?? 80;

  const simulate = () => {
    setLoading(true);
    setTimeout(() => {
      const calcs: SimResult[] = ESCENARIOS.map((esc) => {
        const costoReal = esc.costoBase;
        const cubiertoRaw = costoReal * (coberturaPlan / 100);
        const copagoRaw = costoReal - cubiertoRaw;
        const copagoFinal = Math.min(copagoRaw, topeCopago);
        const porcentajeCopago = (copagoFinal / costoReal) * 100;
        const riesgo: "CRÍTICO" | "ALTO" | "MEDIO" | "BAJO" =
          porcentajeCopago > 50 ? "CRÍTICO" :
          porcentajeCopago > 35 ? "ALTO" :
          porcentajeCopago > 20 ? "MEDIO" : "BAJO";
        const blindajeCubierto = costoReal * BLINDAJE_EFICIENCIA;
        const blindajeCopago = costoReal - blindajeCubierto;
        const ahorro = copagoFinal - blindajeCopago;
        return {
          scenario: esc.label,
          costoTotal: costoReal,
          copago: Math.round(copagoFinal),
          cobertura: Math.round(cubiertoRaw),
          riesgo,
          blindajeCopago: Math.round(blindajeCopago),
          blindajeCobertura: Math.round(blindajeCubierto),
          ahorro: Math.round(ahorro),
        };
      });
      setResults(calcs);
      setLoading(false);
      const criticos = calcs.filter((c) => c.riesgo === "CRÍTICO");
      const altos = calcs.filter((c) => c.riesgo === "ALTO");
      const totalAhorro = calcs.reduce((sum, c) => sum + c.ahorro, 0);
      if (criticos.length > 0) {
        setAiAnalysis(`🚨 RIESGO CRÍTICO: Tu plan ${plan} de ${isapre} presenta vulnerabilidad CRÍTICA en ${criticos.length} escenario(s). Sin blindaje, podrías enfrentar deudas de hasta $${Math.max(...criticos.map((a) => a.copago)).toLocaleString("es-CL")}. Con Blindaje X3: solo $${Math.min(...criticos.map((a) => a.blindajeCopago)).toLocaleString("es-CL")}. Ahorro total: $${totalAhorro.toLocaleString("es-CL")}.`);
      } else if (altos.length > 0) {
        setAiAnalysis(`⚠️ ALERTA: Tu plan ${plan} de ${isapre} presenta RIESGO ALTO en ${altos.length} escenario(s). El Blindaje X3 generaría un ahorro proyectado de $${totalAhorro.toLocaleString("es-CL")} en los escenarios simulados.`);
      } else {
        setAiAnalysis(`✅ Tu plan ${plan} de ${isapre} muestra riesgo controlado. El Blindaje X3 elevaría tu cobertura del ${coberturaPlan}% al 92%, protegiendo $${totalAhorro.toLocaleString("es-CL")} adicionales en escenarios extremos.`);
      }
    }, 600);
  };

  const riesgoColor = (r: string) => {
    if (r === "CRÍTICO") return "#ff0055";
    if (r === "ALTO") return "#ff4444";
    if (r === "MEDIO") return "#ffaa00";
    return "#00e5ff";
  };
  const riesgoBg = (r: string) => {
    if (r === "CRÍTICO") return "rgba(255,0,85,0.1)";
    if (r === "ALTO") return "rgba(255,68,68,0.08)";
    if (r === "MEDIO") return "rgba(255,170,0,0.08)";
    return "rgba(0,229,255,0.06)";
  };

  return (
    <div style={{ minHeight: "100dvh", background: "oklch(0.06 0.02 260)", color: "#e0e8f0", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.06), transparent 70%)", top: -100, left: -100, filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.06), transparent 70%)", bottom: -100, right: -100, filter: "blur(60px)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <a href="/" style={{ color: "rgba(0,229,255,0.6)", textDecoration: "none", fontSize: "0.8rem", fontFamily: "'Share Tech Mono',monospace", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 6, padding: "4px 10px" }}>← X3</a>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: "0.6rem", color: "rgba(0,229,255,0.5)", fontFamily: "'Share Tech Mono',monospace" }}>1 UF ≈ ${ufValue.toLocaleString("es-CL")}</div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.5rem", fontWeight: 800, background: "linear-gradient(135deg, #00e5ff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 6 }}>SIMULADOR DE QUIEBRE</h1>
          <p style={{ color: "rgba(224,232,240,0.5)", fontSize: "0.82rem" }}>Catástrofe vs Blindaje X3 — Descubre tu punto de quiebre antes de que sea tarde</p>
        </div>
        <div style={{ background: "rgba(13,20,40,0.8)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 14, padding: "18px 16px", marginBottom: 16, backdropFilter: "blur(10px)" }}>
          <p style={{ fontSize: "0.6rem", color: "#00e5ff", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>⚙️ CONFIGURACIÓN DEL PLAN</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", display: "block", marginBottom: 4 }}>ISAPRE</label>
              <select value={isapre} onChange={(e) => setIsapre(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 8, padding: "8px 10px", color: "#e0e8f0", fontSize: "0.8rem", outline: "none" }}>
                {ISAPRES.map((i) => <option key={i} value={i} style={{ background: "#0d1428" }}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", display: "block", marginBottom: 4 }}>PLAN</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 8, padding: "8px 10px", color: "#e0e8f0", fontSize: "0.8rem", outline: "none" }}>
                {PLANES.map((p) => <option key={p} value={p} style={{ background: "#0d1428" }}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", display: "block", marginBottom: 4 }}>TOPE COPAGO ANUAL: ${topeCopago.toLocaleString("es-CL")} ({(topeCopago / ufValue).toFixed(1)} UF)</label>
            <input type="range" min={500000} max={10000000} step={500000} value={topeCopago} onChange={(e) => setTopeCopago(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#00e5ff" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Share Tech Mono',monospace", marginTop: 2 }}><span>$500K</span><span>$10M</span></div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setShowBlindaje(!showBlindaje)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: showBlindaje ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${showBlindaje ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 20, color: showBlindaje ? "#00d4ff" : "rgba(255,255,255,0.4)", fontSize: "0.7rem", fontFamily: "'Share Tech Mono',monospace", cursor: "pointer", transition: "all 0.2s" }}>
            🛡️ {showBlindaje ? "Blindaje X3 ON" : "Blindaje X3 OFF"}
          </button>
          {showBlindaje && <div style={{ fontSize: "0.6rem", color: "rgba(0,212,255,0.6)", fontFamily: "'Share Tech Mono',monospace" }}>3 capas activas → 92% cobertura efectiva</div>}
        </div>
        <button onClick={simulate} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "rgba(0,229,255,0.05)" : "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(168,85,247,0.15))", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 12, color: loading ? "rgba(255,255,255,0.3)" : "#00e5ff", fontFamily: "'Orbitron', sans-serif", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.1em", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s", marginBottom: 24 }}>
          {loading ? "SIMULANDO..." : "⚡ SIMULAR CATÁSTROFE"}
        </button>
        {results.length > 0 && (
          <div>
            {showBlindaje && (
              <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
                <p style={{ fontSize: "0.6rem", color: "#00d4ff", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>📊 COMPARATIVA GLOBAL</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Sin Blindaje", val: results.reduce((s, r) => s + r.copago, 0), color: "#ff0055", sub: "Exposición total" },
                    { label: "Con Blindaje X3", val: results.reduce((s, r) => s + r.blindajeCopago, 0), color: "#00d4ff", sub: "Copago protegido" },
                    { label: "Ahorro X3", val: results.reduce((s, r) => s + r.ahorro, 0), color: "#00ff88", sub: "Patrimonio salvado" },
                  ].map((item) => (
                    <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                      <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: "0.85rem", color: item.color, fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>${(item.val / 1000000).toFixed(1)}M</p>
                      <p style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {aiAnalysis && (
              <div style={{ background: "rgba(13,20,40,0.8)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 18, backdropFilter: "blur(10px)" }}>
                <p style={{ fontSize: "0.6rem", color: "#00e5ff", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🤖 ANÁLISIS X3</p>
                <p style={{ fontSize: "0.8rem", color: "rgba(224,232,240,0.8)", lineHeight: 1.6 }}>{aiAnalysis}</p>
              </div>
            )}
            <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>ESCENARIOS SIMULADOS</p>
            {results.map((r, i) => {
              const esc = ESCENARIOS[i];
              const isActive = activeScenario === esc.id;
              return (
                <div key={r.scenario} onClick={() => setActiveScenario(isActive ? null : esc.id)}
                  style={{ background: isActive ? riesgoBg(r.riesgo) : "rgba(13,20,40,0.6)", border: `1px solid ${isActive ? riesgoColor(r.riesgo) : "rgba(0,229,255,0.1)"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "all 0.3s", backdropFilter: "blur(10px)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.4rem" }}>{esc.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.8rem", color: "#e0e8f0", fontWeight: 600 }}>{r.scenario}</span>
                        <span style={{ fontSize: "0.65rem", color: riesgoColor(r.riesgo), fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: `${riesgoColor(r.riesgo)}18`, border: `1px solid ${riesgoColor(r.riesgo)}40` }}>{r.riesgo}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Total: <strong style={{ color: "#e0e8f0" }}>${r.costoTotal.toLocaleString("es-CL")}</strong></span>
                        <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Sin blindaje: <strong style={{ color: riesgoColor(r.riesgo) }}>${r.copago.toLocaleString("es-CL")}</strong></span>
                        {showBlindaje && <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>Con X3: <strong style={{ color: "#00d4ff" }}>${r.blindajeCopago.toLocaleString("es-CL")}</strong></span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", height: "100%", width: `${coberturaPlan}%`, background: riesgoColor(r.riesgo), borderRadius: 3 }} />
                      {showBlindaje && <div style={{ position: "absolute", height: "100%", width: "92%", background: "rgba(0,212,255,0.3)", borderRadius: 3, border: "1px dashed rgba(0,212,255,0.5)" }} />}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Share Tech Mono',monospace", marginTop: 3 }}>
                      <span>Cobertura plan: {coberturaPlan}%</span>
                      {showBlindaje && <span>Blindaje X3: 92%</span>}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${riesgoColor(r.riesgo)}30` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                        <div style={{ background: "rgba(255,0,85,0.06)", border: "1px solid rgba(255,0,85,0.15)", borderRadius: 8, padding: "8px 10px" }}>
                          <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", marginBottom: 2 }}>SIN BLINDAJE</p>
                          <p style={{ fontSize: "0.9rem", color: "#ff0055", fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>${r.copago.toLocaleString("es-CL")}</p>
                        </div>
                        {showBlindaje && (
                          <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 8, padding: "8px 10px" }}>
                            <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", marginBottom: 2 }}>CON BLINDAJE X3</p>
                            <p style={{ fontSize: "0.9rem", color: "#00d4ff", fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>${r.blindajeCopago.toLocaleString("es-CL")}</p>
                          </div>
                        )}
                      </div>
                      {showBlindaje && r.ahorro > 0 && (
                        <div style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, padding: "8px 10px" }}>
                          <p style={{ fontSize: "0.55rem", color: "#00ff88", fontFamily: "'Share Tech Mono',monospace", marginBottom: 2 }}>💰 AHORRO CON BLINDAJE X3</p>
                          <p style={{ fontSize: "0.85rem", color: "#00ff88", fontFamily: "'Orbitron',sans-serif", fontWeight: 700 }}>+${r.ahorro.toLocaleString("es-CL")}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(123,47,255,0.08))", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 14, padding: "18px 16px", marginTop: 20, textAlign: "center" }}>
              <p style={{ fontSize: "0.7rem", color: "#00d4ff", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🛡️ ¿LISTO PARA EL BLINDAJE REAL?</p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: 14, lineHeight: 1.5 }}>Estos son escenarios simulados. X3 puede diseñar tu arquitectura de inmunidad real con productos específicos del mercado chileno.</p>
              <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.4)", borderRadius: 10, color: "#00d4ff", textDecoration: "none", fontFamily: "'Orbitron',sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}>⚡ ACTIVAR BLINDAJE CON X3</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
