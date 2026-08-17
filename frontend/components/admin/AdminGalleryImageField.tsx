"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import {
  MAX_IMAGE_SOURCE_BYTES,
  optimizeImageForUpload,
  type ImageOptimizationOptions,
  type OptimizedImageResult,
} from "@/lib/imageCompression";

interface AdminGalleryImageFieldProps {
  selectedFiles: File[];
  onChange: (files: File[]) => void;
  onProcessingChange?: (processing: boolean) => void;
  disabled?: boolean;
  error?: string;
  maxFiles?: number;
  optimizationOptions?: ImageOptimizationOptions;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function GalleryPreview({
  file,
  result,
  disabled,
  onRemove,
}: {
  file: File;
  result?: OptimizedImageResult;
  disabled: boolean;
  onRemove: () => void;
}) {
  const [previewUrl] = useState(() => URL.createObjectURL(file));

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt={file.name} className="aspect-square w-full object-cover" />
      <div className="space-y-0.5 p-2">
        <p className="truncate text-[11px] font-medium text-slate-300" title={file.name}>
          {file.name}
        </p>
        <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
        {result?.optimized && (
          <p className="text-[10px] font-medium text-emerald-400">
            From {formatFileSize(result.originalSize)}
          </p>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="mt-1 w-full rounded-lg border border-red-900/60 bg-red-950/50 px-2 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-900/70 disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </article>
  );
}

export default function AdminGalleryImageField({
  selectedFiles,
  onChange,
  onProcessingChange,
  disabled = false,
  error,
  maxFiles = 12,
  optimizationOptions,
}: AdminGalleryImageFieldProps) {
  const inputId = `admin-gallery-${useId().replace(/:/g, "")}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRunRef = useRef(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string>();
  const [optimizationResults, setOptimizationResults] = useState(
    () => new Map<File, OptimizedImageResult>()
  );

  useEffect(
    () => () => {
      selectionRunRef.current += 1;
      onProcessingChange?.(false);
    },
    [onProcessingChange]
  );

  const handleSelection = async (files: FileList) => {
    if (selectedFiles.length + files.length > maxFiles) {
      setOptimizationError(`Choose no more than ${maxFiles} new gallery images.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const selectionRun = selectionRunRef.current + 1;
    selectionRunRef.current = selectionRun;
    setOptimizationError(undefined);
    setIsOptimizing(true);
    onProcessingChange?.(true);

    try {
      const optimizedFiles: File[] = [];
      const completedResults = new Map<File, OptimizedImageResult>();

      // Run sequentially to avoid decoding several large images into memory at once.
      for (const sourceFile of Array.from(files)) {
        const result = await optimizeImageForUpload(sourceFile, optimizationOptions);
        if (selectionRunRef.current !== selectionRun) return;
        completedResults.set(result.file, result);
        optimizedFiles.push(result.file);
      }

      setOptimizationResults((current) => {
        const next = new Map(current);
        completedResults.forEach((result, file) => next.set(file, result));
        return next;
      });
      onChange([...selectedFiles, ...optimizedFiles]);
    } catch (selectionError: unknown) {
      if (selectionRunRef.current !== selectionRun) return;
      setOptimizationError(
        selectionError instanceof Error
          ? selectionError.message
          : "The selected gallery images could not be optimized."
      );
    } finally {
      if (selectionRunRef.current === selectionRun) {
        setIsOptimizing(false);
        onProcessingChange?.(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  };

  const fieldError = optimizationError || error;

  return (
    <fieldset disabled={disabled || isOptimizing} className="space-y-3" aria-busy={isOptimizing}>
      <legend className="text-xs font-semibold text-slate-300">New gallery images</legend>
      <p className="text-[11px] text-slate-500">
        Select up to {maxFiles} JPEG, PNG, or WebP images. Each source can be up to{" "}
        {Math.round(MAX_IMAGE_SOURCE_BYTES / (1024 * 1024))} MB and is optimized before upload.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cyan-400"
        >
          {isOptimizing ? "Optimizing images..." : "Choose gallery images"}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || isOptimizing}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) void handleSelection(event.target.files);
          }}
        />
        <span className="text-[11px] text-slate-500">
          {selectedFiles.length
            ? `${selectedFiles.length} new image${selectedFiles.length === 1 ? "" : "s"} ready.`
            : "No new gallery images selected."}
        </span>
        {selectedFiles.length > 0 && (
          <button
            type="button"
            disabled={disabled || isOptimizing}
            onClick={() => onChange([])}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
          >
            Clear all
          </button>
        )}
      </div>

      {fieldError && <p className="text-xs text-red-400">{fieldError}</p>}

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {selectedFiles.map((file, index) => (
            <GalleryPreview
              key={`${file.name}-${file.lastModified}-${file.size}-${index}`}
              file={file}
              result={optimizationResults.get(file)}
              disabled={disabled || isOptimizing}
              onRemove={() => onChange(selectedFiles.filter((_, fileIndex) => fileIndex !== index))}
            />
          ))}
        </div>
      )}
    </fieldset>
  );
}
