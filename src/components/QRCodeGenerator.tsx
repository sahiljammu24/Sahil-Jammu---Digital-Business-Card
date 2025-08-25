import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

export function QRCodeGenerator({ url, size = 120 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      }).catch(console.error);
    }
  }, [url, size]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg"
      aria-label={`QR code for ${url}`}
    />
  );
}