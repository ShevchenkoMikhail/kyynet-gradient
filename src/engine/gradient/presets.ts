import type { DictKey } from '../../i18n/locales/keys'

export type PresetStop = {
  position: number
  color: string
}

export type GradientPreset = {
  id: string
  nameKey: DictKey
  stops: PresetStop[]
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'sunset',
    nameKey: 'preset.sunset',
    stops: [
      { position: 0,    color: '#ff6b6b' },
      { position: 0.5,  color: '#ffa15c' },
      { position: 1,    color: '#ffe066' },
    ],
  },
  {
    id: 'ocean',
    nameKey: 'preset.ocean',
    stops: [
      { position: 0, color: '#0081a7' },
      { position: 1, color: '#00d6b8' },
    ],
  },
  {
    id: 'vaporwave',
    nameKey: 'preset.vaporwave',
    stops: [
      { position: 0,   color: '#ff71ce' },
      { position: 0.5, color: '#b967ff' },
      { position: 1,   color: '#01cdfe' },
    ],
  },
  {
    id: 'fire',
    nameKey: 'preset.fire',
    stops: [
      { position: 0,   color: '#fff200' },
      { position: 0.5, color: '#ff6b00' },
      { position: 1,   color: '#d62828' },
    ],
  },
  {
    id: 'forest',
    nameKey: 'preset.forest',
    stops: [
      { position: 0, color: '#134e5e' },
      { position: 1, color: '#71b280' },
    ],
  },
  {
    id: 'royal',
    nameKey: 'preset.royal',
    stops: [
      { position: 0,   color: '#1a1a2e' },
      { position: 0.5, color: '#533483' },
      { position: 1,   color: '#e94560' },
    ],
  },
  {
    id: 'candy',
    nameKey: 'preset.candy',
    stops: [
      { position: 0,   color: '#ff69b4' },
      { position: 0.5, color: '#ffd700' },
      { position: 1,   color: '#87ceeb' },
    ],
  },
  {
    id: 'neon',
    nameKey: 'preset.neon',
    stops: [
      { position: 0, color: '#00ff87' },
      { position: 1, color: '#60efff' },
    ],
  },
  {
    id: 'rainbow',
    nameKey: 'preset.rainbow',
    stops: [
      { position: 0,    color: '#ff0000' },
      { position: 0.17, color: '#ff9900' },
      { position: 0.33, color: '#ffff00' },
      { position: 0.5,  color: '#00ff00' },
      { position: 0.67, color: '#0099ff' },
      { position: 0.83, color: '#6633ff' },
      { position: 1,    color: '#cc00ff' },
    ],
  },
  {
    id: 'galaxy',
    nameKey: 'preset.galaxy',
    stops: [
      { position: 0,   color: '#0f0c29' },
      { position: 0.5, color: '#302b63' },
      { position: 1,   color: '#24243e' },
    ],
  },
  {
    id: 'mint',
    nameKey: 'preset.mint',
    stops: [
      { position: 0, color: '#00c9a7' },
      { position: 1, color: '#a8eb12' },
    ],
  },
  {
    id: 'cherry',
    nameKey: 'preset.cherry',
    stops: [
      { position: 0, color: '#eb3349' },
      { position: 1, color: '#f45c43' },
    ],
  },
]
