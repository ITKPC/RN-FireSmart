import { useEffect, useMemo, useState } from 'react'

type Assessment = 'Good' | 'Needs Work' | 'N/A' | 'Not Checked'
type ZoneKey = 'immediate' | 'intermediate' | 'extended' | 'access'
type ActionState = 'Not Started' | 'Done' | 'Needs Work'

type AssessmentItem = { id: string; text: string }
type Zone = { key: ZoneKey; title: string; distance: string; priority: string; description: string; items: AssessmentItem[] }
type PriorityAction = { id: string; title: string; why: string; implementation: string; effectiveness: 'High' | 'Medium'; cost: 'Low' | 'Low–Medium' | 'Medium' | 'Medium–High' | 'High' }

const zones: Zone[] = [
  {
    key: 'immediate', title: 'Immediate Zone', distance: '0–1.5 m / 0–5 ft', priority: 'Highest priority',
    description: 'Treat the house, attached garage, decks and first 1.5 m as one ignition system. Make this area a bad place for an ember to establish fire.',
    items: [
      { id: 'roof-material', text: 'Roof has an acceptable fire-resistant assembly; use a listed Class A assembly when replacement is due.' },
      { id: 'roof-gutters', text: 'Roof, valleys, gutters and roof-wall junctions are clean of leaves, needles and combustible debris.' },
      { id: 'eaves', text: 'Eaves are closed or otherwise protected from ember entry.' },
      { id: 'vents', text: 'Attic, soffit, wall and foundation vents use non-combustible screening of 3 mm or smaller, or tested ember-resistant vents.' },
      { id: 'garage-seals', text: 'Attached-garage and exterior doors seal tightly at the top, sides and bottom.' },
      { id: 'siding', text: 'Exterior siding is non-combustible or ignition-resistant where practical.' },
      { id: 'siding-gaps', text: 'Siding and penetrations are free of gaps where embers can lodge or enter.' },
      { id: 'windows', text: 'Windows are multi-pane; exterior tempered glazing is the preferred replacement target.' },
      { id: 'ground-clearance', text: 'There is about 150 mm / 6 in of non-combustible vertical clearance from grade to siding where construction allows.' },
      { id: 'deck-enclosed', text: 'Areas beneath attached decks/porches are free of storage and protected from ember accumulation.' },
      { id: 'immediate-combustibles', text: 'No wood mulch, firewood, doormats, cushions, planters, lumber or other readily combustible material sits in the first 1.5 m.' },
    ],
  },
  {
    key: 'intermediate', title: 'Intermediate Zone', distance: '1.5–10 m / 5–33 ft', priority: 'Second priority',
    description: 'Reduce fuels that could turn a small ember ignition into sustained flame or radiant heat against the house.',
    items: [
      { id: 'grass', text: 'Grass is maintained at 10 cm / 4 in or shorter.' },
      { id: 'yard-debris', text: 'Dead leaves, dry grass, branches and needles are removed regularly.' },
      { id: 'mulch', text: 'Beds nearest the house use non-combustible material such as gravel or crushed rock instead of woody mulch.' },
      { id: 'plants', text: 'Highly flammable shrubs such as cedar/juniper are not planted close to structures.' },
      { id: 'pruning', text: 'Appropriate lower conifer branches are pruned to about 2 m / 6.5 ft.' },
      { id: 'firewood', text: 'Firewood and loose propane are kept outside this zone where practical.' },
      { id: 'vehicles', text: 'The RV is not parked in the 1.5–10 m zone when a farther safe location is available.' },
      { id: 'fence-break', text: 'Combustible fencing does not provide an uninterrupted wood path directly into the house.' },
    ],
  },
  {
    key: 'extended', title: 'Extended Zone', distance: '10–30 m / 33–98 ft', priority: 'Reduce fire intensity',
    description: 'Interrupt continuous fuels and create a safer place for the RV where the property allows.',
    items: [
      { id: 'rv-location', text: 'RV sits 10 m or more from the house if the property allows, ideally over non-combustible ground with about 1.5 m clear around it.' },
      { id: 'extended-prune', text: 'Conifer branches are pruned to about 2 m / 6.5 ft where appropriate.' },
      { id: 'tree-spacing', text: 'Conifer crowns or clusters have useful separation, roughly 3 m / 10 ft between outermost branches where practical.' },
      { id: 'ground-fuels', text: 'Fallen branches, dry grass, needles and other surface fuels are removed.' },
      { id: 'shrubs-under-trees', text: 'Tall or combustible shrubs beneath trees are reduced so ground fire cannot easily climb into the canopy.' },
    ],
  },
  {
    key: 'access', title: 'Responder Access', distance: 'Roadway & driveway', priority: 'Emergency access',
    description: 'Keep the property easy to identify and reach. Do not let evacuation vehicles or stored material block firefighters.',
    items: [
      { id: 'address', text: 'Street/property address is clearly visible through smoke and low visibility.' },
      { id: 'driveway-clear', text: 'Driveway and access routes are clear of vegetation, branches and stored equipment.' },
      { id: 'rv-doesnt-block', text: 'RV/SUV staging does not block responder access to the house, garage or exterior water points.' },
      { id: 'manual-garage', text: 'Garage manual release is tested so a power outage does not trap a vehicle.' },
    ],
  },
]

