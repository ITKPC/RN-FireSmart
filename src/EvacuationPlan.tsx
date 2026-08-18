import { useEffect, useState } from 'react'
import './evacuation-plan.css'

type FieldMap = Record<string, string>
type RouteId = 'EAST' | 'ALT_EAST' | 'SOUTH' | 'NORTH'

type Destination = {
  name: string
  phone: string
  note?: string
}

type RoutePlan = {
  id: RouteId
  name: string
  detail: string
  rvParks: Destination[]
  hotels: Destination[]
}

const routes: RoutePlan[] = [
  {
    id: 'EAST',
    name: 'Route A — East',
    detail: 'Highway 1 toward Burnaby, Langley, Abbotsford and Chilliwack. Reassess before continuing beyond Hope.',
    rvParks: [
      { name: 'Burnaby Cariboo RV Park', phone: '604-420-1722', note: 'Close-in eastbound staging option.' },
      { name: 'Fort Camping at Brae Island', phone: '604-888-8838', note: 'Fort Langley. Confirm space for the RV plus the SUV.' },
      { name: 'Pathfinder Camp Resorts — Agassiz-Harrison', phone: '1-866-267-3678', note: 'Farther east option; reconfirm route conditions first.' },
      { name: 'Sunnyside Campground — Cultus Lake', phone: '604-858-5253', note: 'Chilliwack/Cultus Lake area.' },
    ],
    hotels: [
      { name: 'Accent Inns Burnaby', phone: '604-473-5000', note: 'Dog-friendly; ask specifically about RV parking.' },
      { name: 'Sandman Hotel Langley', phone: '604-888-7263', note: 'Dog-friendly rooms; near Highway 1.' },
      { name: 'Best Western Plus Country Meadows Inn — Aldergrove', phone: '604-856-9880', note: 'Dog-friendly and a strong fallback because truck/RV parking is listed.' },
      { name: 'Coast Chilliwack Hotel by APA', phone: '604-792-5552', note: 'Limited pet-room inventory; call ahead.' },
    ],
  },
  {
    id: 'ALT_EAST',
    name: 'Route B — Alternate East',
    detail: 'Highway 7 toward Pitt Meadows, Maple Ridge and Mission, then reassess toward the Fraser Valley.',
    rvParks: [
      { name: 'Burnaby Cariboo RV Park', phone: '604-420-1722', note: 'Useful before committing farther east.' },
      { name: 'Pathfinder Camp Resorts — Agassiz-Harrison', phone: '1-866-267-3678', note: 'Lougheed Highway / Agassiz-Harrison option.' },
      { name: 'Fort Camping at Brae Island', phone: '604-888-8838', note: 'Can also work if the route reconnects toward Fort Langley.' },
    ],
    hotels: [
      { name: 'Accent Inns Burnaby', phone: '604-473-5000', note: 'Dog-friendly; ask specifically about RV parking.' },
      { name: 'Sandman Hotel Langley', phone: '604-888-7263', note: 'Fallback if you reconnect south toward Langley.' },
      { name: 'Best Western Plus Country Meadows Inn — Aldergrove', phone: '604-856-9880', note: 'Dog-friendly with truck/RV parking listed.' },
      { name: 'Coast Chilliwack Hotel by APA', phone: '604-792-5552', note: 'Farther east fallback; pet rooms are limited.' },
    ],
  },
  {
    id: 'SOUTH',
    name: 'Route C — South',
    detail: 'Highway 99 / 91 / 10 / 17 network as directed by the emergency. Confirm the RV height and route restrictions.',
    rvParks: [],
    hotels: [
      { name: 'Accent Inns Vancouver Airport — Richmond', phone: '604-273-3311', note: 'Dog-friendly southbound fallback. Confirm RV parking before arriving.' },
    ],
  },
  {
    id: 'NORTH',
    name: 'Route D — North',
    detail: 'Highway 99 toward Squamish and Whistler only when the hazard direction and road conditions make north safe.',
    rvParks: [
      { name: 'Capilano River RV Park', phone: '604-987-4722', note: 'North Shore contingency option.' },
      { name: 'Whistler RV Park & Campground', phone: '604-905-2523', note: 'Full-service northbound option; follow the park’s paved access directions.' },
    ],
    hotels: [
      { name: 'Executive Suites Hotel & Resort Squamish', phone: '604-815-0048', note: 'Dog-friendly Sea-to-Sky fallback.' },
    ],
  },
]

function readFields(): FieldMap {
  try {
    return JSON.parse(localStorage.getItem('rn-firesmart-evac-plan') || '{}')
  } catch {
    return {}
  }
}

