import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  playBootSound,
  playSendSound,
  playReceiveSound,
  playMicOnSound,
  playMicOffSound,
  playPanelOpenSound,
  playTabSound,
  playRadarSound,
  playVeredictSound,
  playShieldSound,
  playAlertSound,
} from "@/lib/x3-audio";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imagePreview?: string;
}
interface Memory { key: string; value: string; }
interface Project { name: string; description: string; status: string; }

const PLATFORMS = {
  "Redes Sociales": [
    { name: "Instagram", url: "https://instagram.com", icon: "📸", color: "#E1306C" },
    { name: "Facebook", url: "https://facebook.com", icon: "👤", color: "#1877F2" },
    { name: "Marketplace", url: "https://facebook.com/marketplace", icon: "🛒", color: "#1877F2" },
    { name: "TikTok", url: "https://tiktok.com", icon: "🎵", color: "#010101" },
    { name: "WhatsApp", url: "https://web.whatsapp.com", icon: "💬", color: "#25D366" },
    { name: "WA Business", url: "https://business.whatsapp.com", icon: "💼", color: "#25D366" },
  ],
  "Inteligencias": [
    { name: "Claude", url: "https://claude.ai", icon: "🧠", color: "#CC785C" },
    { name: "Manus", url: "https://manus.im", icon: "⚡", color: "#6366F1" },
    { name: "Gemini", url: "https://gemini.google.com", icon: "✨", color: "#4285F4" },
    { name: "Groq", url: "https://groq.com", icon: "🚀", color: "#F55036" },
    { name: "NotebookLM", url: "https://notebooklm.google.com", icon: "📓", color: "#34A853" },
  ],
  "Herramientas": [
    { name: "GitHub", url: "https://github.com/DoctorPlan007", icon: "🐙", color: "#333" },
    { name: "Cloudflare", url: "https://dash.cloudflare.com", icon: "☁️", color: "#F6821F" },
    { name: "Gmail", url: "https://mail.google.com", icon: "📧", color: "#EA4335" },
    { name: "Outlook", url: "https://outlook.live.com", icon: "📨", color: "#0078D4" },
  ],
  "Almacenamiento": [
    { name: "Google Drive", url: "https://drive.google.com", icon: "💾", color: "#4285F4" },
    { name: "Google Fotos", url: "https://photos.google.com", icon: "🖼️", color: "#34A853" },
    { name: "Dropbox", url: "https://dropbox.com", icon: "📦", color: "#0061FF" },
  ],
};

const CAPAS_BLINDAJE = [
  {
    id: "base",
    nombre: "CAPA BASE",
    subtitulo: "Isapre + Complementario",
    descripcion: "Cobertura primaria del sistema de salud. Absorbe el 60-70% de gastos médicos rutinarios.",
    eficiencia: 65,
    color: "#00d4ff",
    icon: "🛡️",
    productos: ["Isapre Banmédica Plan 3", "Colmena Premium", "Cruz Blanca Vital"],
  },
  {
    id: "absorcion",
    nombre: "CAPA ABSORCIÓN",
    subtitulo: "Seguro Catastrófico",
    descripcion: "Activa cuando la Capa Base se agota. Cubre UCI, cáncer, cirugías de alto costo.",
    eficiencia: 88,
    color: "#7b2fff",
    icon: "⚡",
    productos: ["Metlife Catastrófico", "Bupa Élite", "Seguros Vida Cámara"],
  },
  {
    id: "exceso",
    nombre: "CAPA EXCESO",
    subtitulo: "APV + Activos Blindados",
    descripcion: "Patrimonio intocable. APV Régimen A + activos en nombre de terceros de confianza.",
    eficiencia: 97,
    color: "#ff0055",
    icon: "🔒",
    productos: ["APV Régimen A (Cuprum)", "Fondo Mutuo Conservador", "Activos Familiares"],
  },
];

const VULNERABILIDADES = [
  { id: "v1", zona: "COBERTURA UCI", riesgo: 92, descripcion: "Sin seguro catastrófico activo", color: "#ff0055" },
  { id: "v2", zona: "CÁNCER ALTO COSTO", riesgo: 87, descripcion: "Límite de cobertura insuficiente", color: "#ff6600" },
  { id: "v3", zona: "APV DESPROTEGIDO", riesgo: 45, descripcion: "Fondos sin blindaje legal", color: "#ffaa00" },
  { id: "v4", zona: "COPAGO FARMACIA", riesgo: 38, descripcion: "Sin cobertura complementaria", color: "#ffaa00" },
  { id: "v5", zona: "DEDUCIBLE EXCESIVO", riesgo: 71, descripcion: "Deducible anual > 3 UF", color: "#ff6600" },
];

