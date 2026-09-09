import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  ExternalLink
} from 'lucide-react';
import { UploadedFileInfo } from '../types/userPrint.types';

interface DocumentUploadZoneProps {
  file: UploadedFileInfo | null;
  onFileSelect: (file: UploadedFileInfo) => void;
  onFileRemove: () => void;
  onOpenPreview?: () => void;
  pageSummaryBadge?: string;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  file,
  onFileSelect,
  onFileRemove,
  onOpenPreview,
  pageSummaryBadge
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];

    const extension = selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf';
    // Estimate or mock page count based on file size/type
    const estimatedPages =
      extension === 'pdf'
        ? Math.max(1, Math.min(50, Math.round(selectedFile.size / 100000) || 12))
        : 1;

    const newFileInfo: UploadedFileInfo = {
      id: `file-${Date.now()}`,
      name: selectedFile.name,
      size: selectedFile.size,
      formattedSize: formatFileSize(selectedFile.size),
      type: selectedFile.type,
      extension: extension,
      totalPages: estimatedPages,
      rawFile: selectedFile
    };

    onFileSelect(newFileInfo);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const getFileBadge = (extension: string) => {
    const ext = extension.toLowerCase();
    if (ext === 'pdf') {
      return (
        <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex flex-col items-center justify-center font-bold text-[9px] tracking-tight uppercase shadow-xs shrink-0">
          <FileText className="w-4 h-4 mb-0.5" />
          <span>PDF</span>
        </div>
      );
    }
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      return (
        <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex flex-col items-center justify-center font-bold text-[9px] tracking-tight uppercase shadow-xs shrink-0">
          <ImageIcon className="w-4 h-4 mb-0.5" />
          <span>IMG</span>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex flex-col items-center justify-center font-bold text-[9px] tracking-tight uppercase shadow-xs shrink-0">
        <FileText className="w-4 h-4 mb-0.5" />
        <span>DOC</span>
      </div>
    );
  };

  return (
    <div className="w-full space-y-2.5 sm:space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Large Dashed Upload Box matching user_ui.png */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full rounded-3xl border-2 border-dashed p-5 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? 'border-indigo-600 bg-indigo-50/60 scale-[1.01]'
            : 'border-indigo-200/80 bg-indigo-50/25 hover:bg-indigo-50/50 hover:border-indigo-400'
        }`}
      >
        {/* Solid Indigo Circle Upload Icon */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 mb-2.5 sm:mb-3 transition-transform group-hover:scale-105 shrink-0">
          <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
        </div>

        <p className="text-xs sm:text-sm font-bold text-indigo-600 tracking-tight">
          Tap to Upload
        </p>
        <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">
          PDF, JPG, PNG allowed
        </p>
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-0.5">
          Max file size 10MB
        </p>
      </div>

      {/* Uploaded File Card with Tap to Preview Trigger */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            onClick={onOpenPreview}
            className="w-full rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-2.5 sm:gap-3 overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.99] group"
          >
            {/* File Icon & Details */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              {getFileBadge(file.extension)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {file.name}
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/80 flex items-center gap-1 shrink-0">
                    <span>Tap to Preview</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                  {file.formattedSize} &bull; {file.totalPages} pages {pageSummaryBadge ? `(${pageSummaryBadge})` : ''}
                </p>
              </div>
            </div>

            {/* Remove Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              title="Remove File"
              aria-label="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
