import db from "./db";
import crypto from "crypto";
import { Message } from "./types";


export function createConversation(): string {
  const id = crypto.randomUUID();

  db.prepare(
    `INSERT INTO conversations (id, created_at) VALUES (?, ?)`
  ).run(id, new Date().toISOString());

  return id;
}


export function conversationExists(conversationId: string): boolean {
  const row = db
    .prepare(`SELECT id FROM conversations WHERE id = ?`)
    .get(conversationId);

  return Boolean(row);
}


export function saveMessage(
  conversationId: string,
  sender: "user" | "ai",
  text: string
): void {
  db.prepare(
    `INSERT INTO messages (id, conversation_id, sender, text, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    crypto.randomUUID(),
    conversationId,
    sender,
    text,
    new Date().toISOString()
  );
}


export function getConversationHistory(
  conversationId: string,
  limit = 20
): Message[] {
  return db
    .prepare(
      `
      SELECT *
      FROM (
        SELECT
          id,
          conversation_id AS conversationId,
          sender,
          text,
          created_at AS createdAt
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      )
      ORDER BY createdAt ASC
      `
    )
    .all(conversationId, limit) as Message[];
}