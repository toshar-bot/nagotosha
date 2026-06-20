'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
}

export default function PackImage({ src, alt, className = '', style, draggable = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // 白〜薄いグレーを透明にする
        if (r > 230 && g > 225 && b > 215) {
          // エッジを滑らかにするためアルファを段階的に
          const brightness = (r + g + b) / 3;
          d[i + 3] = brightness > 242 ? 0 : Math.round((255 - brightness) * 6);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setReady(true);
    };
    img.src = src;
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className} ${ready ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      style={{ ...style, maxWidth: '100%', height: 'auto' }}
      aria-label={alt}
      onDragStart={draggable ? undefined : e => e.preventDefault()}
    />
  );
}
