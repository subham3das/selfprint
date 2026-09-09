import React, { useEffect, useRef, useCallback } from 'react';

interface PrinterFramePlayerProps {
  totalPages: number;
  currentPage: number;
  isPrinting: boolean;
  onPageCycleFinished: (completedPage: number) => void;
  onAllPagesFinished: () => void;
  cycleDurationMs?: number; // Duration of one page print cycle in ms (default 2400ms)
}

export const PrinterFramePlayer: React.FC<PrinterFramePlayerProps> = ({
  totalPages,
  currentPage,
  isPrinting,
  onPageCycleFinished,
  onAllPagesFinished,
  cycleDurationMs = 2400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const animationFrameIdRef = useRef<number | null>(null);
  const cycleStartTimeRef = useRef<number>(0);
  const activePageRef = useRef<number>(currentPage);

  // Helper to format frame path
  const getFramePath = useCallback((frameNum: number) => {
    const padded = String(Math.max(1, Math.min(300, frameNum))).padStart(3, '0');
    return `/printload/ezgif-frame-${padded}.jpg`;
  }, []);

  // Preload first 30 frames and key frames immediately for zero lag
  useEffect(() => {
    const preloadFrames = [1, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300];
    for (let i = 1; i <= 30; i++) {
      if (!preloadFrames.includes(i)) preloadFrames.push(i);
    }

    preloadFrames.forEach((frame) => {
      if (!imagesCacheRef.current.has(frame)) {
        const img = new Image();
        img.src = getFramePath(frame);
        imagesCacheRef.current.set(frame, img);
      }
    });
  }, [getFramePath]);

  // Draw a frame onto canvas
  const drawFrame = useCallback((frameNum: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imagesCacheRef.current.get(frameNum);
    if (!img) {
      img = new Image();
      img.src = getFramePath(frameNum);
      imagesCacheRef.current.set(frameNum, img);
    }

    if (img.complete && img.naturalWidth > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      img.onload = () => {
        if (canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
    }
  }, [getFramePath]);

  // Main Cycle Playback Engine
  useEffect(() => {
    if (!isPrinting) {
      drawFrame(300);
      return;
    }

    let isCancelled = false;
    activePageRef.current = currentPage;
    cycleStartTimeRef.current = performance.now();

    const renderLoop = (now: number) => {
      if (isCancelled) return;

      const elapsed = now - cycleStartTimeRef.current;
      const progressInCycle = Math.min(1, elapsed / cycleDurationMs);
      const targetFrame = Math.min(
        300,
        Math.max(1, Math.floor(progressInCycle * 299) + 1)
      );

      drawFrame(targetFrame);

      // Preload ahead frames to guarantee butter-smooth 60fps
      for (let lookahead = 1; lookahead <= 15; lookahead++) {
        const nextF = targetFrame + lookahead;
        if (nextF <= 300 && !imagesCacheRef.current.has(nextF)) {
          const img = new Image();
          img.src = getFramePath(nextF);
          imagesCacheRef.current.set(nextF, img);
        }
      }

      if (progressInCycle < 1) {
        animationFrameIdRef.current = requestAnimationFrame(renderLoop);
      } else {
        // One page cycle complete!
        const finishedPage = activePageRef.current;

        if (finishedPage < totalPages) {
          onPageCycleFinished(finishedPage);
          // Restart next page cycle
          activePageRef.current = finishedPage + 1;
          cycleStartTimeRef.current = performance.now();
          animationFrameIdRef.current = requestAnimationFrame(renderLoop);
        } else {
          // Final page finished! Stop on frame 300
          drawFrame(300);
          onPageCycleFinished(finishedPage);
          setTimeout(() => {
            onAllPagesFinished();
          }, 500);
        }
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isCancelled = true;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [
    isPrinting,
    currentPage,
    totalPages,
    cycleDurationMs,
    drawFrame,
    getFramePath,
    onPageCycleFinished,
    onAllPagesFinished
  ]);

  return (
    <div className="relative w-full max-w-[320px] aspect-[16/9] mx-auto flex items-center justify-center select-none overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-100">
      {/* Canvas for zero-lag hardware accelerated frame rendering */}
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full h-full object-cover rounded-2xl"
      />
    </div>
  );
};