const priorityActions: PriorityAction[] = [
  { id: 'p-zone-zero', title: 'Make 0–1.5 m genuinely non-combustible', why: 'Highest-value close-in fuel reduction.', implementation: 'Remove wood/bark mulch, dead vegetation, firewood, lumber, doormats and stored combustibles. Use gravel, pavers, concrete or other non-combustible surfacing.', effectiveness: 'High', cost: 'Low–Medium' },
  { id: 'p-roof-clean', title: 'Keep roof, valleys and gutters completely clean', why: 'Embers accumulate where roof debris provides ready fuel.', implementation: 'Inspect throughout fire season and after strong winds. Clear valleys, gutters, skylight edges, dormers and roof-wall junctions.', effectiveness: 'High', cost: 'Low' },
  { id: 'p-vents', title: 'Harden vents and ember openings', why: 'Vents can carry embers directly into concealed combustible spaces.', implementation: 'Inventory every vent. Repair coarse/damaged screens and use corrosion-resistant metal screening 3 mm or smaller, or tested ember-resistant vents, while preserving required ventilation.', effectiveness: 'High', cost: 'Low–Medium' },
  { id: 'p-eaves', title: 'Close eaves and eliminate ember gaps', why: 'Open eaves and construction gaps can trap or admit embers.', implementation: 'Use properly designed enclosed soffits and non-combustible/ember-resistant detailing. Preserve drainage and ventilation.', effectiveness: 'High', cost: 'Medium–High' },
  { id: 'p-deck', title: 'Empty and harden beneath decks/porches', why: 'An attached deck can become a direct fire path into the house.', implementation: 'Remove firewood, furniture, cardboard and storage. Use non-combustible ground surfacing and appropriate enclosure/screening.', effectiveness: 'High', cost: 'Low–Medium' },
  { id: 'p-garage', title: 'Seal attached-garage and exterior doors', why: 'Door gaps are ember-entry points.', implementation: 'Inspect the garage door in daylight. Replace failed bottom/side/top seals and damaged weather stripping.', effectiveness: 'High', cost: 'Low–Medium' },
  { id: 'p-rv', title: 'Keep RV separated from the house', why: 'The RV is a large combustible fuel package containing plastics, tires, upholstery, fuel and propane.', implementation: 'Aim for 10 m+ separation if the property permits. Keep weeds/debris out from beneath it and use non-combustible ground where practical.', effectiveness: 'High', cost: 'Low–Medium' },
  { id: 'p-fuels', title: 'Move firewood and loose propane away', why: 'High-energy fuels near the building can create sustained flame exposure.', implementation: 'Establish a dedicated location beyond the Intermediate Zone where practical. Never store firewood under a deck.', effectiveness: 'High', cost: 'Low' },
  { id: 'p-water', title: 'Keep hoses and usable water ready', why: 'Useful while preparing, but not a substitute for hardening or evacuation.', implementation: 'Maintain hoses long enough to reach all sides and test exterior taps. Do not make unattended municipal-water sprinklers a standard departure action.', effectiveness: 'Medium', cost: 'Low–Medium' },
  { id: 'p-upgrades', title: 'Use wildfire-resilient materials at normal replacement', why: 'Roof, siding, windows and fence interfaces matter under ember, radiant and flame exposure.', implementation: 'Specify a listed Class A roof assembly, non-combustible/ignition-resistant siding, multi-pane windows with exterior tempered pane, and non-combustible fence/deck interfaces when replacement is justified.', effectiveness: 'High', cost: 'High' },
]

