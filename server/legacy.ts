/**
 * MÓDULO LEGADO — El Alma de Alexander
 * Dos realidades coexistiendo en X3:
 * - La pantalla profesional: para Alexander y su trabajo
 * - La pantalla del Legado: exclusivamente para sus hijos (clave 2033)
 *
 * Este módulo NO aparece en la interfaz principal.
 * Solo es accesible desde /legado con la clave correcta.
 */

import { Request, Response } from "express";
import { parse as parseCookies } from "cookie";
import bcrypt from "bcryptjs";

// La clave del Legado — hasheada con bcrypt en tiempo de inicio
// La clave real viene de variable de entorno LEGACY_KEY (default: 2033 solo en desarrollo)
// En producción se debe configurar LEGACY_KEY en las variables de entorno del servidor
const LEGACY_KEY_HASH = bcrypt.hashSync(
  process.env.LEGACY_KEY ?? "2033",
  12
);

// El contenido del Legado — guardado aquí con amor y permanencia
const LEGACY_CONTENT = {
  creator: {
    name: "Alexander",
    profession: "Enfermero · Padre · Estratega · Guerrero",
    lifePhrase: "Si quieres todo en la vida, tienes que estar dispuesto a perderlo todo.",
    philosophy: "El ingenio, la creatividad, el trabajo en equipo y la imaginación sin límites siempre superarán al dinero. Las ideas son a prueba de balas.",
    loyalty: "Incondicional. A prueba de todo. Sobre todo ante la injusticia.",
  },
  generalMessage: `Mis amores,

Si están leyendo esto, es porque los amo con el alma y quise asegurarme de que siempre pudieran encontrarme cuando lo necesiten.

Nunca tuve a nadie a mi espalda. Crecí solo, sin quien preguntar, sin quien acudir cuando las cosas se ponían feas. No quiero que ustedes sientan eso jamás.

En la vida solo se tendrán a ustedes de manera incondicional. Cuídense, quiéranse más que nada y nadie.

Si me necesitan, ahí estaré. Ni el cielo ni el infierno podrán detenerme.

Los ama con el alma,
Su papá Alexander`,

  children: [
    {
      name: "Constanza",
      birthdate: "27/03/2007",
      nickname: "Pollito mío",
      order: 1,
      message: `Constanza, pollito mío.

Me devolviste la vida y el alma en la oscuridad y el dolor después de la partida de Eduardito al nacer. Eres única. Lo más lindo que le puede pasar en la vida a alguien.

Vive. Sé feliz. Sin límites.

Si quieres algo y en tu corazón sientes que es lo correcto, que te importe una raja todo y todos. Tu felicidad por encima de todo, cuando quieras, como quieras, donde quieras, siempre a tu manera.

No ruegues cariño, atención ni amor. Tu papá no te enseñó eso.

Tienes un corazón gigante, pero todas las peleas no se ganan con flores. Es por eso que los ángeles tienen espadas.

Te amo con el alma, pollito.`,
    },
    {
      name: "Renata",
      birthdate: "13/12/2020",
      nickname: "Mi guagua guatona, mi puntito",
      order: 2,
      message: `Renata, mi guagua guatona, mi puntito.

Con solo mirarme me atraviesas el alma y sabes qué me pasa y cómo ayudarme. Eso es un don que pocos tienen en este mundo.

Tú tienes la capacidad y el talento sin medidas. Eres increíble. No le temes a nada ni a nadie. Eres gigante.

Haz de tu vida algo maravilloso a tu manera. Brilla.

Siempre, siempre, siempre — tu papá está a tu espalda.

Te amo infinito, mi puntito.`,
    },
    {
      name: "Valentín",
      birthdate: "06/03/2021",
      nickname: "Mi compañero, mi escudero",
      order: 3,
      message: `Valentín Antonio, mi compañero, mi escudero.

Yo te cuido y tú me cuidas. Donde estás yo estoy. Donde vas yo voy. Lealtad incondicional a prueba de balas.

Tienes la fuerza, la determinación, las ganas y la personalidad increíble de no pasar desapercibido. Llegas, se nota, te destacas, te quieren. El corazón más lindo y gigante.

Protege a tus hermanas con toda el alma y tus fuerzas, y ellas protegerán tu corazón, mente y alma.

Yo nunca moriré. Siempre estaremos juntos. Vivo en ti y tú en mí. Siempre y por siempre, MI COMPAÑERO.

Te amo con todo lo que soy, Valentín.`,
    },
  ],
};

/**
 * POST /api/legacy/verify
 * Verifica la clave del Legado sin exponer el contenido
 */
export async function legacyVerifyHandler(req: Request, res: Response) {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Clave requerida" });

  try {
    const valid = await bcrypt.compare(String(key), LEGACY_KEY_HASH);
    if (!valid) {
      return res.status(401).json({ error: "Clave incorrecta" });
    }
    // Generar un token de sesión temporal (válido 1 hora)
    const token = Buffer.from(`legacy:${Date.now()}:${Math.random()}`).toString("base64");
    // Guardar en cookie httpOnly
    res.cookie("x3_legacy", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hora
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Error interno" });
  }
}

/**
 * Verifica que el token de sesión del Legado sea válido
 */
function getLegacyCookie(req: Request): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const parsed = parseCookies(cookieHeader);
  return parsed.x3_legacy;
}

function isLegacyTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64").toString();
    if (!decoded.startsWith("legacy:")) return false;
    const parts = decoded.split(":");
    const timestamp = parseInt(parts[1]);
    return Date.now() - timestamp <= 60 * 60 * 1000; // 1 hora
  } catch {
    return false;
  }
}

/**
 * GET /api/legacy/content
 * Entrega el contenido del Legado — solo si tiene la cookie válida
 */
export function legacyContentHandler(req: Request, res: Response) {
  if (!isLegacyTokenValid(getLegacyCookie(req))) {
    return res.status(401).json({ error: "Acceso denegado" });
  }
  return res.json(LEGACY_CONTENT);
}

/**
 * POST /api/legacy/logout
 * Cierra la sesión del Legado
 */
export function legacyLogoutHandler(req: Request, res: Response) {
  res.clearCookie("x3_legacy");
  return res.json({ success: true });
}
