import './LiquidBackground.css'

export function LiquidBackground() {
  return (
    <div className="liquid-bg" aria-hidden="true">
      <div className="liquid-bg__blob liquid-bg__blob--p1" />
      <div className="liquid-bg__blob liquid-bg__blob--p2" />
      <div className="liquid-bg__blob liquid-bg__blob--p3" />
      <div className="liquid-bg__blob liquid-bg__blob--p4" />
      <div className="liquid-bg__green liquid-bg__green--a" />
      <div className="liquid-bg__green liquid-bg__green--b" />
      <div className="liquid-bg__green liquid-bg__green--c" />
    </div>
  )
}
