import { useState } from "react";
import { useLocation } from "wouter";

// Tabla de impuesto global complementario Chile 2024
function calcularImpuesto(rentaAnual: number): number {
  const tramos = [
    { limite: 13.5 * 12 * 38500, tasa: 0, rebaja: 0 },
    { limite: 30 * 12 * 38500, tasa: 0.04, rebaja: 13.5 * 12 * 38500 * 0.04 },
    { limite: 50 * 12 * 38500, tasa: 0.08, rebaja: 30 * 12 * 38500 * 0.04 + (50 - 30) * 12 * 38500 * 0.04 },
    { limite: 70 * 12 * 38500, tasa: 0.135, rebaja: 0 },
    { limite: 90 * 12 * 38500, tasa: 0.23, rebaja: 0 },
    { limite: 120 * 12 * 38500, tasa: 0.304, rebaja: 0 },
    { limite: 150 * 12 * 38500, tasa: 0.35, rebaja: 0 },
    { limite: Infinity, tasa: 0.40, rebaja: 0 },
  ];

  // Simplificado: tramos reales de retención mensual
  const mensual = rentaAnual / 12;
  if (mensual <= 652638) return 0;
  if (mensual <= 1449196) return (mensual - 652638) * 0.04;
  if (mensual <= 2415327) return (mensual - 1449196) * 0.08 + (1449196 - 652638) * 0.04;
  if (mensual <= 3381458) return (mensual - 2415327) * 0.135 + (2415327 - 1449196) * 0.08 + (1449196 - 652638) * 0.04;
  if (mensual <= 4347589) return (mensual - 3381458) * 0.23 + (3381458 - 2415327) * 0.135 + (2415327 - 1449196) * 0.08 + (1449196 - 652638) * 0.04;
  return mensual * 0.304;
}

