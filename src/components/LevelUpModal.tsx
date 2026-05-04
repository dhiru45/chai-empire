import type { GameState } from '../game/types'

type Props = {
  pending: GameState['pendingLevelUp']
  onClose: () => void
}

export function LevelUpModal({ pending, onClose }: Props) {
  if (!pending) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="level-burst max-w-md rounded-2xl border border-[var(--gold)] bg-[var(--bg-surface)] p-6 text-center shadow-2xl">
        <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">Level Up</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--gold)]">Level {pending.level}</h2>
        {pending.unlock ? (
          <p className="mt-3 text-[var(--cream)]">
            Unlocked: <span className="text-[var(--orange)]">{pending.unlock}</span>
          </p>
        ) : (
          <p className="mt-3 text-[var(--muted)]">Your tapri fame keeps spreading.</p>
        )}
        <button
          type="button"
          className="mt-6 min-h-[48px] w-full rounded-xl bg-[var(--gold)] px-4 py-3 text-base font-semibold text-black"
          onClick={onClose}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
