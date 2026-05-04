import { memo } from 'react'

type Props = {
  progress: number
  restockUntil: number
  stock: number
  maxStock: number
  lastTickAt: number
}

export const BrewBar = memo(function BrewBar({
  progress,
  restockUntil,
  stock,
  maxStock,
  lastTickAt,
}: Props) {
  const restocking = restockUntil > lastTickAt
  const pct = Math.max(0, Math.min(100, progress))
  const stockFull = !restocking && stock >= maxStock
  return (
    <div className="rounded-xl border border-[var(--brown)] bg-[var(--bg-surface)] p-3">
      <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
        <span>Kettle</span>
        <span>
          Stock {stock}/{maxStock}
          {restocking ? (
            <span className="ml-2 text-[var(--orange)]">
              Restocking… {Math.max(0, Math.ceil((restockUntil - lastTickAt) / 1000))}s
            </span>
          ) : null}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--brown)] via-[var(--orange)] to-[var(--gold)] transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {restocking
          ? 'Chai pause while you restock cups.'
          : stockFull
            ? 'Stock full — serve to free space; the bar idles until then.'
            : `☕ Brewing next cup… ${Math.round(pct)}%`}
      </p>
    </div>
  )
})
