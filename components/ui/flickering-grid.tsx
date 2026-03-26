"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
}) => {
  const TARGET_FPS = 10;
  const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInViewRef = useRef(false);
  const isPageVisibleRef = useRef(true);

  const memoizedColor = useMemo(() => {
    const toRGBA = (currentColor: string) => {
      if (typeof window === "undefined") {
        return "rgba(0, 0, 0,";
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 0, 0,";
      ctx.fillStyle = currentColor;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, currentWidth: number, currentHeight: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = currentWidth * dpr;
      canvas.height = currentHeight * dpr;
      canvas.style.width = `${currentWidth}px`;
      canvas.style.height = `${currentHeight}px`;
      const cols = Math.floor(currentWidth / (squareSize + gridGap));
      const rows = Math.floor(currentHeight / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      currentWidth: number,
      currentHeight: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, currentWidth, currentHeight);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          ctx.fillStyle = `${memoizedColor}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap),
            j * (squareSize + gridGap),
            squareSize,
            squareSize,
          );
        }
      }
    },
    [memoizedColor, squareSize, gridGap],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let gridParams: ReturnType<typeof setupCanvas>;
    let cssWidth = 0;
    let cssHeight = 0;
    let lastPaintTime = 0;

    const updateCanvasSize = () => {
      cssWidth = width || container.clientWidth;
      cssHeight = height || container.clientHeight;
      gridParams = setupCanvas(canvas, cssWidth, cssHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInViewRef.current || !isPageVisibleRef.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (time - lastPaintTime < FRAME_INTERVAL_MS) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastPaintTime = time;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        cssWidth,
        cssHeight,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height]);

  return (
    <div ref={containerRef} className={`h-full w-full ${className ?? ""}`}>
      <canvas ref={canvasRef} className="pointer-events-none h-full w-full" />
    </div>
  );
};

export { FlickeringGrid };
