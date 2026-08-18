import { useEffect, useMemo, useState } from 'react'
import './evacuation-plan.css'

type FieldMap = Record<string, string>
type RouteId = 'EAST' | 'ALT_EAST' | 'SOUTH' | 'NORTH'
type DestinationStatus = 'Not called' | 'Available' | 'Full' | 'No answer' | 'Unavailable'
type DestinationStatusMap = Record<string, DestinationStatus>

type Destination = {
  name: string
  phone: string
  type: 'RV' | 'HOTEL'
  city: string
  dog: string
  rv: string
  hookups?: string
  note?: string
}

type RoutePlan = {
  id: RouteId
  name: string
  shortName: string
  direction: string
  detail: string
  destinations: Destination[]
}

const routes: RoutePlan[] = [
  {
    id: 'EAST',
    name: 'Route A — East',
    shortName: 'East',
    direction: 'Highway 1 → Burnaby → Langley → Fraser Valley',
    detail: 'Use the Highway 1 corridor as directed. Reassess current conditions before continuing farther east.',
    destinations: [
      { name: 'Burnaby Cariboo RV Park', phone: '604-420-1722', type: 'RV', city: 'Burnaby', dog: 'Yes — confirm current rules', rv: 'RV sites', hookups: 'Full hookups available', note: 'Close-in eastbound staging option.' },
      { name: 'Fort Camping at Brae Island', phone: '604-888-8838', type: 'RV', city: 'Fort Langley', dog: 'Yes — confirm current rules', rv: 'RV sites', hookups: '30/50 amp options', note: 'Confirm space for the RV plus the SUV.' },
      { name: 'Pathfinder Camp Resorts — Agassiz-Harrison', phone: '1-866-267-3678', type: 'RV', city: 'Agassiz', dog: 'Yes — confirm current rules', rv: 'RV sites', hookups: 'Full-hookup options', note: 'Farther east; reconfirm road conditions first.' },
      { name: 'Sunnyside Campground — Cultus Lake', phone: '604-858-5253', type: 'RV', city: 'Cultus Lake', dog: 'Yes — confirm current rules', rv: 'RV sites', hookups: 'Full-hookup options', note: 'Chilliwack/Cultus Lake area.' },
      { name: 'Accent Inns Burnaby', phone: '604-473-5000', type: 'HOTEL', city: 'Burnaby', dog: 'Dog-friendly rooms', rv: 'Call about motorhome parking', note: 'Useful close-in hotel fallback.' },
      { name: 'Sandman Hotel Langley', phone: '604-888-7263', type: 'HOTEL', city: 'Langley', dog: 'Dog-friendly rooms', rv: 'Call about motorhome parking', note: 'Near Highway 1.' },
      { name: 'Best Western Plus Country Meadows Inn', phone: '604-856-9880', type: 'HOTEL', city: 'Aldergrove', dog: 'Dog-friendly rooms', rv: 'Truck/RV parking listed — reconfirm', note: 'Strong two-vehicle fallback.' },
      { name: 'Coast Chilliwack Hotel by APA', phone: '604-792-5552', type: 'HOTEL', city: 'Chilliwack', dog: 'Limited pet-room inventory', rv: 'Call about motorhome parking', note: 'Call ahead for pet inventory.' },
    ],
  },
  {
    id: 'ALT_EAST',
    name: 'Route B — Alternate East',
    shortName: 'Alt East',
    direction: 'Highway 7 → Maple Ridge → Mission → Fraser Valley',
    detail: 'Use the Highway 7 corridor as directed, then reassess before reconnecting farther east or south.',
    destinations: [
      { name: 'Burnaby Cariboo RV Park', phone: '604-420-1722', type: 'RV', city: 'Burnaby', dog: 'Yes — confirm current rules', rv: 'RV sites', hookups: 'Full hookups available', note: 'Useful before committing farther east.' },
      { name: 'Pathfinder Camp Resorts — Agassiz-Harrison', phone: '1-866-267-3678', type: 'RV', city: 'Agassiz', dog: 'Yes — confirm current rules', rv: 'RV sites', hookups: 'Full-hookup options', note: 'Lougheed Highway / Agassiz-Harrison option.' },
      { name: 'Fort Camping at Brae Island', phone: '604-888-8838', type: 'RV', city: 'Fort Langley', dog: 'Yes — confirm current rules', rv: 'RV sites', hookups: '30/50 amp options', note: 'Option if the route reconnects toward Fort Langley.' },
      { name: 'Accent Inns Burnaby', phone: '604-473-5000', type: 'HOTEL', city: 'Burnaby', dog: 'Dog-friendly rooms', rv: 'Call about motorhome parking' },
      { name: 'Sandman Hotel Langley', phone: '604-888-7263', type: 'HOTEL', city: 'Langley', dog: 'Dog-friendly rooms', rv: 'Call about motorhome parking', note: 'Fallback if reconnecting south.' },
      { name: 'Best Western Plus Country Meadows Inn', phone: '604-856-9880', type: 'HOTEL', city: 'Aldergrove', dog: 'Dog-friendly rooms', rv: 'Truck/RV parking listed — reconfirm' },
      { name: 'Coast Chilliwack Hotel by APA', phone: '604-792-5552', type: 'HOTEL', city: 'Chilliwack', dog: 'Limited pet-room inventory', rv: 'Call about motorhome parking' },
    ],
  },
  {
    id: 'SOUTH',
    name: 'Route C — South',
    shortName: 'South',
    direction: 'Highway 99 / 91 / 10 / 17 network',
    detail: 'Use the southbound network only as appropriate to the incident. Confirm RV height and route restrictions before committing.',
    destinations: [
      { name: 'Accent Inns Vancouver Airport', phone: '604-273-3311', type: 'HOTEL', city: 'Richmond', dog: 'Dog-friendly rooms', rv: 'Call about motorhome parking', note: 'Southbound hotel fallback.' },
    ],
  },
  {
    id: 'NORTH',
    name: 'Route D — North',
    shortName: 'North',
    direction: 'Highway 99 → Squamish → Whistler',
    detail: 'Use the Sea-to-Sky corridor only when the hazard direction, official instructions and road conditions make north safe.',
    destinations: [
      { name: 'Capilano River RV Park', phone: '604-987-4722', type: 'RV', city: 'West Vancouver', dog: 'Pet-friendly — confirm current rules', rv: 'RV sites', hookups: 'Serviced sites', note: 'North Shore contingency option.' },
      { name: 'Whistler RV Park & Campground', phone: '604-905-2523', type: 'RV', city: 'Whistler', dog: 'Pet-friendly — confirm current rules', rv: 'RV sites', hookups: 'Full service', note: 'Follow the park’s paved access directions.' },
      { name: 'Executive Suites Hotel & Resort Squamish', phone: '604-815-0048', type: 'HOTEL', city: 'Squamish', dog: 'Dog-friendly', rv: 'Call about motorhome parking', note: 'Sea-to-Sky hotel fallback.' },
    ],
  },
]

