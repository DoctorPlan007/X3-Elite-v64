import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { X3_SYSTEM_PROMPT } from "./x3-system-prompt";
import { getDb } from "./db";
import { conversations, messages, memories, projects } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { isapresData } from "./isapres-data";
import { getFinancialData } from "./financial-data";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  chat: router({
    send: protectedProcedure
      .input(z.object({
        message: z.string().min(1).max(10000),
        conversationId: z.number().optional(),
        includeMemory: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get or create conversation
        let convId = input.conversationId;
        if (!convId) {
          const [conv] = await db.insert(conversations).values({
            userId: ctx.user.id,
            title: input.message.slice(0, 60),
          });
          convId = (conv as any).insertId;
        }

        // Save user message
        await db.insert(messages).values({
          conversationId: convId!,
          userId: ctx.user.id,
          role: "user" as const,
          content: String(input.message),
        });

        // Get conversation history (last 20 messages)
        const history = await db.select()
          .from(messages)
          .where(eq(messages.conversationId, convId!))
          .orderBy(desc(messages.createdAt))
          .limit(20);

        // Get user memories
        let memoryContext = "";
        if (input.includeMemory) {
          const userMemories = await db.select()
            .from(memories)
            .where(eq(memories.userId, ctx.user.id))
            .limit(50);
          if (userMemories.length > 0) {
            memoryContext = "\n\n## MEMORIA DE ALEXANDER:\n" +
              userMemories.map(m => `- ${m.key}: ${m.value}`).join("\n");
          }
        }

        // Detect special commands
        const msg = input.message.toLowerCase();
        let specialContext = "";

        if (msg.includes("isapre") || msg.includes("salud") || msg.includes("plan de salud")) {
          specialContext = "\n\n## DATOS ISAPRES DISPONIBLES:\n" + JSON.stringify(isapresData, null, 2);
        }

        if (msg.includes("uf") || msg.includes("utm") || msg.includes("finanzas") || msg.includes("inversión") || msg.includes("apv")) {
          try {
            const finData = await getFinancialData();
            specialContext += "\n\n## DATOS FINANCIEROS EN TIEMPO REAL:\n" + JSON.stringify(finData, null, 2);
          } catch (e) {
            specialContext += "\n\n## DATOS FINANCIEROS: No disponibles en este momento.";
          }
        }

        // Build messages for LLM
        const llmMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: X3_SYSTEM_PROMPT + memoryContext + specialContext },
          ...history.reverse().map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content as string,
          })),
        ];

        // Call LLM
        const response = await invokeLLM({ messages: llmMessages });
        const assistantContent = response.choices[0]?.message?.content || "Error al procesar la respuesta.";

        // Save assistant message
        await db.insert(messages).values({
          conversationId: convId!,
          userId: ctx.user.id,
          role: "assistant" as const,
          content: String(assistantContent),
        });

        // Auto-detect memory commands
        const rememberMatch = input.message.match(/recuerda que (.+)/i);
        if (rememberMatch) {
          const memValue = rememberMatch[1];
          const memKey = `nota_${Date.now()}`;
          await db.insert(memories).values({
            userId: ctx.user.id,
            key: memKey,
            value: memValue,
            category: "personal",
          }).onDuplicateKeyUpdate({ set: { value: memValue } });
        }

        return {
          content: assistantContent,
          conversationId: convId,
        };
      }),

    getConversations: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(conversations)
        .where(eq(conversations.userId, ctx.user.id))
        .orderBy(desc(conversations.updatedAt))
        .limit(20);
    }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(messages)
          .where(and(
            eq(messages.conversationId, input.conversationId),
            eq(messages.userId, ctx.user.id)
          ))
          .orderBy(messages.createdAt);
      }),
  }),

  memory: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(memories)
        .where(eq(memories.userId, ctx.user.id))
        .orderBy(desc(memories.updatedAt));
    }),

    save: protectedProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.insert(memories).values({
          userId: ctx.user.id,
          key: input.key,
          value: input.value,
          category: input.category || "general",
        }).onDuplicateKeyUpdate({ set: { value: input.value } });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(memories)
          .where(and(eq(memories.id, input.id), eq(memories.userId, ctx.user.id)));
        return { success: true };
      }),
  }),

  projects: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(projects)
        .where(eq(projects.userId, ctx.user.id))
        .orderBy(desc(projects.updatedAt));
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(projects).values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
        });
        return { success: true, id: (result as any).insertId };
      }),
  }),

  isapres: router({
    getAll: publicProcedure.query(() => isapresData),
    compare: publicProcedure
      .input(z.object({
        isapres: z.array(z.string()),
        region: z.string().optional(),
        budget: z.number().optional(),
      }))
      .query(({ input }) => {
        const filtered = isapresData.filter(i =>
          input.isapres.length === 0 || input.isapres.includes(i.nombre)
        );
        return filtered;
      }),
  }),

  financial: router({
    getData: publicProcedure.query(async () => {
      try {
        return await getFinancialData();
      } catch (e) {
        return { error: "No disponible", uf: null, utm: null };
      }
    }),
  }),

  voice: router({
    transcribe: protectedProcedure
      .input(z.object({ audioUrl: z.string() }))
      .mutation(async ({ input }) => {
        const { transcribeAudio } = await import("./_core/voiceTranscription");
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: "es",
          prompt: "Transcripción en español chileno",
        });
        const text = 'text' in result ? result.text : 'Error al transcribir';
        return { text };
      }),
  }),

  image: router({
    generatePrompt: protectedProcedure
      .input(z.object({ description: z.string() }))
      .mutation(async ({ input }) => {
        const promptMessages: Array<{role: "system" | "user" | "assistant"; content: string}> = [
          {
            role: "system",
            content: "Eres un experto en prompts para generación de imágenes con IA. Crea prompts cinematográficos ultra profesionales en inglés para imágenes 8K de calidad máxima. El prompt debe incluir: estilo visual, iluminación, composición, calidad técnica, mood. Formato: solo el prompt, sin explicaciones.",
          },
          {
            role: "user",
            content: `Crea un prompt cinematográfico 8K para: ${input.description}`,
          },
        ];
        const response = await invokeLLM({ messages: promptMessages });
        const prompt = (response.choices[0]?.message?.content as string) || "";
        
        // Generate the image
        const { generateImage } = await import("./_core/imageGeneration");
        const { url } = await generateImage({ prompt });
        return { prompt, imageUrl: url };
      }),
  }),

  code: router({
    generate: protectedProcedure
      .input(z.object({
        description: z.string(),
        type: z.enum(["landing", "app", "component", "tool"]).default("landing"),
      }))
      .mutation(async ({ input }) => {
        const codeMessages: Array<{role: "system" | "user" | "assistant"; content: string}> = [
          {
            role: "system",
            content: "Eres X3, un motor de generación de código experto. Creas código HTML/CSS/JavaScript completo, funcional y de alta calidad. Para landing pages: diseño moderno, responsive, con animaciones suaves. Para apps: código limpio, bien estructurado, con comentarios. Devuelve SOLO el código, sin explicaciones adicionales. El código debe ser 100% funcional y listo para usar.",
          },
          {
            role: "user",
            content: `Crea ${input.type === "landing" ? "una landing page" : "una app"} para: ${input.description}`,
          },
        ];
        const codeResponse = await invokeLLM({ messages: codeMessages });
        return { code: (codeResponse.choices[0]?.message?.content as string) || "" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
