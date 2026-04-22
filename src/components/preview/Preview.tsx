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

type SceneGroup = {
  id: 'brand' | 'nature' | 'neutral'
  items: Array<{ id: Scene; labelKey: DictKey; swatch: string }>
}

const SCENE_GROUPS: SceneGroup[] = [
  {
    id: 'brand',
    items: [
      { id: 'original', labelKey: 'preview.sceneOriginal', swatch: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
    ],
  },
  {
    id: 'nature',
    items: [
      { id: 'grass',     labelKey: 'preview.sceneGrass',     swatch: '#3a6730' },
      { id: 'sandstone', labelKey: 'preview.sceneSandstone', swatch: '#d9b574' },
      { id: 'sky',       labelKey: 'preview.sceneSky',       swatch: '#62b6d4' },
      { id: 'darkSky',   labelKey: 'preview.sceneDarkSky',   swatch: '#0e1a3d' },
    ],
  },
  {
    id: 'neutral',
    items: [
      { id: 'white',    labelKey: 'preview.sceneWhite',    swatch: '#ffffff' },
      { id: 'gray',     labelKey: 'preview.sceneGray',     swatch: '#808080' },
      { id: 'darkGray', labelKey: 'preview.sceneDarkGray', swatch: '#3a3a3a' },
      { id: 'black',    labelKey: 'preview.sceneBlack',    swatch: '#0a0a0a' },
    ],
  },
]

const ALL_SCENES = SCENE_GROUPS.flatMap(g => g.items)

type Props = {
  segments: Segment[]
}

export function Preview({ segments }: Props) {
  const { t } = useT()
  const [scene, setScene] = useState<Scene>('original')
  const [hoveredScene, setHoveredScene] = useState<Scene | null>(null)

  const displayedSceneId = hoveredScene ?? scene
  const displayedScene = ALL_SCENES.find(s => s.id === displayedSceneId)

  return (
    <section className="preview" aria-label={t('preview.heading')}>
      <div className="preview__header">
        <h2 className="kn-section-heading">{t('preview.heading')}</h2>

        <div
          className="preview__scene-switcher"
          role="toolbar"
          aria-label="Preview scenes"
          onMouseLeave={() => setHoveredScene(null)}
        >
          {displayedScene && (
            <div className="preview__scene-label" aria-live="polite">
              {t(displayedScene.labelKey)}
            </div>
          )}
          <div className="preview__scenes">
            {SCENE_GROUPS.map((group, gi) => (
              <div key={group.id} className="preview__scene-group">
                {group.items.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`preview__scene-btn${s.id === scene ? ' preview__scene-btn--active' : ''}`}
                    onClick={() => setScene(s.id)}
                    onMouseEnter={() => setHoveredScene(s.id)}
                    onFocus={() => setHoveredScene(s.id)}
                    onBlur={() => setHoveredScene(null)}
                    title={t(s.labelKey)}
                    aria-label={t(s.labelKey)}
                    aria-pressed={s.id === scene}
                    style={{ background: s.swatch }}
                  >
                    <span className="preview__scene-btn-ring" aria-hidden="true" />
                  </button>
                ))}
                {gi < SCENE_GROUPS.length - 1 && (
                  <span className="preview__scene-divider" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
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
