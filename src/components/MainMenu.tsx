import { hasSave } from '../game/persistence'

type Props = {
  onStart: () => void
  onContinue: () => void
  onLeaderboard: () => void
  onSettings: () => void
}

export function MainMenu({ onStart, onContinue, onLeaderboard, onSettings }: Props) {
  const canContinue = hasSave()
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[var(--bg-primary)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <svg className="h-full w-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#5c2e0a" />
              <stop offset="100%" stopColor="#1a0a00" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#g)" />
          <rect x="40" y="240" width="720" height="80" fill="#4a3018" opacity="0.55" />
          <rect x="520" y="120" width="70" height="140" fill="#6b4423" opacity="0.45" />
          <circle cx="650" cy="80" r="35" fill="#f5c842" opacity="0.18" />
        </svg>
      </div>
      <div className="relative mx-auto flex max-w-lg flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            <span className="steam-line h-10 w-1 rounded-full bg-[var(--cream)]/40" />
            <span className="steam-line h-10 w-1 rounded-full bg-[var(--cream)]/40" />
            <span className="steam-line h-10 w-1 rounded-full bg-[var(--cream)]/40" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--gold)] md:text-5xl">
            ☕ Chai Empire
          </h1>
          <p className="max-w-md text-sm text-[var(--muted)]">
            Brew fast, serve faster, build a street legend — from tapri to tycoon.
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            className="min-h-[48px] rounded-xl bg-[var(--gold)] px-4 py-3 text-lg font-semibold text-black"
            onClick={onStart}
          >
            Start Game
          </button>
          {canContinue ? (
            <button
              type="button"
              className="min-h-[48px] rounded-xl border border-[var(--gold)]/50 bg-transparent px-4 py-3 text-lg font-semibold text-[var(--gold)]"
              onClick={onContinue}
            >
              Continue
            </button>
          ) : null}
          <button
            type="button"
            className="min-h-[48px] rounded-xl bg-[var(--orange)] px-4 py-3 text-base font-semibold text-black"
            onClick={onLeaderboard}
          >
            Leaderboard
          </button>
          <button
            type="button"
            className="min-h-[48px] rounded-xl bg-black/30 px-4 py-3 text-base font-semibold text-[var(--cream)]"
            onClick={onSettings}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
