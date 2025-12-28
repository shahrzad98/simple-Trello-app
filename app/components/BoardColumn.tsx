import React from "react";
import type {
  Board,
  DragOverCard,
  DragOverList,
  DragPayload,
} from "../routes/types";
import ListActionsMenu from "./ListActionsMenu";
import CardItem from "./CardItem";
import AddCardComposer from "./AddCardComposer";

type Props = {
  board: Board;

  // Menu
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onDeleteList: () => void;
  onDeleteAllCards: () => void;
  setMenuEl: (el: HTMLDivElement | null) => void;

  // List DnD
  dragging: DragPayload | null;
  dragOverList: DragOverList;
  dragOverCard: DragOverCard;

  onDragStartList: (
    e: React.DragEvent<HTMLSpanElement>,
    boardId: number
  ) => void;
  onDragEndAny: () => void;

  onDragOverListContainer: (
    e: React.DragEvent<HTMLDivElement>,
    targetBoardId: number
  ) => void;
  onDropOnListContainer: (
    e: React.DragEvent<HTMLDivElement>,
    targetBoardId: number
  ) => void;
  onDragLeaveListContainer: (
    e: React.DragEvent<HTMLDivElement>,
    targetBoardId: number
  ) => void;

  // Card DnD
  onDragStartCard: (
    e: React.DragEvent<HTMLDivElement>,
    boardId: number,
    cardId: number
  ) => void;
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

  // End zone
  onDragOverListEndZone: (
    e: React.DragEvent<HTMLDivElement>,
    targetBoardId: number
  ) => void;
  onDropOnListEndZone: (
    e: React.DragEvent<HTMLDivElement>,
    targetBoardId: number
  ) => void;

  // Comments
  onOpenComments: (boardId: number, cardId: number) => void;

  // Add card UI
  isAddCardOpen: boolean;
  newCardTitle: string;
  onOpenAddCard: () => void;
  onCancelAddCard: () => void;
  onChangeNewCardTitle: (v: string) => void;
  onCreateCard: () => void;
};

export default function BoardColumn({
  board,

  isMenuOpen,
  onToggleMenu,
  onDeleteList,
  onDeleteAllCards,
  setMenuEl,

  dragging,
  dragOverList,
  dragOverCard,

  onDragStartList,
  onDragEndAny,

  onDragOverListContainer,
  onDropOnListContainer,
  onDragLeaveListContainer,

  onDragStartCard,
  onDragOverCardTarget,
  onDropOnCardTarget,

  onDragOverListEndZone,
  onDropOnListEndZone,

  onOpenComments,

  isAddCardOpen,
  newCardTitle,
  onOpenAddCard,
  onCancelAddCard,
  onChangeNewCardTitle,
  onCreateCard,
}: Props) {
  const isListDragOver = dragOverList?.boardId === board.id;
  const listInsertSide = dragOverList?.side;

  return (
    <div
      onDragOver={(e) => onDragOverListContainer(e, board.id)}
      onDrop={(e) => onDropOnListContainer(e, board.id)}
      onDragLeave={(e) => onDragLeaveListContainer(e, board.id)}
      className={[
        "rounded-md bg-gray-200 p-2 w-67 relative",
        isListDragOver ? "ring-2 ring-sky-500" : "",
      ].join(" ")}
    >
      {/* List reorder indicator (left/right) when dragging lists */}
      {dragging?.type === "list" && isListDragOver && (
        <div
          className={[
            "absolute top-0 bottom-0 w-1 bg-sky-500",
            listInsertSide === "right" ? "right-0" : "left-0",
          ].join(" ")}
        />
      )}

      <div className="flex justify-between items-center mb-2 relative">
        <div className="flex items-center gap-2">
          {/* Drag handle for entire list */}
          <span
            draggable
            onDragStart={(e) => onDragStartList(e, board.id)}
            onDragEnd={onDragEndAny}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab select-none text-gray-700 font-bold"
            title="Drag list"
          >
            ≡
          </span>

          <p className="text-md font-semibold">{board.title}</p>
        </div>

        {/* Trigger */}
        <p
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu();
          }}
          className="text-2xl font-semibold relative bottom-1 cursor-pointer select-none"
        >
          ...
        </p>

        {isMenuOpen && (
          <ListActionsMenu
            containerRef={setMenuEl}
            onDeleteList={onDeleteList}
            onDeleteAllCards={onDeleteAllCards}
          />
        )}
      </div>

      {/* Cards */}
      {board.cards.map((card) => (
        <CardItem
          key={card.id}
          boardId={board.id}
          card={card}
          dragging={dragging}
          dragOverCard={dragOverCard}
          onDragStartCard={onDragStartCard}
          onDragEndAny={onDragEndAny}
          onDragOverCardTarget={onDragOverCardTarget}
          onDropOnCardTarget={onDropOnCardTarget}
          onOpenComments={onOpenComments}
        />
      ))}

      {/* End drop zone */}
      <div
        onDragOver={(e) => onDragOverListEndZone(e, board.id)}
        onDrop={(e) => onDropOnListEndZone(e, board.id)}
        className={[
          "rounded-md p-2 mt-1",
          dragging?.type === "card"
            ? "border border-dashed border-gray-400"
            : "border border-transparent",
        ].join(" ")}
      >
        {dragging?.type === "card" ? (
          <p className="text-xs text-gray-600 select-none">
            Drop here to place at the end
          </p>
        ) : null}
      </div>

      {/* Add card */}
      <AddCardComposer
        isOpen={isAddCardOpen}
        value={newCardTitle}
        onOpen={onOpenAddCard}
        onCancel={onCancelAddCard}
        onChange={onChangeNewCardTitle}
        onCreate={onCreateCard}
      />
    </div>
  );
}
