'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { fabricEngine } from '@/lib/canvas/engine';
import { useCanvasStore } from '@/stores/canvas.store';
import { useProjectStore } from '@/stores/project.store';
import { useUIStore } from '@/stores/ui.store';
import { drawGrid, removeGrid, applyGridSnapping } from '@/lib/canvas/helpers';
import { panToCenter, calculateZoomToFit } from '@/lib/canvas/utils';

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const { zoom, activeTool, showGrid, snapToGrid } = useUIStore();
  const { currentProject } = useProjectStore();
  const { setZoom: setCanvasZoom } = useCanvasStore();

  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || isInitialized.current) return;

    const width = currentProject?.width ?? 1080;
    const height = currentProject?.height ?? 1080;

    fabricEngine.initialize(canvasRef.current, {
      width,
      height,
      backgroundColor: '#FFFFFF',
      selection: true,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
    });

    if (showGrid && fabricEngine.canvas) {
      drawGrid(fabricEngine.canvas, {
        gridSize: 20,
        gridColor: '#2A2A3E',
        gridOpacity: 0.3,
        showGrid: true,
        snapToGrid: false,
      });
    }

    if (fabricEngine.canvas) {
      applyGridSnapping(fabricEngine.canvas, 20, snapToGrid);
    }

    fabricEngine.setTool(activeTool);

    const container = containerRef.current;
    if (container && fabricEngine.canvas) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const fitZoom = calculateZoomToFit(width, height, containerWidth, containerHeight);
      fabricEngine.setZoom(fitZoom * 100);
      panToCenter(fabricEngine.canvas);
    }

    isInitialized.current = true;
  }, [currentProject, showGrid, snapToGrid, activeTool]);

  useEffect(() => {
    initializeCanvas();

    return () => {
      fabricEngine.destroy();
      isInitialized.current = false;
    };
  }, [initializeCanvas]);

  useEffect(() => {
    if (!fabricEngine.canvas) return;
    fabricEngine.setTool(activeTool);
  }, [activeTool]);

  useEffect(() => {
    if (!fabricEngine.canvas) return;
    fabricEngine.setZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    if (!fabricEngine.canvas) return;
    if (showGrid) {
      drawGrid(fabricEngine.canvas, {
        gridSize: 20,
        gridColor: '#2A2A3E',
        gridOpacity: 0.3,
        showGrid: true,
        snapToGrid: false,
      });
    } else {
      removeGrid(fabricEngine.canvas);
    }
  }, [showGrid]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!fabricEngine.canvas || (!e.ctrlKey && !e.metaKey)) return;
    e.preventDefault();

    const delta = e.deltaY;
    let newZoom = zoom * (1 - delta / 500);
    newZoom = Math.min(6400, Math.max(10, newZoom));

    setCanvasZoom(newZoom);
  }, [zoom, setCanvasZoom]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#0A0A0F] overflow-hidden relative"
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
