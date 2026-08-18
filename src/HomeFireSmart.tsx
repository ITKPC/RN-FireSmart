import { useEffect, useMemo, useState } from 'react'

type Assessment = 'Good' | 'Needs Work' | 'N/A' | 'Not Checked'
type ZoneKey = 'immediate' | 'intermediate' | 'extended' | 'access'

type AssessmentItem = {
  id: string
  text: string
}

type Zone = {
  key: ZoneKey
  title: string
  distance: string
  priority: string
  description: string
  items: AssessmentItem[]
}

const zones: Zone[] = [
  {
    key: 'immediate',
    title: 'Immediate Zone',
    distance: '0–1.5 m / 0–5 ft',
    priority: 'Highest priority',
    description: 'The home, decks, ramps and the first 1.5 m / 5 ft around each structure. Keep this area free of readily combustible material.',
    items: [
      { id: 'roof-material', text: 'Roof has acceptable fire-resistant roofing material.' },
      { id: 'roof-gutters', text: 'Roof and gutters are clean of leaves, needles and other combustible debris.' },
      { id: 'eaves', text: 'Eaves are closed and protected from ember entry.' },
      { id: 'vents', text: 'Vents are non-combustible and screened; 3 mm / 1/8 in screening or appropriate fire-rated vents.' },
      { id: 'siding', text: 'Exterior siding is non-combustible or ignition-resistant.' },
      { id: 'siding-gaps', text: 'Siding is free of gaps, holes and places where embers can collect.' },
      { id: 'windows', text: 'Windows are multi-paned or tempered glass.' },
      { id: 'ground-clearance', text: 'There is at least 15 cm / 6 in of non-combustible vertical clearance from ground to siding.' },
      { id: 'deck-enclosed', text: 'Open areas beneath decks or ramps are enclosed or protected from ember accumulation.' },
      { id: 'deck-material', text: 'Deck/porch materials and condition reduce ignition risk.' },
      { id: 'immediate-combustibles', text: 'The area is free of combustible storage, cushions, umbrellas and other easily ignited material when not in use.' },
    ],
  },
  {
    key: 'intermediate',
    title: 'Intermediate Zone',
    distance: '1.5–10 m / 5–33 ft',
    priority: 'Second priority',
    description: 'The surrounding yard. Reduce fuels, keep vegetation maintained, and avoid creating a continuous path for fire to reach the home.',
    items: [
      { id: 'grass', text: 'Grass is maintained at 10 cm / 4 in or shorter.' },
      { id: 'yard-debris', text: 'Yard is free of dead leaves, dry grass, branches and other combustible debris.' },
      { id: 'mulch', text: 'Beds near the home use non-combustible material such as gravel or crushed rock rather than bark or pine-needle mulch.' },
      { id: 'plants', text: 'Landscaping near the home favours lower-flammability plants.' },
      { id: 'pruning', text: 'Conifer branches are pruned up to about 2 m / 6.5 ft from the ground where appropriate.' },
      { id: 'plant-spacing', text: 'Shrubs, trees and plant clusters have useful separation; the guide recommends at least 2 m / 6.5 ft between shrubs, trees or clusters in this zone.' },
      { id: 'firewood', text: 'Firewood is kept at least 10 m / 33 ft from the home or in a FireSmart-mitigated structure.' },
      { id: 'vehicles', text: 'Stored vehicles/trailers sit on non-combustible ground with about 1.5 m / 5 ft of non-combustible area around them where practical.' },
    ],
  },
  {
    key: 'extended',
    title: 'Extended Zone',
    distance: '10–30 m / 33–98 ft',
    priority: 'Reduce fire intensity',
    description: 'The objective is not to eliminate fire, but to reduce its intensity and interrupt rapid spread through vegetation and stored fuels.',
    items: [
      { id: 'extended-combustibles', text: 'Firewood piles and other combustible storage are located away from the home, preferably in this zone or otherwise mitigated.' },
      { id: 'extended-prune', text: 'Conifer branches are pruned to about 2 m / 6.5 ft from the ground where appropriate.' },
      { id: 'tree-spacing', text: 'Conifer trees or clusters have about 3 m / 10 ft between outermost branches where practical.' },
      { id: 'ground-fuels', text: 'Accumulations of fallen branches, dry grass and needles are removed.' },
      { id: 'shrubs-under-trees', text: 'Tall or combustible shrubs beneath trees are reduced so fire cannot easily climb into the canopy.' },
    ],
  },
  {
    key: 'access',
    title: 'Responder Access',
    distance: 'Roadway & driveway',
    priority: 'Emergency access',
    description: 'Keep the property identifiable and accessible so emergency responders can enter while residents may be evacuating.',
    items: [
      { id: 'address', text: 'Street/property address is clearly visible to emergency responders.' },
      { id: 'driveway-clear', text: 'Driveway and access routes are clear of vegetation, branches and obstructions that could impede fire apparatus.' },
      { id: 'turnaround', text: 'There is adequate turnaround space for emergency vehicles where the property allows it.' },
      { id: 'multiple-access', text: 'A second access route is identified where one exists or can reasonably be maintained.' },
    ],
  },
]

