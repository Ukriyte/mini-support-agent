import { Router } from "express";
import {
  createConversation,
  conversationExists,
  saveMessage,
  getConversationHistory,
} from "./chat.service";

import { generateReply } from "./llm.service";

const router = Router();
const MAX_HISTORY_LLM = 20;

router.post("/message", async (req, res) => {
  const { message, sessionId } = req.body as {
    message?: string;
    sessionId?: string;
  };


  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "Message cannot be empty",
    });
  }

  const trimmedMessage = message.slice(0, 1000); 

  let conversationId = sessionId;

  if (!conversationId || !conversationExists(conversationId)) {
    conversationId = createConversation();
  }


  saveMessage(conversationId, "user", trimmedMessage);


  const history = getConversationHistory(conversationId, MAX_HISTORY_LLM);

  const aiReply = await generateReply(history, trimmedMessage);


  saveMessage(conversationId, "ai", aiReply);

  return res.json({
    reply: aiReply,
    sessionId: conversationId,
  });
});

router.get("/history/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId || !conversationExists(sessionId)) {
    return res.json({
      sessionId,
      messages: [],
    });
  }

  const messages = getConversationHistory(sessionId, 50);

  return res.json({
    sessionId,
    messages: messages.map((m) => ({
      sender: m.sender,
      text: m.text,
      createdAt: m.createdAt,
    })),
  });
});


export default router;
