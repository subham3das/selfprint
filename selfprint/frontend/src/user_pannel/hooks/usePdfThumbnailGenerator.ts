import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { UploadedFileInfo } from '../types/userPrint.types';

// Configure PDF.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

// Generate high-resolution authentic document page canvas (600 x 848 A4 ratio)
const generateHighResMockPageThumbnail = (pageNum: number, totalPages: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 848;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle Header Bar
  ctx.fillStyle = pageNum === 1 ? '#4F46E5' : '#F1F5F9';
  ctx.fillRect(40, 40, canvas.width - 80, pageNum === 1 ? 48 : 20);

  // Document Title
  if (pageNum === 1) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('CHAPTER ' + pageNum + ' : ARCHITECTURE & DESIGN SYSTEM', 56, 70);
  } else {
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('SECTION ' + pageNum + '.0 — SPECIFICATIONS AND PRINTER TELEMETRY', 56, 54);
  }

  // Section Heading
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`1.${pageNum} Technical Overview & Core Modules`, 40, 120);

  // Paragraph Lines
  const startY = 150;
  for (let i = 0; i < 22; i++) {
    const y = startY + i * 26;
    if (y > canvas.height - 80) break;

    if (i % 6 === 0) {
      // Sub-heading
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Module Parameter ${Math.floor(i / 6) + 1}.A: Data Flow & Routing`, 40, y);
    } else if (i % 7 === 0) {
      // Diagram or Visual Card Box
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(40, y - 6, canvas.width - 80, 60, 8);
      ctx.fill();
      ctx.stroke();

      // Colored elements inside box
      ctx.fillStyle = '#6366F1';
      ctx.beginPath();
      ctx.roundRect(56, y + 8, 80, 32, 6);
      ctx.fill();

      ctx.fillStyle = '#A5B4FC';
      ctx.beginPath();
      ctx.roundRect(148, y + 8, 120, 32, 6);
      ctx.fill();

      ctx.fillStyle = '#E0E7FF';
      ctx.beginPath();
      ctx.roundRect(280, y + 8, 160, 32, 6);
      ctx.fill();

      i += 2;
    } else {
      // Regular text simulated lines
      ctx.fillStyle = '#94A3B8';
      const lineWidth = canvas.width - 80 - ((i * 37) % 110);
      ctx.beginPath();
      ctx.roundRect(40, y + 4, lineWidth, 10, 3);
      ctx.fill();
    }
  }

  // Footer / Page Number
  ctx.fillStyle = '#94A3B8';
  ctx.font = '12px monospace';
  ctx.fillText(`— Page ${pageNum} of ${totalPages} —`, canvas.width / 2 - 60, canvas.height - 32);

  return canvas.toDataURL('image/jpeg', 0.92);
};

export const usePdfThumbnailGenerator = (file: UploadedFileInfo | null) => {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!file) {
      setThumbnails({});
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loadRealOrMockPdf = async () => {
      const totalPages = file.totalPages || 12;
      const initialMap: Record<number, string> = {};

      // If user uploaded a real PDF file
      if (file.rawFile && file.extension === 'pdf') {
        try {
          const fileData = await file.rawFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: fileData }).promise;
          pdfDocRef.current = pdf;

          const numPages = pdf.numPages;
          // Render at high crisp resolution (scale 1.8 for crystal clarity)
          const renderCount = Math.min(numPages, 50);
          for (let p = 1; p <= renderCount; p++) {
            if (!isMounted) break;
            const page = await pdf.getPage(p);
            const viewport = page.getViewport({ scale: 1.8 });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              await page.render({ canvasContext: ctx, viewport, canvas }).promise;
              initialMap[p] = canvas.toDataURL('image/jpeg', 0.9);
              if (isMounted) {
                setThumbnails((prev) => ({ ...prev, [p]: initialMap[p] }));
              }
            }
          }
        } catch (err) {
          console.warn('PDF.js high-res fallback to vector preview:', err);
          for (let p = 1; p <= totalPages; p++) {
            initialMap[p] = generateHighResMockPageThumbnail(p, totalPages);
          }
          if (isMounted) setThumbnails(initialMap);
        }
      } else {
        // High-resolution crisp mock preview
        for (let p = 1; p <= totalPages; p++) {
          initialMap[p] = generateHighResMockPageThumbnail(p, totalPages);
        }
        if (isMounted) setThumbnails(initialMap);
      }

      if (isMounted) setIsLoading(false);
    };

    loadRealOrMockPdf();

    return () => {
      isMounted = false;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
    };
  }, [file]);

  return { thumbnails, isLoading };
};
