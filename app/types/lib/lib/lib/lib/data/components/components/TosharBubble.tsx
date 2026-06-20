'use client';

interface Props {
  text: string;
  animate?: boolean;
  size?: 'sm' | 'md';
}

export default function TosharBubble({ text, animate = true, size = 'md' }: Props) {
  return (
    <div className="flex items-end gap-3 px-4">
      <div className={`text-5xl flex-shrink-0 ${animate ? 'animate-toshar-float' : ''}`}>
        🐻
      </div>

      <div className="relative flex-1 bg-[#1f1f1f] border border-[#333] rounded-2xl rounded-bl-none px-4 py-3 shadow-lg">
        <div
          className="absolute -bottom-[1px] -left-[8px] w-0 h-0"
          style={{
            borderRight: '10px solid #1f1f1f',
            borderTop: '10px solid transparent',
            borderBottom: '0px solid transparent',
          }}
        />
        <div
          className="absolute -bottom-[2px] -left-[10px] w-0 h-0"
          style={{
            borderRight: '11px solid #333',
            borderTop: '11px solid transparent',
            borderBottom: '0px solid transparent',
          }}
        />
        <p className={`text-white leading-relaxed ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}