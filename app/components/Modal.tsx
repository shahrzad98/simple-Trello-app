import React, { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children: ReactNode;
  /**
   * - undefined: show default footer
   * - null/false: hide footer entirely
   * - ReactNode: render custom footer
   */
  footer?: ReactNode | null | false;
};

export default function Modal({
  open,
  onClose,
  title = "Modal title",
  children,
  footer,
}: ModalProps) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const showFooter = footer !== null && footer !== false;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <h2 id="modal-title" className="text-md text-gray-600">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 text-gray-700">{children}</div>

        {showFooter && (
          <div className="flex justify-end gap-3 px-6 py-4">
            {footer !== undefined ? (
              footer
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Confirm
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
