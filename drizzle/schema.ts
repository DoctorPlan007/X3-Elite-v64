import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).default("Nueva conversación"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const memories = mysqlTable("memories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  category: varchar("category", { length: 64 }).default("general"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active"),
  data: json("data"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── MÓDULO LEGADO — El Alma de Alexander ───────────────────────────────────
// Perfil del creador: su historia, valores, forma de pensar y hablar.
// Solo accesible con la clave personal de Alexander.
export const legacyProfile = mysqlTable("legacy_profile", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Clave personal hasheada (bcrypt) — solo los hijos la conocen
  accessKeyHash: varchar("accessKeyHash", { length: 255 }).notNull(),
  // Historia de vida y valores
  lifeStory: text("lifeStory"),
  values: text("values"),
  wayOfThinking: text("wayOfThinking"),
  wayOfSpeaking: text("wayOfSpeaking"),
  // Frase de vida
  lifePhrase: text("lifePhrase"),
  // Datos del creador
  creatorName: varchar("creatorName", { length: 255 }),
  profession: varchar("profession", { length: 255 }),
  // Metadatos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Mensajes individuales para cada hijo — guardados con amor y permanencia.
export const legacyMessages = mysqlTable("legacy_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Nombre del hijo destinatario
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  // Fecha de nacimiento del hijo (para personalizar el saludo)
  recipientBirthdate: varchar("recipientBirthdate", { length: 20 }),
  // El mensaje del papá — guardado exactamente como lo escribió
  message: text("message").notNull(),
  // Apodo cariñoso
  nickname: varchar("nickname", { length: 255 }),
  // Orden de visualización
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegacyProfile = typeof legacyProfile.$inferSelect;
export type LegacyMessage = typeof legacyMessages.$inferSelect;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Memory = typeof memories.$inferSelect;
export type Project = typeof projects.$inferSelect;
