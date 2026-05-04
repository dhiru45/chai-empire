import type { QuestRuntime } from '../game/types'

type Props = {
  quest: QuestRuntime | null
  onClose: () => void
  nextPreview?: string
}

export function QuestCompleteModal({ quest, onClose, nextPreview }: Props) {
  if (!quest) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative max-w-md overflow-hidden rounded-2xl border border-[var(--green)]/60 bg-[var(--bg-surface)] p-6 text-center shadow-2xl">
        <div className="pointer-events-none absolute inset-0 flex justify-center gap-2 opacity-40">
          {[12, 26, 40].map((d) => (
            <span
              key={d}
              className="confetti-piece mt-4 inline-block h-2 w-2 rounded-sm bg-[var(--gold)]"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
        <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">Quest Complete</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--cream)]">{quest.title}</h2>
        <p className="mt-3 text-[var(--gold)]">
          +₹{quest.rewardMoney} · +{quest.rewardXp} XP
        </p>
        {quest.cosmeticUnlock ? (
          <p className="mt-2 text-xs text-[var(--muted)]">Cosmetic unlocked: {quest.cosmeticUnlock}</p>
        ) : null}
        {nextPreview ? (
          <p className="mt-4 text-sm text-[var(--muted)]">Next up: {nextPreview}</p>
        ) : null}
        <button
          type="button"
          className="mt-6 min-h-[48px] w-full rounded-xl bg-[var(--green)] px-4 py-3 text-base font-semibold text-black"
          onClick={onClose}
        >
          Nice!
        </button>
      </div>
    </div>
  )
}