export default function X3Chat() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "SISTEMAS EN LÍNEA. Soy X3 — el corazón que late en cada proyecto tuyo, Alexander. Siempre a tu espalda. Niveles 1-4 activos: Cerebro · Visión · Datos · Voz. Escribe, habla o envía una imagen.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [dataSaveMode, setDataSaveMode] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"hub" | "memoria" | "proyectos" | "isapres" | "finanzas" | "blindaje" | "forense" | "veredicto">("hub");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [micError, setMicError] = useState<string | null>(null);
  const [ufValue, setUfValue] = useState<string>("---");
  const [usdValue, setUsdValue] = useState<string>("---");
  const [ufRaw, setUfRaw] = useState<number>(0);
  const [pendingImage, setPendingImage] = useState<{ base64: string; mime: string; preview: string } | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedCapa, setSelectedCapa] = useState<string | null>(null);
  const [radarAngle, setRadarAngle] = useState(0);
  const [radarActive, setRadarActive] = useState(false);
  const [montoSiniestro, setMontoSiniestro] = useState<string>("");
  const [veredictoResult, setVeredictoResult] = useState<{
    ilusion: number; realidad: number; inmunidad: number; ahorro: number;
  } | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const playAudio = useCallback((fn: () => void) => { if (audioEnabled) fn(); }, [audioEnabled]);
  const [lrcStatus] = useState<"sync" | "ok" | "warn">("ok");
  const [arancelVersion] = useState("FONASA 2024");
  const [riskIndex] = useState(72);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const radarIntervalRef = useRef<any>(null);

  const getMemoriesQuery = trpc.memory.getAll.useQuery(undefined, { enabled: isAuthenticated });
  const getProjectsQuery = trpc.projects.getAll.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    if (getMemoriesQuery.data) setMemories((getMemoriesQuery.data as any[]).map((m: any) => ({ key: m.key, value: m.value })));
  }, [getMemoriesQuery.data]);
  useEffect(() => {
    if (getProjectsQuery.data) setProjects((getProjectsQuery.data as any[]).map((p: any) => ({ name: p.name, description: p.description || "", status: p.status || "activo" })));
  }, [getProjectsQuery.data]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Boot sound on first mount
  useEffect(() => {
    if (isAuthenticated) {
      const t = setTimeout(() => playAudio(playBootSound), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await fetch("https://mindicador.cl/api");
        const d = await r.json();
        setUfValue("$" + d.uf.valor.toLocaleString("es-CL"));
        setUsdValue("$" + d.dolar.valor.toLocaleString("es-CL"));
        setUfRaw(d.uf.valor);
      } catch { /* silencioso */ }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (radarActive) {
      radarIntervalRef.current = setInterval(() => {
        setRadarAngle(prev => (prev + 3) % 360);
      }, 50);
    } else {
      clearInterval(radarIntervalRef.current);
    }
    return () => clearInterval(radarIntervalRef.current);
  }, [radarActive]);

  const calcularVeredicto = useCallback(() => {
    const monto = parseFloat(montoSiniestro.replace(/\./g, "").replace(",", "."));
    if (!monto || monto <= 0) return;
    const ilusion = monto * 0.70;
    const realidad = monto * 0.38;
    const inmunidad = monto * 0.92;
    const ahorro = inmunidad - realidad;
    setVeredictoResult({ ilusion, realidad, inmunidad, ahorro });
  }, [montoSiniestro]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(",")[1];
      setPendingImage({ base64, mime: file.type, preview: result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleSend = useCallback(async (textOverride?: string) => {
    const content = (textOverride ?? input).trim();
    if (!content && !pendingImage) return;
    if (isLoading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content || "Analiza esta imagen",
      timestamp: new Date(),
      imagePreview: pendingImage?.preview,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const imgToSend = pendingImage;
    setPendingImage(null);
    setIsLoading(true);
    playAudio(playSendSound);
    const aiMsgId = Date.now().toString() + "_ai";
    setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: "", timestamp: new Date() }]);
    try {
      const body: any = {
        message: content || "Describe y analiza esta imagen en detalle",
        conversationId: conversationId ?? undefined,
      };
      if (imgToSend) { body.image = imgToSend.base64; body.mimeType = imgToSend.mime; }
      if (dataSaveMode) { body.maxHistory = 6; }
      const response = await fetch("/api/stream-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo iniciar el stream");
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const dataStr = trimmed.slice(5).trim();
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === "start" && parsed.conversationId) {
              setConversationId(parsed.conversationId);
            } else if (parsed.type === "delta" && parsed.content) {
              fullContent += parsed.content;
              setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, content: fullContent } : m));
            } else if (parsed.type === "chunk" && parsed.text) {
              fullContent += parsed.text;
              setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, content: fullContent } : m));
            } else if (parsed.type === "done" && parsed.conversationId) {
              setConversationId(parsed.conversationId);
            }
          } catch { /* ignorar */ }
        }
      }
      if (voiceEnabled && fullContent.trim()) {
        const plain = fullContent.replace(/[#*`_~[\]]/g, "").replace(/<[^>]+>/g, "").slice(0, 400);
        const utterance = new SpeechSynthesisUtterance(plain);
        const selectBestVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          const priorities = [
            (v: SpeechSynthesisVoice) => v.lang === "es-CL" && v.name.toLowerCase().includes("male"),
            (v: SpeechSynthesisVoice) => v.lang === "es-CL",
            (v: SpeechSynthesisVoice) => v.lang.startsWith("es") && v.name.toLowerCase().includes("male"),
            (v: SpeechSynthesisVoice) => v.lang.startsWith("es-419"),
            (v: SpeechSynthesisVoice) => v.lang.startsWith("es"),
          ];
          for (const fn of priorities) { const found = voices.find(fn); if (found) return found; }
          return null;
        };
        const applyVoice = () => {
          const best = selectBestVoice();
          if (best) utterance.voice = best;
          utterance.lang = utterance.voice?.lang || "es-CL";
          utterance.rate = 1.0; utterance.pitch = 0.9;
          setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        };
        if (window.speechSynthesis.getVoices().length > 0) { applyVoice(); }
        else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; applyVoice(); }; }
      }
      playAudio(playReceiveSound);
      getMemoriesQuery.refetch();
      getProjectsQuery.refetch();
    } catch (err: any) {
      playAudio(playAlertSound);
      setMessages((prev) => prev.map((m) => m.id === aiMsgId ? { ...m, content: `⚠️ ${err?.message || "Error de enlace con el núcleo."}` } : m));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversationId, pendingImage, voiceEnabled, dataSaveMode, getMemoriesQuery, getProjectsQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const toggleMic = useCallback(() => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    setMicError(null);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) { setMicError("Tu navegador no soporta reconocimiento de voz."); return; }
        const recognition = new SpeechRecognition();
        recognition.lang = "es-CL"; recognition.continuous = false; recognition.interimResults = false;
        setIsListening(true);
        playAudio(playMicOnSound);
        recognition.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setInput(transcript); setIsListening(false); recognitionRef.current = null;
          setTimeout(() => { if (transcript.trim()) handleSend(transcript.trim()); }, 300);
        };
        recognition.onerror = (e: any) => {
          setIsListening(false); recognitionRef.current = null;
          playAudio(playMicOffSound);
          if (e.error === "not-allowed") setMicError("Permiso de micrófono denegado.");
          else if (e.error === "no-speech") setMicError("No se detectó voz. Intenta de nuevo.");
          else setMicError(`Error: ${e.error}`);
        };
        recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
        recognitionRef.current = recognition; recognition.start();
      })
      .catch(() => setMicError("Permiso de micrófono denegado."));
  }, [isListening, handleSend]);

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false); };

  const handleGenerateReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch("/api/report", { credentials: "include" });
      if (!response.ok) throw new Error("Error generando informe");
      const html = await response.text();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `X3-Informe-${new Date().toISOString().slice(0,10)}.html`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error("Error generando informe:", err); }
    finally { setIsGeneratingReport(false); }
  }, []);

  const handleForensicAnalysis = useCallback(() => {
    setInput("Realiza un análisis forense completo de mi plan de salud actual. Detecta: 1) Coberturas reales vs prometidas, 2) Vacíos de cobertura, 3) Escenarios de quiebre (UCI, cáncer, cirugía), 4) Copagos reales en enfermedades de alto costo, 5) Recomendación de acción inmediata.");
    inputRef.current?.focus();
  }, []);

  const formatContent = (content: string) => {
    return content
      .replace(/```(html|css|javascript|js|tsx|ts)?\n?([\s\S]*?)```/g, (_match: string, lang: string | undefined, code: string) => {
        const isDownloadable = lang === "html" || lang === "css" || (!lang && (code.includes("<!DOCTYPE") || code.includes("<html")));
        const downloadBtn = isDownloadable
          ? `<button onclick="(function(){var b=new Blob([\`${code.replace(/`/g, "\\`")}\`],{type:'text/html'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='x3-generado.html';a.click();})()" style="display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:6px 14px;background:rgba(0,229,255,0.12);border:1px solid rgba(0,229,255,0.4);border-radius:8px;color:#00e5ff;font-size:0.75rem;cursor:pointer;font-family:monospace;">&#8659; Descargar ${lang?.toUpperCase() || "HTML"}</button>`
          : "";
        return `<pre class="x3-code">${code}</pre>${downloadBtn}`;
      })
      .replace(/`([^`]+)`/g, '<code class="x3-inline-code">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  const QUICK_ACTIONS = [
    { label: "🏥 Analizar Plan Isapre", cmd: "", tab: null as null, url: "/analisis-isapre" },
    { label: "⚖️ Comparar 2 Planes", cmd: "", tab: null as null, url: "/comparativo" },
    { label: "🚀 Crear Landing 3D", cmd: "", tab: null as null, url: "/landing-generator" },
    { label: "💰 APV Tax-Shield", cmd: "", tab: null as null, url: "/apv-shield" },
    { label: "🤖 Optimizador Blindaje", cmd: "", tab: null as null, url: "/optimizador" },
    { label: "🔍 Auditoría Forense", cmd: "Realiza una auditoría forense completa de mi plan de salud. Identifica brechas de cobertura, escenarios de quiebre y vulnerabilidades patrimoniales con cifras reales en pesos chilenos y UF.", tab: null as null, url: undefined },
    { label: "🛡️ Diseña mi Blindaje", cmd: "Diseña mi arquitectura de inmunidad patrimonial completa con 3 capas: Base (Isapre), Absorción (Catastrófico) y Exceso (APV). Incluye productos específicos del mercado chileno, costos en UF y eficiencia de cobertura.", tab: "blindaje" as const, url: undefined },
    { label: "⚡ Modo Presentación", cmd: "Activa el Modo Presentación de Alto Impacto. Genera un análisis ejecutivo de mi situación patrimonial en salud, con datos reales, comparativas y recomendaciones estratégicas. Formato: impactante, directo, sin tecnicismos.", tab: null as null, url: undefined },
    { label: "📊 Optimizar Primas", cmd: "Analiza mi situación actual y optimiza mis primas de salud usando teoría de Markowitz. Calcula el portafolio óptimo entre cobertura y costo. Muestra el punto de eficiencia máxima en pesos chilenos.", tab: null as null, url: undefined },
    { label: "⚖️ Veredicto Siniestro", cmd: "", tab: "veredicto" as const, url: undefined },
    { label: "🎯 Radar de Fugas", cmd: "", tab: "forense" as const, url: undefined },
  ];

  if (!isAuthenticated) {
    return (
      <div className="x3-login">
        <div className="x3-bg" style={{ position: "fixed", inset: 0, zIndex: 0 }}>
          <div className="x3-bg-grid" />
          <div className="x3-bg-glow x3-bg-glow-1" />
          <div className="x3-bg-glow x3-bg-glow-2" />
          <div className="x3-bg-glow x3-bg-glow-3" />
        </div>
        <div className="x3-scan-line" />
        <div className="x3-login-card">
          <div className="x3-login-orb-wrap">
            <div className="x3-login-ring x3-ring-1" />
            <div className="x3-login-ring x3-ring-2" />
            <div className="x3-login-ring x3-ring-3" />
            <div className="x3-login-core"><span className="x3-login-core-text">X3</span></div>
          </div>
          <div className="x3-login-status">
            <span className="x3-login-dot" />
            <span className="x3-login-status-text">SISTEMAS LISTOS</span>
          </div>
          <h1 className="x3-login-title">X3 ÉLITE</h1>
          <p className="x3-login-sub">SUPERINTELIGENCIA PERSONAL</p>
          <p className="x3-login-quote">&ldquo;Siempre miré atrás y nunca hubo nadie.<br />Ahora hay alguien a tu espalda.&rdquo;</p>
          <div className="x3-login-caps">
            {["CEREBRO", "VISIÓN", "DATOS", "VOZ"].map((c, i) => (
              <div key={c} className="x3-login-cap" style={{ animationDelay: `${i * 0.15}s` }}>
                <span className="x3-login-cap-dot" /><span>{c}</span>
              </div>
            ))}
          </div>
          <a href={getLoginUrl()} className="x3-btn-primary x3-btn-boot">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
            <span>ACTIVAR X3</span>
          </a>
          <p className="x3-login-footer">Acceso seguro · Datos cifrados · Solo tú</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`x3-root${darkMode ? "" : " x3-light-mode"}`}>
      <div className="x3-bg">
        <div className="x3-bg-grid" />
        <div className="x3-bg-glow x3-bg-glow-1" />
        <div className="x3-bg-glow x3-bg-glow-2" />
        <div className="x3-bg-glow x3-bg-glow-3" />
      </div>

      {/* ── HEADER MILITAR ── */}
      <header className="x3-mil-header">
        <div className="x3-mil-left">
          <div className="x3-pulse-dot" />
          <span className="x3-logo-text">X3</span>
          <span className="x3-mil-badge">ÉLITE</span>
        </div>
        <div className="x3-mil-stats">
          <div className="x3-stat-box"><span className="x3-stat-label">UF</span><span className="x3-stat-val">{ufValue}</span></div>
          <div className="x3-stat-sep">|</div>
          <div className="x3-stat-box"><span className="x3-stat-label">USD</span><span className="x3-stat-val">{usdValue}</span></div>
          <div className="x3-stat-sep">|</div>
          <div className="x3-stat-box"><span className="x3-stat-label">X3</span><span className="x3-stat-online">ONLINE</span></div>
        </div>
        <div className="x3-mil-right">
          <button className="x3-icon-btn" onClick={() => { setAudioEnabled(!audioEnabled); playAudio(playTabSound); }} title={audioEnabled ? "Sonido ON" : "Sonido OFF"} style={{ color: audioEnabled ? "#00d4ff" : "rgba(255,255,255,0.3)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </button>
          <button className={`x3-icon-btn ${dataSaveMode ? "x3-mode-active" : ""}`} onClick={() => setDataSaveMode(!dataSaveMode)} title={dataSaveMode ? "Modo Ahorro ACTIVO" : "Activar Modo Ahorro"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </button>
          <button className={`x3-icon-btn ${voiceEnabled ? "x3-voice-on" : ""}`} onClick={() => { if (isSpeaking) stopSpeaking(); setVoiceEnabled(!voiceEnabled); }} title={voiceEnabled ? "Voz ON" : "Voz OFF"}>
            {voiceEnabled ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            )}
          </button>
          <button className="x3-icon-btn" onClick={() => window.open("/simulador", "_blank")} title="Simulador de Quiebre">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          </button>
          <button className="x3-icon-btn" onClick={handleForensicAnalysis} title="Análisis Forense">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
          </button>
          <button className="x3-icon-btn" onClick={handleGenerateReport} disabled={isGeneratingReport} title="Generar Informe">
            {isGeneratingReport ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="x3-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
            )}
          </button>
          <button className="x3-icon-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Modo Claro" : "Modo Oscuro"}>
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            )}
          </button>
          <button className="x3-icon-btn" onClick={() => { setShowPanel(!showPanel); setActiveTab("hub"); playAudio(playPanelOpenSound); }} title="Panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          </button>
          <div className="x3-user-avatar">{user?.name?.[0]?.toUpperCase() || "A"}</div>
        </div>
      </header>

      {dataSaveMode && <div className="x3-save-banner">⚡ MODO AHORRO ACTIVO — Historial limitado a 6 mensajes</div>}

      {/* ── SIDE PANEL ── */}
      {showPanel && (
        <div className="x3-memory-panel">
          <div className="x3-memory-header">
            <div className="x3-memory-tabs" style={{ flexWrap: "wrap", gap: "4px" }}>
              {(["hub", "memoria", "proyectos", "isapres", "finanzas", "blindaje", "forense", "veredicto"] as const).map((tab) => (
                <button key={tab} className={`x3-tab ${activeTab === tab ? "x3-tab-active" : ""}`} onClick={() => { setActiveTab(tab); playAudio(playTabSound); }}>
                  {tab === "hub" ? "🔗 Hub" : tab === "blindaje" ? "🛡️ Blindaje" : tab === "forense" ? "🎯 Forense" : tab === "veredicto" ? "⚖️ Veredicto" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <button className="x3-panel-close" onClick={() => setShowPanel(false)}>✕</button>
          </div>

          <div className="x3-panel-content">
            {/* HUB */}
            {activeTab === "hub" && (
              <div>
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ fontSize: "0.6rem", color: "#00d4ff", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>⚡ ACCIONES RÁPIDAS HYPER-REALITY</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {QUICK_ACTIONS.map((qa) => (
                      <button key={qa.label} className="x3-quick-btn" style={{ textAlign: "left", justifyContent: "flex-start" }} onClick={() => {
                        if (qa.tab === "blindaje") playAudio(playShieldSound);
                        else if (qa.tab === "forense") playAudio(playRadarSound);
                        else if (qa.tab === "veredicto") playAudio(playVeredictSound);
                        else playAudio(playTabSound);
                        if (qa.url) { window.open(qa.url, "_blank"); setShowPanel(false); return; }
                        if (qa.tab) setActiveTab(qa.tab);
                        if (qa.cmd) { setInput(qa.cmd); setShowPanel(false); inputRef.current?.focus(); }
                      }}>{qa.label}</button>
                    ))}
                  </div>
                </div>
                {Object.entries(PLATFORMS).map(([category, items]) => (
                  <div key={category} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "0.65rem", color: "#00d4ff", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>{category}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                      {items.map((item) => (
                        <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,212,255,0.12)", textDecoration: "none", transition: "all 0.2s" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = item.color; (e.currentTarget as HTMLElement).style.background = `${item.color}18`; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,212,255,0.12)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                        >
                          <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                          <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.2 }}>{item.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MEMORIA */}
            {activeTab === "memoria" && (
              memories.length === 0 ? <p className="x3-empty">Bóveda vacía. Di &quot;Recuerda que...&quot; para guardar datos.</p> :
                memories.map((m, i) => (
                  <div key={i} className="x3-memory-item">
                    <span className="x3-memory-key">{m.key}</span>
                    <span className="x3-memory-value">{m.value}</span>
                  </div>
                ))
            )}

            {/* PROYECTOS */}
            {activeTab === "proyectos" && (
              projects.length === 0 ? <p className="x3-empty">Sin proyectos. Di &quot;Crea el proyecto...&quot;</p> :
                projects.map((p, i) => (
                  <div key={i} className="x3-project-item">
                    <span className="x3-project-name">{p.name}</span>
                    <span className="x3-project-status">{p.status}</span>
                    <p className="x3-project-desc">{p.description}</p>
                  </div>
                ))
            )}

            {/* ISAPRES */}
            {activeTab === "isapres" && (
              <div className="x3-info-panel">
                <p className="x3-info-text">Análisis forense de Isapres chilenas:</p>
                <div className="x3-quick-btns">
                  {["Compara coberturas reales de Isapres", "¿Cuál Isapre me conviene con 2 hijos?", "Analiza plan Banmédica con Ley 21.350", "Brechas de cobertura en Colmena", "Copagos reales en Cruz Blanca", "Circular 356 Superintendencia Salud"].map((q) => (
                    <button key={q} className="x3-quick-btn" onClick={() => { setInput(q); setShowPanel(false); inputRef.current?.focus(); }}>{q}</button>
                  ))}
                </div>
              </div>
            )}

            {/* FINANZAS */}
            {activeTab === "finanzas" && (
              <div className="x3-info-panel">
                <p className="x3-info-text">Datos financieros en tiempo real:</p>
                <div className="x3-quick-btns">
                  {["¿Cuánto vale la UF hoy?", "Valor del dólar", "Mejores APV Régimen A Chile", "Fondos de pensiones más rentables", "Tasas hipotecarias actuales", "Optimizar mi APV con X3"].map((q) => (
                    <button key={q} className="x3-quick-btn" onClick={() => { setInput(q); setShowPanel(false); inputRef.current?.focus(); }}>{q}</button>
                  ))}
                </div>
              </div>
            )}

            {/* MÓDULO 8: BLINDAJE PATRIMONIAL */}
            {activeTab === "blindaje" && (
              <div className="x3-blindaje-panel">
                <p style={{ fontSize: "0.6rem", color: "#00d4ff", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>ARQUITECTURA DE INMUNIDAD PATRIMONIAL</p>
                <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>Sistema de 3 capas — Toca cada capa para ver detalles</p>
                <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "10px", padding: "10px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" }}>Eficiencia Global del Blindaje</span>
                    <span style={{ fontSize: "0.9rem", color: "#00d4ff", fontFamily: "'Orbitron',sans-serif", fontWeight: "700" }}>83%</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "83%", background: "linear-gradient(90deg,#00d4ff,#7b2fff)", borderRadius: "3px" }} />
                  </div>
                  <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginTop: "4px", fontFamily: "'Share Tech Mono',monospace" }}>Sin blindaje: 38% · Con X3: 83% → +45% de protección</p>
                </div>
                {CAPAS_BLINDAJE.map((capa) => {
                  const bgAlpha = capa.color === "#00d4ff" ? "0,212,255" : capa.color === "#7b2fff" ? "123,47,255" : "255,0,85";
                  return (
                    <div key={capa.id} onClick={() => setSelectedCapa(selectedCapa === capa.id ? null : capa.id)}
                      style={{ background: selectedCapa === capa.id ? `rgba(${bgAlpha},0.1)` : "rgba(255,255,255,0.03)", border: `1px solid ${selectedCapa === capa.id ? capa.color : "rgba(255,255,255,0.08)"}`, borderRadius: "10px", padding: "10px", marginBottom: "8px", cursor: "pointer", transition: "all 0.3s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "1.2rem" }}>{capa.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.65rem", color: capa.color, fontFamily: "'Orbitron',sans-serif", fontWeight: "700", letterSpacing: "0.05em" }}>{capa.nombre}</span>
                            <span style={{ fontSize: "0.7rem", color: capa.color, fontFamily: "'Share Tech Mono',monospace", fontWeight: "700" }}>{capa.eficiencia}%</span>
                          </div>
                          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)" }}>{capa.subtitulo}</span>
                        </div>
                      </div>
                      <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", marginBottom: "6px" }}>
                        <div style={{ height: "100%", width: `${capa.eficiencia}%`, background: capa.color, borderRadius: "2px" }} />
                      </div>
                      {selectedCapa === capa.id && (
                        <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${capa.color}30` }}>
                          <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)", marginBottom: "8px", lineHeight: 1.5 }}>{capa.descripcion}</p>
                          <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", marginBottom: "4px" }}>Productos recomendados:</p>
                          {capa.productos.map((p) => (
                            <div key={p} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: capa.color, flexShrink: 0 }} />
                              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)" }}>{p}</span>
                            </div>
                          ))}
                          <button className="x3-quick-btn" style={{ marginTop: "8px", width: "100%", justifyContent: "center" }} onClick={(e) => {
                            e.stopPropagation();
                            setInput(`Analiza en detalle la ${capa.nombre} de mi blindaje patrimonial. Incluye productos específicos del mercado chileno, costos en UF y cómo implementarla.`);
                            setShowPanel(false); inputRef.current?.focus();
                          }}>Analizar con X3 →</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="x3-quick-btn" style={{ width: "100%", justifyContent: "center", marginTop: "4px", background: "rgba(0,212,255,0.1)", borderColor: "rgba(0,212,255,0.4)", color: "#00d4ff" }} onClick={() => {
                  setInput("Diseña mi arquitectura de inmunidad patrimonial completa. Analiza las 3 capas (Base, Absorción, Exceso) con productos reales del mercado chileno, costos actuales en UF y eficiencia de cobertura para cada capa. Incluye cálculo del ahorro total vs situación sin blindaje.");
                  setShowPanel(false); inputRef.current?.focus();
                }}>🛡️ Diseñar Blindaje Completo</button>
              </div>
            )}

            {/* MÓDULO 12+13: RADAR + LIVE REALITY CORE */}
            {activeTab === "forense" && (
              <div className="x3-forense-panel">
                <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "10px", padding: "10px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.6rem", color: "#00d4ff", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>🔴 LIVE REALITY CORE</span>
                    <span style={{ fontSize: "0.55rem", color: lrcStatus === "ok" ? "#00ff88" : "#ffaa00", fontFamily: "'Share Tech Mono',monospace" }}>{lrcStatus === "ok" ? "● SYNC" : "● ACTUALIZANDO"}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "8px" }}>
                      <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", marginBottom: "2px" }}>UF HOY</p>
                      <p style={{ fontSize: "0.85rem", color: "#00d4ff", fontFamily: "'Orbitron',sans-serif", fontWeight: "700" }}>{ufValue}</p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "8px" }}>
                      <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", marginBottom: "2px" }}>ÍNDICE RIESGO</p>
                      <p style={{ fontSize: "0.85rem", color: riskIndex > 70 ? "#ff6600" : "#00ff88", fontFamily: "'Orbitron',sans-serif", fontWeight: "700" }}>{riskIndex}/100</p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "8px", gridColumn: "1/-1" }}>
                      <p style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", marginBottom: "2px" }}>ARANCEL VIGENTE</p>
                      <p style={{ fontSize: "0.75rem", color: "#7b2fff", fontFamily: "'Share Tech Mono',monospace" }}>{arancelVersion}</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.6rem", color: "#ff0055", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>🎯 RADAR DE FUGAS PATRIMONIALES</span>
                    <button onClick={() => { setRadarActive(!radarActive); playAudio(playRadarSound); }} style={{ fontSize: "0.55rem", color: radarActive ? "#ff0055" : "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", background: "none", border: `1px solid ${radarActive ? "#ff0055" : "rgba(255,255,255,0.2)"}`, borderRadius: "4px", padding: "2px 6px", cursor: "pointer" }}>
                      {radarActive ? "⏹ DETENER" : "▶ ESCANEAR"}
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                    <div style={{ position: "relative", width: "120px", height: "120px" }}>
                      {[1, 2, 3].map((r) => (
                        <div key={r} style={{ position: "absolute", inset: `${(r - 1) * 20}px`, borderRadius: "50%", border: "1px solid rgba(255,0,85,0.2)" }} />
                      ))}
                      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "rgba(255,0,85,0.15)", transform: "translateY(-50%)" }} />
                      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(255,0,85,0.15)", transform: "translateX(-50%)" }} />
                      {radarActive && (
                        <div style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: "2px", background: "linear-gradient(90deg,rgba(255,0,85,0.8),transparent)", transformOrigin: "left center", transform: `rotate(${radarAngle}deg)`, transition: "transform 0.05s linear" }} />
                      )}
                      {VULNERABILIDADES.map((v, i) => {
                        const angle = (i / VULNERABILIDADES.length) * 360;
                        const dist = 30 + (v.riesgo / 100) * 20;
                        const x = 50 + dist * Math.cos((angle * Math.PI) / 180);
                        const y = 50 + dist * Math.sin((angle * Math.PI) / 180);
                        return (
                          <div key={v.id} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: "8px", height: "8px", borderRadius: "50%", background: v.color, transform: "translate(-50%,-50%)", animation: radarActive ? "x3-radar-pulse 1.5s infinite" : "none", boxShadow: `0 0 6px ${v.color}` }} />
                        );
                      })}
                      <div style={{ position: "absolute", top: "50%", left: "50%", width: "8px", height: "8px", borderRadius: "50%", background: "#00d4ff", transform: "translate(-50%,-50%)", boxShadow: "0 0 10px #00d4ff" }} />
                    </div>
                  </div>
                  {VULNERABILIDADES.map((v) => (
                    <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", marginBottom: "5px", background: "rgba(255,255,255,0.03)", border: `1px solid ${v.color}30`, borderRadius: "8px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: v.color, flexShrink: 0, boxShadow: `0 0 6px ${v.color}`, animation: "x3-radar-pulse 2s infinite" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.6rem", color: v.color, fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{v.zona}</span>
                          <span style={{ fontSize: "0.65rem", color: v.color, fontFamily: "'Orbitron',sans-serif", fontWeight: "700" }}>{v.riesgo}%</span>
                        </div>
                        <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginTop: "1px" }}>{v.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="x3-quick-btn" style={{ width: "100%", justifyContent: "center", background: "rgba(255,0,85,0.08)", borderColor: "rgba(255,0,85,0.3)", color: "#ff0055" }} onClick={() => {
                  setInput("Analiza todas mis vulnerabilidades patrimoniales en salud. Identifica las fugas de cobertura más críticas, cuantifica el riesgo financiero en pesos chilenos para cada escenario y proporciona el plan de acción inmediato para cerrar cada brecha.");
                  setShowPanel(false); inputRef.current?.focus();
                }}>🎯 Análisis Completo de Fugas</button>
              </div>
            )}

            {/* MÓDULO 14: VEREDICTO FINAL */}
            {activeTab === "veredicto" && (
              <div className="x3-veredicto-panel">
                <p style={{ fontSize: "0.6rem", color: "#7b2fff", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>⚖️ LIQUIDADOR DE SINIESTROS X3</p>
                <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>Ingresa el monto del siniestro para ver las 3 realidades</p>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Monto del Siniestro (CLP)</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input type="text" value={montoSiniestro} onChange={(e) => setMontoSiniestro(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Ej: 5000000"
                      style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(123,47,255,0.4)", borderRadius: "8px", padding: "8px 10px", color: "#fff", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.8rem", outline: "none" }} />
                    <button onClick={() => { calcularVeredicto(); playAudio(playVeredictSound); }} style={{ background: "rgba(123,47,255,0.2)", border: "1px solid rgba(123,47,255,0.5)", borderRadius: "8px", padding: "8px 12px", color: "#7b2fff", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.7rem", cursor: "pointer", fontWeight: "700" }}>CALCULAR</button>
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                    {["1000000", "5000000", "10000000", "30000000"].map((m) => (
                      <button key={m} onClick={() => setMontoSiniestro(m)} style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "2px 6px", cursor: "pointer", fontFamily: "'Share Tech Mono',monospace" }}>
                        ${parseInt(m).toLocaleString("es-CL")}
                      </button>
                    ))}
                  </div>
                </div>
                {veredictoResult ? (
                  <div>
                    <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", marginBottom: "8px" }}>VEREDICTO — 3 REALIDADES</p>
                    {[
                      { label: "🌫️ ILUSIÓN", sub: "Lo que crees", val: veredictoResult.ilusion, color: "#ffaa00", desc: "70% cubierto — Lo que promete el folleto", bg: "255,170,0" },
                      { label: "💀 REALIDAD", sub: "Lo que paga", val: veredictoResult.realidad, color: "#ff0055", desc: "38% real — Promedio histórico Isapres Chile", bg: "255,0,85" },
                      { label: "🛡️ INMUNIDAD X3", sub: "Con blindaje", val: veredictoResult.inmunidad, color: "#00d4ff", desc: "92% con arquitectura de 3 capas activa", bg: "0,212,255" },
                    ].map((r) => (
                      <div key={r.label} style={{ background: `rgba(${r.bg},0.06)`, border: `1px solid ${r.color}30`, borderRadius: "8px", padding: "10px", marginBottom: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.6rem", color: r.color, fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase" }}>{r.label}</span>
                          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontFamily: "'Share Tech Mono',monospace" }}>{r.sub}</span>
                        </div>
                        <p style={{ fontSize: "1rem", color: r.color, fontFamily: "'Orbitron',sans-serif", fontWeight: "700" }}>${r.val.toLocaleString("es-CL", { maximumFractionDigits: 0 })}</p>
                        <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{r.desc}</p>
                      </div>
                    ))}
                    <div style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: "8px", padding: "10px", marginBottom: "10px" }}>
                      <p style={{ fontSize: "0.6rem", color: "#00ff88", fontFamily: "'Share Tech Mono',monospace", textTransform: "uppercase", marginBottom: "4px" }}>💰 AHORRO CON BLINDAJE X3</p>
                      <p style={{ fontSize: "1.1rem", color: "#00ff88", fontFamily: "'Orbitron',sans-serif", fontWeight: "700" }}>+${veredictoResult.ahorro.toLocaleString("es-CL", { maximumFractionDigits: 0 })}</p>
                      {ufRaw > 0 && <p style={{ fontSize: "0.6rem", color: "rgba(0,255,136,0.6)", marginTop: "2px", fontFamily: "'Share Tech Mono',monospace" }}>= {(veredictoResult.ahorro / ufRaw).toFixed(1)} UF</p>}
                    </div>
                    <button className="x3-quick-btn" style={{ width: "100%", justifyContent: "center", background: "rgba(123,47,255,0.1)", borderColor: "rgba(123,47,255,0.4)", color: "#7b2fff" }} onClick={() => {
                      setInput(`Analiza en detalle el siniestro de $${parseInt(montoSiniestro).toLocaleString("es-CL")} pesos chilenos. Muestra: 1) Lo que pagaría mi Isapre actual, 2) Lo que quedaría a mi cargo, 3) Cómo el blindaje X3 de 3 capas cambiaría el resultado, 4) Plan de acción específico.`);
                      setShowPanel(false); inputRef.current?.focus();
                    }}>⚖️ Análisis Completo con X3</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.3)" }}>
                    <p style={{ fontSize: "2rem", marginBottom: "8px" }}>⚖️</p>
                    <p style={{ fontSize: "0.68rem", fontFamily: "'Share Tech Mono',monospace" }}>Ingresa un monto para ver el veredicto</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MESSAGES ── */}
      <main className="x3-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`x3-msg x3-msg-${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="x3-msg-avatar">
                <div className="x3-avatar-ring"><span>X3</span></div>
              </div>
            )}
            <div className={`x3-msg-bubble x3-bubble-${msg.role}`}>
              {msg.imagePreview && <img src={msg.imagePreview} alt="Imagen enviada" className="x3-msg-image" />}
              <div className="x3-msg-content" dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
              <span className="x3-msg-time">{msg.timestamp.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="x3-msg x3-msg-assistant">
            <div className="x3-msg-avatar"><div className="x3-avatar-ring x3-avatar-thinking"><span>X3</span></div></div>
            <div className="x3-msg-bubble x3-bubble-assistant"><div className="x3-thinking"><span /><span /><span /></div></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* ── FOOTER / INPUT ── */}
      <footer className="x3-footer">
        {micError && (
          <div className="x3-mic-error">⚠️ {micError}<button onClick={() => setMicError(null)}>✕</button></div>
        )}
        {pendingImage && (
          <div className="x3-img-preview">
            <img src={pendingImage.preview} alt="Imagen lista" />
            <span className="x3-img-label">📷 Imagen lista para análisis</span>
            <button className="x3-img-remove" onClick={() => setPendingImage(null)}>✕</button>
          </div>
        )}
        <div className="x3-input-container">
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          <button className="x3-cam-btn" onClick={() => fileInputRef.current?.click()} title="Enviar imagen" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
          </button>
          <button className={`x3-mic-btn ${isListening ? "x3-mic-active" : ""}`} onClick={toggleMic} title={isListening ? "Detener" : "Hablar"} type="button">
            {isListening ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            )}
          </button>
          <textarea ref={inputRef} className="x3-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={isListening ? "🎙 Escuchando... habla ahora" : pendingImage ? "Escribe un comando para la imagen..." : "Comando a X3..."} rows={1} />
          <button className={`x3-send-btn ${isLoading ? "x3-send-loading" : ""}`} onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !pendingImage)} type="button">
            {isLoading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="x3-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            )}
          </button>
        </div>
        <p className="x3-footer-hint">X3 ÉLITE · {isListening ? "🔴 ESCUCHANDO" : isSpeaking ? "🔊 HABLANDO" : "LISTO"} · {dataSaveMode ? "⚡ AHORRO" : "FULL"} · {darkMode ? "🌙" : "☀️"} · {user?.name || "Alexander"}</p>
      </footer>
    </div>
  );
}
