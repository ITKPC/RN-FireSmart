import { useEffect, useMemo, useState } from 'react'
import './vehicle-readiness.css'

type VehicleDecision = 'UNDECIDED' | 'COMING' | 'LEAVING'
type VehicleState = Record<string, VehicleDecision>
type ChecklistState = Record<string, boolean>

type VehiclePlan = {
  id: string
  name: string
  subtitle: string
  coming: string[]
  leaving: string[]
}

const vehicles: VehiclePlan[] = [
  {
    id: 'boat',
    name: 'Boat',
    subtitle: 'Boat and trailer',
    coming: [
      'Confirm tow vehicle and assigned driver.',
      'Confirm trailer is road-ready and coupled correctly.',
      'Confirm boat and trailer registration / insurance information is available.',
      'Take boat keys from the Vehicle & Recreation Key Set.',
      'Secure loose equipment for travel.',
      'Confirm destination has space for boat and trailer.',
    ],
    leaving: [
      'Photograph boat and trailer condition.',
      'Confirm current storage location is recorded.',
      'Remove loose valuables or irreplaceable items if practical before Alert.',
      'Take boat keys in the Vehicle & Recreation Key Set.',
      'Confirm insurance and identifying information are available digitally.',
    ],
  },
  {
    id: 'seadoo',
    name: 'Sea-Doo',
    subtitle: 'Sea-Doo and trailer',
    coming: [
      'Confirm tow vehicle and assigned driver.',
      'Confirm trailer is road-ready and coupled correctly.',
      'Take Sea-Doo keys from the Vehicle & Recreation Key Set.',
      'Secure equipment for travel.',
      'Confirm registration / insurance information is available.',
      'Confirm destination has trailer parking.',
    ],
    leaving: [
      'Photograph Sea-Doo and trailer condition.',
      'Confirm storage location is recorded.',
      'Take Sea-Doo keys in the Vehicle & Recreation Key Set.',
      'Confirm insurance and identifying information are available digitally.',
    ],
  },
  {
    id: 'marlin',
    name: '65 Marlin',
    subtitle: '1965 Marlin',
    coming: [
      'Confirm fuel level and mechanical readiness.',
      'Confirm assigned driver.',
      'Take Marlin keys from the Vehicle & Recreation Key Set.',
      'Confirm registration and insurance information are available.',
      'Load only the personal duffles assigned to the driver if this is their evacuation vehicle.',
      'Photograph odometer before departure.',
    ],
    leaving: [
      'Park in the agreed safest available location.',
      'Close windows and remove valuables.',
      'Photograph exterior, interior and odometer.',
      'Take Marlin keys in the Vehicle & Recreation Key Set.',
      'Confirm insurance and identifying information are available digitally.',
    ],
  },
  {
    id: 'm2',
    name: 'M2',
    subtitle: 'BMW M2',
    coming: [
      'Confirm fuel level.',
      'Confirm assigned driver.',
      'Confirm daily-use BMW key is with the driver.',
      'Load that driver’s E-Duffle and P-Duffle.',
      'Confirm phone and charging are available.',
      'Photograph odometer before departure.',
    ],
    leaving: [
      'Park in the agreed safest available location.',
      'Close windows and remove valuables.',
      'Photograph exterior, interior and odometer.',
      'Take spare BMW M2 key in the Vehicle & Recreation Key Set.',
      'Confirm insurance and registration information are available digitally.',
    ],
  },
  {
    id: 'f150',
    name: 'F-150',
    subtitle: 'Ford F-150',
    coming: [
      'Confirm fuel level.',
      'Confirm assigned driver.',
      'Confirm daily-use F-150 key is with the driver.',
      'Load that driver’s E-Duffle and P-Duffle.',
      'Confirm emergency vehicle kit is onboard.',
      'Photograph odometer before departure.',
    ],
    leaving: [
      'Park in the agreed safest available location.',
      'Close windows and remove valuables from cab / box.',
      'Photograph exterior, interior and odometer.',
      'Take spare F-150 key in the Vehicle & Recreation Key Set.',
      'Confirm insurance and registration information are available digitally.',
    ],
  },
  {
    id: 'suv',
    name: 'SUV',
    subtitle: 'Primary evacuation support vehicle',
    coming: [
      'Confirm fuel level.',
      'Confirm assigned driver.',
      'Load that driver’s E-Duffle and P-Duffle.',
      'Keep dedicated emergency vehicle kit onboard.',
      'Confirm phone, charging and paper / offline route information.',
      'Photograph odometer before departure.',
    ],
    leaving: [
      'Park in the agreed safest available location.',
      'Close windows and remove valuables.',
      'Photograph exterior, interior and odometer.',
      'Take all relevant keys.',
      'Confirm insurance and registration information are available digitally.',
    ],
  },
  {
    id: 'rv',
    name: 'RV',
    subtitle: '14-day evacuation platform',
    coming: [
      'Confirm fuel, propane and fresh water.',
      'Confirm batteries / power systems and sleeping setup are ready.',
      'Load 14-day dry goods and consumables at Elevated Readiness.',
      'Load all six Go Boxes at Evacuation Alert.',
      'Load Personal Documents Binder at Evacuation Alert.',
      'Load Vehicle & Recreation Key Set at Evacuation Alert.',
      'Confirm assigned driver and that driver’s E-Duffle and P-Duffle are onboard.',
      'Confirm RV height, length, width, fuel range and route constraints are known.',
      'Confirm Tucker travel position and supplies.',
      'Confirm departure-ready status.',
    ],
    leaving: [
      'Park in the agreed safest available location.',
      'Close windows, vents and doors as appropriate.',
      'Remove loose valuables and critical documents.',
      'Photograph exterior, interior and odometer.',
      'Take RV keys.',
      'Confirm insurance, registration and identifying information are available digitally.',
      'Record why the RV is unavailable / being left (for example winterized or maintenance).',
    ],
  },
]

