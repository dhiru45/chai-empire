import { memo } from 'react'
import type { UpgradeDef } from '../game/constants'

type Props = {
  def: UpgradeDef
  level: number
  cost: number | null
  onBuy: (id: string) => void
  money: number
}

export const UpgradeCard = memo(function UpgradeCard({ def, level, cost, onBuy, money }: Props) {
  const maxed = cost == null
  const affordable = cost != null && money >= cost
  return (
    <div className="flex min-h-[44px] flex-col gap-2 rounded-xl border border-[var(--brown)] bg-[var(--bg-card)] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            {def.icon}
          </span>
          <div>
            <p className="font-semibold text-[var(--cream)]">{def.name}</p>
            <p className="text-xs text-[var(--muted)]">{def.description}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Lv {level}/{def.maxLevel}
        </p>
      </div>
      <button
        type="button"
        disabled={maxed || !affordable}
        onClick={() => onBuy(def.id)}
        className="min-h-[44px] rounded-lg bg-[var(--orange)] px-3 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        {maxed ? 'Maxed' : `Buy — ₹${cost}`}
      </button>
    </div>
  )
})
