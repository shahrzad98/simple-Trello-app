export type Comment = {
  id: number;
  author: string;
  createdAt: number;
  text: string;
};

export type Card = {
  id: number;
  title: string;
  comments: Comment[];
};

export type Board = {
  id: number;
  title: string;
  cards: Card[];
};

export type DragPayload =
  | { type: "list"; boardId: number }
  | { type: "card"; boardId: number; cardId: number };

export type DragOverList = { boardId: number; side: "left" | "right" } | null;

export type DragOverCard =
  | { boardId: number; cardId: number; position: "above" | "below" }
  | null;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function isDragPayload(v: unknown): v is DragPayload {
  if (!isObject(v)) return false;

  if (v.type === "list") return typeof v.boardId === "number";

  if (v.type === "card")
    return typeof v.boardId === "number" && typeof v.cardId === "number";

  return false;
}

export function safeParseDragPayload(raw: string): DragPayload | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isDragPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
