import { memo } from 'react'
import type { QuestRuntime } from '../game/types'

type Props = {
  quest: QuestRuntime
  progress: number
}

const tierLabel: Record<number, string> = {
  1: 'Beginner',
  2: 'Regular',
  3: 'Advanced',
  4: 'Elite',
}

export const QuestCard = memo(function QuestCard({ quest, progress }: Props) {
  const pct = Math.min(100, Math.round((progress / Math.max(1, quest.target)) * 100))
  return (
    <div
      className={`rounded-xl border p-3 ${
        quest.completed ? 'border-[var(--green)]/60 bg-black/20' : 'border-[var(--brown)] bg-[var(--bg-card)]'
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="font-semibold text-[var(--cream)]">{quest.title}</p>
        <span className="text-[0.65rem] uppercase text-[var(--muted)]">
          {tierLabel[quest.tier] ?? 'Quest'}
        </span>
      </div>
      <p className="text-xs text-[var(--muted)]">{quest.description}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full ${quest.completed ? 'bg-[var(--green)]' : 'bg-[var(--gold)]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[0.7rem] text-[var(--muted)]">
        {Math.min(progress, quest.target)} / {quest.target} · Reward ₹{quest.rewardMoney} + {quest.rewardXp} XP
      </p>
    </div>
  )
})
