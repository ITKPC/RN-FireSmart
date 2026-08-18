import { useState } from 'react'
import App from './App'
import HomeFireSmart from './HomeFireSmart'
import VehicleReadiness from './VehicleReadiness'
import './home-firesmart.css'

type Area = 'readiness' | 'vehicles' | 'home'

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
            <button className={area === 'vehicles' ? 'active' : ''} onClick={() => setArea('vehicles')}>
              Vehicles
            </button>
            <button className={area === 'home' ? 'active' : ''} onClick={() => setArea('home')}>
              Home FireSmart
            </button>
          </div>
        </div>
      </nav>
      {area === 'readiness' && <App />}
      {area === 'vehicles' && <VehicleReadiness />}
      {area === 'home' && <HomeFireSmart />}
    </div>
  )
}
