import React from "react";

type Props = {
  isOpen: boolean;
  value: string;

  onOpen: () => void;
  onCancel: () => void;

  onChange: (v: string) => void;
  onCreate: () => void;
};

export default function AddListComposer({
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
        className="cursor-pointer text-white px-2 w-67 py-1 hover:bg-blu bg-sky-800 rounded-sm transition duration-200 ease-in-out"
      >
        + Add another list
      </p>
    );
  }

  return (
    <div className="rounded-md bg-gray-200 p-2 w-67">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onCreate();
          }
        }}
        className="placeholder:text-sm mb-2 w-full outline-0 shadow-2xl bg-white rounded-md p-1"
        placeholder="Enter a list title ... (Enter to create)"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="w-max cursor-pointer px-2 h-7 text-sm font-bold bg-green-600 text-white rounded-md"
        >
          Add list
        </button>
        <p
          onClick={onCancel}
          className="text-2xl cursor-pointer text-gray-400 font-bold"
        >
          ×
        </p>
      </div>
    </div>
  );
}
