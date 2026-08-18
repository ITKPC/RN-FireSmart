import { useEffect, useMemo, useState } from 'react'
import './vehicle-readiness.css'

type KitStatus = Record<string, boolean>

const suvKit = [
  { id: 'food', label: 'Non-perishable food, such as energy bars' },
  { id: 'water', label: 'Water in plastic bottles; replace every six months' },
  { id: 'blanket', label: 'Blanket' },
  { id: 'clothing', label: 'Extra clothing and shoes or boots' },
  { id: 'firstaid', label: 'First aid kit' },
  { id: 'shovel', label: 'Small shovel, ice scraper and snow brush' },
  { id: 'candle', label: 'Candle in a deep can and matches' },
  { id: 'flashlight', label: 'Wind-up or battery-independent flashlight' },
  { id: 'whistle', label: 'Whistle' },
  { id: 'maps', label: 'Road maps / offline route information' },
  { id: 'traction', label: 'Sand, salt or non-clumping cat litter for traction' },
  { id: 'washer', label: 'Antifreeze / windshield washer fluid' },
  { id: 'towrope', label: 'Tow rope' },
  { id: 'jumpers', label: 'Jumper cables' },
  { id: 'extinguisher', label: 'Vehicle-rated fire extinguisher' },
  { id: 'warning', label: 'Warning light or road flares / emergency triangles' },
]

function readKit(): KitStatus {
  try {
    const saved = localStorage.getItem('rn-firesmart-suv-kit')
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export default function VehicleReadiness() {
  const [kit, setKit] = useState<KitStatus>(readKit)

  useEffect(() => {
    localStorage.setItem('rn-firesmart-suv-kit', JSON.stringify(kit))
  }, [kit])

  const complete = useMemo(() => suvKit.filter((item) => kit[item.id]).length, [kit])
  const percent = Math.round((complete / suvKit.length) * 100)

  return (
    <div className="vehicle-page">
      <header className="vehicle-hero">
        <div>
          <p className="vehicle-kicker">Evacuation vehicle readiness</p>
          <h1>SUV</h1>
          <p>Keep a dedicated emergency kit in the SUV so it remains useful even if the RV is unavailable.</p>
        </div>
        <div className="vehicle-score">
          <span>Emergency kit</span>
          <strong>{percent}%</strong>
          <small>{complete} of {suvKit.length} items confirmed</small>
        </div>
      </header>

      <main className="vehicle-main">
        <section className="vehicle-panel">
          <div className="vehicle-section-heading">
            <div>
              <p className="vehicle-kicker">Always in the SUV</p>
              <h2>Emergency kit</h2>
            </div>
            <p>These are baseline vehicle supplies. They are not dependent on the wildfire stage.</p>
          </div>

          <div className="vehicle-progress"><span style={{ width: `${percent}%` }} /></div>

          <div className="vehicle-kit-list">
            {suvKit.map((item) => (
              <label className={`vehicle-kit-row ${kit[item.id] ? 'done' : ''}`} key={item.id}>
                <input
                  type="checkbox"
                  checked={Boolean(kit[item.id])}
                  onChange={(event) => setKit((current) => ({ ...current, [item.id]: event.target.checked }))}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="vehicle-panel vehicle-note-panel">
          <h2>Fire-season rule</h2>
          <p>Keep this kit physically in the SUV. E-Duffles and P-Duffles still follow Nancy or Rick into whichever vehicle that person is driving.</p>
          <p>The SUV kit is supplemental; it does not replace the six Go Boxes, Tucker supplies, the RV load plan, or the personal duffles.</p>
        </section>

        <p className="vehicle-source-note">SUV emergency-kit checklist adapted from the vehicle emergency-kit checklist image you supplied.</p>
      </main>
    </div>
  )
}
