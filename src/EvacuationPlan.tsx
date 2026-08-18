import { useEffect, useState } from 'react'
import './evacuation-plan.css'

type FieldMap = Record<string, string>

const routes = [
  { name: 'Route A — East', detail: 'Highway 1 toward Burnaby, Langley, Abbotsford and Chilliwack. Reassess before continuing beyond Hope.' },
  { name: 'Route B — Alternate East', detail: 'Highway 7 toward Pitt Meadows, Maple Ridge and Mission, then reassess toward the Fraser Valley.' },
  { name: 'Route C — South', detail: 'Highway 99 / 91 / 10 / 17 network as directed by the emergency. Confirm the RV height and route restrictions.' },
  { name: 'Route D — North', detail: 'Highway 99 toward Squamish and Whistler only when the hazard direction and road conditions make north safe.' },
]

const rvDestinations = [
  ['Burnaby Cariboo RV Park', '604-420-1722'],
  ['Capilano River RV Park', '604-987-4722'],
  ['Pathfinder Camp Resorts', '1-866-267-3678'],
  ['Sunnyside / Cultus Lake', '604-858-5253'],
  ['Whistler RV Park', '604-905-2523'],
]

const hotelFallbacks = [
  ['Accent Inns Burnaby', '604-473-5000'],
  ['Sandman Langley', '604-888-7263'],
  ['Best Western Aldergrove', '604-856-9880'],
  ['Coast Chilliwack', '604-792-5552'],
  ['Executive Suites Squamish', '604-815-0048'],
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

  useEffect(() => {
    localStorage.setItem('rn-firesmart-evac-plan', JSON.stringify(fields))
  }, [fields])

  const set = (key: string, value: string) => setFields((current) => ({ ...current, [key]: value }))

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
          <div className="evac-heading"><div><p className="evac-kicker">Direction decision</p><h2>Four route corridors</h2></div><p>Check official evacuation information and road conditions before choosing a direction.</p></div>
          <div className="route-grid">{routes.map((route) => <article className="route-card" key={route.name}><h3>{route.name}</h3><p>{route.detail}</p></article>)}</div>
          <div className="evac-warning">Do not build one permanent evacuation route. Build a decision tree and choose from current conditions and official direction.</div>
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
          <div className="evac-heading"><div><p className="evac-kicker">Possible destinations</p><h2>RV and hotel fallback list</h2></div><p>These are planning references, not guaranteed emergency shelters. Reconfirm availability, pet policy and RV access before using.</p></div>
          <h3>RV options</h3>
          <div className="destination-grid">{rvDestinations.map(([name, phone]) => <Contact key={name} label={name} value={phone} />)}</div>
          <h3>Dog-friendly hotel fallbacks</h3>
          <div className="destination-grid">{hotelFallbacks.map(([name, phone]) => <Contact key={name} label={name} value={phone} />)}</div>
          <div className="evac-note">Call script: “We are evacuating with one dog, one SUV and one motorhome approximately ___ feet long and ___ feet high. Do you have a pet room tonight, and may we leave the motorhome in your parking lot overnight?”</div>
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

function Field({ label, value = '', onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return <label className="evac-field"><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} /></label>
}
