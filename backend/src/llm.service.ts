import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./prompt";
import { Message } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateReply(
  history: Message[],
  userMessage: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const prompt = `
${SYSTEM_PROMPT}

Conversation so far:
${history
  .map(
    (m) =>
      `${m.sender === "user" ? "User" : "Agent"}: ${m.text}`
  )
  .join("\n")}

User: ${userMessage}
Agent:
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    return response || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("LLM error (Gemini):", error);

    if (error?.status === 429) {
      return "I'm receiving too many requests right now. Please try again in a moment.";
    }

    return "Sorry, I'm having trouble responding right now. Please try again later.";
  }
}