function readDecisions(): VehicleState {
  try { return JSON.parse(localStorage.getItem('rn-firesmart-vehicle-decisions') || '{}') } catch { return {} }
}
function readChecks(): ChecklistState {
  try { return JSON.parse(localStorage.getItem('rn-firesmart-vehicle-checks') || '{}') } catch { return {} }
}

export default function VehicleReadiness() {
  const [selected, setSelected] = useState('rv')
  const [decisions, setDecisions] = useState<VehicleState>(readDecisions)
  const [checks, setChecks] = useState<ChecklistState>(readChecks)

  useEffect(() => { localStorage.setItem('rn-firesmart-vehicle-decisions', JSON.stringify(decisions)) }, [decisions])
  useEffect(() => { localStorage.setItem('rn-firesmart-vehicle-checks', JSON.stringify(checks)) }, [checks])

  const vehicle = vehicles.find((item) => item.id === selected) || vehicles[0]
  const decision = decisions[vehicle.id] || 'UNDECIDED'
  const tasks = decision === 'COMING' ? vehicle.coming : decision === 'LEAVING' ? vehicle.leaving : []
  const done = useMemo(() => tasks.filter((_, i) => checks[`${vehicle.id}-${decision}-${i}`]).length, [tasks, checks, vehicle.id, decision])
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const setDecision = (next: VehicleDecision) => {
    setDecisions((current) => ({ ...current, [vehicle.id]: next }))
  }

  return (
    <div className="vehicle-page">
      <header className="vehicle-hero">
        <div>
          <p className="vehicle-kicker">Evacuation asset decisions</p>
          <h1>Vehicles & Recreation</h1>
          <p>Every vehicle needs a plan whether it is coming with you or being left behind.</p>
        </div>
        <div className="vehicle-score">
          <span>Selected asset</span>
          <strong>{vehicle.name}</strong>
          <small>{decision === 'UNDECIDED' ? 'Decision not made' : decision === 'COMING' ? 'Coming with us' : 'Leaving behind'}</small>
        </div>
      </header>

      <main className="vehicle-main">
        <section className="vehicle-panel">
          <div className="vehicle-button-grid">
            {vehicles.map((item) => {
              const state = decisions[item.id] || 'UNDECIDED'
              return <button key={item.id} className={`vehicle-select ${selected === item.id ? 'active' : ''}`} onClick={() => setSelected(item.id)}><strong>{item.name}</strong><span>{state === 'UNDECIDED' ? 'Not decided' : state === 'COMING' ? 'Coming' : 'Leaving'}</span></button>
            })}
          </div>
        </section>

        <section className="vehicle-panel">
          <div className="vehicle-section-heading">
            <div><p className="vehicle-kicker">{vehicle.subtitle}</p><h2>{vehicle.name}</h2></div>
            <p>Choose the evacuation decision. The checklist changes to match.</p>
          </div>

          <div className="vehicle-decision-row">
            <button className={decision === 'COMING' ? 'decision-active coming' : ''} onClick={() => setDecision('COMING')}>COMING WITH US</button>
            <button className={decision === 'LEAVING' ? 'decision-active leaving' : ''} onClick={() => setDecision('LEAVING')}>LEAVING BEHIND</button>
            <button className={decision === 'UNDECIDED' ? 'decision-active' : ''} onClick={() => setDecision('UNDECIDED')}>NOT DECIDED</button>
          </div>

          {decision === 'UNDECIDED' ? (
            <div className="vehicle-undecided">Make the decision before an Evacuation Alert whenever possible. The goal at Alert is execution, not deciding what to save.</div>
          ) : (
            <>
              <div className="vehicle-progress"><span style={{ width: `${percent}%` }} /></div>
              <div className="vehicle-progress-copy">{done} of {tasks.length} complete</div>
              <div className="vehicle-kit-list">
                {tasks.map((task, index) => {
                  const key = `${vehicle.id}-${decision}-${index}`
                  return <label className={`vehicle-kit-row ${checks[key] ? 'done' : ''}`} key={key}><input type="checkbox" checked={Boolean(checks[key])} onChange={(e) => setChecks((current) => ({ ...current, [key]: e.target.checked }))} /><span>{task}</span></label>
                })}
              </div>
            </>
          )}
        </section>

        <section className="vehicle-panel vehicle-note-panel">
          <h2>Shared key rule</h2>
          <p>The Vehicle & Recreation Key Set in the drawer goes into the RV at Evacuation Alert. It includes the boat, Sea-Doo, Marlin, BMW M2 and Ford F-150 keys.</p>
          <p>Daily-use keys for whichever vehicles are actually being driven stay with the assigned driver.</p>
        </section>
      </main>
    </div>
  )
}
