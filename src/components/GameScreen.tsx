import { useEffect, useMemo, useRef, useState } from 'react'
import { soundManager } from '../audio/soundManager'
import { FLAVORS, QUESTS, SNACKS, UPGRADES } from '../game/constants'
import {
  computeOrderPayout,
  effectiveSeats,
  isFlavorUnlocked,
  isSnackUnlocked,
  upgradeCost,
} from '../game/economy'
import type { GameState } from '../game/types'
import { getQuestProgress } from '../game/gameLoop'
import { useGameStore } from '../store/gameStore'
import { BrewBar } from './BrewBar'
import { EventBanner } from './EventBanner'
import { Header } from './Header'
import { LeaderboardPanel } from './LeaderboardPanel'
import { LevelUpModal } from './LevelUpModal'
import { OrderCard } from './OrderCard'
import { QuestCard } from './QuestCard'
import { QuestCompleteModal } from './QuestCompleteModal'
import { StallScene } from './StallScene'
import { UpgradeCard } from './UpgradeCard'

export function GameScreen() {
  const state = useGameStore()
  const {
    money,
    reputation,
    level,
    xp,
    day,
    season,
    brewProgress,
    stock,
    maxStock,
    restockUntil,
    lastTickAt,
    orders,
    upgrades,
    quests,
    leaderboard,
    globalLeaderboard,
    activeEvent,
    settings,
    gamePanelTab,
    pendingLevelUp,
    pendingQuest,
    pendingEventChoice,
    serve,
    buyUpgrade,
    setTab,
    dismissLevelUp,
    dismissQuest,
    resolveInspector,
    backToMenu,
    refreshGlobalBoard,
  } = state

  const seats = effectiveSeats(state)
  const restocking = restockUntil > lastTickAt
  const canServe = stock > 0 && !restocking
  const orderIdsRef = useRef<string>('')
  const [boardTab, setBoardTab] = useState<'local' | 'global'>('local')

  useEffect(() => {
    const id = window.setInterval(() => {
      void refreshGlobalBoard()
    }, 60_000)
    void refreshGlobalBoard()
    return () => clearInterval(id)
  }, [refreshGlobalBoard])

  useEffect(() => {
    const brewing = stock < maxStock && !restocking && brewProgress < 100
    soundManager.kettleLoop(settings.sound, brewing)
    return () => soundManager.stopKettle()
  }, [settings.sound, brewProgress, stock, maxStock, restocking])

  useEffect(() => {
    soundManager.music(settings.music)
  }, [settings.music])

  useEffect(() => {
    const key = orders.map((o) => o.id).join(',')
    const prev = orderIdsRef.current
    if (prev && key !== prev) {
      const prevSet = new Set(prev.split(',').filter(Boolean))
      const hasNew = orders.some((o) => !prevSet.has(o.id))
      if (hasNew) soundManager.play('order', settings.sound)
    }
    orderIdsRef.current = key
  }, [orders, settings.sound])

  const onServe = (id: string) => {
    soundManager.play('coin', settings.sound)
    serve(id)
  }

  const nextQuestPreview = useMemo(() => {
    const next = QUESTS.map((q) => state.quests.find((r) => r.id === q.id)).find((r) => r && !r.completed)
    return next?.title
  }, [state.quests])

  const activeQuests = quests.filter((q) => !q.completed).slice(0, 4)

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-primary)] px-3 py-4 text-[var(--cream)] md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className="min-h-[44px] rounded-lg px-3 text-sm text-[var(--gold)] underline"
            onClick={backToMenu}
          >
            ← Menu
          </button>
          <p className="text-xs text-[var(--muted)]">Tick 200ms · autosave</p>
        </div>
        <Header
          money={money}
          reputation={reputation}
          level={level}
          xp={xp}
          day={day}
          season={season}
          stallName={settings.stallName}
        />
        <EventBanner event={activeEvent} />
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-4">
            <StallScene orders={orders} seats={seats} upgrades={upgrades} />
            <BrewBar
              progress={brewProgress}
              restockUntil={restockUntil}
              stock={stock}
              maxStock={maxStock}
              lastTickAt={lastTickAt}
            />
            <div className="flex gap-2 rounded-xl bg-black/25 p-1">
              {(['orders', 'upgrades', 'market'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`min-h-[44px] flex-1 rounded-lg px-2 text-sm font-semibold capitalize ${
                    gamePanelTab === t ? 'bg-[var(--gold)] text-black' : 'text-[var(--cream)]'
                  }`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {gamePanelTab === 'orders' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {orders.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    payout={computeOrderPayout(state, o)}
                    canServe={canServe}
                    onServe={onServe}
                  />
                ))}
                {orders.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">Waiting for customers…</p>
                ) : null}
              </div>
            ) : null}
            {gamePanelTab === 'upgrades' ? (
              <div className="grid gap-3 md:grid-cols-2">
                {UPGRADES.map((u) => (
                  <UpgradeCard
                    key={u.id}
                    def={u}
                    level={upgrades[u.id] ?? 0}
                    cost={upgradeCost(state, u.id, u.baseCost, u.maxLevel)}
                    onBuy={buyUpgrade}
                    money={money}
                  />
                ))}
              </div>
            ) : null}
            {gamePanelTab === 'market' ? <MarketPanel state={state} /> : null}
          </div>
          <div className="flex flex-col gap-4">
            <LeaderboardPanel
              local={leaderboard}
              global={globalLeaderboard}
              tab={boardTab}
              onTab={setBoardTab}
            />
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--gold)]">Active quests</p>
              <div className="flex max-h-[420px] flex-col gap-2 overflow-auto scroll-thin pr-1">
                {activeQuests.map((q) => (
                  <QuestCard key={q.id} quest={q} progress={getQuestProgress(state, q)} />
                ))}
                {activeQuests.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">All quests cleared — you legend.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      {pendingLevelUp ? (
        <LevelUpModal
          pending={pendingLevelUp}
          onClose={() => {
            soundManager.play('celebrate', settings.sound)
            dismissLevelUp()
          }}
        />
      ) : (
        <QuestCompleteModal
          quest={pendingQuest}
          onClose={() => {
            soundManager.play('celebrate', settings.sound)
            dismissQuest()
          }}
          nextPreview={nextQuestPreview}
        />
      )}
      {pendingEventChoice === 'health_inspector' ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-md rounded-2xl border border-[var(--orange)] bg-[var(--bg-surface)] p-6">
            <p className="text-lg font-semibold text-[var(--cream)]">Health Inspector</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Pay ₹30 fine or take a reputation hit (−10).
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="min-h-[48px] flex-1 rounded-xl bg-[var(--gold)] px-3 py-2 font-semibold text-black disabled:opacity-40"
                disabled={money < 30}
                onClick={() => resolveInspector(true)}
              >
                Pay ₹30
              </button>
              <button
                type="button"
                className="min-h-[48px] flex-1 rounded-xl border border-[var(--brown)] px-3 py-2 font-semibold text-[var(--cream)]"
                onClick={() => resolveInspector(false)}
              >
                Take −10 rep
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MarketPanel({ state }: { state: GameState }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-[var(--brown)] bg-[var(--bg-card)] p-3">
        <p className="mb-2 font-semibold text-[var(--gold)]">Chai flavors</p>
        <ul className="space-y-2 text-sm">
          {FLAVORS.map((f) => {
            const ok = isFlavorUnlocked(state, f.id)
            return (
              <li key={f.id} className="flex justify-between gap-2">
                <span className={ok ? 'text-[var(--cream)]' : 'text-[var(--muted)] line-through'}>
                  {f.label}
                </span>
                <span className="text-[var(--muted)]">{ok ? `₹${f.basePrice}` : 'Locked'}</span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="rounded-xl border border-[var(--brown)] bg-[var(--bg-card)] p-3">
        <p className="mb-2 font-semibold text-[var(--gold)]">Snacks</p>
        <ul className="space-y-2 text-sm">
          {SNACKS.map((s) => {
            const ok = isSnackUnlocked(state, s.id)
            return (
              <li key={s.id} className="flex justify-between gap-2">
                <span className={ok ? 'text-[var(--cream)]' : 'text-[var(--muted)] line-through'}>
                  {s.label}
                </span>
                <span className="text-[var(--muted)]">{ok ? `+₹${s.upsell}` : 'Locked'}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