function readFields(): FieldMap {
  try { return JSON.parse(localStorage.getItem('rn-firesmart-evac-plan') || '{}') } catch { return {} }
}

function readDestinationStatuses(): DestinationStatusMap {
  try { return JSON.parse(localStorage.getItem('rn-firesmart-destination-statuses') || '{}') } catch { return {} }
}

export default function EvacuationPlan() {
  const [fields, setFields] = useState<FieldMap>(readFields)
  const [destinationStatuses, setDestinationStatuses] = useState<DestinationStatusMap>(readDestinationStatuses)
  const [selectedRoute, setSelectedRoute] = useState<RouteId | null>(() => {
    const saved = localStorage.getItem('rn-firesmart-selected-route') as RouteId | null
    return routes.some((route) => route.id === saved) ? saved : null
  })
  const [selectedDestination, setSelectedDestination] = useState(() => localStorage.getItem('rn-firesmart-selected-destination') || '')
  const [showCallScript, setShowCallScript] = useState(false)

  useEffect(() => { localStorage.setItem('rn-firesmart-evac-plan', JSON.stringify(fields)) }, [fields])
  useEffect(() => { localStorage.setItem('rn-firesmart-destination-statuses', JSON.stringify(destinationStatuses)) }, [destinationStatuses])
  useEffect(() => {
    if (selectedRoute) localStorage.setItem('rn-firesmart-selected-route', selectedRoute)
    else localStorage.removeItem('rn-firesmart-selected-route')
  }, [selectedRoute])
  useEffect(() => {
    if (selectedDestination) localStorage.setItem('rn-firesmart-selected-destination', selectedDestination)
    else localStorage.removeItem('rn-firesmart-selected-destination')
  }, [selectedDestination])

  const set = (key: string, value: string) => setFields((current) => ({ ...current, [key]: value }))
  const activeRoute = routes.find((route) => route.id === selectedRoute)
  const activeDestination = activeRoute?.destinations.find((destination) => destination.name === selectedDestination)
  const rallyKey = selectedRoute ? `rally-${selectedRoute}` : 'rally-none'
  const rvParks = useMemo(() => activeRoute?.destinations.filter((d) => d.type === 'RV') || [], [activeRoute])
  const hotels = useMemo(() => activeRoute?.destinations.filter((d) => d.type === 'HOTEL') || [], [activeRoute])

  const chooseRoute = (routeId: RouteId) => {
    if (selectedRoute !== routeId) setSelectedDestination('')
    setSelectedRoute(routeId)
  }

  const setDestinationStatus = (name: string, status: DestinationStatus) => {
    setDestinationStatuses((current) => ({ ...current, [name]: status }))
  }

  return (
    <div className="evac-page">
      <header className="evac-hero compact-hero">
        <div>
          <p className="evac-kicker">RN-FireSmart</p>
          <h1>Evacuation Plan</h1>
          <p>Which way are we going? Where are we staying? Where do we meet if separated? What do we do next?</p>
        </div>
        <div className="evac-rule">Official evacuation instructions always override this plan.</div>
      </header>

      <main className="evac-main">
        <section className="decision-panel">
          <div className="decision-steps" aria-label="Evacuation decision sequence">
            <span className={selectedRoute ? 'complete' : 'active'}>1 Route</span>
            <span className={selectedDestination ? 'complete' : selectedRoute ? 'active' : ''}>2 Destination</span>
            <span className={fields[rallyKey] ? 'complete' : selectedDestination ? 'active' : ''}>3 Rally Point</span>
            <span className={fields[rallyKey] && selectedDestination ? 'active' : ''}>4 Depart</span>
          </div>

          <div className="evac-heading decision-heading">
            <div><p className="evac-kicker">1 — Route</p><h2>Where are we going?</h2></div>
            <p>Choose from current conditions and official direction.</p>
          </div>
          <div className={`route-grid ${selectedRoute ? 'route-grid-compact' : ''}`}>
            {routes.map((route) => (
              <button className={`route-card route-choice ${selectedRoute === route.id ? 'selected' : ''}`} key={route.id} onClick={() => chooseRoute(route.id)}>
                <strong>{route.shortName}</strong>
                {!selectedRoute && <small>{route.direction}</small>}
              </button>
            ))}
          </div>

          {activeRoute && (
            <div className="selected-route-command">
              <div><span>Selected route</span><strong>{activeRoute.name}</strong><p>{activeRoute.direction}</p></div>
              <p>{activeRoute.detail}</p>
            </div>
          )}

          {activeRoute && (
            <>
              <div className="evac-heading step-heading"><div><p className="evac-kicker">2 — Destination</p><h2>Where are we staying?</h2></div><p>Call before departure. Confirm availability, Tucker and RV access.</p></div>

              <DestinationSection title="RV parks / campgrounds" destinations={rvParks} selectedDestination={selectedDestination} statuses={destinationStatuses} onSelect={setSelectedDestination} onStatus={setDestinationStatus} />
              <DestinationSection title="Dog-friendly hotel / motel + Tucker" destinations={hotels} selectedDestination={selectedDestination} statuses={destinationStatuses} onSelect={setSelectedDestination} onStatus={setDestinationStatus} />

              <button className="call-script-toggle" onClick={() => setShowCallScript((current) => !current)}>{showCallScript ? 'Hide call script' : 'Show call script'}</button>
              {showCallScript && <div className="call-script">We are evacuating with one dog, one SUV and one motorhome approximately {fields.rvLength || '___'} long and {fields.rvHeight || '___'} high. Do you have a pet room or RV site available tonight, and can the SUV remain with us?</div>}

              <div className="rally-command">
                <div>
                  <p className="evac-kicker">3 — Rally Point</p>
                  <h2>If separated, where do we meet?</h2>
                  <p>Neither driver turns around. Both continue to this rally point.</p>
                </div>
                <Field label={`${activeRoute.shortName} rally point`} value={fields[rallyKey]} onChange={(v) => set(rallyKey, v)} placeholder="Enter agreed location" />
              </div>

              <div className="depart-command">
                <div><p className="evac-kicker">4 — Depart</p><h2>{activeDestination ? `Primary: ${activeDestination.name}` : 'Select a destination before departure'}</h2></div>
                <div className="depart-rules">
                  <strong>RV sets the pace.</strong>
                  <span>SUV follows through the initial urban portion.</span>
                  <span>If separated: DO NOT TURN AROUND.</span>
                  <span>Both vehicles continue to the rally point.</span>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="ess-action-panel">
          <div>
            <p className="evac-kicker">Emergency Support Services</p>
            <h2>ESS / Evacuee Registration & Assistance</h2>
            <p>Create or maintain the profile before an emergency; use the incident-specific process during an evacuation.</p>
          </div>
          <div className="ess-actions">
            <a className="primary-action" href="https://ess.gov.bc.ca/" target="_blank" rel="noreferrer">Open ESS / ERA</a>
            <a className="phone-action" href="tel:18003874258">1-800-387-4258</a>
          </div>
        </section>

        <section className="evac-panel support-panel">
          <div className="evac-heading"><div><p className="evac-kicker">Operational support</p><h2>Two-vehicle rule</h2></div></div>
          <div className="two-vehicle-rule">
            <div><strong>RV</strong><span>Pace-setting vehicle</span></div>
            <div className="rule-arrow">→</div>
            <div><strong>SUV</strong><span>Follow first; scout only when safe</span></div>
          </div>
          <div className="separation-rule"><strong>IF SEPARATED: DO NOT TURN AROUND.</strong><span>Both vehicles continue to the agreed rally point.</span></div>
        </section>

        <section className="reference-stack">
          <details className="reference-details">
            <summary><span><small>Household reference</small><strong>Insurance & emergency contacts</strong></span><span>View / edit</span></summary>
            <div className="reference-content">
              <div className="contact-grid">
                <Contact label="Immediate danger" value="911" />
                <Contact label="BC highway conditions" value="1-800-550-4997" />
                <Contact label="Report a wildfire" value="*5555 / 1-800-663-5555" />
              </div>
              <div className="form-grid reference-form">
                <Field label="Insurance company" value={fields.insurer} onChange={(v) => set('insurer', v)} />
                <Field label="Emergency claims number" value={fields.claims} onChange={(v) => set('claims', v)} />
                <Field label="Policy number" value={fields.policy} onChange={(v) => set('policy', v)} />
                <Field label="Veterinarian" value={fields.vet} onChange={(v) => set('vet', v)} />
                <Field label="Vet telephone" value={fields.vetPhone} onChange={(v) => set('vetPhone', v)} />
                <Field label="Emergency veterinary clinic" value={fields.emergencyVet} onChange={(v) => set('emergencyVet', v)} />
              </div>
            </div>
          </details>

          <details className="reference-details">
            <summary><span><small>Household reference</small><strong>RV specifications</strong></span><span>View / edit</span></summary>
            <div className="reference-content">
              <div className="rv-height-card"><span>RV HEIGHT</span><strong>{fields.rvHeight || 'Not entered'}</strong><small>Height to highest rooftop component</small></div>
              <div className="form-grid reference-form">
                <Field label="Height to highest rooftop component" value={fields.rvHeight} onChange={(v) => set('rvHeight', v)} placeholder="e.g. 12 ft 8 in / 3.86 m" />
                <Field label="Overall length" value={fields.rvLength} onChange={(v) => set('rvLength', v)} />
                <Field label="Width including mirrors" value={fields.rvWidth} onChange={(v) => set('rvWidth', v)} />
                <Field label="Approx. loaded weight" value={fields.rvWeight} onChange={(v) => set('rvWeight', v)} />
                <Field label="Fuel type" value={fields.rvFuel} onChange={(v) => set('rvFuel', v)} />
                <Field label="Safe range on one tank" value={fields.rvRange} onChange={(v) => set('rvRange', v)} />
                <Field label="Licence plate" value={fields.rvPlate} onChange={(v) => set('rvPlate', v)} />
                <Field label="Propane tank / cylinders" value={fields.rvPropane} onChange={(v) => set('rvPropane', v)} />
              </div>
              <div className="evac-note">The SUV must never determine whether a route is suitable for the RV. Do not improvise onto backcountry or forestry shortcuts unless authorities explicitly direct traffic there and confirm suitability.</div>
            </div>
          </details>

          <details className="reference-details">
            <summary><span><small>Household reference</small><strong>Tucker travel information</strong></span><span>View / edit</span></summary>
            <div className="reference-content">
              <div className="form-grid reference-form">
                <Field label="Microchip / tattoo number" value={fields.tuckerId} onChange={(v) => set('tuckerId', v)} />
                <Field label="Medication" value={fields.tuckerMeds} onChange={(v) => set('tuckerMeds', v)} />
                <Field label="Normal travelling position" value={fields.tuckerTravel} onChange={(v) => set('tuckerTravel', v)} />
                <Field label="Trusted alternate caregiver" value={fields.tuckerCaregiver} onChange={(v) => set('tuckerCaregiver', v)} />
              </div>
              <div className="evac-note">Keep leash/harness, backup leash, bowls, food, water, medications, vaccination/medical records, waste bags and recent photos ready.</div>
            </div>
          </details>
        </section>

        <div className="evac-footer-rule">CHECK OFFICIAL EMERGENCY INFORMATION + ROAD CONDITIONS BEFORE CHOOSING A DIRECTION. DO NOT TAKE SHORTCUTS. IF SEPARATED, BOTH VEHICLES CONTINUE TO THE AGREED RALLY POINT.</div>
      </main>
    </div>
  )
}

function DestinationSection({ title, destinations, selectedDestination, statuses, onSelect, onStatus }: { title: string; destinations: Destination[]; selectedDestination: string; statuses: DestinationStatusMap; onSelect: (name: string) => void; onStatus: (name: string, status: DestinationStatus) => void }) {
  return (
    <div className="destination-section">
      <h3>{title}</h3>
      {destinations.length === 0 ? <div className="evac-note">No standing option has been assigned to this corridor yet. Add more options before relying on this route.</div> : (
        <div className="destination-grid operational-destinations">
          {destinations.map((destination) => (
            <article className={`destination-card ${selectedDestination === destination.name ? 'selected' : ''}`} key={destination.name}>
              <button className="destination-select" onClick={() => onSelect(destination.name)}>
                <span className="destination-type">{destination.type === 'RV' ? 'RV PARK' : 'HOTEL / MOTEL'}</span>
                <strong>{destination.name}</strong>
                <small>{destination.city}</small>
              </button>
              <div className="destination-facts">
                <span><b>Tucker:</b> {destination.dog}</span>
                <span><b>RV:</b> {destination.rv}</span>
                {destination.hookups && <span><b>Hookups:</b> {destination.hookups}</span>}
                {destination.note && <span>{destination.note}</span>}
              </div>
              <div className="destination-actions">
                <a href={`tel:${destination.phone.replace(/[^0-9]/g, '')}`}>Call {destination.phone}</a>
                <select value={statuses[destination.name] || 'Not called'} onChange={(event) => onStatus(destination.name, event.target.value as DestinationStatus)} aria-label={`Call status for ${destination.name}`}>
                  <option>Not called</option><option>Available</option><option>Full</option><option>No answer</option><option>Unavailable</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function Contact({ label, value }: { label: string; value: string }) {
  return <article className="contact-card"><span>{label}</span><strong>{value}</strong></article>
}

function Field({ label, value = '', onChange, placeholder = '' }: { label: string; value?: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="evac-field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>
}
