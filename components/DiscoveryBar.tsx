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
        <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">発見率</span>
        <span className="text-xs font-black">
          <span className="text-white">{owned}</span>
          <span className="text-gray-500"> / {total}</span>
          <span className="text-gold ml-1.5">{pct}%</span>
        </span>
      </div>
      <div className="h-2 bg-[#1f1f1f] rounded-full overflow-hidden border border-[#2a2a2a]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #e63946, #f5a623)',
            boxShadow: pct > 0 ? '0 0 8px rgba(245,166,35,0.5)' : 'none',
          }}
        />
      </div>
    </div>
  );
}