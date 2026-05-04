import { useRef } from 'react'
import { exportSave, importSave } from '../game/persistence'
import { useGameStore } from '../store/gameStore'

type Props = {
  onBack: () => void
}

export function SettingsScreen({ onBack }: Props) {
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const resetGame = useGameStore((s) => s.resetGame)
  const importState = useGameStore((s) => s.importState)
  const snapshot = useGameStore.getState
  const fileRef = useRef<HTMLInputElement>(null)

  const onExport = () => {
    const json = exportSave(snapshot())
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chai-empire-save.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const st = importSave(text)
      if (st) importState(st)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const onReset = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      resetGame()
      onBack()
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-primary)] px-4 py-8 text-[var(--cream)]">
      <div className="mx-auto max-w-lg space-y-6">
        <button
          type="button"
          className="text-sm text-[var(--gold)] underline"
          onClick={onBack}
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-[var(--gold)]">Settings</h1>
        <label className="block space-y-2">
          <span className="text-sm text-[var(--muted)]">Stall name</span>
          <input
            className="min-h-[48px] w-full rounded-xl border border-[var(--brown)] bg-[var(--bg-surface)] px-3 text-[var(--cream)]"
            value={settings.stallName}
            onChange={(e) => updateSettings({ stallName: e.target.value })}
          />
        </label>
        <Toggle
          label="Sound effects"
          checked={settings.sound}
          onChange={(v) => updateSettings({ sound: v })}
        />
        <Toggle
          label="Background music"
          checked={settings.music}
          onChange={(v) => updateSettings({ music: v })}
        />
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="min-h-[48px] rounded-xl bg-[var(--bg-surface)] px-4 py-3 font-semibold"
            onClick={onExport}
          >
            Export save (JSON)
          </button>
          <button
            type="button"
            className="min-h-[48px] rounded-xl border border-[var(--brown)] px-4 py-3 font-semibold"
            onClick={() => fileRef.current?.click()}
          >
            Import save
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImportFile} />
          <button
            type="button"
            className="min-h-[48px] rounded-xl bg-[var(--red)]/80 px-4 py-3 font-semibold text-black"
            onClick={onReset}
          >
            Reset game
          </button>
        </div>
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      className="flex min-h-[48px] w-full items-center justify-between rounded-xl border border-[var(--brown)] bg-[var(--bg-surface)] px-4"
      onClick={() => onChange(!checked)}
    >
      <span>{label}</span>
      <span className="font-semibold text-[var(--gold)]">{checked ? 'On' : 'Off'}</span>
    </button>
  )
}
