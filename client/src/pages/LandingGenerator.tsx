import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

const ESTILOS = [
  { id: "cinematic3d", label: "🎬 Cinemático 3D", desc: "Partículas, profundidad, parallax, glassmorphism" },
  { id: "military", label: "⚡ Militar Táctico", desc: "Orbitron, neón, grid, HUD style" },
  { id: "luxury", label: "💎 Lujo Premium", desc: "Dorado, negro profundo, tipografía elegante" },
  { id: "tech", label: "🤖 Tech Futurista", desc: "Holográfico, datos en movimiento, cyan" },
  { id: "medical", label: "🏥 Médico Profesional", desc: "Limpio, confiable, azul corporativo" },
  { id: "impact", label: "🔥 Impacto Máximo", desc: "Rojo, urgencia, conversión agresiva" },
];

const SECTORES = ["Salud / Isapres", "Seguros", "Inversiones / APV", "Inmobiliaria", "Consultoría", "Tecnología", "Educación", "Otro"];
const OBJETIVOS = ["Captar leads", "Vender servicio", "Agendar reunión", "Demostrar autoridad", "Comparar opciones", "Urgencia / Oferta"];

export default function LandingGenerator() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    nombre_empresa: "",
    sector: "",
    propuesta: "",
    publico: "",
    objetivo: "",
    estilo: "cinematic3d",
    incluir_radar: false,
    incluir_contador: false,
    incluir_testimonios: false,
    cta_texto: "Quiero mi análisis gratuito",
    color_principal: "#00e5ff",
  });
  const [codigo, setCodigo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const generateMutation = trpc.code.generate.useMutation();

  const handleGenerar = async () => {
    setLoading(true);
    setError(null);
    setCodigo(null);
    try {
      const estiloSeleccionado = ESTILOS.find(e => e.id === form.estilo);
      const extras = [
        form.incluir_radar && "Un radar interactivo animado que muestra las 'fugas de dinero' o riesgos del cliente",
        form.incluir_contador && "Un contador en tiempo real que muestra cuánto dinero pierde el visitante por no actuar (aumenta cada segundo)",
        form.incluir_testimonios && "3 testimonios de clientes con foto placeholder, nombre y resultado obtenido",
      ].filter(Boolean).join(", ");

      const description = `Landing page de alta conversión con estas especificaciones EXACTAS:

EMPRESA: ${form.nombre_empresa || "X3 Élite"}
SECTOR: ${form.sector}
PROPUESTA DE VALOR: ${form.propuesta}
PÚBLICO OBJETIVO: ${form.publico}
OBJETIVO PRINCIPAL: ${form.objetivo}
ESTILO VISUAL: ${estiloSeleccionado?.label} — ${estiloSeleccionado?.desc}
COLOR PRINCIPAL: ${form.color_principal}
CTA PRINCIPAL: "${form.cta_texto}"
${extras ? `ELEMENTOS ESPECIALES: ${extras}` : ""}

REQUISITOS TÉCNICOS OBLIGATORIOS:
1. HTML/CSS/JS en un solo archivo, 100% funcional sin dependencias externas
2. Diseño ${form.estilo === "cinematic3d" ? "con canvas de partículas animadas, efecto parallax en scroll, glassmorphism en cards, sombras de neón" : form.estilo === "military" ? "con fondo de grid táctico, tipografía Orbitron (importada de Google Fonts), barras de progreso animadas, estética HUD militar" : form.estilo === "luxury" ? "con fondo negro profundo, acentos dorados, tipografía serif elegante, animaciones sutiles de aparición" : form.estilo === "tech" ? "con fondo holográfico, datos en movimiento, tipografía monospace, efectos de glitch" : form.estilo === "medical" ? "limpio y profesional, azul corporativo, íconos SVG, layout en grid" : "con colores rojos de urgencia, countdown timer, badges de escasez, CTA muy visible"}
3. Secciones: Hero con headline impactante → Problema del cliente → Solución → Beneficios (3) → ${extras ? "Elementos especiales → " : ""}CTA final
4. Totalmente responsive (mobile-first)
5. Animaciones de entrada al hacer scroll (IntersectionObserver)
6. Formulario de contacto funcional con validación
7. Meta tags SEO completos
8. Velocidad de carga optimizada

IMPORTANTE: El código debe ser VISUALMENTE IMPRESIONANTE, de nivel agencia premium. No genérico.`;

      const result = await generateMutation.mutateAsync({ description, type: "landing" });
      setCodigo(result.code);
    } catch {
      setError("Error al generar la landing. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const downloadLanding = () => {
    if (!codigo) return;
    const blob = new Blob([codigo], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `X3-Landing-${(form.nombre_empresa || "landing").replace(/\s/g, "-")}-${Date.now()}.html`;
    a.click();
  };

  const getPreviewSrc = () => {
    if (!codigo) return "";
    const blob = new Blob([codigo], { type: "text/html" });
    return URL.createObjectURL(blob);
  };

  const canGenerate = form.sector && form.propuesta && form.publico && form.objetivo;

  return (
    <div style={{ background: "#060912", minHeight: "100vh", color: "#e0e8f0", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,180,0,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,180,0,.02) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <button onClick={() => navigate("/")} style={btnSecondary}>← VOLVER</button>
          <div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.9rem", fontWeight: 800, color: "#ffb400" }}>GENERADOR DE LANDING PAGES</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.55rem", color: "rgba(255,180,0,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>3D Cinemáticas · Motor X3 Élite</div>
          </div>
        </div>

        {!codigo ? (
          <>
            {/* SELECTOR DE ESTILO */}
            <div style={{ marginBottom: "20px" }}>
              <p style={sectionLabel}>Estilo visual</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
                {ESTILOS.map(e => (
                  <button key={e.id} onClick={() => setForm(f => ({ ...f, estilo: e.id }))}
                    style={{ background: form.estilo === e.id ? "rgba(255,180,0,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${form.estilo === e.id ? "rgba(255,180,0,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "10px 8px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                    <div style={{ fontSize: "0.75rem", color: form.estilo === e.id ? "#ffb400" : "#e0e8f0", fontWeight: 600, marginBottom: "2px" }}>{e.label}</div>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", lineHeight: "1.3" }}>{e.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* DATOS */}
            <div style={{ display: "grid", gap: "14px", marginBottom: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={labelStyle}><span style={labelTextStyle}>Nombre de empresa / marca</span>
                  <input style={inputStyle} type="text" placeholder="Ej: X3 Élite" value={form.nombre_empresa} onChange={e => setForm(f => ({ ...f, nombre_empresa: e.target.value }))} />
                </label>
                <label style={labelStyle}><span style={labelTextStyle}>Sector *</span>
                  <select style={selectStyle} value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}>
                    <option value="">Selecciona</option>
                    {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <label style={labelStyle}><span style={labelTextStyle}>Propuesta de valor (qué ofreces) *</span>
                <textarea style={{ ...inputStyle, resize: "none", height: "70px" }} placeholder="Ej: Blindaje patrimonial total en salud. Analizamos tu plan de Isapre y te protegemos de gastos catastróficos." value={form.propuesta} onChange={e => setForm(f => ({ ...f, propuesta: e.target.value }))} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={labelStyle}><span style={labelTextStyle}>Público objetivo *</span>
                  <input style={inputStyle} type="text" placeholder="Ej: Familias chilenas con Isapre" value={form.publico} onChange={e => setForm(f => ({ ...f, publico: e.target.value }))} />
                </label>
                <label style={labelStyle}><span style={labelTextStyle}>Objetivo de la landing *</span>
                  <select style={selectStyle} value={form.objetivo} onChange={e => setForm(f => ({ ...f, objetivo: e.target.value }))}>
                    <option value="">Selecciona</option>
                    {OBJETIVOS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
                <label style={labelStyle}><span style={labelTextStyle}>Texto del CTA principal</span>
                  <input style={inputStyle} type="text" placeholder="Ej: Quiero mi análisis gratuito" value={form.cta_texto} onChange={e => setForm(f => ({ ...f, cta_texto: e.target.value }))} />
                </label>
                <label style={labelStyle}><span style={labelTextStyle}>Color principal</span>
                  <input style={{ ...inputStyle, width: "60px", height: "40px", padding: "4px", cursor: "pointer" }} type="color" value={form.color_principal} onChange={e => setForm(f => ({ ...f, color_principal: e.target.value }))} />
                </label>
              </div>
            </div>

            {/* ELEMENTOS ESPECIALES */}
            <div style={{ marginBottom: "20px" }}>
              <p style={sectionLabel}>Elementos especiales (opcionales)</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {[
                  { key: "incluir_radar", label: "🎯 Radar de fugas interactivo" },
                  { key: "incluir_contador", label: "⏱ Contador pérdida en tiempo real" },
                  { key: "incluir_testimonios", label: "💬 Testimonios de clientes" },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setForm(f => ({ ...f, [opt.key]: !f[opt.key as keyof typeof f] }))}
                    style={{ background: form[opt.key as keyof typeof form] ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${form[opt.key as keyof typeof form] ? "rgba(0,229,255,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "20px", color: form[opt.key as keyof typeof form] ? "#00e5ff" : "rgba(255,255,255,0.5)", padding: "7px 14px", fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.2s" }}>
                    {form[opt.key as keyof typeof form] ? "✓ " : ""}{opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button style={{ ...btnPrimary, width: "100%", fontSize: "0.85rem", padding: "14px", opacity: canGenerate ? 1 : 0.4 }} disabled={!canGenerate || loading} onClick={handleGenerar}>
              {loading ? "🎬 GENERANDO LANDING 3D..." : "🚀 GENERAR LANDING PAGE"}
            </button>
            {loading && <p style={{ textAlign: "center", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "10px", fontFamily: "'Share Tech Mono',monospace" }}>Esto puede tomar 20-40 segundos...</p>}
            {error && <p style={{ color: "#ff4444", fontSize: "0.75rem", marginTop: "12px", textAlign: "center" }}>{error}</p>}
          </>
        ) : (
          <>
            {/* RESULTADO */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <button style={{ ...btnPrimary, flex: 1 }} onClick={downloadLanding}>⬇ Descargar HTML</button>
              <button style={{ ...btnSecondary, flex: 1 }} onClick={() => setPreview(!preview)}>{preview ? "📝 Ver código" : "👁 Preview"}</button>
              <button style={btnSecondary} onClick={() => { setCodigo(null); setPreview(false); }}>🔄 Nueva landing</button>
            </div>

            {preview ? (
              <iframe
                src={getPreviewSrc()}
                style={{ width: "100%", height: "70vh", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", background: "#fff" }}
                title="Preview Landing"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,180,0,0.15)", borderRadius: "12px", padding: "16px", maxHeight: "65vh", overflowY: "auto" }}>
                <pre style={{ fontSize: "0.72rem", color: "#e0e8f0", whiteSpace: "pre-wrap", fontFamily: "'Share Tech Mono',monospace", lineHeight: "1.5" }}>{codigo}</pre>
              </div>
            )}
            <p style={{ textAlign: "center", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.6rem", color: "rgba(255,180,0,0.3)", marginTop: "16px" }}>Landing generada por X3 ÉLITE · Motor Cinemático 3D</p>
          </>
        )}
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = { fontFamily: "'Share Tech Mono',monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginBottom: "10px" };
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "5px" };
const labelTextStyle: React.CSSProperties = { fontSize: "0.6rem", color: "rgba(255,255,255,0.45)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" as const, letterSpacing: "0.07em" };
const selectStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e0e8f0", padding: "9px 11px", fontSize: "0.8rem", fontFamily: "'Inter',sans-serif", outline: "none", cursor: "pointer" };
const inputStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e0e8f0", padding: "9px 11px", fontSize: "0.8rem", fontFamily: "'Inter',sans-serif", outline: "none", width: "100%" };
const btnPrimary: React.CSSProperties = { background: "linear-gradient(135deg,rgba(255,180,0,0.2),rgba(255,100,0,0.1))", border: "1px solid rgba(255,180,0,0.5)", borderRadius: "10px", color: "#ffb400", padding: "12px 20px", fontSize: "0.75rem", fontFamily: "'Orbitron',sans-serif", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" };
const btnSecondary: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "rgba(255,255,255,0.6)", padding: "12px 16px", fontSize: "0.72rem", fontFamily: "'Share Tech Mono',monospace", cursor: "pointer" };
