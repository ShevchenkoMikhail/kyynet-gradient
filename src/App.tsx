import { Header } from './components/layout/Header/Header'
import { Intro } from './components/layout/Intro/Intro'
import { Footer } from './components/layout/Footer/Footer'
import { Preview } from './components/preview/Preview'
import { Editor } from './components/editor/Editor'
import { OutputPanel } from './components/output/OutputPanel'
import { ToastHost } from './components/feedback/Toast/ToastHost'
import { ConfettiHost } from './components/feedback/Confetti/ConfettiHost'
import { LiquidBackground } from './components/feedback/LiquidBackground'
import { useFormatDoc } from './state/useFormatDoc'
import './App.css'

export default function App() {
  const doc = useFormatDoc()

  return (
    <>
      <LiquidBackground />
      <Header />
      <main className="app-main">
        <Intro />
        <div className="app-main__inner">
          <Preview segments={doc.segments} />
          <Editor
            text={doc.text}
            setText={doc.setText}
            segments={doc.segments}
            gradients={doc.gradients}
            applyColor={doc.applyColor}
            applyStyleToggle={doc.applyStyleToggle}
            applyResetRange={doc.applyResetRange}
            applyGradient={doc.applyGradient}
            clearAllFormatting={doc.clearAllFormatting}
            replaceSegments={doc.replaceSegments}
            undo={doc.undo}
            redo={doc.redo}
            canUndo={doc.canUndo}
            canRedo={doc.canRedo}
          />
          <OutputPanel outputs={doc.outputs} />
        </div>
      </main>
      <Footer />
      <ToastHost />
      <ConfettiHost />
    </>
  )
}
