import { memo } from 'react'
import type { LeaderboardEntry } from '../game/types'

type Props = {
  local: LeaderboardEntry[]
  global: LeaderboardEntry[]
  tab: 'local' | 'global'
  onTab: (t: 'local' | 'global') => void
}

export const LeaderboardPanel = memo(function LeaderboardPanel({
  local,
  global,
  tab,
  onTab,
}: Props) {
  const rows = tab === 'local' ? local : global
  return (
    <div className="rounded-2xl border border-[var(--brown)] bg-[var(--bg-surface)] p-3">
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          className={`min-h-[40px] flex-1 rounded-lg px-2 text-sm font-semibold ${
            tab === 'local' ? 'bg-[var(--gold)] text-black' : 'bg-black/25 text-[var(--cream)]'
          }`}
          onClick={() => onTab('local')}
        >
          Local
        </button>
        <button
          type="button"
          className={`min-h-[40px] flex-1 rounded-lg px-2 text-sm font-semibold ${
            tab === 'global' ? 'bg-[var(--gold)] text-black' : 'bg-black/25 text-[var(--cream)]'
          }`}
          onClick={() => onTab('global')}
        >
          Global
        </button>
      </div>
      <ol className="max-h-64 space-y-2 overflow-auto scroll-thin pr-1">
        {rows.length === 0 && tab === 'global' ? (
          <li className="text-sm text-[var(--muted)]">
            No global scores yet. Configure VITE_LEADERBOARD_URL to post scores.
          </li>
        ) : null}
        {rows.slice(0, 10).map((row, idx) => (
          <li
            key={row.id + idx}
            className={`flex items-center justify-between rounded-lg px-2 py-2 text-sm ${
              row.isPlayer ? 'bg-[var(--gold)]/15 ring-1 ring-[var(--gold)]/40' : 'bg-black/20'
            }`}
          >
            <span className="text-[var(--muted)]">#{idx + 1}</span>
            <span className="flex-1 px-2 text-left text-[var(--cream)]">{row.name}</span>
            <span className="font-mono text-[var(--gold)]">{row.score}</span>
            <span className="pl-2 text-xs text-[var(--muted)]">Lv{row.level}</span>
          </li>
        ))}
      </ol>
    </div>
  )
})
