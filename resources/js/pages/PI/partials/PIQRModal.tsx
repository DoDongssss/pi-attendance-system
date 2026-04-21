// resources/js/pages/PI/partials/PIQRModal.tsx
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface Props {
    pi: { id: number; code: string; name: string };
    onClose: () => void;
}

export default function PIQRModal({ pi, onClose }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // QR encodes a URL that triggers checkin/checkout when scanned
    const scanUrl = `${window.location.origin}/attendance/scan/${pi.code}`;

    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, scanUrl, {
                width: 280,
                margin: 2,
                color: { dark: '#111827', light: '#ffffff' },
            });
        }
    }, [scanUrl]);

    function handleDownload() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `QR-${pi.code}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function handlePrint() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <html>
                <head>
                    <title>QR - ${pi.code}</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center;
                               justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                        img { width: 280px; height: 280px; }
                        p { margin: 8px 0 2px; font-size: 14px; font-weight: 600; color: #111; }
                        span { font-size: 12px; color: #888; }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" />
                    <p>${pi.name}</p>
                    <span>${pi.code}</span>
                </body>
            </html>
        `);
        win.document.close();
        win.print();
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">

                    <div className="w-full flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">{pi.name}</h2>
                            <p className="text-xs text-gray-400 font-mono">{pi.code}</p>
                        </div>
                        <button onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                    </div>

                    <canvas ref={canvasRef} className="rounded-lg" />

                    <p className="text-xs text-gray-400 text-center">
                        Scan to check in or check out
                    </p>

                    <div className="flex gap-2 w-full">
                        <button onClick={handleDownload}
                            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
                            ↓ Download
                        </button>
                        <button onClick={handlePrint}
                            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            🖨 Print
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}