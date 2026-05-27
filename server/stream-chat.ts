import { Request, Response } from "express";
import { ENV } from "./_core/env";
import { X3_SYSTEM_PROMPT } from "./x3-system-prompt";
import { isapresData } from "./isapres-data";
import { getFinancialData } from "./financial-data";
import { getDb } from "./db";
import { conversations, messages, memories } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { sdk } from "./_core/sdk";

const resolveApiUrl = () => {
  // If GEMINI_API_KEY is set, use Google Gemini API directly
  if (ENV.geminiApiKey && ENV.geminiApiKey.trim().length > 0) {
    return "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  }
  // Fallback to Manus built-in Forge API
  return ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";
};

const resolveApiKey = () =>
  ENV.geminiApiKey && ENV.geminiApiKey.trim().length > 0
    ? ENV.geminiApiKey
    : ENV.forgeApiKey;

export async function streamChatHandler(req: Request, res: Response) {
  // Auth via SDK (same as tRPC protectedProcedure)
  let userId: number;
  try {
    const user = await sdk.authenticateRequest(req);
    userId = user.id;
  } catch {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const { message, conversationId, image, mimeType, maxHistory } = req.body as {
    message: string;
    conversationId?: number;
    image?: string;       // base64 — Nivel 2 Visión
    mimeType?: string;
    maxHistory?: number;  // Modo Ahorro de Datos
  };

  if (!message?.trim() && !image) {
    res.status(400).json({ error: "Mensaje vacío" });
    return;
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const [conv] = await db.insert(conversations).values({
        userId,
        title: message.slice(0, 60),
      });
      convId = (conv as any).insertId;
    } else {
      // Validate that the conversation belongs to this user
      const [existingConv] = await db.select()
        .from(conversations)
        .where(eq(conversations.id, convId))
        .limit(1);
      if (!existingConv || existingConv.userId !== userId) {
        sendEvent({ type: "error", message: "Conversación no encontrada" });
        res.end();
        return;
      }
    }

    // Save user message
    await db.insert(messages).values({
      conversationId: convId!,
      userId,
      role: "user" as const,
      content: String(message),
    });

    // Get conversation history (Modo Ahorro limita el historial)
    const historyLimit = maxHistory ?? 20;
    const history = await db.select()
      .from(messages)
      .where(eq(messages.conversationId, convId!))
      .orderBy(desc(messages.createdAt))
      .limit(historyLimit);

    // Get user memories
    const userMemories = await db.select()
      .from(memories)
      .where(eq(memories.userId, userId))
      .limit(50);

    let memoryContext = "";
    if (userMemories.length > 0) {
      memoryContext = "\n\n## MEMORIA DE ALEXANDER:\n" +
        userMemories.map((m: any) => `- ${m.key}: ${m.value}`).join("\n");
    }

    // Detect special commands
    const msg = message.toLowerCase();
    let specialContext = "";

    if (msg.includes("isapre") || msg.includes("salud") || msg.includes("plan de salud")) {
      specialContext = "\n\n## DATOS ISAPRES DISPONIBLES:\n" + JSON.stringify(isapresData, null, 2);
    }

    if (msg.includes("uf") || msg.includes("utm") || msg.includes("finanzas") || msg.includes("inversión") || msg.includes("apv") || msg.includes("dólar")) {
      try {
        const finData = await getFinancialData();
        specialContext += "\n\n## DATOS FINANCIEROS EN TIEMPO REAL:\n" + JSON.stringify(finData, null, 2);
      } catch {
        specialContext += "\n\n## DATOS FINANCIEROS: No disponibles en este momento.";
      }
    }

    // Build messages for LLM
    // Last message in history is the user message we just saved — build its content
    const lastUserContent: any[] = [{ type: "text", text: message || "Analiza esta imagen" }];
    if (image) {
      lastUserContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType || "image/jpeg"};base64,${image}` },
      });
    }

    // Build history excluding the last user message (we'll add it with image)
    const historyMessages = history.reverse();
    const withoutLast = historyMessages.slice(0, -1);

    const llmMessages: any[] = [
      { role: "system" as const, content: X3_SYSTEM_PROMPT + memoryContext + specialContext },
      ...withoutLast.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content as string,
      })),
      // Last user message — may include image
      { role: "user" as const, content: image ? lastUserContent : (message || "Analiza esta imagen") },
    ];

    // Call LLM with streaming
    const response = await fetch(resolveApiUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${resolveApiKey()}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: llmMessages,
        stream: true,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      sendEvent({ type: "error", message: `Error del servidor IA: ${response.status} - ${errorText.slice(0, 200)}` });
      res.end();
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      sendEvent({ type: "error", message: "No se pudo iniciar el stream" });
      res.end();
      return;
    }

    // Send conversationId first
    sendEvent({ type: "start", conversationId: convId });

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
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const dataStr = trimmed.slice(5).trim();
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            sendEvent({ type: "delta", content: delta });
          }
        } catch {
          // ignore parse errors on malformed chunks
        }
      }
    }

    // Save assistant message to DB
    if (fullContent) {
      await db.insert(messages).values({
        conversationId: convId!,
        userId,
        role: "assistant" as const,
        content: String(fullContent),
      });

        // Memoria explícita: "recuerda que..."
      const rememberMatch = message.match(/recuerda que (.+)/i);
      if (rememberMatch) {
        const memValue = rememberMatch[1];
        const memKey = `nota_${Date.now()}`;
        await db.insert(memories).values({
          userId,
          key: memKey,
          value: memValue,
          category: "personal",
        }).onDuplicateKeyUpdate({ set: { value: memValue } });
      }

      // Memoria automática inteligente — X3 detecta datos importantes sin que el usuario lo pida
      const autoMemoryPatterns: Array<{ regex: RegExp; key: string; category: string }> = [
        { regex: /mi isapre es ([\w\s]+)/i, key: "isapre", category: "salud" },
        { regex: /tengo plan ([\w\s]+)/i, key: "plan_salud", category: "salud" },
        { regex: /trabajo en ([\w\s]+)/i, key: "trabajo", category: "personal" },
        { regex: /vivo en ([\w\s]+)/i, key: "ciudad", category: "personal" },
        { regex: /tengo (\d+) hijos/i, key: "num_hijos", category: "familia" },
        { regex: /mi rut es ([\d\-kK]+)/i, key: "rut", category: "personal" },
        { regex: /mi apv es ([\w\s]+)/i, key: "apv", category: "finanzas" },
        { regex: /invierto en ([\w\s]+)/i, key: "inversiones", category: "finanzas" },
        { regex: /mi proyecto ([\w\s]+) es/i, key: `proyecto_${Date.now()}`, category: "proyectos" },
      ];

      for (const pattern of autoMemoryPatterns) {
        const match = message.match(pattern.regex);
        if (match) {
          await db.insert(memories).values({
            userId,
            key: pattern.key,
            value: match[1].trim(),
            category: pattern.category,
          }).onDuplicateKeyUpdate({ set: { value: match[1].trim() } });
        }
      }
    }

    sendEvent({ type: "done", conversationId: convId });
    res.end();

  } catch (err: any) {
    console.error("[stream-chat] Error:", err);
    sendEvent({ type: "error", message: err?.message || "Error interno del servidor" });
    res.end();
  }
}
