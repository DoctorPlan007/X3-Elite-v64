export interface FinancialData {
  uf: { valor: number; fecha: string } | null;
  utm: { valor: number; fecha: string } | null;
  dolar: { valor: number; fecha: string } | null;
  euro: { valor: number; fecha: string } | null;
  ipc: { valor: number; fecha: string } | null;
  error?: string;
}

export async function getFinancialData(): Promise<FinancialData> {
  const result: FinancialData = {
    uf: null,
    utm: null,
    dolar: null,
    euro: null,
    ipc: null,
  };

  try {
    // UF desde mindicador.cl (API pública chilena)
    const ufRes = await fetch("https://mindicador.cl/api/uf", {
      signal: AbortSignal.timeout(5000),
    });
    if (ufRes.ok) {
      const ufData = await ufRes.json();
      if (ufData?.serie?.[0]) {
        result.uf = {
          valor: ufData.serie[0].valor,
          fecha: ufData.serie[0].fecha,
        };
      }
    }
  } catch (e) {
    console.warn("UF fetch failed:", e);
  }

  try {
    // UTM desde mindicador.cl
    const utmRes = await fetch("https://mindicador.cl/api/utm", {
      signal: AbortSignal.timeout(5000),
    });
    if (utmRes.ok) {
      const utmData = await utmRes.json();
      if (utmData?.serie?.[0]) {
        result.utm = {
          valor: utmData.serie[0].valor,
          fecha: utmData.serie[0].fecha,
        };
      }
    }
  } catch (e) {
    console.warn("UTM fetch failed:", e);
  }

  try {
    // Dólar desde mindicador.cl
    const dolarRes = await fetch("https://mindicador.cl/api/dolar", {
      signal: AbortSignal.timeout(5000),
    });
    if (dolarRes.ok) {
      const dolarData = await dolarRes.json();
      if (dolarData?.serie?.[0]) {
        result.dolar = {
          valor: dolarData.serie[0].valor,
          fecha: dolarData.serie[0].fecha,
        };
      }
    }
  } catch (e) {
    console.warn("Dólar fetch failed:", e);
  }

  try {
    // Euro desde mindicador.cl
    const euroRes = await fetch("https://mindicador.cl/api/euro", {
      signal: AbortSignal.timeout(5000),
    });
    if (euroRes.ok) {
      const euroData = await euroRes.json();
      if (euroData?.serie?.[0]) {
        result.euro = {
          valor: euroData.serie[0].valor,
          fecha: euroData.serie[0].fecha,
        };
      }
    }
  } catch (e) {
    console.warn("Euro fetch failed:", e);
  }

  try {
    // IPC desde mindicador.cl
    const ipcRes = await fetch("https://mindicador.cl/api/ipc", {
      signal: AbortSignal.timeout(5000),
    });
    if (ipcRes.ok) {
      const ipcData = await ipcRes.json();
      if (ipcData?.serie?.[0]) {
        result.ipc = {
          valor: ipcData.serie[0].valor,
          fecha: ipcData.serie[0].fecha,
        };
      }
    }
  } catch (e) {
    console.warn("IPC fetch failed:", e);
  }

  return result;
}
