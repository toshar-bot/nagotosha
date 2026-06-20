'use client';

interface Props {
  owned: number;
  total: number;
}

export default function DiscoveryBar({ owned, total }: Props) {
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8a7864] font-medium tracking-wider uppercase">発見率</span>
        <span className="text-xs font-black">
          <span className="text-[#2b2118]">{owned}</span>
          <span className="text-[#8a7864]"> / {total}</span>
          <span className="text-gold ml-1.5">{pct}%</span>
        </span>
      </div>
      <div className="h-2 bg-white/80 rounded-full overflow-hidden border border-border shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #c9412d, #b8872f)',
            boxShadow: pct > 0 ? '0 0 8px rgba(184,135,47,0.45)' : 'none',
          }}
        />
      </div>
    </div>
  );
}
