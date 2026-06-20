'use client';

interface Props {
  text: string;
  animate?: boolean;
  size?: 'sm' | 'md';
}

export default function TosharBubble({ text, animate = true, size = 'md' }: Props) {
  return (
    <div className="flex items-end gap-3 px-4">
      <div className={`w-12 h-12 rounded-2xl flex-shrink-0 bg-white border border-border shadow-md flex items-center justify-center ${animate ? 'animate-toshar-float' : ''}`}>
        <span className="game-icon" />
      </div>

      <div className="relative flex-1 bg-white/90 border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-lg">
        <div
          className="absolute -bottom-[1px] -left-[8px] w-0 h-0"
          style={{
            borderRight: '10px solid #ffffff',
            borderTop: '10px solid transparent',
            borderBottom: '0px solid transparent',
          }}
        />
        <div
          className="absolute -bottom-[2px] -left-[10px] w-0 h-0"
          style={{
            borderRight: '11px solid #e4d4bd',
            borderTop: '11px solid transparent',
            borderBottom: '0px solid transparent',
          }}
        />
        <p className={`text-[#2b2118] leading-relaxed ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}