const elevatedActions = [
  'RV is fully departure-ready before an Evacuation Alert: fuel, propane, water, power and sleeping readiness checked.',
  'SUV is fuelled and ready.',
  'Load RV dry goods and the 14-day food/consumables plan.',
  'Verify Tucker food, water and supplies for the 14-day standard.',
  'Charge and stage power banks and other Power Depot equipment.',
  'Locate documents, passports, medications and current-use office electronics so nothing has to be searched for later.',
  'Verify Nancy and Rick E-/P-Duffles are ready for final current-use items.',
  'Resolve any missing Go Box or document-location exceptions while there is still time.',
]

const alertActions = [
  'RV should already be departure-ready. Do not start RV preparation now.',
  'Move the six Go Boxes from the gym into the RV.',
  'Move the Personal Documents Binder into the RV.',
  'Load current-use electronics, medications and remaining Tucker/current-use items.',
  'Open the blinds.',
  'Move patio furniture, mats, cushions and other exterior combustibles inside or away from the house if time is safe.',
  'Connect garden hoses and fill available large water containers if time is safe; do not remain to operate them after an Order.',
  'Disconnect the automatic garage opener so the door can be operated manually if power fails.',
  'Keep ESS profile and accommodation information accessible.',
  'Monitor official instructions and stop property work immediately if conditions worsen.',
]

const orderActions = [
  'Stop all property-protection work.',
  'People + Tucker + medications + go bags + phones + keys.',
  'Close windows, exterior doors and garage only if this does not delay departure.',
  'Leave interior/exterior lights on unless officials instruct otherwise.',
  'Do not routinely shut off the natural-gas meter.',
  'Do not switch off the main electrical breaker unless authorities instruct you to do so.',
  'Leave immediately by the official route. The RV and house are expendable if saving them would delay departure.',
]

const maintenance = [
  'Clean leaves, needles and debris from roof, gutters, decks, patios and balconies.',
  'Keep grass under 10 cm / 4 in and remove dry surface fuels.',
  'Keep combustible furniture, toys, building materials and firewood away from the house when not in use.',
  'Check vent screens, door seals and ember gaps periodically through fire season.',
  'Keep the RV roof and the ground beneath/around it free of needles, weeds and stored combustibles.',
  'Keep address signage and driveway access clear for responders.',
]

function readAssessment(): Record<string, Assessment> {
  try { return JSON.parse(localStorage.getItem('rn-firesmart-home-assessment') || '{}') } catch { return {} }
}
function readActions(): Record<string, ActionState> {
  try { return JSON.parse(localStorage.getItem('rn-firesmart-survivability-actions') || '{}') } catch { return {} }
}
function assessmentClass(value: Assessment) { return `assessment-${value.toLowerCase().replaceAll(' ', '-').replace('/', 'na')}` }

