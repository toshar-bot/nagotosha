'use client';

interface Props {
  text: string;
  animate?: boolean;
  size?: 'sm' | 'md';
}

export default function TosharBubble({ text, animate = true, size = 'md' }: Props) {
  const displayText = text.replace(/\\n/g, '\n');

  return (
    <div className="flex items-end gap-3 px-4">
      <div className={`toshar-avatar flex-shrink-0 ${animate ? 'animate-toshar-float' : ''}`} aria-label="トーシャー博士" />

      <div className="relative flex-1 bg-white/94 border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-[0_10px_28px_rgba(96,61,28,0.14)]">
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
        <p className={`whitespace-pre-line text-[#2b2118] leading-relaxed ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {displayText}
        </p>
      </div>
    </div>
  );
}
