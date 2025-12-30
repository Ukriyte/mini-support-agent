export type Sender = "user" | "ai";

export interface Message {
  id: string;
  conversationId: string;
  sender: Sender;
  text: string;
  createdAt: string;
}
