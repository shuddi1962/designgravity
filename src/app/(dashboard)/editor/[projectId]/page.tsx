'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/project.store';
import { useUIStore } from '@/stores/ui.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { fabricEngine } from '@/lib/canvas/engine';
import { exportCanvas, downloadExport, checkExportQuality } from '@/lib/export';
import { panToCenter } from '@/lib/canvas/utils';
import { eventBus, EVENTS } from '@/lib/event-bus';

const tools = [
  { id: 'select', label: 'Select', shortcut: 'V' },
  { id: 'text', label: 'Text', shortcut: 'T' },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O' },
  { id: 'line', label: 'Line', shortcut: 'L' },
  { id: 'image', label: 'Image', shortcut: 'I' },
  { id: 'hand', label: 'Hand', shortcut: 'H' },
];

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { currentProject, openProject } = useProjectStore();
  const { activeTool, setActiveTool, zoom, setZoom, showGrid, toggleGrid, showRulers, toggleRulers } = useUIStore();
  const { undo, redo, copy, paste, duplicate } = useCanvasStore();
  const [isExporting, setIsExporting] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    openProject(resolvedParams.projectId);
  }, [resolvedParams.projectId, openProject]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'v':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('select');
          break;
        case 't':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('text');
          break;
        case 'r':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('rectangle');
          break;
        case 'o':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('ellipse');
          break;
        case 'l':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('line');
          break;
        case 'h':
          if (!e.ctrlKey && !e.metaKey) setActiveTool('hand');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  const handleAddRectangle = () => {
    fabricEngine.addRectangle();
    setActiveTool('select');
  };

  const handleAddEllipse = () => {
    fabricEngine.addEllipse();
    setActiveTool('select');
  };

  const handleAddText = () => {
    fabricEngine.addText('Text');
    setActiveTool('select');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      fabricEngine.addImage(url);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = async (format: 'png' | 'jpg' | 'svg') => {
    if (!fabricEngine.canvas) return;
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      const quality = checkExportQuality(fabricEngine.canvas, 1);
      if (quality.warnings.length > 0) {
        console.warn('Export warnings:', quality.warnings);
      }

      const result = await exportCanvas(fabricEngine.canvas, {
        format,
        quality: format === 'jpg' ? 0.9 : 1,
        multiplier: 1,
        transparent: format === 'png',
      });

      downloadExport(result);
      eventBus.emit(EVENTS.EXPORT_COMPLETED, { format, size: result.size });
    } catch (error) {
      eventBus.emit(EVENTS.EXPORT_FAILED, { error });
    } finally {
      setIsExporting(false);
    }
  };

  const handleUndo = () => {
    undo();
    eventBus.emit('canvas:undo');
  };

  const handleRedo = () => {
    redo();
    eventBus.emit('canvas:redo');
  };

  const handleToolAction = (toolId: string) => {
    setActiveTool(toolId as typeof activeTool);

    if (toolId === 'rectangle') handleAddRectangle();
    if (toolId === 'ellipse') handleAddEllipse();
    if (toolId === 'text') handleAddText();
    if (toolId === 'image') fileInputRef.current?.click();
  };

  return (
    <div className="h-screen flex flex-col bg-[#0A0A0F]">
      <header className="h-12 border-b border-[#2A2A3E] bg-[#141420] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-[#0A0A0F] rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="font-medium text-[#F8F8FC]">{currentProject?.name || 'Untitled Design'}</div>
          <div className="text-sm text-[#9090A8]">
            {currentProject?.width ?? 1080} × {currentProject?.height ?? 1080} px
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleUndo} className="p-2 hover:bg-[#0A0A0F] rounded-lg transition-colors" title="Undo (Ctrl+Z)">
            <svg className="w-5 h-5 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button onClick={handleRedo} className="p-2 hover:bg-[#0A0A0F] rounded-lg transition-colors" title="Redo (Ctrl+Y)">
            <svg className="w-5 h-5 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>

          <div className="w-px h-6 bg-[#2A2A3E] mx-2" />

          <button onClick={copy} className="p-2 hover:bg-[#0A0A0F] rounded-lg transition-colors" title="Copy (Ctrl+C)">
            <svg className="w-5 h-5 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button onClick={paste} className="p-2 hover:bg-[#0A0A0F] rounded-lg transition-colors" title="Paste (Ctrl+V)">
            <svg className="w-5 h-5 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          <button onClick={duplicate} className="p-2 hover:bg-[#0A0A0F] rounded-lg transition-colors" title="Duplicate (Ctrl+D)">
            <svg className="w-5 h-5 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </button>

          <div className="w-px h-6 bg-[#2A2A3E] mx-2" />

          <button onClick={toggleGrid} className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-[#7C3AED] text-white' : 'hover:bg-[#0A0A0F] text-[#9090A8]'}`} title="Toggle Grid">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>

          <div className="flex items-center gap-1 bg-[#0A0A0F] rounded-lg px-2 py-1">
            <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-1 hover:bg-[#141420] rounded transition-colors">
              <svg className="w-4 h-4 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm text-[#F8F8FC] w-12 text-center">{Math.round(zoom)}%</span>
            <button onClick={() => setZoom(Math.min(6400, zoom + 10))} className="p-1 hover:bg-[#141420] rounded transition-colors">
              <svg className="w-4 h-4 text-[#9090A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="w-px h-6 bg-[#2A2A3E] mx-2" />

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="px-4 py-2 bg-[#141420] border border-[#2A2A3E] hover:border-[#7C3AED] text-[#F8F8FC] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#141420] border border-[#2A2A3E] rounded-lg shadow-xl py-1 z-50 min-w-[160px]">
                <button onClick={() => handleExport('png')} className="w-full px-4 py-2 text-left text-sm text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors">
                  PNG
                </button>
                <button onClick={() => handleExport('jpg')} className="w-full px-4 py-2 text-left text-sm text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors">
                  JPG
                </button>
                <button onClick={() => handleExport('svg')} className="w-full px-4 py-2 text-left text-sm text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors">
                  SVG
                </button>
              </div>
            )}
          </div>

          <button className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-sm font-medium transition-colors">
            Share
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-14 bg-[#141420] border-r border-[#2A2A3E] flex flex-col items-center py-4 gap-1 shrink-0">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolAction(tool.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                activeTool === tool.id
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#9090A8] hover:text-[#F8F8FC] hover:bg-[#0A0A0F]'
              }`}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <ToolIcon tool={tool.id} />
            </button>
          ))}

          <div className="w-8 h-px bg-[#2A2A3E] my-2" />

          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-[#9090A8] hover:text-[#F8F8FC] hover:bg-[#0A0A0F] transition-colors" title="Layers">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </aside>

        <FabricCanvasComponent />

        <PropertiesPanel />
      </div>

      <footer className="h-8 border-t border-[#2A2A3E] bg-[#141420] px-4 flex items-center justify-between text-xs text-[#9090A8] shrink-0">
        <div className="flex items-center gap-4">
          <span>{currentProject?.width ?? 1080} × {currentProject?.height ?? 1080} px</span>
          <span>RGB</span>
          <span>72 DPI</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(zoom)}%</span>
          <span>Ready</span>
        </div>
      </footer>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}

function ToolIcon({ tool }: { tool: string }) {
  const icons: Record<string, React.ReactNode> = {
    select: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />,
    text: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />,
    rectangle: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />,
    ellipse: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0" />,
    line: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />,
    image: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    hand: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />,
  };

  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[tool]}
    </svg>
  );
}

function FabricCanvasComponent() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInitialized = React.useRef(false);

  const { activeTool, zoom, showGrid, snapToGrid, setActiveTool } = useUIStore();
  const { currentProject } = useProjectStore();

  React.useEffect(() => {
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

    fabricEngine.setTool(activeTool);

    if (containerRef.current && fabricEngine.canvas) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const fitZoom = Math.min(containerWidth / width, containerHeight / height, 1);
      fabricEngine.setZoom(fitZoom * 100);
      panToCenter(fabricEngine.canvas);
    }

    isInitialized.current = true;
  }, [currentProject, activeTool]);

  React.useEffect(() => {
    if (!fabricEngine.canvas) return;
    fabricEngine.setTool(activeTool);
  }, [activeTool]);

  React.useEffect(() => {
    if (!fabricEngine.canvas) return;
    fabricEngine.setZoom(zoom);
  }, [zoom]);

  return (
    <div ref={containerRef} className="flex-1 bg-[#0A0A0F] overflow-auto flex items-center justify-center p-8 relative">
      <canvas ref={canvasRef} className="shadow-2xl" />
    </div>
  );
}

function PropertiesPanel() {
  const [selectedProps, setSelectedProps] = React.useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    fill: string;
    stroke: string;
  } | null>(null);

  React.useEffect(() => {
    const handleSelection = () => {
      const obj = fabricEngine.getActiveObject();
      if (obj) {
        setSelectedProps({
          x: Math.round(obj.left ?? 0),
          y: Math.round(obj.top ?? 0),
          width: Math.round(obj.getScaledWidth()),
          height: Math.round(obj.getScaledHeight()),
          rotation: Math.round(obj.angle ?? 0),
          opacity: Math.round((obj.opacity ?? 1) * 100),
          fill: typeof obj.fill === 'string' ? obj.fill : '#7C3AED',
          stroke: typeof obj.stroke === 'string' ? obj.stroke : '',
        });
      } else {
        setSelectedProps(null);
      }
    };

    const handleModified = () => {
      const obj = fabricEngine.getActiveObject();
      if (obj) {
        setSelectedProps({
          x: Math.round(obj.left ?? 0),
          y: Math.round(obj.top ?? 0),
          width: Math.round(obj.getScaledWidth()),
          height: Math.round(obj.getScaledHeight()),
          rotation: Math.round(obj.angle ?? 0),
          opacity: Math.round((obj.opacity ?? 1) * 100),
          fill: typeof obj.fill === 'string' ? obj.fill : '#7C3AED',
          stroke: typeof obj.stroke === 'string' ? obj.stroke : '',
        });
      }
    };

    if (fabricEngine.canvas) {
      fabricEngine.canvas.on('selection:created', handleSelection);
      fabricEngine.canvas.on('selection:updated', handleSelection);
      fabricEngine.canvas.on('selection:cleared', () => setSelectedProps(null));
      fabricEngine.canvas.on('object:modified', handleModified);
    }

    return () => {
      if (fabricEngine.canvas) {
        fabricEngine.canvas.off('selection:created', handleSelection);
        fabricEngine.canvas.off('selection:updated', handleSelection);
        fabricEngine.canvas.off('selection:cleared', () => setSelectedProps(null));
        fabricEngine.canvas.off('object:modified', handleModified);
      }
    };
  }, []);

  const updateProperty = (key: string, value: number | string) => {
    const obj = fabricEngine.getActiveObject();
    if (!obj) return;

    switch (key) {
      case 'x':
        obj.set('left', Number(value));
        break;
      case 'y':
        obj.set('top', Number(value));
        break;
      case 'width':
        obj.set('width', Number(value));
        obj.setCoords();
        break;
      case 'height':
        obj.set('height', Number(value));
        obj.setCoords();
        break;
      case 'rotation':
        obj.set('angle', Number(value));
        break;
      case 'opacity':
        obj.set('opacity', Number(value) / 100);
        break;
      case 'fill':
        obj.set('fill', value);
        break;
      case 'stroke':
        obj.set('stroke', value || null);
        break;
    }

    fabricEngine.canvas?.renderAll();
    setSelectedProps((prev) => prev ? { ...prev, [key]: value } : null);
  };

  return (
    <aside className="w-72 bg-[#141420] border-l border-[#2A2A3E] p-4 overflow-auto shrink-0">
      <h3 className="font-medium text-[#F8F8FC] mb-4">Properties</h3>

      {selectedProps ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#9090A8] mb-1">Position</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[#9090A8]">X</label>
                <input
                  type="number"
                  value={selectedProps.x}
                  onChange={(e) => updateProperty('x', e.target.value)}
                  className="w-full px-2 py-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded text-[#F8F8FC] text-sm focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#9090A8]">Y</label>
                <input
                  type="number"
                  value={selectedProps.y}
                  onChange={(e) => updateProperty('y', e.target.value)}
                  className="w-full px-2 py-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded text-[#F8F8FC] text-sm focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9090A8] mb-1">Size</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[#9090A8]">W</label>
                <input
                  type="number"
                  value={selectedProps.width}
                  onChange={(e) => updateProperty('width', e.target.value)}
                  className="w-full px-2 py-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded text-[#F8F8FC] text-sm focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#9090A8]">H</label>
                <input
                  type="number"
                  value={selectedProps.height}
                  onChange={(e) => updateProperty('height', e.target.value)}
                  className="w-full px-2 py-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded text-[#F8F8FC] text-sm focus:border-[#7C3AED] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9090A8] mb-1">Rotation</label>
            <input
              type="number"
              value={selectedProps.rotation}
              onChange={(e) => updateProperty('rotation', e.target.value)}
              className="w-full px-2 py-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded text-[#F8F8FC] text-sm focus:border-[#7C3AED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#9090A8] mb-1">Opacity</label>
            <input
              type="range"
              min={0}
              max={100}
              value={selectedProps.opacity}
              onChange={(e) => updateProperty('opacity', e.target.value)}
              className="w-full"
            />
            <span className="text-xs text-[#9090A8]">{selectedProps.opacity}%</span>
          </div>

          <div>
            <label className="block text-xs text-[#9090A8] mb-1">Fill</label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-[#2A2A3E] cursor-pointer"
                style={{ backgroundColor: selectedProps.fill }}
              />
              <input
                type="text"
                value={selectedProps.fill}
                onChange={(e) => updateProperty('fill', e.target.value)}
                className="flex-1 px-2 py-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded text-[#F8F8FC] text-sm focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9090A8] mb-1">Stroke</label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-[#2A2A3E] cursor-pointer"
                style={{ backgroundColor: selectedProps.stroke || 'transparent' }}
              />
              <input
                type="text"
                value={selectedProps.stroke}
                placeholder="None"
                onChange={(e) => updateProperty('stroke', e.target.value)}
                className="flex-1 px-2 py-1 bg-[#0A0A0F] border border-[#2A2A3E] rounded text-[#F8F8FC] text-sm focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A2A3E]">
            <button
              onClick={() => fabricEngine.deleteActiveObjects()}
              className="w-full px-3 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Delete Object
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-[#9090A8] text-center py-8">
          Select an object to edit properties
        </div>
      )}
    </aside>
  );
}
