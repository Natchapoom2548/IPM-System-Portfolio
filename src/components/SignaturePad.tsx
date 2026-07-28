import React, { useRef, useState, useEffect } from "react";
import { Trash2, Upload, Edit3, Image as ImageIcon } from "lucide-react";

interface SignaturePadProps {
  value: string; // base64 representation of the signature
  onChange: (val: string) => void;
  title: string;
}

export function SignaturePad({ value, onChange, title }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<"draw" | "view">(value ? "view" : "draw");

  // Keep drawing context ref
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      // Get exact CSS bounding size
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || canvas.parentElement?.clientWidth || 200;
      const h = rect.height || canvas.parentElement?.clientHeight || 85;
      
      canvas.width = w * 2; // high resolution
      canvas.height = h * 2;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(2, 2);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#1b3a82"; // Beautiful dark blue signature color
        ctx.lineWidth = 2.5;
        ctxRef.current = ctx;
      }
    }
  }, [mode]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Prevent default touch/pointer behavior (scrolling/gestures)
    if (e.cancelable) {
      e.preventDefault();
    }
    const coords = getCoordinates(e);
    if (!coords || !ctxRef.current) return;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctxRef.current) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const coords = getCoordinates(e);
    if (!coords) return;

    ctxRef.current.lineTo(coords.x, coords.y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const base64 = canvasRef.current.toDataURL("image/png");
      onChange(base64);
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current && ctxRef.current) {
      const canvas = canvasRef.current;
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
      onChange("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
          setMode("view");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex items-center text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1 uppercase tracking-wider">
        <span className="text-[#1b3a82] font-black">{title}</span>
      </div>

      <div className="relative w-full h-[85px] bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
        {mode === "view" && value ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white p-2">
            <img src={value} alt="Signature" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
          </div>
        ) : mode === "draw" ? (
          <>
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              style={{ touchAction: "none" }}
              className="absolute inset-0 w-full h-full cursor-crosshair bg-white"
            />
            {!isDrawing && !value && (
              <span className="absolute text-slate-400 text-[10px] pointer-events-none select-none italic font-bold">
                ลากเมาส์หรือใช้นิ้วเซ็นที่นี่
              </span>
            )}
            {value && (
              <button
                type="button"
                onClick={clearCanvas}
                className="absolute bottom-1 right-1 p-1 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all shadow-sm"
                title="ล้างรายเซ็น"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 space-y-1">
            <ImageIcon className="h-5 w-5 text-slate-300" />
            <span className="text-[9px] font-medium">ยังไม่มีข้อมูลรายเซ็น</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={() => {
            if (mode === "view") {
              setMode("draw");
              onChange("");
            } else {
              setMode("view");
            }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs transition-all font-black border cursor-pointer min-h-[44px] ${
            mode === "draw"
              ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
              : "bg-blue-50 text-[#1b3a82] border-blue-100 hover:bg-blue-100/60"
          }`}
        >
          <Edit3 className="h-4 w-4" />
          {mode === "draw" ? "ดูตัวอย่าง" : "เซ็นตรงนี้"}
        </button>
        
        <label className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/60 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all text-xs font-black min-h-[44px]">
          <Upload className="h-4 w-4" />
          <span>อัปโหลดรูป</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