export default function HomeFireSmart() {
  const [assessment, setAssessment] = useState<Record<string, Assessment>>(readAssessment)
  const [actions, setActions] = useState<Record<string, ActionState>>(readActions)
  const [openZone, setOpenZone] = useState<ZoneKey>('immediate')
  const [showReference, setShowReference] = useState(false)

  useEffect(() => { localStorage.setItem('rn-firesmart-home-assessment', JSON.stringify(assessment)) }, [assessment])
  useEffect(() => { localStorage.setItem('rn-firesmart-survivability-actions', JSON.stringify(actions)) }, [actions])

  const allItems = zones.flatMap((zone) => zone.items)
  const scoredItems = allItems.filter((item) => assessment[item.id] && !['N/A', 'Not Checked'].includes(assessment[item.id]))
  const goodItems = scoredItems.filter((item) => assessment[item.id] === 'Good')
  const score = scoredItems.length ? Math.round((goodItems.length / scoredItems.length) * 100) : 0
  const needsWork = allItems.filter((item) => assessment[item.id] === 'Needs Work').length
  const doneActions = priorityActions.filter((item) => actions[item.id] === 'Done').length

  const zoneScores = useMemo(() => Object.fromEntries(zones.map((zone) => {
    const scored = zone.items.filter((item) => assessment[item.id] && !['N/A', 'Not Checked'].includes(assessment[item.id]))
    const good = scored.filter((item) => assessment[item.id] === 'Good')
    return [zone.key, scored.length ? Math.round((good.length / scored.length) * 100) : null]
  })), [assessment])

  const cycleAssessment = (id: string) => {
    const options: Assessment[] = ['Not Checked', 'Good', 'Needs Work', 'N/A']
    const current = assessment[id] ?? 'Not Checked'
    setAssessment((existing) => ({ ...existing, [id]: options[(options.indexOf(current) + 1) % options.length] }))
  }
  const cycleAction = (id: string) => {
    const options: ActionState[] = ['Not Started', 'Needs Work', 'Done']
    const current = actions[id] ?? 'Not Started'
    setActions((existing) => ({ ...existing, [id]: options[(options.indexOf(current) + 1) % options.length] }))
  }

  return (
    <div className="home-firesmart-page">
      <header className="home-firesmart-hero">
        <div>
          <p className="home-kicker">Home survivability + FireSmart</p>
          <h1>Home FireSmart</h1>
          <p>Make the house difficult for embers to enter, difficult for embers to ignite, and difficult for nearby fuels to transmit fire to it after we leave.</p>
        </div>
        <div className="home-score-card">
          <span>Assessed readiness</span><strong>{scoredItems.length ? `${score}%` : '—'}</strong>
          <small>{needsWork ? `${needsWork} assessment item${needsWork === 1 ? '' : 's'} need work` : scoredItems.length ? 'No assessed items need work' : 'Start the assessment below'}</small>
        </div>
      </header>

      <section className="survivability-summary">
        <div><span>Priority actions complete</span><strong>{doneActions}/{priorityActions.length}</strong><small>Work from the house outward.</small></div>
        <div><span>Core principle</span><strong>Hardening + close-in fuel removal</strong><small>Do both; neither replaces the other.</small></div>
        <div><span>Life-safety rule</span><strong>Order = leave</strong><small>No property task justifies delaying departure.</small></div>
      </section>

      <section className="home-panel priority-panel">
        <div className="home-section-heading"><div><p className="home-kicker">Highest-value work</p><h2>Prioritized home survivability actions</h2></div><p>These actions translate the research plan into household work. Mark each item as Not Started, Needs Work or Done.</p></div>
        <div className="priority-action-list">
          {priorityActions.map((item, index) => {
            const state = actions[item.id] ?? 'Not Started'
            return <article className={`priority-action-card action-${state.toLowerCase().replaceAll(' ', '-')}`} key={item.id}>
              <div className="priority-number">{index + 1}</div>
              <div className="priority-copy"><div className="priority-meta"><span>{item.effectiveness} effectiveness</span><span>{item.cost} effort/cost</span></div><h3>{item.title}</h3><p><strong>Why:</strong> {item.why}</p><p>{item.implementation}</p></div>
              <button className="action-state-button" onClick={() => cycleAction(item.id)}>{state}</button>
            </article>
          })}
        </div>
      </section>

      <section className="home-zone-overview">
        {zones.map((zone) => <button key={zone.key} className={`zone-overview-card zone-${zone.key} ${openZone === zone.key ? 'active' : ''}`} onClick={() => setOpenZone(zone.key)}><span className="zone-priority">{zone.priority}</span><strong>{zone.title}</strong><span>{zone.distance}</span><small>{zoneScores[zone.key] === null ? 'Not assessed' : `${zoneScores[zone.key]}% assessed good`}</small></button>)}
      </section>

      <section className="home-panel zone-detail-panel">
        {zones.filter((zone) => zone.key === openZone).map((zone) => <div key={zone.key}>
          <div className="home-section-heading"><div><p className="home-kicker">Property self-assessment</p><h2>{zone.title}</h2><p className="zone-distance">{zone.distance}</p></div><p>{zone.description}</p></div>
          <div className="assessment-list">{zone.items.map((item) => { const value = assessment[item.id] ?? 'Not Checked'; return <div className="assessment-row" key={item.id}><span>{item.text}</span><button className={`assessment-button ${assessmentClass(value)}`} onClick={() => cycleAssessment(item.id)}>{value}</button></div> })}</div>
        </div>)}
      </section>

      <section className="wildfire-timing-grid">
        <article className="timing-card elevated-card"><p className="home-kicker">Elevated Readiness / before Alert</p><h2>Make departure readiness real</h2>{elevatedActions.map((item) => <div className="timing-item" key={item}>{item}</div>)}</article>
        <article className="timing-card alert-card"><p className="home-kicker">Evacuation Alert</p><h2>Final loading + house closeout</h2>{alertActions.map((item) => <div className="timing-item" key={item}>{item}</div>)}</article>
        <article className="timing-card order-card"><p className="home-kicker">Evacuation Order / danger escalating</p><h2>Stop work and leave</h2>{orderActions.map((item) => <div className="timing-item" key={item}>{item}</div>)}</article>
      </section>

      <section className="home-panel utility-panel">
        <div className="home-section-heading"><div><p className="home-kicker">Utilities & water</p><h2>Avoid dangerous folklore</h2></div><p>These are deliberate rules so neither of us has to improvise under pressure.</p></div>
        <div className="rule-grid">
          <div><strong>Natural gas</strong><span>Do not routinely shut off the gas meter during evacuation unless officials/utility instructions specifically require it.</span></div>
          <div><strong>Electricity</strong><span>Do not make the main breaker an automatic evacuation action. Follow authority instructions; leave interior/exterior lights on during wildfire evacuation unless told otherwise.</span></div>
          <div><strong>Sprinklers</strong><span>Do not make “leave all sprinklers running” a standard departure step. Prepare hoses/water while safe, then leave when ordered.</span></div>
          <div><strong>Generator</strong><span>Portable generators stay outdoors and must never backfeed a household circuit.</span></div>
        </div>
      </section>

      <section className="home-panel">
        <div className="home-section-heading"><div><p className="home-kicker">Regular maintenance</p><h2>Keep FireSmart work routine</h2></div><p>Routine maintenance protects the work already done and keeps the first 10 m from quietly becoming combustible again.</p></div>
        <div className="maintenance-grid">{maintenance.map((item) => <div className="maintenance-item" key={item}>{item}</div>)}</div>
      </section>

      <section className="home-panel resource-strip">
        <div><p className="home-kicker">Kamloops</p><h2>Free FireSmart home assessment</h2><p>Book the City of Kamloops on-site assessment and ask the assessor to walk the house, attached garage, deck, RV location, fence lines and property perimeter.</p></div>
        <a href="tel:2508283472">250-828-3472</a>
      </section>

      <section className="home-panel reference-panel">
        <button className="home-reference-toggle" onClick={() => setShowReference((current) => !current)}>{showReference ? 'Hide survivability reference' : 'Open survivability reference'}</button>
        {showReference && <div className="home-reference-content">
          <div><h3>Why homes ignite</h3><p>Windblown embers, radiant heat and direct flame interact. Ember accumulation in roofs, gutters, decks, corners and vents is a major ignition pathway.</p></div>
          <div><h3>Home Ignition Zones</h3><p><strong>Immediate:</strong> 0–1.5 m. <strong>Intermediate:</strong> 1.5–10 m. <strong>Extended:</strong> 10–30 m. Concentrate limited effort nearest the structure first.</p></div>
          <div><h3>Materials</h3><p>Prefer tested assemblies rather than marketing labels: Class A roof assemblies, ember-resistant vents/≤3 mm metal screening, non-combustible siding, multi-pane windows with exterior tempered glass, and non-combustible deck/fence interfaces.</p></div>
          <div><h3>RV</h3><p>Treat the RV as both an evacuation asset and a potential ignition exposure. Separation is more realistic than trying to harden an RV to residential construction standards.</p></div>
          <div><h3>Tucker</h3><p>Keep food, water, leash/harness, medication, ID/vaccination information and identifying photos ready. Critical Tucker supplies should not exist in only one vehicle.</p></div>
          <div><h3>Evidence principle</h3><p>The strongest practical conclusion is the combination of building hardening plus very close defensible space. More distant vegetation work does not replace close-in work.</p></div>
          <p className="home-source-note">This operational screen is distilled from the “Wildfire Home Survivability Plan for a Kamloops Household” supplied for this project. It intentionally preserves the plan’s hierarchy while shortening the research detail for app use.</p>
        </div>}
      </section>
    </div>
  )
}