const maintenance = [
  'Clean leaves, needles and other debris from roof, gutters, decks, patios and balconies.',
  'Keep grass under 10 cm / 4 in.',
  'Remove dead leaves, branches and dry grass from the yard.',
  'Prune appropriate lower tree branches to about 2 m / 6.5 ft.',
  'Remove combustible shrubs beneath trees.',
  'Keep outdoor furniture, toys, building materials and firewood safely away from the home when not in use.',
  'Check mature trees for damage or decay and follow local tree-protection requirements.',
]

function readAssessment(): Record<string, Assessment> {
  try {
    const saved = localStorage.getItem('rn-firesmart-home-assessment')
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function assessmentClass(value: Assessment) {
  return `assessment-${value.toLowerCase().replaceAll(' ', '-').replace('/', 'na')}`
}

export default function HomeFireSmart() {
  const [assessment, setAssessment] = useState<Record<string, Assessment>>(readAssessment)
  const [openZone, setOpenZone] = useState<ZoneKey>('immediate')
  const [showReference, setShowReference] = useState(false)

  useEffect(() => {
    localStorage.setItem('rn-firesmart-home-assessment', JSON.stringify(assessment))
  }, [assessment])

  const allItems = zones.flatMap((zone) => zone.items)
  const scoredItems = allItems.filter((item) => assessment[item.id] && assessment[item.id] !== 'N/A' && assessment[item.id] !== 'Not Checked')
  const goodItems = scoredItems.filter((item) => assessment[item.id] === 'Good')
  const score = scoredItems.length ? Math.round((goodItems.length / scoredItems.length) * 100) : 0
  const needsWork = allItems.filter((item) => assessment[item.id] === 'Needs Work').length

  const zoneScores = useMemo(() => Object.fromEntries(zones.map((zone) => {
    const scored = zone.items.filter((item) => assessment[item.id] && assessment[item.id] !== 'N/A' && assessment[item.id] !== 'Not Checked')
    const good = scored.filter((item) => assessment[item.id] === 'Good')
    return [zone.key, scored.length ? Math.round((good.length / scored.length) * 100) : null]
  })), [assessment])

  const cycleAssessment = (id: string) => {
    const options: Assessment[] = ['Not Checked', 'Good', 'Needs Work', 'N/A']
    const current = assessment[id] ?? 'Not Checked'
    const next = options[(options.indexOf(current) + 1) % options.length]
    setAssessment((existing) => ({ ...existing, [id]: next }))
  }

  return (
    <div className="home-firesmart-page">
      <header className="home-firesmart-hero">
        <div>
          <p className="home-kicker">BC FireSmart homeowner guidance</p>
          <h1>Home FireSmart</h1>
          <p>Property mitigation, maintenance and reference — separate from evacuation readiness.</p>
        </div>
        <div className="home-score-card">
          <span>Assessed readiness</span>
          <strong>{scoredItems.length ? `${score}%` : '—'}</strong>
          <small>{needsWork ? `${needsWork} item${needsWork === 1 ? '' : 's'} need work` : scoredItems.length ? 'No assessed items need work' : 'Start the assessment below'}</small>
        </div>
      </header>

      <section className="home-zone-overview">
        {zones.map((zone) => (
          <button key={zone.key} className={`zone-overview-card zone-${zone.key} ${openZone === zone.key ? 'active' : ''}`} onClick={() => setOpenZone(zone.key)}>
            <span className="zone-priority">{zone.priority}</span>
            <strong>{zone.title}</strong>
            <span>{zone.distance}</span>
            <small>{zoneScores[zone.key] === null ? 'Not assessed' : `${zoneScores[zone.key]}% assessed good`}</small>
          </button>
        ))}
      </section>

      <section className="home-panel zone-detail-panel">
        {zones.filter((zone) => zone.key === openZone).map((zone) => (
          <div key={zone.key}>
            <div className="home-section-heading">
              <div>
                <p className="home-kicker">Self-assessment</p>
                <h2>{zone.title}</h2>
                <p className="zone-distance">{zone.distance}</p>
              </div>
              <p>{zone.description}</p>
            </div>
            <div className="assessment-list">
              {zone.items.map((item) => {
                const value = assessment[item.id] ?? 'Not Checked'
                return (
                  <div className="assessment-row" key={item.id}>
                    <span>{item.text}</span>
                    <button className={`assessment-button ${assessmentClass(value)}`} onClick={() => cycleAssessment(item.id)}>
                      {value}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="home-panel">
        <div className="home-section-heading">
          <div>
            <p className="home-kicker">Regular maintenance</p>
            <h2>Keep FireSmart work routine</h2>
          </div>
          <p>The guide recommends incorporating these actions into ordinary yard and home maintenance, with priority on the area within 10 m / 33 ft of the house.</p>
        </div>
        <div className="maintenance-grid">
          {maintenance.map((item) => <div className="maintenance-item" key={item}>{item}</div>)}
        </div>
      </section>

      <section className="home-panel reference-panel">
        <button className="home-reference-toggle" onClick={() => setShowReference((current) => !current)}>
          {showReference ? 'Hide FireSmart reference' : 'Open FireSmart reference'}
        </button>
        {showReference && (
          <div className="home-reference-content">
            <div>
              <h3>Why homes ignite</h3>
              <p>The guide focuses on three main wildfire exposures: windblown embers, radiant heat and direct flame. Ember entry and ember-ignited material on or near structures are a major reason the Immediate Zone receives the highest priority.</p>
            </div>
            <div>
              <h3>Home Ignition Zones</h3>
              <p><strong>Immediate:</strong> 0–1.5 m / 0–5 ft. <strong>Intermediate:</strong> 1.5–10 m / 5–33 ft. <strong>Extended:</strong> 10–30 m / 33–98 ft.</p>
            </div>
            <div>
              <h3>Planting guidance</h3>
              <p>The guide generally favours deciduous trees and lower-flammability plants near homes, and cautions against highly flammable conifers such as cedar, juniper, spruce, fir and pine close to structures.</p>
            </div>
            <div>
              <h3>Useful conversions used here</h3>
              <p>1.5 m ≈ 5 ft • 10 m ≈ 33 ft • 30 m ≈ 98 ft • 15 cm ≈ 6 in • 10 cm ≈ 4 in • 2 m ≈ 6.5 ft • 3 m ≈ 10 ft • 3 mm ≈ 1/8 in.</p>
            </div>
            <p className="home-source-note">Based on the “FireSmart Begins With You Guide” for homeowners and renters provided for this project. The app paraphrases the guide for household use; the official guide remains the authoritative reference.</p>
          </div>
        )}
      </section>
    </div>
  )
}
