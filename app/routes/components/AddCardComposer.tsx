import React from "react";

type Props = {
  isOpen: boolean;
  value: string;

  onOpen: () => void;
  onCancel: () => void;

  onChange: (v: string) => void;
  onCreate: () => void;
};

export default function AddCardComposer({
  isOpen,
  value,
  onOpen,
  onCancel,
  onChange,
  onCreate,
}: Props) {
  if (!isOpen) {
    return (
      <p
        onClick={onOpen}
        className="mt-5 cursor-pointer text-gray-500 px-2 py-1 hover:bg-gray-300 -m-2 rounded-b-md overflow-hidden transition duration-200 ease-in-out"
      >
        + Add another card
      </p>
    );
  }

  return (
    <>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onCreate();
          }
        }}
        className="placeholder:text-sm mb-2 w-full outline-0 mt-5 shadow-2xl bg-white rounded-md p-1"
        placeholder="Enter a card title ... (Enter to create)"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="w-max cursor-pointer p-2 bg-green-600 text-white rounded-md"
        >
          Create card
        </button>
        <p
          onClick={onCancel}
          className="text-2xl cursor-pointer text-gray-400 font-bold"
        >
          ×
        </p>
      </div>
    </>
  );
}
