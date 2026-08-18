"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface DeleteConfirmationOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DeleteConfirmationContextValue {
  confirmDelete: (options: DeleteConfirmationOptions) => Promise<boolean>;
}

const DeleteConfirmationContext = createContext<DeleteConfirmationContextValue | undefined>(
  undefined
);

export function DeleteConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<DeleteConfirmationOptions | null>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const closeConfirmation = useCallback((confirmed: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setRequest(null);
    resolve?.(confirmed);
  }, []);

  const confirmDelete = useCallback(
    (options: DeleteConfirmationOptions) =>
      new Promise<boolean>((resolve) => {
        resolveRef.current?.(false);
        resolveRef.current = resolve;
        setRequest(options);
      }),
    []
  );

  useEffect(() => {
    if (!request) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeConfirmation(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeConfirmation, request]);

  useEffect(
    () => () => {
      resolveRef.current?.(false);
      resolveRef.current = null;
    },
    []
  );

  return (
    <DeleteConfirmationContext.Provider value={{ confirmDelete }}>
      {children}
      {request && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeConfirmation(false);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirmation-title"
            aria-describedby="delete-confirmation-message"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 4h.01M10.3 3.8 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.8a2 2 0 0 0-3.4 0Z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 id="delete-confirmation-title" className="text-lg font-bold text-white">
                  {request.title || "Confirm deletion"}
                </h2>
                <p id="delete-confirmation-message" className="mt-2 text-sm leading-6 text-slate-400">
                  {request.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => closeConfirmation(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              >
                {request.cancelLabel || "Cancel"}
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={() => closeConfirmation(true)}
                className="rounded-xl border border-red-700 bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
              >
                {request.confirmLabel || "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </DeleteConfirmationContext.Provider>
  );
}

export function useDeleteConfirmation(): DeleteConfirmationContextValue {
  const context = useContext(DeleteConfirmationContext);
  if (!context) {
    throw new Error("useDeleteConfirmation must be used within DeleteConfirmationProvider");
  }
  return context;
}
