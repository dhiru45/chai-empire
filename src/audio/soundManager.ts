import { Howl } from 'howler'

type SoundId = 'coin' | 'order' | 'fail' | 'celebrate'

const sfx: Partial<Record<SoundId, Howl>> = {}
let kettleHowl: Howl | null = null
let musicHowl: Howl | null = null

function sfxHowl(id: SoundId, src: string): Howl {
  if (sfx[id]) return sfx[id]!
  const h = new Howl({
    src: [src],
    volume: 0.4,
    preload: true,
    onloaderror: () => {
      try {
        h.unload()
      } catch {
        /* ignore */
      }
      delete sfx[id]
    },
  })
  sfx[id] = h
  return h
}

export const soundManager = {
  play(id: SoundId, enabled: boolean) {
    if (!enabled) return
    const paths: Record<SoundId, string> = {
      coin: '/sounds/coin.mp3',
      order: '/sounds/order.mp3',
      fail: '/sounds/fail.mp3',
      celebrate: '/sounds/celebrate.mp3',
    }
    try {
      sfxHowl(id, paths[id]).play()
    } catch {
      /* optional assets */
    }
  },

  kettleLoop(enabled: boolean, brewing: boolean) {
    if (!kettleHowl) {
      kettleHowl = new Howl({
        src: ['/sounds/kettle.mp3'],
        loop: true,
        volume: 0.22,
        preload: false,
        onloaderror: () => {
          try {
            kettleHowl?.unload()
          } catch {
            /* ignore */
          }
          kettleHowl = null
        },
      })
    }
    if (!enabled || !brewing || !kettleHowl) {
      try {
        kettleHowl?.stop()
      } catch {
        /* ignore */
      }
      return
    }
    try {
      if (!kettleHowl.playing()) kettleHowl.play()
    } catch {
      /* ignore */
    }
  },

  stopKettle() {
    try {
      kettleHowl?.stop()
    } catch {
      /* ignore */
    }
  },

  music(enabled: boolean) {
    if (!musicHowl) {
      musicHowl = new Howl({
        src: ['/sounds/music.mp3'],
        loop: true,
        volume: 0.18,
        preload: false,
        onloaderror: () => {
          try {
            musicHowl?.unload()
          } catch {
            /* ignore */
          }
          musicHowl = null
        },
      })
    }
    if (!musicHowl) return
    if (!enabled) {
      musicHowl.stop()
      return
    }
    try {
      if (!musicHowl.playing()) musicHowl.play()
    } catch {
      /* ignore */
    }
  },
}
