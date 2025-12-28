import { useState } from "react";
import Modal from "./components/Modal";

export default function Home() {
  const [addCardOpen, setAddCardOpen] = useState(false);
   const [openComments, setOpenComments] = useState(false);
  return (
    <>
      <Modal
        open={openComments}
        onClose={() => setOpenComments(false)}
        title="Simple Modal"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenComments(false)}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              onClick={() => setOpenComments(false)}
            >
              Done
            </button>
          </>
        }
      >
        <p>Modal content goes here.</p>
      </Modal>

      <div className="p-4 flex flex-col gap-4">
        <p className="text-white text-xl font-bold">Demo Board</p>
        <div className="rounded-md bg-gray-200 p-2 w-67">
          <div className="flex  justify-between items-center mb-2">
            <p className="text-md font-semibold">Todo</p>
            <p className="text-2xl font-semibold relative bottom-1">...</p>
          </div>
          <div className="rounded-md mb-2 bg-white p-2 flex flex-col">
            <p className="mb-1">Review Drag & Drop </p>
            <p className="text-xs py-1 text-gray-600 px-2 bg-gray-200 w-max rounded-md self-end">
              Comments(0)
            </p>
          </div>
          <div className="rounded-md mb-2 bg-white p-2 flex flex-col">
            <p className="mb-1">Review Drag & Drop </p>
            <p
            onClick={()=>setOpenComments(true)}
            className="text-xs py-1 cursor-pointer text-gray-600 px-2 bg-gray-200 w-max rounded-md self-end">
              Comments(0)
            </p>
          </div>
          {addCardOpen ? (
            <>
              <textarea
                className="placeholder:text-sm  mb-2 w-full outline-0 mt-5 shadow-2xl bg-white rounded-md p-1"
                placeholder="Enter a card title ..."
              ></textarea>
              <div className="flex items-center gap-3">
                <button className="w-max cursor-pointer p-2 bg-green-600 text-white rounded-md">
                  Create card
                </button>
                <p
                  onClick={() => setAddCardOpen(false)}
                  className="text-2xl cursor-pointer text-gray-400 font-bold"
                >
                  ×
                </p>
              </div>
            </>
          ) : (
            <p
              onClick={() => setAddCardOpen(true)}
              className="mt-5 cursor-pointer text-gray-500 px-2 py-1 hover:bg-gray-300 -m-2 rounded-b-md overflow-hidden transition duration-200 ease-in-out"
            >
              + Add another card
            </p>
          )}
        </div>
      </div>
    </>
  );
}
