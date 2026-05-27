import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const ISAPRES_OPCIONES = [
  { nombre: "Banmédica", planes: ["Plan 1 (2.5 UF)", "Plan 3 (4.2 UF)", "Plan Premium (6.8 UF)"] },
  { nombre: "Colmena", planes: ["Básico (2.1 UF)", "Estándar (3.8 UF)", "Premium (5.9 UF)"] },
  { nombre: "Cruz Blanca", planes: ["Vital (2.3 UF)", "Plus (4.0 UF)", "Elite (6.2 UF)"] },
  { nombre: "Consalud", planes: ["Base (1.9 UF)", "Medio (3.5 UF)", "Alto (5.5 UF)"] },
  { nombre: "Esencial", planes: ["Básico (1.8 UF)", "Estándar (3.2 UF)", "Premium (4.9 UF)"] },
  { nombre: "Vida Tres", planes: ["Inicial (2.0 UF)", "Plus (3.7 UF)", "Élite (5.8 UF)"] },
];

interface Perfil {
  isapre: string;
  plan: string;
  ingreso: number;
  cargas: number;
  condicion: "sano" | "cronica" | "alto_riesgo";
  objetivo: "minimo_costo" | "maxima_cobertura" | "equilibrio";
}

export default function OptimizadorBlindaje() {
  const [, setLocation] = useLocation();
  const [perfil, setPerfil] = useState<Perfil>({
    isapre: "Banmédica",
    plan: "Plan 1 (2.5 UF)",
    ingreso: 2500000,
    cargas: 2,
    condicion: "sano",
    objetivo: "equilibrio",
  });
  const [resultado, setResultado] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [fase, setFase] = useState<"form" | "analizando" | "resultado">("form");
  const [presentacionActiva, setPresentacionActiva] = useState(false);
  const [slideActual, setSlideActual] = useState(0);

  const sendMutation = trpc.chat.send.useMutation();

  const isapresSeleccionada = ISAPRES_OPCIONES.find(i => i.nombre === perfil.isapre);

  const analizar = useCallback(async () => {
    setFase("analizando");
    setIsLoading(true);

    const prompt = `OPTIMIZADOR AUTOMÁTICO DE BLINDAJE PATRIMONIAL X3

PERFIL DEL CLIENTE:
- Isapre actual: ${perfil.isapre} — ${perfil.plan}
- Ingreso mensual: $${perfil.ingreso.toLocaleString('es-CL')}
- Cargas familiares: ${perfil.cargas}
- Condición de salud: ${perfil.condicion === 'sano' ? 'Sano (sin condiciones preexistentes)' : perfil.condicion === 'cronica' ? 'Condición crónica controlada' : 'Alto riesgo / condición compleja'}
- Objetivo: ${perfil.objetivo === 'minimo_costo' ? 'Minimizar costo mensual' : perfil.objetivo === 'maxima_cobertura' ? 'Máxima cobertura posible' : 'Equilibrio costo-cobertura óptimo'}

INSTRUCCIÓN: Actúa como el Optimizador Automático de Blindaje X3. Analiza el perfil y genera:

## 1. DIAGNÓSTICO DE VULNERABILIDAD ACTUAL
Detecta las 3 principales fallas de cobertura del plan actual. Incluye montos en pesos chilenos.

## 2. ARQUITECTURA DE BLINDAJE ÓPTIMA (3 CAPAS)
**CAPA BASE:** Recomienda el plan Isapre ideal para este perfil (puede ser cambio o ajuste del actual). Justifica con costo en UF y cobertura real.
**CAPA ABSORCIÓN:** Recomienda el seguro catastrófico específico. Nombre del producto, compañía, costo estimado mensual.
**CAPA EXCESO:** Recomienda APV Régimen A o B según el ingreso. Monto óptimo mensual, ahorro tributario anual.

## 3. COMPARATIVA FINANCIERA
| Concepto | Sin Blindaje | Con Blindaje X3 |
|----------|-------------|-----------------|
| Gasto mensual en salud | $X | $X |
| Riesgo catastrófico anual | $X | $0 |
| Ahorro tributario APV | $0 | $X |
| Costo total real | $X | $X |

## 4. VEREDICTO X3
Una sola frase de cierre. Directa. Impactante. Con el monto exacto que se recupera o protege.

Usa datos reales del mercado chileno 2024. Cita Ley 21.350 si detectas vulneración de Isapre. Cita Art. 42 bis para APV.`;

    try {
      const res = await sendMutation.mutateAsync({ message: prompt });
      setResultado((res as any).response || (res as any).content || "");
      setFase("resultado");
    } catch (err) {
      setResultado("Error al conectar con el núcleo X3. Verifica tu conexión.");
      setFase("resultado");
    } finally {
      setIsLoading(false);
    }
  }, [perfil, sendMutation]);

  // Modo Presentación: genera 3 slides desde el resultado
  const slides = resultado ? [
    {
      titulo: "DIAGNÓSTICO DE VULNERABILIDAD",
      contenido: resultado.split("## 2.")[0].replace("## 1. DIAGNÓSTICO DE VULNERABILIDAD ACTUAL", "").trim(),
      color: "#ff4444",
      icon: "🎯",
    },
    {
      titulo: "ARQUITECTURA DE BLINDAJE X3",
      contenido: resultado.split("## 2.")[1]?.split("## 3.")[0]?.replace("ARQUITECTURA DE BLINDAJE ÓPTIMA (3 CAPAS)", "").trim() || "",
      color: "#00ffcc",
      icon: "🛡️",
    },
    {
      titulo: "VEREDICTO FINAL",
      contenido: resultado.split("## 4.")[1]?.replace("VEREDICTO X3", "").trim() || resultado.slice(-400),
      color: "#ffcc00",
      icon: "⚖️",
    },
  ] : [];

  const descargarInforme = () => {
    if (!resultado) return;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Optimizador Blindaje X3 — ${perfil.isapre}</title>
<style>
  body{margin:0;background:#0a0a0f;color:#e0e0e0;font-family:'Courier New',monospace;padding:40px;}
  .wrap{max-width:900px;margin:0 auto;}
  h1{color:#00ffcc;letter-spacing:4px;font-size:24px;border-bottom:2px solid #00ffcc;padding-bottom:16px;}
  h2{color:#00ffcc;font-size:16px;letter-spacing:2px;margin-top:32px;}
  p{line-height:1.8;color:#ccc;}
  strong{color:#00ffcc;}
  table{width:100%;border-collapse:collapse;margin:20px 0;}
  th{background:rgba(0,255,204,0.1);color:#00ffcc;padding:10px;text-align:left;font-size:12px;letter-spacing:1px;}
  td{padding:10px;border-bottom:1px solid rgba(0,255,204,0.1);color:#ccc;font-size:13px;}
  .footer{margin-top:60px;text-align:center;color:#555;font-size:11px;border-top:1px solid rgba(0,255,204,0.2);padding-top:20px;}
  .seal{display:inline-block;border:1px solid #00ffcc;padding:6px 20px;color:#00ffcc;font-size:11px;letter-spacing:3px;margin-top:10px;}
</style></head><body><div class="wrap">
<h1>⚡ OPTIMIZADOR DE BLINDAJE X3</h1>
<p><strong>Perfil:</strong> ${perfil.isapre} — ${perfil.plan} | Ingreso: $${perfil.ingreso.toLocaleString('es-CL')} | Cargas: ${perfil.cargas}</p>
<p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
<hr style="border-color:rgba(0,255,204,0.2);margin:24px 0;">
${resultado.replace(/## /g, '<h2>').replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}
<div class="footer">
  <div>Generado por X3 Superinteligencia Patrimonial</div>
  <div class="seal">✓ ANALIZADO · PROTEGIDO · RESPALDADO</div>
  <div style="margin-top:8px;font-size:10px;">"Estamos contigo antes, durante y después."</div>
</div>
</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `X3_Blindaje_${perfil.isapre}_${new Date().toISOString().slice(0,10)}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'Share Tech Mono', monospace", padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setLocation('/')} style={{ background: 'none', border: '1px solid #00ffcc', color: '#00ffcc', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px' }}>← VOLVER</button>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', color: '#00ffcc', letterSpacing: '3px' }}>🛡️ OPTIMIZADOR DE BLINDAJE X3</h1>
          <div style={{ fontSize: '10px', color: '#666', letterSpacing: '2px' }}>ANÁLISIS AUTOMÁTICO · 3 CAPAS · VEREDICTO INMEDIATO</div>
        </div>
      </div>

      {/* FASE: FORMULARIO */}
      {fase === "form" && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Isapre */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>ISAPRE ACTUAL</label>
              <select value={perfil.isapre} onChange={e => setPerfil(p => ({ ...p, isapre: e.target.value, plan: ISAPRES_OPCIONES.find(i => i.nombre === e.target.value)?.planes[0] || "" }))}
                style={{ width: '100%', background: '#111', border: '1px solid rgba(0,255,204,0.3)', color: '#00ffcc', padding: '10px', fontFamily: 'inherit', fontSize: '13px' }}>
                {ISAPRES_OPCIONES.map(i => <option key={i.nombre} value={i.nombre}>{i.nombre}</option>)}
              </select>
            </div>

            {/* Plan */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>PLAN ACTUAL</label>
              <select value={perfil.plan} onChange={e => setPerfil(p => ({ ...p, plan: e.target.value }))}
                style={{ width: '100%', background: '#111', border: '1px solid rgba(0,255,204,0.3)', color: '#00ffcc', padding: '10px', fontFamily: 'inherit', fontSize: '13px' }}>
                {isapresSeleccionada?.planes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Ingreso */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>INGRESO MENSUAL</label>
              <input type="range" min={500000} max={8000000} step={100000} value={perfil.ingreso}
                onChange={e => setPerfil(p => ({ ...p, ingreso: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#00ffcc' }} />
              <div style={{ textAlign: 'center', fontSize: '20px', color: '#00ffcc', fontWeight: 'bold', marginTop: '8px' }}>
                ${perfil.ingreso.toLocaleString('es-CL')}
              </div>
            </div>

            {/* Cargas */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>CARGAS FAMILIARES</label>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setPerfil(p => ({ ...p, cargas: n }))} style={{
                    width: '40px', height: '40px', border: `2px solid ${perfil.cargas === n ? '#00ffcc' : 'rgba(0,255,204,0.2)'}`,
                    background: perfil.cargas === n ? 'rgba(0,255,204,0.15)' : 'transparent',
                    color: perfil.cargas === n ? '#00ffcc' : '#666', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 'bold'
                  }}>{n}</button>
                ))}
              </div>
            </div>

            {/* Condición */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '12px' }}>CONDICIÓN DE SALUD</label>
              {[
                { val: 'sano', lbl: '💚 Sano', sub: 'Sin condiciones preexistentes' },
                { val: 'cronica', lbl: '🟡 Crónica', sub: 'Condición controlada' },
                { val: 'alto_riesgo', lbl: '🔴 Alto Riesgo', sub: 'Condición compleja' },
              ].map(c => (
                <button key={c.val} onClick={() => setPerfil(p => ({ ...p, condicion: c.val as any }))} style={{
                  display: 'block', width: '100%', marginBottom: '6px', padding: '8px 12px', textAlign: 'left',
                  border: `1px solid ${perfil.condicion === c.val ? '#00ffcc' : 'rgba(0,255,204,0.15)'}`,
                  background: perfil.condicion === c.val ? 'rgba(0,255,204,0.08)' : 'transparent',
                  color: perfil.condicion === c.val ? '#00ffcc' : '#888', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px'
                }}>
                  {c.lbl} <span style={{ fontSize: '10px', color: '#555' }}>— {c.sub}</span>
                </button>
              ))}
            </div>

            {/* Objetivo */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '12px' }}>OBJETIVO</label>
              {[
                { val: 'minimo_costo', lbl: '💰 Mínimo Costo', sub: 'Optimizar gasto mensual' },
                { val: 'maxima_cobertura', lbl: '🛡️ Máxima Cobertura', sub: 'Protección total' },
                { val: 'equilibrio', lbl: '⚖️ Equilibrio', sub: 'Costo-cobertura óptimo' },
              ].map(o => (
                <button key={o.val} onClick={() => setPerfil(p => ({ ...p, objetivo: o.val as any }))} style={{
                  display: 'block', width: '100%', marginBottom: '6px', padding: '8px 12px', textAlign: 'left',
                  border: `1px solid ${perfil.objetivo === o.val ? '#00ffcc' : 'rgba(0,255,204,0.15)'}`,
                  background: perfil.objetivo === o.val ? 'rgba(0,255,204,0.08)' : 'transparent',
                  color: perfil.objetivo === o.val ? '#00ffcc' : '#888', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px'
                }}>
                  {o.lbl} <span style={{ fontSize: '10px', color: '#555' }}>— {o.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={analizar} style={{
            width: '100%', padding: '18px', background: 'linear-gradient(135deg, #00ffcc, #0066ff)',
            border: 'none', color: '#000', fontSize: '14px', fontWeight: 'bold', letterSpacing: '4px',
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            ⚡ ACTIVAR OPTIMIZADOR X3
          </button>
        </div>
      )}

      {/* FASE: ANALIZANDO */}
      {fase === "analizando" && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px', animation: 'pulse 1s infinite' }}>🛡️</div>
          <div style={{ fontSize: '16px', color: '#00ffcc', letterSpacing: '4px', marginBottom: '16px' }}>OPTIMIZANDO BLINDAJE</div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '32px' }}>Analizando {perfil.isapre} · {perfil.plan} · ${perfil.ingreso.toLocaleString('es-CL')}/mes</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {['DETECTANDO FALLAS', 'CALCULANDO CAPAS', 'GENERANDO VEREDICTO'].map((s, i) => (
              <div key={s} style={{ fontSize: '10px', color: '#444', letterSpacing: '1px', padding: '6px 12px', border: '1px solid rgba(0,255,204,0.15)', animation: `fadeIn 0.5s ${i * 0.5}s both` }}>{s}</div>
            ))}
          </div>
        </div>
      )}

      {/* FASE: RESULTADO */}
      {fase === "resultado" && !presentacionActiva && (
        <div>
          {/* Resultado principal */}
          <div style={{ background: 'rgba(0,255,204,0.04)', border: '1px solid rgba(0,255,204,0.2)', padding: '24px', marginBottom: '16px', lineHeight: '1.8', fontSize: '14px' }}
            dangerouslySetInnerHTML={{ __html: resultado
              .replace(/## (.+)/g, '<h3 style="color:#00ffcc;letter-spacing:2px;font-size:14px;margin:24px 0 12px;">$1</h3>')
              .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#00ffcc;">$1</strong>')
              .replace(/\|(.+)\|/g, '<div style="font-family:monospace;font-size:12px;color:#aaa;">|$1|</div>')
              .replace(/\n/g, '<br/>')
            }} />

          {/* Botones de acción */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <button onClick={() => { setPresentacionActiva(true); setSlideActual(0); }} style={{
              padding: '14px', background: 'rgba(0,255,204,0.08)', border: '2px solid #00ffcc',
              color: '#00ffcc', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', letterSpacing: '2px'
            }}>📊 MODO PRESENTACIÓN</button>
            <button onClick={descargarInforme} style={{
              padding: '14px', background: 'rgba(0,102,255,0.08)', border: '2px solid #0066ff',
              color: '#0066ff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', letterSpacing: '2px'
            }}>📥 DESCARGAR INFORME</button>
            <button onClick={() => { setFase("form"); setResultado(""); }} style={{
              padding: '14px', background: 'transparent', border: '1px solid rgba(0,255,204,0.3)',
              color: '#666', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', letterSpacing: '2px'
            }}>🔄 NUEVO ANÁLISIS</button>
          </div>
        </div>
      )}

      {/* MODO PRESENTACIÓN — 3 slides */}
      {fase === "resultado" && presentacionActiva && slides.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: '#0a0a0f', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          {/* Header presentación */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#666', letterSpacing: '3px' }}>MODO PRESENTACIÓN X3 · SLIDE {slideActual + 1}/3</div>
            <button onClick={() => setPresentacionActiva(false)} style={{ background: 'none', border: '1px solid rgba(0,255,204,0.3)', color: '#666', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px' }}>✕ CERRAR</button>
          </div>

          {/* Slide actual */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `2px solid ${slides[slideActual].color}`, padding: '40px', background: `rgba(${slides[slideActual].color === '#ff4444' ? '255,68,68' : slides[slideActual].color === '#00ffcc' ? '0,255,204' : '255,204,0'},0.04)` }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>{slides[slideActual].icon}</div>
            <h2 style={{ color: slides[slideActual].color, letterSpacing: '4px', textAlign: 'center', marginBottom: '32px', fontSize: '20px' }}>
              {slides[slideActual].titulo}
            </h2>
            <div style={{ fontSize: '14px', lineHeight: '1.9', color: '#ccc', maxHeight: '50vh', overflowY: 'auto' }}
              dangerouslySetInnerHTML={{ __html: slides[slideActual].contenido
                .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${slides[slideActual].color}">$1</strong>`)
                .replace(/\n/g, '<br/>')
              }} />
          </div>

          {/* Navegación */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px', alignItems: 'center' }}>
            <button onClick={() => setSlideActual(s => Math.max(0, s - 1))} disabled={slideActual === 0} style={{
              padding: '12px 24px', background: 'transparent', border: '1px solid rgba(0,255,204,0.3)',
              color: slideActual === 0 ? '#333' : '#00ffcc', cursor: slideActual === 0 ? 'default' : 'pointer',
              fontFamily: 'inherit', fontSize: '13px'
            }}>← ANTERIOR</button>
            <div style={{ display: 'flex', gap: '8px' }}>
              {slides.map((_, i) => (
                <div key={i} onClick={() => setSlideActual(i)} style={{
                  width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer',
                  background: i === slideActual ? '#00ffcc' : 'rgba(0,255,204,0.2)'
                }} />
              ))}
            </div>
            <button onClick={() => setSlideActual(s => Math.min(2, s + 1))} disabled={slideActual === 2} style={{
              padding: '12px 24px', background: slideActual === 2 ? 'transparent' : 'linear-gradient(135deg, #00ffcc, #0066ff)',
              border: 'none', color: slideActual === 2 ? '#333' : '#000',
              cursor: slideActual === 2 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 'bold'
            }}>SIGUIENTE →</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:0.7} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
