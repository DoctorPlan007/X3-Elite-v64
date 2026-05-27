import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("auth.me (public)", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const cleared: string[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        email: "test@x3.ai",
        name: "Test X3",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => { cleared.push(name); },
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(cleared.length).toBeGreaterThan(0);
  });
});

describe("X3 chat router (protected)", () => {
  it("chat.send is a protected procedure — rejects unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.chat.send({ message: "Hola X3" })).rejects.toThrow();
  });
});

describe("X3 memory router (protected)", () => {
  it("memory.getAll rejects unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.memory.getAll()).rejects.toThrow();
  });
});

describe("X3 projects router (protected)", () => {
  it("projects.getAll rejects unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.projects.getAll()).rejects.toThrow();
  });
});

describe("X3 isapres router (public)", () => {
  it("isapres.getAll returns array of isapres", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.isapres.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("nombre");
    expect(result[0]).toHaveProperty("planes");
  });
});
