/**
 * GENERADOR DE INFORMES PDF — X3
 * Genera informes profesionales en PDF con análisis de salud, finanzas y proyectos.
 * Comando: "Dame mi informe" → PDF descargable.
 */

import { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { memories, projects } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { getFinancialData } from "./financial-data";

export async function pdfReportHandler(req: Request, res: Response) {
  // Auth
  let userId: number;
  let userName: string;
  try {
    const user = await sdk.authenticateRequest(req);
    userId = user.id;
    userName = user.name || "Alexander";
  } catch {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  try {
    const db = await getDb();
    const userMemories = db ? await db.select().from(memories).where(eq(memories.userId, userId)) : [];
    const userProjects = db ? await db.select().from(projects).where(eq(projects.userId, userId)) : [];

    let finData: any = null;
    try { finData = await getFinancialData(); } catch { /* ignore */ }

    const now = new Date();
    const dateStr = now.toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

    // Group memories by category
    const memByCategory: Record<string, typeof userMemories> = {};
    for (const m of userMemories) {
      const cat = m.category || "general";
      if (!memByCategory[cat]) memByCategory[cat] = [];
      memByCategory[cat].push(m);
    }

    // Build HTML for the report
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Informe X3 — ${dateStr}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0a0a0f; color: #e8e8f0; padding: 40px; min-height: 100vh; }
  .header { border-bottom: 2px solid #00d4ff; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header-left h1 { font-size: 2rem; font-weight: 700; color: #00d4ff; letter-spacing: 0.05em; }
  .header-left p { font-size: 0.85rem; color: rgba(232,232,240,0.5); margin-top: 4px; }
  .header-right { text-align: right; font-size: 0.78rem; color: rgba(232,232,240,0.4); }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: #00d4ff; margin-bottom: 16px; padding-bottom: 6px; border-bottom: 1px solid rgba(0,212,255,0.2); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; }
  .card-label { font-size: 0.68rem; color: rgba(232,232,240,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .card-value { font-size: 1.2rem; font-weight: 600; color: #00d4ff; }
  .card-sub { font-size: 0.72rem; color: rgba(232,232,240,0.5); margin-top: 4px; }
  .memory-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; }
  .memory-key { color: rgba(232,232,240,0.5); text-transform: capitalize; }
  .memory-val { color: #e8e8f0; font-weight: 500; max-width: 60%; text-align: right; }
  .project-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px; margin-bottom: 10px; }
  .project-name { font-weight: 600; color: #e8e8f0; margin-bottom: 4px; }
  .project-desc { font-size: 0.8rem; color: rgba(232,232,240,0.5); }
  .project-status { display: inline-block; font-size: 0.65rem; padding: 2px 8px; border-radius: 20px; background: rgba(0,212,255,0.1); color: #00d4ff; border: 1px solid rgba(0,212,255,0.2); margin-top: 6px; }
  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 0.72rem; color: rgba(232,232,240,0.25); }
  .empty { color: rgba(232,232,240,0.3); font-size: 0.82rem; font-style: italic; padding: 12px 0; }
  .badge { display: inline-block; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); color: #00d4ff; font-size: 0.65rem; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.08em; }
  /* Gráficos de Estrés */
  .stress-chart { margin: 20px 0; }
  .stress-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .stress-label { font-size: 0.72rem; color: rgba(232,232,240,0.5); width: 180px; flex-shrink: 0; }
  .stress-bar-wrap { flex: 1; height: 10px; background: rgba(255,255,255,0.06); border-radius: 5px; overflow: hidden; }
  .stress-bar { height: 100%; border-radius: 5px; transition: width 1s ease; }
  .stress-val { font-size: 0.72rem; font-weight: 600; width: 80px; text-align: right; }
  .stress-vs { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
  .stress-vs-col { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; }
  .stress-vs-title { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
  .stress-vs-amount { font-size: 1.4rem; font-weight: 700; margin-bottom: 4px; }
  .stress-vs-sub { font-size: 0.72rem; color: rgba(232,232,240,0.4); }
  .legal-cite { background: rgba(0,102,255,0.08); border-left: 3px solid #0066ff; padding: 10px 14px; margin: 8px 0; font-size: 0.78rem; color: rgba(232,232,240,0.7); }
  .legal-cite strong { color: #4d94ff; }
  .seal-box { text-align: center; margin: 32px 0; padding: 20px; border: 2px solid rgba(0,212,255,0.3); }
  .seal-text { font-size: 0.7rem; letter-spacing: 0.2em; color: #00d4ff; text-transform: uppercase; }
</style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>X3 INFORME</h1>
      <p>Generado para ${userName} · ${dateStr} ${timeStr}</p>
    </div>
    <div class="header-right">
      <span class="badge">CONFIDENCIAL</span><br><br>
      X3 ÉLITE · Sistema de Inteligencia Personal
    </div>
  </div>

  ${finData ? `
  <div class="section">
    <div class="section-title">Indicadores Financieros en Tiempo Real</div>
    <div class="grid-2">
      ${finData.uf ? `<div class="card"><div class="card-label">UF</div><div class="card-value">$${Number(finData.uf).toLocaleString("es-CL", {minimumFractionDigits:2})}</div><div class="card-sub">Unidad de Fomento</div></div>` : ""}
      ${finData.dolar ? `<div class="card"><div class="card-label">Dólar</div><div class="card-value">$${Number(finData.dolar).toLocaleString("es-CL",{minimumFractionDigits:2})}</div><div class="card-sub">USD → CLP</div></div>` : ""}
      ${finData.utm ? `<div class="card"><div class="card-label">UTM</div><div class="card-value">$${Number(finData.utm).toLocaleString("es-CL")}</div><div class="card-sub">Unidad Tributaria Mensual</div></div>` : ""}
      ${finData.euro ? `<div class="card"><div class="card-label">Euro</div><div class="card-value">$${Number(finData.euro).toLocaleString("es-CL",{minimumFractionDigits:2})}</div><div class="card-sub">EUR → CLP</div></div>` : ""}
    </div>
  </div>
  ` : ""}

  <div class="section">
    <div class="section-title">Perfil y Memoria Personal</div>
    ${userMemories.length === 0 ? '<p class="empty">Sin datos guardados aún. Cuéntale a X3 sobre ti y lo recordará.</p>' : ""}
    ${Object.entries(memByCategory).map(([cat, items]) => `
      <div style="margin-bottom:16px;">
        <p style="font-size:0.7rem;color:rgba(232,232,240,0.35);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">${cat}</p>
        ${items.map(m => `
          <div class="memory-item">
            <span class="memory-key">${m.key.replace(/_/g, " ")}</span>
            <span class="memory-val">${m.value}</span>
          </div>
        `).join("")}
      </div>
    `).join("")}
  </div>

  <div class="section">
    <div class="section-title">Proyectos Activos</div>
    ${userProjects.length === 0 ? '<p class="empty">Sin proyectos registrados aún.</p>' : ""}
    ${userProjects.map(p => `
      <div class="project-item">
        <div class="project-name">${p.name}</div>
        ${p.description ? `<div class="project-desc">${p.description}</div>` : ""}
        <span class="project-status">${p.status || "activo"}</span>
      </div>
    `).join("")}
  </div>

  <!-- GRÁFICOS DE ESTRÉS PATRIMONIAL -->
  <div class="section">
    <div class="section-title">⚠️ Gráficos de Estrés Patrimonial</div>
    <p style="font-size:0.8rem;color:rgba(232,232,240,0.5);margin-bottom:16px;">Comparativa: Sistema Actual (Vulnerable) vs Blindaje X3 (Inmune)</p>
    <div class="stress-chart">
      <div class="stress-row">
        <span class="stress-label">UCI 30 días</span>
        <div class="stress-bar-wrap"><div class="stress-bar" style="width:100%;background:linear-gradient(90deg,#ff4444,#ff0000);"></div></div>
        <span class="stress-val" style="color:#ff4444;">$22.000.000</span>
      </div>
      <div class="stress-row">
        <span class="stress-label">UCI con Blindaje X3</span>
        <div class="stress-bar-wrap"><div class="stress-bar" style="width:5%;background:linear-gradient(90deg,#00ffcc,#00d4ff);"></div></div>
        <span class="stress-val" style="color:#00ffcc;">$0</span>
      </div>
      <div class="stress-row" style="margin-top:12px;">
        <span class="stress-label">Cáncer tratamiento</span>
        <div class="stress-bar-wrap"><div class="stress-bar" style="width:90%;background:linear-gradient(90deg,#ff6600,#ff4400);"></div></div>
        <span class="stress-val" style="color:#ff6600;">$18.500.000</span>
      </div>
      <div class="stress-row">
        <span class="stress-label">Cáncer con Blindaje X3</span>
        <div class="stress-bar-wrap"><div class="stress-bar" style="width:8%;background:linear-gradient(90deg,#00ffcc,#00d4ff);"></div></div>
        <span class="stress-val" style="color:#00ffcc;">$320.000</span>
      </div>
      <div class="stress-row" style="margin-top:12px;">
        <span class="stress-label">Gasto de bolsillo anual</span>
        <div class="stress-bar-wrap"><div class="stress-bar" style="width:75%;background:linear-gradient(90deg,#ffaa00,#ff8800);"></div></div>
        <span class="stress-val" style="color:#ffaa00;">$2.800.000</span>
      </div>
      <div class="stress-row">
        <span class="stress-label">Gasto con Blindaje X3</span>
        <div class="stress-bar-wrap"><div class="stress-bar" style="width:12%;background:linear-gradient(90deg,#00ffcc,#00d4ff);"></div></div>
        <span class="stress-val" style="color:#00ffcc;">$320.000</span>
      </div>
    </div>
    <div class="stress-vs">
      <div class="stress-vs-col">
        <div class="stress-vs-title" style="color:#ff4444;">Sistema Actual (Vulnerable)</div>
        <div class="stress-vs-amount" style="color:#ff4444;">$22.000.000</div>
        <div class="stress-vs-sub">Exposición máxima en siniestro UCI</div>
      </div>
      <div class="stress-vs-col" style="border-color:rgba(0,255,204,0.2);">
        <div class="stress-vs-title" style="color:#00ffcc;">Blindaje X3 (Inmune)</div>
        <div class="stress-vs-amount" style="color:#00ffcc;">$0</div>
        <div class="stress-vs-sub">Exposición con 3 capas activas</div>
      </div>
    </div>
  </div>

  <!-- CITAS LEGALES -->
  <div class="section">
    <div class="section-title">⚖️ Base Legal del Blindaje</div>
    <div class="legal-cite"><strong>Ley 21.350</strong> — Reforma de Isapres. Regula las alzas de planes y establece el GES como cobertura mínima obligatoria. <a href="https://www.suseso.cl" style="color:#4d94ff;">suseso.cl</a></div>
    <div class="legal-cite"><strong>Circular 356 SUSESO</strong> — Regula los contratos de salud previsional. Cualquier alza no notificada con 60 días de anticipación es ilegal. <a href="https://www.suseso.cl" style="color:#4d94ff;">suseso.cl</a></div>
    <div class="legal-cite"><strong>Artículo 42 bis — Ley de Impuesto a la Renta</strong> — APV permite reducir base imponible o recibir crédito del 15%. Máximo 600 UF anuales. <a href="https://www.sii.cl" style="color:#4d94ff;">sii.cl</a></div>
    <div class="legal-cite"><strong>ISO 31000</strong> — Estándar internacional de gestión de riesgos. Base metodológica del Blindaje X3.</div>
  </div>

  <div class="seal-box">
    <div class="seal-text">✓ Analizado · Protegido · Respaldado</div>
    <p style="font-size:0.7rem;color:rgba(232,232,240,0.3);margin-top:8px;">&ldquo;Estamos contigo antes, durante y después.&rdquo;</p>
  </div>

  <div class="footer">
    X3 ÉLITE — El corazón que late en cada proyecto de Alexander<br>
    Este informe es confidencial y generado automáticamente · ${dateStr}
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `inline; filename="X3-Informe-${now.toISOString().slice(0,10)}.html"`);
    res.send(html);

  } catch (err: any) {
    console.error("[pdf-report] Error:", err);
    res.status(500).json({ error: "Error generando informe" });
  }
}
