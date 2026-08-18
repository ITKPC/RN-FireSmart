import { useState } from 'react'
import App from './App'
import HomeFireSmart from './HomeFireSmart'
import './home-firesmart.css'

type Area = 'readiness' | 'home'

export default function Root() {
  const [area, setArea] = useState<Area>('readiness')

  return (
    <div className="root-shell">
      <nav className="app-area-nav" aria-label="RN-FireSmart areas">
        <div className="app-area-nav-inner">
          <strong className="area-brand">RN-FireSmart</strong>
          <div className="area-tabs">
            <button className={area === 'readiness' ? 'active' : ''} onClick={() => setArea('readiness')}>
              Evacuation Readiness
            </button>
            <button className={area === 'home' ? 'active' : ''} onClick={() => setArea('home')}>
              Home FireSmart
            </button>
          </div>
        </div>
      </nav>
      {area === 'readiness' ? <App /> : <HomeFireSmart />}
    </div>
  )
}
