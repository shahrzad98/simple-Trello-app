import React from "react";
import type { Card, DragOverCard, DragPayload } from "../types";

type Props = {
  boardId: number;
  card: Card;

  dragging: DragPayload | null;
  dragOverCard: DragOverCard;

  onDragStartCard: (e: React.DragEvent<HTMLDivElement>, boardId: number, cardId: number) => void;
  onDragEndAny: () => void;

  onDragOverCardTarget: (
    e: React.DragEvent<HTMLDivElement>,
    targetBoardId: number,
    targetCardId: number
  ) => void;

  onDropOnCardTarget: (
    e: React.DragEvent<HTMLDivElement>,
    targetBoardId: number,
    targetCardId: number
  ) => void;

  onOpenComments: (boardId: number, cardId: number) => void;
};

export default function CardItem({
  boardId,
  card,
  dragging,
  dragOverCard,
  onDragStartCard,
  onDragEndAny,
  onDragOverCardTarget,
  onDropOnCardTarget,
  onOpenComments,
}: Props) {
  const isDraggingThisCard =
    dragging?.type === "card" &&
    dragging.boardId === boardId &&
    dragging.cardId === card.id;

  const isOverThisCard =
    dragOverCard?.boardId === boardId && dragOverCard?.cardId === card.id;

  const dropLineClass = isOverThisCard
    ? dragOverCard.position === "above"
      ? "border-t-4 border-sky-500"
      : "border-b-4 border-sky-500"
    : "border border-transparent";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStartCard(e, boardId, card.id)}
      onDragEnd={onDragEndAny}
      onDragOver={(e) => onDragOverCardTarget(e, boardId, card.id)}
      onDrop={(e) => onDropOnCardTarget(e, boardId, card.id)}
      className={["rounded-md mb-2 bg-white p-2 flex flex-col", dropLineClass].join(" ")}
      style={{ opacity: isDraggingThisCard ? 0.6 : 1 }}
    >
      <p className="mb-1">{card.title}</p>
      <p
        onClick={() => onOpenComments(boardId, card.id)}
        className="text-xs py-1 cursor-pointer text-gray-600 px-2 bg-gray-200 w-max rounded-md self-end"
      >
        Comments ({card.comments.length})
      </p>
    </div>
  );
}
