import { memo } from 'react'
import { xpForNextLevel } from '../game/constants'

type Props = {
  money: number
  reputation: number
  level: number
  xp: number
  day: number
  season: string
  stallName: string
}

export const Header = memo(function Header({
  money,
  reputation,
  level,
  xp,
  day,
  season,
  stallName,
}: Props) {
  const need = xpForNextLevel(level)
  const pct = Math.min(100, Math.round((xp / Math.max(1, need)) * 100))
  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-[var(--brown)] bg-[var(--bg-surface)] p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Stall</p>
        <h1 className="text-xl font-semibold text-[var(--gold)]">{stallName}</h1>
        <p className="text-sm text-[var(--muted)]">
          Day {day} · {season}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Cash" value={`₹${Math.floor(money)}`} accent="text-[var(--gold)]" />
        <Stat label="Reputation" value={`${Math.floor(reputation)}/100`} accent="text-[var(--cream)]" />
        <Stat label="Level" value={`${level}`} accent="text-[var(--orange)]" />
        <div className="rounded-lg bg-black/25 p-2">
          <p className="text-[0.65rem] uppercase text-[var(--muted)]">XP</p>
          <p className="text-sm text-[var(--cream)]">
            {Math.floor(xp)} / {need}
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
            <div className="h-full bg-[var(--green)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </header>
  )
})

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg bg-black/25 p-2">
      <p className="text-[0.65rem] uppercase text-[var(--muted)]">{label}</p>
      <p className={`text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  )
}
