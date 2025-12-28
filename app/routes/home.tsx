import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "./components/Modal";

export default function Home() {
  // Boards -> Cards -> Comments
  const [boards, setBoards] = useState([
    {
      id: 1,
      title: "Todo",
      cards: [{ id: 1, title: "Review Drag & Drop", comments: [] }],
    },
  ]);

  // Add board UI
  const [addBoardOpen, setAddBoardOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  // Add card UI (per-board)
  const [addCardOpenBoardId, setAddCardOpenBoardId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  // Comments modal state
  const [openComments, setOpenComments] = useState(false);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

  // New comment input
  const [newCommentText, setNewCommentText] = useState("");

  // List actions menu state
  const [openListMenuBoardId, setOpenListMenuBoardId] = useState(null);
  const menuRef = useRef(null);

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId) ?? null,
    [boards, activeBoardId]
  );

  const activeCard = useMemo(() => {
    if (!activeBoard) return null;
    return activeBoard.cards.find((c) => c.id === activeCardId) ?? null;
  }, [activeBoard, activeCardId]);

  const formatTimestamp = (ts) => new Date(ts).toLocaleString();

  const handleCreateBoard = () => {
    const title = newBoardTitle.trim();
    if (!title) return;

    setBoards((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        cards: [], // new board starts with NO cards
      },
    ]);

    setNewBoardTitle("");
    setAddBoardOpen(false);
  };

  const handleCreateCard = (boardId) => {
    const title = newCardTitle.trim();
    if (!title) return;

    const newCard = { id: Date.now(), title, comments: [] };

    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId ? { ...b, cards: [...b.cards, newCard] } : b
      )
    );

    setNewCardTitle("");
    setAddCardOpenBoardId(null);
  };

  const handleOpenComments = (boardId, cardId) => {
    setActiveBoardId(boardId);
    setActiveCardId(cardId);
    setOpenComments(true);
    setNewCommentText("");
  };

  const handleAddComment = () => {
    const text = newCommentText.trim();
    if (!text || !activeBoardId || !activeCardId) return;

    const comment = {
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
            c.id === activeCardId
              ? { ...c, comments: [...c.comments, comment] }
              : c
          ),
        };
      })
    );

    setNewCommentText("");
  };

  // List actions handlers
  const handleDeleteList = (boardId) => {
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    setOpenListMenuBoardId(null);

    // If the deleted board was active in comments, close the modal.
    if (activeBoardId === boardId) {
      setOpenComments(false);
      setActiveBoardId(null);
      setActiveCardId(null);
    }
  };

  const handleDeleteAllCards = (boardId) => {
    setBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, cards: [] } : b))
    );
    setOpenListMenuBoardId(null);

    // If currently viewing comments from this board, close since the card may be gone.
    if (activeBoardId === boardId) {
      setOpenComments(false);
      setActiveBoardId(null);
      setActiveCardId(null);
    }
  };

  // Close menu on outside click / Escape
  useEffect(() => {
    if (!openListMenuBoardId) return;

    const onMouseDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setOpenListMenuBoardId(null);
      }
    };

    const onKeyDown = (e) => {
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
      <Modal
        open={openComments}
        onClose={() => setOpenComments(false)}
        title={`Comments for "${activeCard?.title ?? ""}"`}
        footer={
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!newCommentText.trim() || !activeBoardId || !activeCardId}
            className="w-max h-7 cursor-pointer px-4 text-sm bg-green-400 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Comment
          </button>
        }
      >
        {!activeCard || activeCard.comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activeCard.comments.map((c) => (
              <div
                key={c.id}
                className="bg-gray-50 border border-gray-200 rounded-md p-2"
              >
                <p className="text-xs text-gray-600 mb-1">
                  {c.author} · {formatTimestamp(c.createdAt)}
                </p>
                <p className="text-sm whitespace-pre-wrap">{c.text}</p>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          className="placeholder:text-sm mb-2 w-full outline-0 mt-5 border border-gray-300 rounded-md p-1"
          placeholder="Write a comment ... (Enter to send, Shift+Enter for new line)"
        />
      </Modal>

      <div className="p-4 flex flex-col gap-4">
        <p className="text-white text-xl font-bold">Demo Board</p>

        {/* Boards row */}
        <div className="flex gap-4 items-start overflow-x-auto">
          <div className="overflow-x-auto pb-24">
            {/* Actual row */}
            <div className="flex gap-4 items-start min-w-max">
              {boards.map((board) => (
                <div key={board.id} className="rounded-md bg-gray-200 p-2 w-67">
                  <div className="flex justify-between items-center mb-2 relative">
                    <p className="text-md font-semibold">{board.title}</p>

                    {/* Trigger */}
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenListMenuBoardId((prev) =>
                          prev === board.id ? null : board.id
                        );
                      }}
                      className="text-2xl font-semibold relative bottom-1 cursor-pointer select-none"
                    >
                      ...
                    </p>

                    {/* Menu */}
                    {openListMenuBoardId === board.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-8 z-50 w-52 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-2 text-sm font-semibold border-b border-gray-200">
                          List Actions
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteList(board.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          Delete list
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAllCards(board.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          Delete all cards
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cards */}
                  {board.cards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-md mb-2 bg-white p-2 flex flex-col"
                    >
                      <p className="mb-1">{card.title}</p>
                      <p
                        onClick={() => handleOpenComments(board.id, card.id)}
                        className="text-xs py-1 cursor-pointer text-gray-600 px-2 bg-gray-200 w-max rounded-md self-end"
                      >
                        Comments ({card.comments.length})
                      </p>
                    </div>
                  ))}

                  {/* Add / Create card UI (per-board) */}
                  {addCardOpenBoardId === board.id ? (
                    <>
                      <textarea
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleCreateCard(board.id);
                          }
                        }}
                        className="placeholder:text-sm mb-2 w-full outline-0 mt-5 shadow-2xl bg-white rounded-md p-1"
                        placeholder="Enter a card title ... (Enter to create)"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleCreateCard(board.id)}
                          className="w-max cursor-pointer p-2 bg-green-600 text-white rounded-md"
                        >
                          Create card
                        </button>
                        <p
                          onClick={() => {
                            setAddCardOpenBoardId(null);
                            setNewCardTitle("");
                          }}
                          className="text-2xl cursor-pointer text-gray-400 font-bold"
                        >
                          ×
                        </p>
                      </div>
                    </>
                  ) : (
                    <p
                      onClick={() => {
                        setAddCardOpenBoardId(board.id);
                        setNewCardTitle("");
                      }}
                      className="mt-5 cursor-pointer text-gray-500 px-2 py-1 hover:bg-gray-300 -m-2 rounded-b-md overflow-hidden transition duration-200 ease-in-out"
                    >
                      + Add another card
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* + Add new board */}
          {addBoardOpen ? (
            <div className="rounded-md bg-gray-200 p-2 w-67">
              <input
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateBoard();
                  }
                }}
                className="placeholder:text-sm mb-2 w-full outline-0 shadow-2xl bg-white rounded-md p-1"
                placeholder="Enter a list title ... (Enter to create)"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateBoard}
                  className="w-max cursor-pointer px-2 h-7 text-sm font-bold bg-green-600 text-white rounded-md"
                >
                  Add list
                </button>
                <p
                  onClick={() => {
                    setAddBoardOpen(false);
                    setNewBoardTitle("");
                  }}
                  className="text-2xl cursor-pointer text-gray-400 font-bold"
                >
                  ×
                </p>
              </div>
            </div>
          ) : (
            <p
              onClick={() => setAddBoardOpen(true)}
              className="cursor-pointer text-white px-2 w-67 py-1 hover:bg-blu bg-sky-800 rounded-sm transition duration-200 ease-in-out"
            >
              + Add another list
            </p>
          )}
        </div>
      </div>
    </>
  );
}
