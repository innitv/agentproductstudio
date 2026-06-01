export interface AIAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  active: boolean;
  dialogsCount: number;
  type: "public" | "private";
}

export interface Message {
  sender: "bot" | "user";
  text: string;
}
