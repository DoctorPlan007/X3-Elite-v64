import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the SDK
vi.mock("./_core/sdk", () => ({
  sdk: {
    authenticateRequest: vi.fn(),
  },
}));

// Mock the DB
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Mock the LLM/financial/isapres
vi.mock("./financial-data", () => ({
  getFinancialData: vi.fn().mockResolvedValue({ uf: { valor: 40000 } }),
}));

vi.mock("./isapres-data", () => ({
  isapresData: [{ nombre: "Banmédica", planes: [] }],
}));

vi.mock("./x3-system-prompt", () => ({
  X3_SYSTEM_PROMPT: "You are X3.",
}));

// Mock fetch for LLM streaming
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { streamChatHandler } from "./stream-chat";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";

function createMockRes() {
  const chunks: string[] = [];
  return {
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
    write: vi.fn((chunk: string) => chunks.push(chunk)),
    end: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    _chunks: chunks,
  };
}

function createMockReq(body: object, cookies: Record<string, string> = {}) {
  return {
    body,
    cookies,
    headers: { cookie: "" },
  } as any;
}

describe("streamChatHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    vi.mocked(sdk.authenticateRequest).mockRejectedValue(new Error("Unauthorized"));
    const req = createMockReq({ message: "hola" });
    const res = createMockRes();

    await streamChatHandler(req, res as any);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No autenticado" });
  });

  it("returns 400 when message is empty", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue({ id: 1, openId: "user1", name: "Test", email: null, loginMethod: null, role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() });
    const req = createMockReq({ message: "" });
    const res = createMockRes();

    await streamChatHandler(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Mensaje vacío" });
  });

  it("sends SSE headers and streams response", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue({ id: 1, openId: "user1", name: "Test", email: null, loginMethod: null, role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() });

    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 42 }]),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    // Mock streaming response
    const streamChunks = [
      'data: {"choices":[{"delta":{"content":"Hola"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" Alexander"}}]}\n\n',
      'data: [DONE]\n\n',
    ];
    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(async () => {
        if (chunkIndex < streamChunks.length) {
          const chunk = streamChunks[chunkIndex++];
          return { done: false, value: new TextEncoder().encode(chunk) };
        }
        return { done: true, value: undefined };
      }),
    };
    mockFetch.mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    });

    const req = createMockReq({ message: "hola" });
    const res = createMockRes();

    await streamChatHandler(req, res as any);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
    expect(res.flushHeaders).toHaveBeenCalled();
    
    // Check that delta events were sent
    const writtenData = res._chunks.join("");
    expect(writtenData).toContain('"type":"start"');
    expect(writtenData).toContain('"type":"delta"');
    expect(writtenData).toContain("Hola");
    expect(writtenData).toContain("done");
    expect(res.end).toHaveBeenCalled();
  });

  it("rejects conversationId that does not belong to user", async () => {
    vi.mocked(sdk.authenticateRequest).mockResolvedValue({ id: 1, openId: "user1", name: "Test", email: null, loginMethod: null, role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() });

    const mockDb = {
      insert: vi.fn(),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 99, userId: 999 }]), // different user
          }),
        }),
      }),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const req = createMockReq({ message: "hola", conversationId: 99 });
    const res = createMockRes();

    await streamChatHandler(req, res as any);

    const writtenData = res._chunks.join("");
    expect(writtenData).toContain('"type":"error"');
    expect(writtenData).toContain("Conversaci");
    expect(res.end).toHaveBeenCalled();
  });
});
