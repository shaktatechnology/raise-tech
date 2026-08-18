"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useDeleteConfirmation } from "@/components/admin/DeleteConfirmation";
import {
  MAX_IMAGE_SOURCE_BYTES,
  optimizeImageForUpload,
  type ImageOptimizationOptions,
  type OptimizedImageResult,
} from "@/lib/imageCompression";

interface AdminImageFieldProps {
  label: string;
  existingImageUrl?: string | null;
  existingImageFilename?: string | null;
  existingImageAlt: string;
  selectedFile: File | null;
  onSelectFile: (file: File) => void;
  onClearSelection: () => void;
  onProcessingChange?: (processing: boolean) => void;
  onRemoveExisting?: () => void;
  onUndoRemoval?: () => void;
  isExistingMarkedForRemoval?: boolean;
  disabled?: boolean;
  error?: string;
  accept?: string;
  aspectRatioGuidance?: string;
  accent?: "cyan" | "amber" | "purple" | "pink";
  optimizationOptions?: ImageOptimizationOptions;
  previewMaxWidth?: string;
  objectFit?: "contain" | "cover";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminImageField({
  label,
  existingImageUrl,
  existingImageFilename,
  existingImageAlt,
  selectedFile,
  onSelectFile,
  onClearSelection,
  onProcessingChange,
  onRemoveExisting,
  onUndoRemoval,
  isExistingMarkedForRemoval = false,
  disabled = false,
  error,
  accept = "image/jpeg,image/png,image/webp",
  aspectRatioGuidance,
  accent = "cyan",
  optimizationOptions,
  previewMaxWidth = "max-w-md",
  objectFit = "contain",
}: AdminImageFieldProps) {
  const { confirmDelete } = useDeleteConfirmation();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRunRef = useRef(0);
  const inputId = `admin-image-${useId().replace(/:/g, "")}`;
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [existingImageFailed, setExistingImageFailed] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string>();
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizedImageResult | null>(null);

  useEffect(() => {
    // The failed state belongs to one backend URL and must reset when that URL changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExistingImageFailed(false);
  }, [existingImageUrl]);

  useEffect(() => {
    if (!selectedFile) {
      // Synchronize the controlled File prop with the browser-owned input/preview state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPreviewUrl(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(
    () => () => {
      selectionRunRef.current += 1;
      onProcessingChange?.(false);
    },
    [onProcessingChange]
  );

  const focusClasses =
    accent === "amber"
      ? "focus-visible:outline-amber-400"
      : accent === "purple"
        ? "focus-visible:outline-purple-400"
        : accent === "pink"
          ? "focus-visible:outline-pink-400"
          : "focus-visible:outline-cyan-400";
  const fieldError = optimizationError || error;

  const handleFileSelection = async (file: File) => {
    const selectionRun = selectionRunRef.current + 1;
    selectionRunRef.current = selectionRun;
    setOptimizationError(undefined);
    setOptimizationResult(null);
    setIsOptimizing(true);
    onProcessingChange?.(true);

    try {
      const result = await optimizeImageForUpload(file, optimizationOptions);
      if (selectionRunRef.current !== selectionRun) return;
      if (isExistingMarkedForRemoval) onUndoRemoval?.();
      setOptimizationResult(result);
      onSelectFile(result.file);
    } catch (selectionError) {
      if (selectionRunRef.current !== selectionRun) return;
      setOptimizationError(
        selectionError instanceof Error
          ? selectionError.message
          : "The selected image could not be optimized."
      );
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      if (selectionRunRef.current === selectionRun) {
        setIsOptimizing(false);
        onProcessingChange?.(false);
      }
    }
  };

  const handleClearSelection = () => {
    selectionRunRef.current += 1;
    setIsOptimizing(false);
    onProcessingChange?.(false);
    setOptimizationError(undefined);
    setOptimizationResult(null);
    if (inputRef.current) inputRef.current.value = "";
    onClearSelection();
  };

  const handleRemove = async () => {
    if (!onRemoveExisting) return;
    const confirmed = await confirmDelete({
      title: "Remove saved image?",
      message: "The saved image will be marked for removal and deleted after you save these changes.",
      confirmLabel: "Remove image",
    });
    if (confirmed) {
      onRemoveExisting();
    }
  };

  return (
    <fieldset
      disabled={disabled || isOptimizing}
      className="space-y-3"
      aria-busy={isOptimizing}
    >
      <legend className="block text-xs font-semibold text-slate-300">{label}</legend>
      {aspectRatioGuidance && (
        <p className="text-[11px] text-slate-500">{aspectRatioGuidance}</p>
      )}
      <p className="text-[11px] text-slate-500">
        Images up to {Math.round(MAX_IMAGE_SOURCE_BYTES / (1024 * 1024))} MB are
        automatically optimized before upload.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className={`cursor-pointer rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700 focus-within:outline-2 focus-within:outline-offset-2 ${focusClasses} peer-disabled:cursor-not-allowed`}
        >
          {isOptimizing ? "Optimizing…" : "Choose image"}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          disabled={disabled || isOptimizing}
          className="sr-only"
          aria-describedby={fieldError ? `${inputId}-error` : undefined}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void handleFileSelection(file);
          }}
        />
        <span className="text-xs text-slate-500">
          {isOptimizing
            ? "Optimizing image…"
            : selectedFile
              ? "A new image is selected below."
              : "No new image selected."}
        </span>
      </div>

      {fieldError && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-400">
          {fieldError}
        </p>
      )}

      <div>
        <section className={`w-full ${previewMaxWidth} rounded-xl border border-slate-800 bg-slate-950/60 p-3`}>
          <div className="mb-2 flex min-h-7 flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {selectedFile ? "Selected image preview" : "Current saved image"}
            </p>
            {selectedFile && (
              <button
                type="button"
                disabled={disabled}
                onClick={handleClearSelection}
                className={`rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 ${focusClasses} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Clear selection
              </button>
            )}
            {existingImageUrl &&
              !selectedFile &&
              !isExistingMarkedForRemoval &&
              onRemoveExisting && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => void handleRemove()}
                className={`rounded-lg border border-red-800/70 bg-red-950/60 px-2.5 py-1 text-[11px] font-semibold text-red-300 transition hover:bg-red-900/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Remove image
              </button>
            )}
            {existingImageUrl && isExistingMarkedForRemoval && onUndoRemoval && (
              <button
                type="button"
                disabled={disabled}
                onClick={onUndoRemoval}
                className={`rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 ${focusClasses} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Undo
              </button>
            )}
          </div>

          {(selectedFile && localPreviewUrl) || existingImageUrl ? (
            <>
              <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-center p-2">
                {selectedFile || !existingImageFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedFile && localPreviewUrl ? localPreviewUrl : existingImageUrl || ""}
                    alt={selectedFile ? `Selected preview for ${existingImageAlt}` : existingImageAlt}
                    onError={() => {
                      if (!selectedFile) setExistingImageFailed(true);
                    }}
                    className={`h-full w-full ${
                      objectFit === "cover" ? "object-cover" : "object-contain"
                    } ${
                      !selectedFile && isExistingMarkedForRemoval ? "opacity-30 grayscale" : ""
                    }`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-xs text-red-400">
                    The saved image could not be loaded.
                  </div>
                )}
                {!selectedFile && isExistingMarkedForRemoval && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-lg bg-red-950/90 px-3 py-1.5 text-xs font-bold text-red-300">
                      Marked for removal
                    </span>
                  </div>
                )}
              </div>
              {(selectedFile || existingImageFilename) && (
                <p
                  className="mt-2 truncate text-[11px] font-medium text-slate-300"
                  title={selectedFile?.name || existingImageFilename || undefined}
                >
                  {selectedFile?.name || existingImageFilename}
                </p>
              )}
              {selectedFile && (
                <p className="text-[11px] text-slate-500">{formatFileSize(selectedFile.size)}</p>
              )}
              {selectedFile && optimizationResult?.optimized && (
                <p className="mt-1 text-[11px] font-medium text-emerald-400">
                  Optimized from {formatFileSize(optimizationResult.originalSize)} to{" "}
                  {formatFileSize(selectedFile.size)} before upload.
                </p>
              )}
            </>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/50 px-4 text-center text-xs text-slate-600">
              Select an image to preview it before saving
            </div>
          )}
        </section>

      </div>
    </fieldset>
  );
}
