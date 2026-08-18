import { useEffect, useState } from 'react'
import './evacuation-plan.css'

type RouteId = 'EAST' | 'SOUTHEAST' | 'NORTH' | 'NORTHWEST' | 'SOUTH'

type RoutePlan = {
  id: RouteId
  shortName: string
  highway: string
  corridor: string
  guidance: string
}

const routes: RoutePlan[] = [
  {
    id: 'EAST',
    shortName: 'East',
    highway: 'Hwy 1',
    corridor: 'Kamloops → Chase → Salmon Arm → Sicamous → Revelstoke → Golden',
    guidance: 'A logical eastbound corridor when the threat is west, south, or localized around Kamloops.',
  },
  {
    id: 'SOUTHEAST',
    shortName: 'Southeast',
    highway: 'Hwy 97',
    corridor: 'Kamloops → Monte Creek → Falkland → Vernon → Kelowna / Okanagan',
    guidance: 'A southeast option into the Okanagan without committing toward the Lower Mainland.',
  },
  {
    id: 'NORTH',
    shortName: 'North',
    highway: 'Hwy 5',
    corridor: 'Kamloops → Barriere → Little Fort → Clearwater → Blue River → Tête Jaune Cache',
    guidance: 'A geographically distinct escape corridor from the Thompson and Okanagan routes.',
  },
  {
    id: 'NORTHWEST',
    shortName: 'Northwest',
    highway: 'Hwy 1 / Hwy 97',
    corridor: 'Kamloops → Cache Creek → Clinton → 100 Mile House → Williams Lake → Prince George',
    guidance: 'The Cariboo corridor provides a substantial northbound option away from the Southern Interior.',
  },
  {
    id: 'SOUTH',
    shortName: 'South',
    highway: 'Hwy 5',
    corridor: 'Kamloops → Merritt → Hope',
    guidance: 'A southbound corridor with additional branching possibilities from Merritt and Hope.',
  },
]

function readRoute(): RouteId | null {
  const saved = localStorage.getItem('rn-firesmart-selected-route') as RouteId | null
  return routes.some((route) => route.id === saved) ? saved : null
}

export default function EvacuationPlan() {
  const [selectedRoute, setSelectedRoute] = useState<RouteId | null>(readRoute)
  const [destination, setDestination] = useState(() => localStorage.getItem('rn-firesmart-destination') || '')
  const [rallyPoint, setRallyPoint] = useState(() => localStorage.getItem('rn-firesmart-rally-point') || '')

  useEffect(() => {
    if (selectedRoute) localStorage.setItem('rn-firesmart-selected-route', selectedRoute)
    else localStorage.removeItem('rn-firesmart-selected-route')
  }, [selectedRoute])

  useEffect(() => { localStorage.setItem('rn-firesmart-destination', destination) }, [destination])
  useEffect(() => { localStorage.setItem('rn-firesmart-rally-point', rallyPoint) }, [rallyPoint])

  const activeRoute = routes.find((route) => route.id === selectedRoute)

  return (
    <div className="evac-page">
      <header className="evac-hero">
        <div>
          <p className="evac-kicker">RN-FireSmart</p>
          <h1>Evacuation Plan</h1>
          <p>Choose the safest usable corridor, decide where we are going, agree where we meet, then leave.</p>
        </div>
        <div className="evac-rule">Official evacuation instructions always override this household plan.</div>
      </header>

      <main className="evac-main">
        <section className="decision-panel">
          <div className="decision-steps" aria-label="Evacuation decision sequence">
            <span className={selectedRoute ? 'complete' : 'active'}>1 Route</span>
            <span className={destination ? 'complete' : selectedRoute ? 'active' : ''}>2 Destination</span>
            <span className={rallyPoint ? 'complete' : destination ? 'active' : ''}>3 Rally Point</span>
            <span className={selectedRoute && destination && rallyPoint ? 'active' : ''}>4 Depart</span>
          </div>

          <div className="route-toolbar">
            <div>
              <p className="evac-kicker">1 — Route</p>
              <h2>Which corridor is safe right now?</h2>
              <p>Check current road conditions before choosing. Keep RN-FireSmart open while DriveBC opens in a new tab.</p>
            </div>
            <a
              className="drivebc-button"
              href="https://www.drivebc.ca/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Check DriveBC ↗
            </a>
          </div>

          <div className="route-grid">
            {routes.map((route) => (
              <button
                type="button"
                className={`route-card ${selectedRoute === route.id ? 'selected' : ''}`}
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
              >
                <div className="route-card-topline">
                  <strong>{route.shortName}</strong>
                  <span>{route.highway}</span>
                </div>
                <p className="route-corridor">{route.corridor}</p>
                <small>{route.guidance}</small>
                {selectedRoute === route.id && <b className="selected-badge">Selected</b>}
              </button>
            ))}
          </div>

          {activeRoute && (
            <div className="selected-route-command">
              <div>
                <span>Selected corridor</span>
                <strong>{activeRoute.shortName} — {activeRoute.highway}</strong>
              </div>
              <p>{activeRoute.corridor}</p>
            </div>
          )}
        </section>

        <section className="evac-panel destination-panel">
          <div className="evac-heading">
            <div>
              <p className="evac-kicker">2 — Destination</p>
              <h2>Where are we staying?</h2>
            </div>
            <p>Choose this after the safe corridor is known. Confirm availability, Tucker acceptance and RV access before relying on a property.</p>
          </div>
          <label className="evac-field">
            <span>Selected destination</span>
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="RV park, hotel, family/friend or ESS direction"
            />
          </label>
          <p className="destination-note">Destination cards can be added per corridor as we verify the actual RV parks and dog-friendly accommodation we would use.</p>
        </section>

        <section className="rally-command">
          <div>
            <p className="evac-kicker">3 — Rally Point</p>
            <h2>If separated, where do we meet?</h2>
            <p>Neither driver turns around. Both vehicles continue to the agreed rally point.</p>
          </div>
          <label className="evac-field">
            <span>Agreed rally point</span>
            <input value={rallyPoint} onChange={(event) => setRallyPoint(event.target.value)} placeholder="Enter agreed location" />
          </label>
        </section>

        <section className="depart-command">
          <div>
            <p className="evac-kicker">4 — Depart</p>
            <h2>{selectedRoute && destination && rallyPoint ? 'Departure plan is set.' : 'Complete the three decisions above.'}</h2>
          </div>
          <div className="depart-rules">
            <strong>RV sets the pace.</strong>
            <span>SUV follows through the initial urban portion.</span>
            <span>If separated: DO NOT TURN AROUND.</span>
            <span>Both vehicles continue to the rally point.</span>
          </div>
        </section>

        <section className="ess-action-panel">
          <div>
            <p className="evac-kicker">Emergency Support Services</p>
            <h2>ESS / Evacuee Registration & Assistance</h2>
            <p>Use the provincial service when directed or when emergency support is required.</p>
          </div>
          <div className="ess-actions">
            <a className="primary-action" href="https://ess.gov.bc.ca/" target="_blank" rel="noopener noreferrer">Open ESS / ERA ↗</a>
            <a className="phone-action" href="tel:18003874258">1-800-387-4258</a>
          </div>
        </section>

        <div className="evac-footer-rule">Never delay evacuation to complete this plan. If ordered to leave, leave.</div>
      </main>
    </div>
  )
}