export default function APVShield() {
  const [, setLocation] = useLocation();
  const [ingreso, setIngreso] = useState(2500000);
  const [aporte, setAporte] = useState(200000);
  const [regimen, setRegimen] = useState<"A" | "B">("A");
  const [resultado, setResultado] = useState<null | {
    impSinAPV: number;
    impConAPV: number;
    ahorro: number;
    ahorroAnual: number;
    retornoAPV: number;
    acumulado10: number;
  }>(null);

  function calcular() {
    const rentaAnual = ingreso * 12;
    const apvAnual = aporte * 12;

    const impSinAPV = calcularImpuesto(rentaAnual) * 12;
    let impConAPV = 0;
    let ahorro = 0;

    if (regimen === "A") {
      // Régimen A: crédito del 15% del APV contra impuesto
      const credito = Math.min(apvAnual * 0.15, impSinAPV);
      impConAPV = Math.max(0, impSinAPV - credito);
      ahorro = credito;
    } else {
      // Régimen B: APV se descuenta de la base imponible
      const rentaConAPV = Math.max(0, rentaAnual - apvAnual);
      impConAPV = calcularImpuesto(rentaConAPV) * 12;
      ahorro = impSinAPV - impConAPV;
    }

    const ahorroAnual = ahorro;
    // Retorno real: ahorro + aporte invertido con rentabilidad 5% anual
    const retornoAPV = apvAnual + ahorroAnual;
    // Proyección 10 años con 5% anual
    let acumulado = 0;
    for (let i = 0; i < 10; i++) {
      acumulado = (acumulado + retornoAPV) * 1.05;
    }

    setResultado({ impSinAPV, impConAPV, ahorro, ahorroAnual, retornoAPV, acumulado10: acumulado });
  }

  function generarCertificado() {
    if (!resultado) return;
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Certificado APV Tax-Shield X3</title>
<style>
  body{margin:0;background:#0a0a0f;color:#00ffcc;font-family:'Courier New',monospace;padding:40px;}
  .cert{max-width:800px;margin:0 auto;border:2px solid #00ffcc;padding:40px;position:relative;}
  .cert::before{content:'';position:absolute;inset:8px;border:1px solid rgba(0,255,204,0.3);}
  h1{text-align:center;font-size:28px;letter-spacing:4px;margin-bottom:4px;}
  .sub{text-align:center;color:#888;font-size:12px;letter-spacing:2px;margin-bottom:40px;}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:30px 0;}
  .box{background:rgba(0,255,204,0.05);border:1px solid rgba(0,255,204,0.3);padding:20px;text-align:center;}
  .box .val{font-size:28px;font-weight:bold;color:#00ffcc;}
  .box .lbl{font-size:11px;color:#888;margin-top:4px;}
  .highlight{background:rgba(0,255,204,0.1);border:2px solid #00ffcc;padding:20px;text-align:center;margin:20px 0;}
  .highlight .val{font-size:36px;font-weight:bold;color:#00ffcc;}
  .footer{text-align:center;margin-top:40px;font-size:11px;color:#555;border-top:1px solid rgba(0,255,204,0.2);padding-top:20px;}
  .seal{display:inline-block;border:2px solid #00ffcc;padding:8px 20px;font-size:11px;letter-spacing:3px;margin-top:10px;}
</style></head><body>
<div class="cert">
  <h1>⚡ CERTIFICADO APV TAX-SHIELD</h1>
  <div class="sub">ARTÍCULO 42 BIS · LEY DE IMPUESTO A LA RENTA · X3 SUPERINTELIGENCIA PATRIMONIAL</div>
  <div class="grid">
    <div class="box"><div class="val">$${ingreso.toLocaleString('es-CL')}</div><div class="lbl">INGRESO MENSUAL</div></div>
    <div class="box"><div class="val">$${aporte.toLocaleString('es-CL')}</div><div class="lbl">APORTE APV MENSUAL</div></div>
    <div class="box"><div class="val">$${resultado.impSinAPV.toLocaleString('es-CL')}</div><div class="lbl">IMPUESTO SIN APV (anual)</div></div>
    <div class="box"><div class="val">$${resultado.impConAPV.toLocaleString('es-CL')}</div><div class="lbl">IMPUESTO CON APV (anual)</div></div>
  </div>
  <div class="highlight">
    <div class="lbl">AHORRO TRIBUTARIO ANUAL</div>
    <div class="val">$${resultado.ahorroAnual.toLocaleString('es-CL')}</div>
  </div>
  <div class="grid">
    <div class="box"><div class="val">$${resultado.retornoAPV.toLocaleString('es-CL')}</div><div class="lbl">RETORNO REAL AÑO 1</div></div>
    <div class="box"><div class="val">$${Math.round(resultado.acumulado10).toLocaleString('es-CL')}</div><div class="lbl">PROYECCIÓN 10 AÑOS (5% anual)</div></div>
  </div>
  <div class="footer">
    <div>Régimen ${regimen} · Art. 42 bis Ley de Impuesto a la Renta</div>
    <div>Generado el ${new Date().toLocaleDateString('es-CL')} por X3 Superinteligencia Patrimonial</div>
    <div class="seal">✓ ANALIZADO · PROTEGIDO · RESPALDADO</div>
    <div style="margin-top:10px;font-size:10px;">"Estamos contigo antes, durante y después."</div>
  </div>
</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `X3_APV_Shield_${new Date().toISOString().slice(0,10)}.html`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: "'Share Tech Mono', monospace", padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setLocation('/')} style={{ background: 'none', border: '1px solid #00ffcc', color: '#00ffcc', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px' }}>← VOLVER</button>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#00ffcc', letterSpacing: '3px' }}>⚡ APV TAX-SHIELD</h1>
          <div style={{ fontSize: '11px', color: '#666', letterSpacing: '2px' }}>ARTÍCULO 42 BIS · CALCULADOR DE AHORRO TRIBUTARIO</div>
        </div>
      </div>

      {/* Info legal */}
      <div style={{ background: 'rgba(0,255,204,0.05)', border: '1px solid rgba(0,255,204,0.3)', padding: '16px', marginBottom: '24px', fontSize: '13px' }}>
        <strong style={{ color: '#00ffcc' }}>Artículo 42 bis — Ley de Impuesto a la Renta</strong>
        <p style={{ margin: '8px 0 0', color: '#aaa', lineHeight: '1.6' }}>
          El APV permite reducir tu base imponible o recibir un crédito tributario del 15%. 
          El dinero que pagarías al Estado va directo a tu cuenta de inversión.
        </p>
      </div>

      {/* Formulario */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>INGRESO MENSUAL BRUTO</label>
          <input
            type="range" min={500000} max={10000000} step={100000} value={ingreso}
            onChange={e => setIngreso(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#00ffcc' }}
          />
          <div style={{ textAlign: 'center', fontSize: '24px', color: '#00ffcc', fontWeight: 'bold', marginTop: '8px' }}>
            ${ingreso.toLocaleString('es-CL')}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>APORTE APV MENSUAL</label>
          <input
            type="range" min={50000} max={1000000} step={10000} value={aporte}
            onChange={e => setAporte(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#00ffcc' }}
          />
          <div style={{ textAlign: 'center', fontSize: '24px', color: '#00ffcc', fontWeight: 'bold', marginTop: '8px' }}>
            ${aporte.toLocaleString('es-CL')}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>RÉGIMEN APV</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
            {(['A', 'B'] as const).map(r => (
              <button key={r} onClick={() => setRegimen(r)} style={{
                padding: '16px', border: `2px solid ${regimen === r ? '#00ffcc' : 'rgba(0,255,204,0.2)'}`,
                background: regimen === r ? 'rgba(0,255,204,0.1)' : 'transparent',
                color: regimen === r ? '#00ffcc' : '#666', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '14px', fontWeight: 'bold'
              }}>
                Régimen {r}
                <div style={{ fontSize: '10px', marginTop: '4px', color: '#888' }}>
                  {r === 'A' ? 'Crédito 15%' : 'Descuento base'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={calcular} style={{
        width: '100%', padding: '16px', background: 'linear-gradient(135deg, #00ffcc, #0066ff)',
        border: 'none', color: '#000', fontSize: '14px', fontWeight: 'bold', letterSpacing: '3px',
        cursor: 'pointer', fontFamily: 'inherit', marginBottom: '24px'
      }}>
        ⚡ CALCULAR AHORRO TRIBUTARIO
      </button>

      {resultado && (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          {/* Resultado principal */}
          <div style={{ background: 'rgba(0,255,204,0.08)', border: '2px solid #00ffcc', padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#888', letterSpacing: '3px', marginBottom: '8px' }}>AHORRO TRIBUTARIO ANUAL</div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#00ffcc' }}>
              ${resultado.ahorroAnual.toLocaleString('es-CL')}
            </div>
            <div style={{ fontSize: '13px', color: '#aaa', marginTop: '8px' }}>
              Ese dinero va a tu cuenta de inversión, no al Estado
            </div>
          </div>

          {/* Grid de métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { lbl: 'Impuesto SIN APV', val: `$${resultado.impSinAPV.toLocaleString('es-CL')}`, color: '#ff4444' },
              { lbl: 'Impuesto CON APV', val: `$${resultado.impConAPV.toLocaleString('es-CL')}`, color: '#00ffcc' },
              { lbl: 'Retorno real año 1', val: `$${resultado.retornoAPV.toLocaleString('es-CL')}`, color: '#00ff88' },
              { lbl: 'Proyección 10 años', val: `$${Math.round(resultado.acumulado10).toLocaleString('es-CL')}`, color: '#ffcc00' },
            ].map(m => (
              <div key={m.lbl} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: m.color }}>{m.val}</div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', letterSpacing: '1px' }}>{m.lbl}</div>
              </div>
            ))}
          </div>

          {/* Barra comparativa */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,255,204,0.2)', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#888', letterSpacing: '2px', marginBottom: '16px' }}>COMPARATIVA VISUAL</div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#ff4444' }}>Sin APV</span>
                <span style={{ color: '#ff4444' }}>${resultado.impSinAPV.toLocaleString('es-CL')}</span>
              </div>
              <div style={{ height: '12px', background: 'rgba(255,68,68,0.2)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: '100%', background: '#ff4444', borderRadius: '2px' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#00ffcc' }}>Con APV Régimen {regimen}</span>
                <span style={{ color: '#00ffcc' }}>${resultado.impConAPV.toLocaleString('es-CL')}</span>
              </div>
              <div style={{ height: '12px', background: 'rgba(0,255,204,0.1)', borderRadius: '2px' }}>
                <div style={{
                  height: '100%',
                  width: resultado.impSinAPV > 0 ? `${(resultado.impConAPV / resultado.impSinAPV) * 100}%` : '0%',
                  background: '#00ffcc', borderRadius: '2px',
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Cita legal */}
          <div style={{ background: 'rgba(0,102,255,0.08)', border: '1px solid rgba(0,102,255,0.3)', padding: '16px', marginBottom: '20px', fontSize: '12px' }}>
            <strong style={{ color: '#0066ff' }}>⚖️ Base Legal</strong>
            <p style={{ margin: '8px 0 0', color: '#aaa', lineHeight: '1.6' }}>
              Artículo 42 bis, Ley de Impuesto a la Renta — permite deducir aportes voluntarios de pensiones de la base imponible (Régimen B) o recibir un crédito tributario del 15% (Régimen A). Máximo anual: 600 UF.
            </p>
          </div>

          <button onClick={generarCertificado} style={{
            width: '100%', padding: '14px', background: 'transparent',
            border: '2px solid #00ffcc', color: '#00ffcc', fontSize: '13px',
            fontWeight: 'bold', letterSpacing: '3px', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            📜 DESCARGAR CERTIFICADO APV TAX-SHIELD
          </button>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
