import { useState } from 'react'
import type { Segment } from '../../engine/types'
import { useT, type DictKey } from '../../i18n'
import { RenderedLine } from './RenderedLine'
import './Preview.css'

type Scene =
  | 'original'
  | 'grass'
  | 'sandstone'
  | 'sky'
  | 'darkSky'
  | 'white'
  | 'gray'
  | 'darkGray'
  | 'black'

const SCENES: Array<{ id: Scene; labelKey: DictKey; swatch: string }> = [
  { id: 'original',  labelKey: 'preview.sceneOriginal',  swatch: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
  { id: 'grass',     labelKey: 'preview.sceneGrass',     swatch: '#3a6730' },
  { id: 'sandstone', labelKey: 'preview.sceneSandstone', swatch: '#d9b574' },
  { id: 'sky',       labelKey: 'preview.sceneSky',       swatch: '#62b6d4' },
  { id: 'darkSky',   labelKey: 'preview.sceneDarkSky',   swatch: '#0e1a3d' },
  { id: 'white',     labelKey: 'preview.sceneWhite',     swatch: '#ffffff' },
  { id: 'gray',      labelKey: 'preview.sceneGray',      swatch: '#808080' },
  { id: 'darkGray',  labelKey: 'preview.sceneDarkGray',  swatch: '#3a3a3a' },
  { id: 'black',     labelKey: 'preview.sceneBlack',     swatch: '#0a0a0a' },
]

type Props = {
  segments: Segment[]
}

export function Preview({ segments }: Props) {
  const { t } = useT()
  const [scene, setScene] = useState<Scene>('original')

  return (
    <section className="preview" aria-label={t('preview.heading')}>
      <div className="preview__header">
        <h2 className="kn-section-heading">{t('preview.heading')}</h2>
        <div className="preview__scenes" role="toolbar" aria-label="Preview scenes">
          {SCENES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`preview__scene-btn${s.id === scene ? ' preview__scene-btn--active' : ''}`}
              onClick={() => setScene(s.id)}
              title={t(s.labelKey)}
              aria-label={t(s.labelKey)}
              aria-pressed={s.id === scene}
              style={{ background: s.swatch }}
            />
          ))}
        </div>
      </div>
      <div className="preview__panel" data-scene={scene}>
        {segments.length === 0 ? (
          <span className="preview__empty">{t('preview.empty')}</span>
        ) : (
          <RenderedLine segments={segments} />
        )}
      </div>
    </section>
  )
}
