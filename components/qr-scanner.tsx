'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedText: string) => void;
  title?: string;
  description?: string;
}

export function QrScannerModal({
  isOpen,
  onClose,
  onScan,
  title = 'Scan QR / Barcode',
  description = 'Point your mobile or tablet camera at the item or document barcode.'
}: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    setScanning(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser/device');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check native BarcodeDetector support
      if ('BarcodeDetector' in window) {
        // @ts-expect-error - standard web API in modern browsers
        const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13', 'code_39'] });
        const intervalId = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              clearInterval(intervalId);
              stopCamera();
              onScan(code);
              onClose();
            }
          } catch {
            // ignore continuous detection frame errors
          }
        }, 300);

        return () => clearInterval(intervalId);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    stopCamera();
    onScan(manualCode.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-indigo-600" />
            <span className="font-bold text-slate-800 text-sm">{title}</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-500">{description}</p>

          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
            <video ref={videoRef} className="h-full w-full object-cover" />
            
            {scanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-44 w-44 rounded-2xl border-2 border-indigo-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                  <div className="h-1 w-full bg-indigo-500 animate-pulse" />
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-4 text-center">
                <AlertCircle size={28} className="text-amber-400 mb-2" />
                <p className="text-xs text-slate-200">{error}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  <RefreshCw size={13} />
                  Retry Camera
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="mt-4 border-t pt-3">
            <label className="text-[11px] font-semibold text-slate-500 uppercase">Or Enter Code Manually</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="e.g. ITM-2025-0012 or WO-00045"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                <Check size={14} />
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
