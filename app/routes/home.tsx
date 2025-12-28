"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Board, Card, Comment, DragOverCard, DragOverList, DragPayload } from "./types";
import CommentsModal from "./components/CommentsModal";
import BoardColumn from "./components/BoardColumn";
import AddListComposer from "./components/AddListComposer";
import { safeParseDragPayload } from "./types";

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([
    { id: 1, title: "Todo", cards: [{ id: 1, title: "Review Drag & Drop", comments: [] }] },
  ]);

  // Add board UI
  const [addBoardOpen, setAddBoardOpen] = useState<boolean>(false);
  const [newBoardTitle, setNewBoardTitle] = useState<string>("");

  // Add card UI (per-board)
  const [addCardOpenBoardId, setAddCardOpenBoardId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState<string>("");

  // Comments modal state
  const [openComments, setOpenComments] = useState<boolean>(false);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);

  // New comment input
  const [newCommentText, setNewCommentText] = useState<string>("");

  // List actions menu state
  const [openListMenuBoardId, setOpenListMenuBoardId] = useState<number | null>(null);
  const menuElRef = useRef<HTMLDivElement | null>(null);

  // Drag & Drop state
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [dragOverList, setDragOverList] = useState<DragOverList>(null);
  const [dragOverCard, setDragOverCard] = useState<DragOverCard>(null);

  const activeBoard = useMemo<Board | null>(
    () => boards.find((b) => b.id === activeBoardId) ?? null,
    [boards, activeBoardId]
  );

  const activeCard = useMemo<Card | null>(() => {
    if (!activeBoard) return null;
    return activeBoard.cards.find((c) => c.id === activeCardId) ?? null;
  }, [activeBoard, activeCardId]);

  const formatTimestamp = (ts: number): string => new Date(ts).toLocaleString();

  const clearDragUi = (): void => {
    setDragOverList(null);
    setDragOverCard(null);
  };

  // ---------------------------
  // CRUD
  // ---------------------------
  const handleCreateBoard = (): void => {
    const title = newBoardTitle.trim();
    if (!title) return;

    setBoards((prev) => [...prev, { id: Date.now(), title, cards: [] }]);
    setNewBoardTitle("");
    setAddBoardOpen(false);
  };

  const handleCreateCard = (boardId: number): void => {
    const title = newCardTitle.trim();
    if (!title) return;

    const newCard: Card = { id: Date.now(), title, comments: [] };

    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, cards: [...b.cards, newCard] } : b))
    );

    setNewCardTitle("");
    setAddCardOpenBoardId(null);
  };

  const handleOpenComments = (boardId: number, cardId: number): void => {
    setActiveBoardId(boardId);
    setActiveCardId(cardId);
    setOpenComments(true);
    setNewCommentText("");
  };

  const handleAddComment = (): void => {
    const text = newCommentText.trim();
    if (!text || activeBoardId == null || activeCardId == null) return;

    const comment: Comment = {
      id: Date.now(),
      author: "You",
      createdAt: Date.now(),
      text,
    };

    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== activeBoardId) return b;
        return {
          ...b,
          cards: b.cards.map((c) =>
            c.id === activeCardId ? { ...c, comments: [...c.comments, comment] } : c
          ),
        };
      })
    );

    setNewCommentText("");
  };

  const handleDeleteList = (boardId: number): void => {
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    setOpenListMenuBoardId(null);

    if (activeBoardId === boardId) {
      setOpenComments(false);
      setActiveBoardId(null);
      setActiveCardId(null);
    }
  };

  const handleDeleteAllCards = (boardId: number): void => {
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, cards: [] } : b)));
    setOpenListMenuBoardId(null);

    if (activeBoardId === boardId) {
      setOpenComments(false);
      setActiveBoardId(null);
      setActiveCardId(null);
    }
  };

  // ---------------------------
  // Reorder helpers
  // ---------------------------
  const reorderBoards = (sourceBoardId: number, targetBoardId: number, insertAfter: boolean): void => {
    setBoards((prev) => {
      const fromIndex = prev.findIndex((b) => b.id === sourceBoardId);
      const toIndexBase = prev.findIndex((b) => b.id === targetBoardId);
      if (fromIndex < 0 || toIndexBase < 0) return prev;
      if (fromIndex === toIndexBase) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);

      let insertIndex = toIndexBase + (insertAfter ? 1 : 0);
      if (fromIndex < insertIndex) insertIndex -= 1;

      insertIndex = Math.max(0, Math.min(insertIndex, next.length));
      next.splice(insertIndex, 0, moved);
      return next;
    });
  };

  const moveCardToIndex = (
    sourceBoardId: number,
    cardId: number,
    targetBoardId: number,
    targetIndex: number
  ): void => {
    setBoards((prev) => {
      const sourceBoardIndex = prev.findIndex((b) => b.id === sourceBoardId);
      const targetBoardIndex = prev.findIndex((b) => b.id === targetBoardId);
      if (sourceBoardIndex < 0 || targetBoardIndex < 0) return prev;

      const fromCardIndex = prev[sourceBoardIndex].cards.findIndex((c) => c.id === cardId);
      if (fromCardIndex < 0) return prev;

      const next: Board[] = prev.map((b) => ({ ...b, cards: [...b.cards] }));
      const [movedCard] = next[sourceBoardIndex].cards.splice(fromCardIndex, 1);

      let insertIndex = targetIndex;
      if (sourceBoardId === targetBoardId && fromCardIndex < insertIndex) insertIndex -= 1;

      insertIndex = Math.max(0, Math.min(insertIndex, next[targetBoardIndex].cards.length));
      next[targetBoardIndex].cards.splice(insertIndex, 0, movedCard);

      if (activeCardId === cardId && sourceBoardId !== targetBoardId) {
        setActiveBoardId(targetBoardId);
      }

      return next;
    });
  };

  // ---------------------------
  // DnD: start/end
  // ---------------------------
  const handleDragStartList = (e: React.DragEvent<HTMLSpanElement>, boardId: number): void => {
    const payload: DragPayload = { type: "list", boardId };
    setDragging(payload);
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragStartCard = (
    e: React.DragEvent<HTMLDivElement>,
    boardId: number,
    cardId: number
  ): void => {
    const payload: DragPayload = { type: "card", boardId, cardId };
    setDragging(payload);
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEndAny = (): void => {
    setDragging(null);
    clearDragUi();
  };

  // ---------------------------
  // DnD: list container
  // ---------------------------
  const handleDragOverListContainer = (e: React.DragEvent<HTMLDivElement>, targetBoardId: number): void => {
    if (!dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (dragging.type === "list") {
      const rect = e.currentTarget.getBoundingClientRect();
      const isRight = e.clientX > rect.left + rect.width / 2;
      setDragOverList({ boardId: targetBoardId, side: isRight ? "right" : "left" });
      setDragOverCard(null);
    } else {
      setDragOverList({ boardId: targetBoardId, side: "left" });
    }
  };

  const handleDropOnListContainer = (e: React.DragEvent<HTMLDivElement>, targetBoardId: number): void => {
    e.preventDefault();

    const raw =
      e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");

    const payload = safeParseDragPayload(raw) ?? dragging;
    if (!payload) return;

    if (payload.type === "list") {
      const rect = e.currentTarget.getBoundingClientRect();
      const insertAfter = e.clientX > rect.left + rect.width / 2;
      reorderBoards(payload.boardId, targetBoardId, insertAfter);
    }

    if (payload.type === "card") {
      const targetBoard = boards.find((b) => b.id === targetBoardId);
      const endIndex = targetBoard ? targetBoard.cards.length : 0;
      moveCardToIndex(payload.boardId, payload.cardId, targetBoardId, endIndex);
    }

    clearDragUi();
  };

  const handleDragLeaveListContainer = (e: React.DragEvent<HTMLDivElement>, targetBoardId: number): void => {
    const next = e.relatedTarget as Node | null;
    if (!next || !e.currentTarget.contains(next)) {
      setDragOverList((prev) => (prev?.boardId === targetBoardId ? null : prev));
    }
  };

  // ---------------------------
  // DnD: card targets
  // ---------------------------
  const handleDragOverCardTarget = (
    e: React.DragEvent<HTMLDivElement>,
    targetBoardId: number,
    targetCardId: number
  ): void => {
    if (!dragging || dragging.type !== "card") return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const isBelow = e.clientY > rect.top + rect.height / 2;

    setDragOverCard({
      boardId: targetBoardId,
      cardId: targetCardId,
      position: isBelow ? "below" : "above",
    });

    if (dragOverList) setDragOverList(null);
  };

  const handleDropOnCardTarget = (
    e: React.DragEvent<HTMLDivElement>,
    targetBoardId: number,
    targetCardId: number
  ): void => {
    e.preventDefault();
    e.stopPropagation();

    const raw =
      e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");

    const payload = safeParseDragPayload(raw) ?? dragging;
    if (!payload || payload.type !== "card") return;

    const targetBoard = boards.find((b) => b.id === targetBoardId);
    if (!targetBoard) return;

    const targetIdx = targetBoard.cards.findIndex((c) => c.id === targetCardId);
    if (targetIdx < 0) return;

    const insertAfter = dragOverCard?.position === "below";
    const insertIndex = targetIdx + (insertAfter ? 1 : 0);

    moveCardToIndex(payload.boardId, payload.cardId, targetBoardId, insertIndex);
    clearDragUi();
  };

  // End zone
  const handleDragOverListEndZone = (e: React.DragEvent<HTMLDivElement>, targetBoardId: number): void => {
    if (!dragging || dragging.type !== "card") return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverCard(null);
    setDragOverList({ boardId: targetBoardId, side: "left" });
  };

  const handleDropOnListEndZone = (e: React.DragEvent<HTMLDivElement>, targetBoardId: number): void => {
    e.preventDefault();
    e.stopPropagation();

    const raw =
      e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");

    const payload = safeParseDragPayload(raw) ?? dragging;
    if (!payload || payload.type !== "card") return;

    const targetBoard = boards.find((b) => b.id === targetBoardId);
    const endIndex = targetBoard ? targetBoard.cards.length : 0;

    moveCardToIndex(payload.boardId, payload.cardId, targetBoardId, endIndex);
    clearDragUi();
  };

  // ---------------------------
  // Menu outside-click / Escape
  // ---------------------------
  useEffect(() => {
    if (openListMenuBoardId == null) return;

    const onMouseDown = (e: MouseEvent) => {
      const el = menuElRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpenListMenuBoardId(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenListMenuBoardId(null);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openListMenuBoardId]);

  if (typeof document === "undefined") return null;

  return (
    <>
      <CommentsModal
        open={openComments}
        onClose={() => setOpenComments(false)}
        cardTitle={activeCard?.title ?? ""}
        comments={activeCard?.comments ?? []}
        newCommentText={newCommentText}
        onChangeNewCommentText={setNewCommentText}
        onAddComment={handleAddComment}
        canSubmit={!!newCommentText.trim() && activeBoardId != null && activeCardId != null}
        formatTimestamp={formatTimestamp}
      />

      <div className="p-4 flex flex-col gap-4">
        <p className="text-white text-xl font-bold">Demo Board</p>

        <div className="flex gap-4 items-start overflow-x-auto">
          <div className="overflow-x-auto pb-24">
            <div className="flex gap-4 items-start min-w-max">
              {boards.map((board) => (
                <BoardColumn
                  key={board.id}
                  board={board}
                  dragging={dragging}
                  dragOverList={dragOverList}
                  dragOverCard={dragOverCard}
                  onDragStartList={handleDragStartList}
                  onDragEndAny={handleDragEndAny}
                  onDragOverListContainer={handleDragOverListContainer}
                  onDropOnListContainer={handleDropOnListContainer}
                  onDragLeaveListContainer={handleDragLeaveListContainer}
                  onDragStartCard={handleDragStartCard}
                  onDragOverCardTarget={handleDragOverCardTarget}
                  onDropOnCardTarget={handleDropOnCardTarget}
                  onDragOverListEndZone={handleDragOverListEndZone}
                  onDropOnListEndZone={handleDropOnListEndZone}
                  onOpenComments={handleOpenComments}
                  isMenuOpen={openListMenuBoardId === board.id}
                  onToggleMenu={() =>
                    setOpenListMenuBoardId((prev) => (prev === board.id ? null : board.id))
                  }
                  onDeleteList={() => handleDeleteList(board.id)}
                  onDeleteAllCards={() => handleDeleteAllCards(board.id)}
                  setMenuEl={(el) => {
                    menuElRef.current = el;
                  }}
                  isAddCardOpen={addCardOpenBoardId === board.id}
                  newCardTitle={newCardTitle}
                  onOpenAddCard={() => {
                    setAddCardOpenBoardId(board.id);
                    setNewCardTitle("");
                  }}
                  onCancelAddCard={() => {
                    setAddCardOpenBoardId(null);
                    setNewCardTitle("");
                  }}
                  onChangeNewCardTitle={setNewCardTitle}
                  onCreateCard={() => handleCreateCard(board.id)}
                />
              ))}
            </div>
          </div>

          <AddListComposer
            isOpen={addBoardOpen}
            value={newBoardTitle}
            onOpen={() => setAddBoardOpen(true)}
            onCancel={() => {
              setAddBoardOpen(false);
              setNewBoardTitle("");
            }}
            onChange={setNewBoardTitle}
            onCreate={handleCreateBoard}
          />
        </div>
      </div>
    </>
  );
}