export default function EvacuationPlan() {
  const [fields, setFields] = useState<FieldMap>(readFields)
  const [selectedRoute, setSelectedRoute] = useState<RouteId | null>(() => {
    const saved = localStorage.getItem('rn-firesmart-selected-route') as RouteId | null
    return routes.some((route) => route.id === saved) ? saved : null
  })

  useEffect(() => {
    localStorage.setItem('rn-firesmart-evac-plan', JSON.stringify(fields))
  }, [fields])

  useEffect(() => {
    if (selectedRoute) localStorage.setItem('rn-firesmart-selected-route', selectedRoute)
    else localStorage.removeItem('rn-firesmart-selected-route')
  }, [selectedRoute])

  const set = (key: string, value: string) => setFields((current) => ({ ...current, [key]: value }))
  const activeRoute = routes.find((route) => route.id === selectedRoute)

  return (
    <div className="evac-page">
      <header className="evac-hero">
        <div>
          <p className="evac-kicker">Reusable household plan</p>
          <h1>Evacuation Plan</h1>
          <p>This page is the standing plan. It is not tied to one wildfire season or one incident.</p>
        </div>
        <div className="evac-rule">Official evacuation instructions always override this plan.</div>
      </header>

      <main className="evac-main">
        <section className="evac-panel">
          <div className="evac-heading"><div><p className="evac-kicker">Direction decision</p><h2>Select the evacuation corridor</h2></div><p>Choose the route that is appropriate for the current incident. The app will show destinations for that corridor.</p></div>
          <div className="route-grid">
            {routes.map((route) => (
              <button
                className={`route-card route-choice ${selectedRoute === route.id ? 'selected' : ''}`}
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
              >
                <h3>{route.name}</h3>
                <p>{route.detail}</p>
              </button>
            ))}
          </div>
          <div className="evac-warning">Do not build one permanent evacuation route. Choose from current conditions and official direction.</div>
        </section>

        {activeRoute && (
          <section className="evac-panel route-destinations">
            <div className="evac-heading">
              <div><p className="evac-kicker">Selected corridor</p><h2>{activeRoute.name}</h2></div>
              <button className="route-clear" onClick={() => setSelectedRoute(null)}>Clear route</button>
            </div>
            <p className="selected-route-detail">{activeRoute.detail}</p>

            <h3>RV parks / campgrounds</h3>
            {activeRoute.rvParks.length > 0 ? (
              <div className="destination-grid">
                {activeRoute.rvParks.map((destination) => <DestinationCard key={destination.name} destination={destination} />)}
              </div>
            ) : (
              <div className="evac-note">No standing RV-park option has been assigned to this corridor yet. Do not assume a hotel parking lot can take the motorhome; call ahead.</div>
            )}

            <h3>Dog-friendly hotel / motel fallbacks</h3>
            <div className="destination-grid">
              {activeRoute.hotels.map((destination) => <DestinationCard key={destination.name} destination={destination} />)}
            </div>

            <div className="evac-note">These are planning references, not guaranteed emergency shelters. Reconfirm current road access, availability, pet acceptance and RV parking before using them.</div>
            <div className="evac-note">Call script: “We are evacuating with one dog, one SUV and one motorhome approximately ___ feet long and ___ feet high. Do you have a pet room tonight, and may we leave the motorhome in your parking lot overnight?”</div>
          </section>
        )}

        <section className="evac-panel">
          <div className="evac-heading"><div><p className="evac-kicker">Emergency support</p><h2>ESS and critical contacts</h2></div><p>Verify these contacts at the beginning of each fire season.</p></div>
          <div className="contact-grid">
            <Contact label="Immediate danger" value="911" />
            <Contact label="BC Evacuee Helpline / ESS" value="1-800-387-4258" />
            <Contact label="BC highway conditions" value="1-800-550-4997" />
            <Contact label="Report a wildfire" value="*5555 or 1-800-663-5555" />
          </div>
          <div className="evac-note">Create and maintain your ESS/ERA profile before an emergency. During an evacuation, use the reception centre, helpline or online process identified for that incident.</div>
        </section>

        <section className="evac-panel">
          <div className="evac-heading"><div><p className="evac-kicker">Our information</p><h2>Fill once, maintain annually</h2></div></div>
          <div className="form-grid">
            <Field label="Insurance company" value={fields.insurer} onChange={(v) => set('insurer', v)} />
            <Field label="Emergency claims number" value={fields.claims} onChange={(v) => set('claims', v)} />
            <Field label="Policy number" value={fields.policy} onChange={(v) => set('policy', v)} />
            <Field label="Veterinarian" value={fields.vet} onChange={(v) => set('vet', v)} />
            <Field label="Vet telephone" value={fields.vetPhone} onChange={(v) => set('vetPhone', v)} />
            <Field label="Emergency veterinary clinic" value={fields.emergencyVet} onChange={(v) => set('emergencyVet', v)} />
          </div>
        </section>

        <section className="evac-panel">
          <div className="evac-heading"><div><p className="evac-kicker">RV constraints</p><h2>Know the motorhome before choosing a route</h2></div><p>The SUV must never determine whether a route is suitable for the RV.</p></div>
          <div className="form-grid">
            <Field label="Height to highest rooftop component" value={fields.rvHeight} onChange={(v) => set('rvHeight', v)} />
            <Field label="Overall length" value={fields.rvLength} onChange={(v) => set('rvLength', v)} />
            <Field label="Width including mirrors" value={fields.rvWidth} onChange={(v) => set('rvWidth', v)} />
            <Field label="Approx. loaded weight" value={fields.rvWeight} onChange={(v) => set('rvWeight', v)} />
            <Field label="Fuel type" value={fields.rvFuel} onChange={(v) => set('rvFuel', v)} />
            <Field label="Safe range on one tank" value={fields.rvRange} onChange={(v) => set('rvRange', v)} />
            <Field label="Licence plate" value={fields.rvPlate} onChange={(v) => set('rvPlate', v)} />
            <Field label="Propane tank / cylinders" value={fields.rvPropane} onChange={(v) => set('rvPropane', v)} />
          </div>
          <div className="evac-note">Do not improvise onto forest service roads, gravel forestry routes or backcountry shortcuts unless authorities explicitly direct traffic there and confirm suitability.</div>
        </section>

        <section className="evac-panel">
          <div className="evac-heading"><div><p className="evac-kicker">If separated</p><h2>Rally points</h2></div><p>Neither driver turns around looking for the other. Both continue to the agreed rally point.</p></div>
          <div className="form-grid">
            <Field label="Rally A — local" value={fields.rallyA} onChange={(v) => set('rallyA', v)} />
            <Field label="Rally B — east" value={fields.rallyB} onChange={(v) => set('rallyB', v)} />
            <Field label="Rally C — alternate" value={fields.rallyC} onChange={(v) => set('rallyC', v)} />
          </div>
        </section>

        <section className="evac-panel">
          <div className="evac-heading"><div><p className="evac-kicker">Two vehicles</p><h2>RV sets the pace</h2></div></div>
          <ul className="evac-list">
            <li>The RV is the pace-setting vehicle; the SUV is the more agile support vehicle.</li>
            <li>For the initial urban portion, the SUV follows the RV rather than disappearing ahead.</li>
            <li>Once established on the main corridor, the SUV may scout ahead only where legal and safe.</li>
            <li>Keep paper directions in both vehicles. Cellular navigation is not the only copy of the route.</li>
            <li>If communication fails, neither driver turns around. Both proceed to the agreed rally point.</li>
          </ul>
        </section>

        <section className="evac-panel">
          <div className="evac-heading"><div><p className="evac-kicker">Tucker</p><h2>Travel information</h2></div></div>
          <div className="form-grid">
            <Field label="Microchip / tattoo number" value={fields.tuckerId} onChange={(v) => set('tuckerId', v)} />
            <Field label="Medication" value={fields.tuckerMeds} onChange={(v) => set('tuckerMeds', v)} />
            <Field label="Normal travelling position" value={fields.tuckerTravel} onChange={(v) => set('tuckerTravel', v)} />
            <Field label="Trusted alternate caregiver" value={fields.tuckerCaregiver} onChange={(v) => set('tuckerCaregiver', v)} />
          </div>
          <ul className="evac-list"><li>Keep leash/harness, backup leash, bowls, food, water, medications, vaccination/medical records, waste bags and recent photos ready.</li><li>Confirm pet-friendly accommodation rather than assuming a general hotel room will accept Tucker.</li></ul>
        </section>

        <div className="evac-footer-rule">CHECK OFFICIAL EMERGENCY INFORMATION + ROAD CONDITIONS BEFORE CHOOSING A DIRECTION. DO NOT TAKE SHORTCUTS. IF SEPARATED, BOTH VEHICLES CONTINUE TO THE AGREED RALLY POINT.</div>
      </main>
    </div>
  )
}

function Contact({ label, value }: { label: string; value: string }) {
  return <article className="contact-card"><span>{label}</span><strong>{value}</strong></article>
}

function DestinationCard({ destination }: { destination: Destination }) {
  return <article className="contact-card destination-card"><span>{destination.name}</span><strong>{destination.phone}</strong>{destination.note && <small>{destination.note}</small>}</article>
}

function Field({ label, value = '', onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <label className="evac-field"><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} /></label>
}
