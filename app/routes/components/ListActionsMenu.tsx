import React from "react";

type Props = {
  onDeleteList: () => void;
  onDeleteAllCards: () => void;
  containerRef?: (el: HTMLDivElement | null) => void;
};

export default function ListActionsMenu({
  onDeleteList,
  onDeleteAllCards,
  containerRef,
}: Props) {
  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-8 z-50 w-52 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-sm font-semibold border-b border-gray-200">
        List Actions
      </div>

      <button
        type="button"
        onClick={onDeleteList}
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
      >
        Delete list
      </button>

      <button
        type="button"
        onClick={onDeleteAllCards}
        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
      >
        Delete all cards
      </button>
    </div>
  );
}
