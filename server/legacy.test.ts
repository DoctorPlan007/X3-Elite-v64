/**
 * Tests del Módulo Legado
 * Verifica que solo la clave correcta (2033) da acceso al contenido
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { legacyVerifyHandler, legacyContentHandler, legacyLogoutHandler } from "./legacy";

function mockReq(overrides: any = {}) {
  return {
    body: {},
    headers: {},
    cookies: {},
    ...overrides,
  } as any;
}

function mockRes() {
  const res: any = {
    statusCode: 200,
    cookies: {} as Record<string, any>,
    _json: null as any,
    status(code: number) { this.statusCode = code; return this; },
    json(data: any) { this._json = data; return this; },
    cookie(name: string, value: string, opts?: any) { this.cookies[name] = { value, opts }; return this; },
    clearCookie(name: string) { delete this.cookies[name]; return this; },
  };
  return res;
}

describe("Módulo Legado — Control de acceso", () => {
  it("rechaza cuando no se envía clave", async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();
    await legacyVerifyHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._json.error).toBeTruthy();
  });

  it("rechaza clave incorrecta", async () => {
    const req = mockReq({ body: { key: "1234" } });
    const res = mockRes();
    await legacyVerifyHandler(req, res);
    expect(res.statusCode).toBe(401);
    expect(res._json.error).toContain("incorrecta");
  });

  it("rechaza otra clave incorrecta", async () => {
    const req = mockReq({ body: { key: "0000" } });
    const res = mockRes();
    await legacyVerifyHandler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("acepta la clave correcta 2033", async () => {
    const req = mockReq({ body: { key: "2033" } });
    const res = mockRes();
    await legacyVerifyHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._json.success).toBe(true);
    // Debe establecer cookie
    expect(res.cookies["x3_legacy"]).toBeTruthy();
  });

  it("deniega acceso al contenido sin cookie", () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();
    legacyContentHandler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("deniega acceso al contenido con cookie inválida", () => {
    const req = mockReq({ headers: { cookie: "x3_legacy=invalido123" } });
    const res = mockRes();
    legacyContentHandler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("permite acceso al contenido con cookie válida", () => {
    // Generar token válido
    const token = Buffer.from(`legacy:${Date.now()}:test`).toString("base64");
    const req = mockReq({ headers: { cookie: `x3_legacy=${token}` } });
    const res = mockRes();
    legacyContentHandler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._json.children).toHaveLength(3);
    expect(res._json.children[0].name).toBe("Constanza");
    expect(res._json.children[1].name).toBe("Renata");
    expect(res._json.children[2].name).toBe("Valentín");
  });

  it("el contenido incluye los mensajes de los tres hijos", () => {
    const token = Buffer.from(`legacy:${Date.now()}:test`).toString("base64");
    const req = mockReq({ headers: { cookie: `x3_legacy=${token}` } });
    const res = mockRes();
    legacyContentHandler(req, res);
    const data = res._json;
    expect(data.creator.name).toBe("Alexander");
    expect(data.generalMessage).toBeTruthy();
    expect(data.children.find((c: any) => c.name === "Constanza")?.nickname).toContain("Pollito");
    expect(data.children.find((c: any) => c.name === "Valentín")?.nickname).toContain("compañero");
  });

  it("logout elimina la cookie", () => {
    const req = mockReq({});
    const res = mockRes();
    res.cookies["x3_legacy"] = { value: "test" };
    legacyLogoutHandler(req, res);
    expect(res.cookies["x3_legacy"]).toBeUndefined();
    expect(res._json.success).toBe(true);
  });
});
