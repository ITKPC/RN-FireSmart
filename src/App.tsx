import { useEffect, useMemo, useState } from 'react'

type Stage = 'NORMAL' | 'ELEVATED' | 'ALERT' | 'ORDER' | 'EVACUATED' | 'STAND_DOWN'

type Status = 'Ready' | 'Check' | 'Not Ready' | 'Winterized' | 'Loaded'

const stages: { id: Stage; label: string; description: string }[] = [
  { id: 'NORMAL', label: 'Normal / Fire-Season Ready', description: 'Maintain the summer baseline and keep core assets ready.' },
  { id: 'ELEVATED', label: 'Elevated Readiness', description: 'Prepare now so an evacuation alert requires almost no thinking.' },
  { id: 'ALERT', label: 'Evacuation Alert', description: 'Load the RV and person-bound gear so leaving is immediate.' },
  { id: 'ORDER', label: 'Evacuation Order / Leave Now', description: 'People, Tucker, keys, phones, duffles, then leave.' },
  { id: 'EVACUATED', label: 'Evacuated', description: 'Track safety, location, expenses, and what left the property.' },
  { id: 'STAND_DOWN', label: 'Stand Down', description: 'Threat has passed; deliberately unwind or retain preparations.' },
]

const goBoxes = [
  { number: 1, name: 'Nancy Mementos', location: 'Gym' },
  { number: 2, name: 'Rick Mementos', location: 'Gym' },
  { number: 3, name: 'Tucker', location: 'Gym' },
  { number: 4, name: 'Health / Medical', location: 'Gym' },
  { number: 5, name: 'Household Valuables', location: 'Gym' },
  { number: 6, name: 'Unassigned', location: 'Gym' },
]

const defaultAssetStatus: Record<string, Status> = {
  rv: 'Ready',
  power: 'Ready',
  boxes: 'Ready',
  documents: 'Ready',
  nancyE: 'Ready',
  nancyP: 'Ready',
  rickE: 'Ready',
  rickP: 'Ready',
  tucker: 'Ready',
}

const stageTasks: Record<Stage, string[]> = {
  NORMAL: [
    'Verify all six go boxes are in the gym and ready.',
    'Keep RV fuel, propane, water, bedding and sleeping setup ready.',
    'Keep emergency power banks together and charged.',
    'Keep Nancy and Rick E-Duffles and P-Duffles organized for fast loading.',
    'Keep the 14-day food, water and Tucker plan current.',
  ],
  ELEVATED: [
    'Load dry goods and 14-day consumables into the RV.',
    'Recheck RV fuel, propane, water and sleeping readiness.',
    'Top up and verify the Power Depot.',
    'Locate passports, certificates, medications and current-use critical items.',
    'Verify Nancy and Rick E-Duffles and P-Duffles are ready to load.',
    'Confirm Tucker food, treats, leash and supplies are current.',
  ],
  ALERT: [
    'Move all six go boxes from the gym into the RV.',
    'Move the personal documents carry binder into the RV.',
    'Pack Nancy office tech into Nancy E-Duffle and load it with Nancy.',
    'Pack Rick electronics into Rick E-Duffle and load it with Rick.',
    'Load Nancy and Rick P-Duffles with their assigned person.',
    'Load any remaining current-use Tucker items.',
    'Confirm each driver has keys, phone and personal duffles.',
  ],
  ORDER: [
    'Nancy in assigned vehicle.',
    'Rick in assigned vehicle.',
    'Tucker in vehicle.',
    'Nancy E-Duffle and P-Duffle loaded.',
    'Rick E-Duffle and P-Duffle loaded.',
    'Six go boxes loaded in RV.',
    'Personal documents binder loaded in RV.',
    'Phones and keys confirmed.',
    'Leave the property.',
  ],
  EVACUATED: [
    'Confirm Nancy, Rick and Tucker are safe.',
    'Record where you are staying.',
    'Record which vehicle each person has.',
    'Track evacuation expenses and receipts.',
    'Record what was taken and what remained behind.',
  ],
  STAND_DOWN: [
    'Decide what remains staged and what returns to normal locations.',
    'Replace consumed food, water, medications and Tucker supplies.',
    'Return go boxes to the gym when appropriate.',
    'Update RV readiness instead of automatically resetting it.',
    'Record anything moved, missing, expired or needing maintenance.',
  ],
}

function stageClass(stage: Stage) {
  return `stage-${stage.toLowerCase().replace('_', '-')}`
}

function readStage(): Stage {
  const saved = localStorage.getItem('rn-firesmart-stage') as Stage | null
  return saved && stages.some((stage) => stage.id === saved) ? saved : 'NORMAL'
}

function readStatuses(): Record<string, Status> {
  try {
    const saved = localStorage.getItem('rn-firesmart-assets')
    return saved ? { ...defaultAssetStatus, ...JSON.parse(saved) } : defaultAssetStatus
  } catch {
    return defaultAssetStatus
  }
}

export default function App() {
  const [stage, setStage] = useState<Stage>(readStage)
  const [statuses, setStatuses] = useState<Record<string, Status>>(readStatuses)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})

  useEffect(() => {
    localStorage.setItem('rn-firesmart-stage', stage)
    setCompleted({})
  }, [stage])

  useEffect(() => {
    localStorage.setItem('rn-firesmart-assets', JSON.stringify(statuses))
  }, [statuses])

  const currentStage = useMemo(() => stages.find((item) => item.id === stage)!, [stage])

  const setAsset = (key: string, value: Status) => {
    setStatuses((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="app-shell">
      <header className={`hero ${stageClass(stage)}`}>
        <div>
          <p className="eyebrow">RN-FireSmart</p>
          <h1>Household wildfire readiness</h1>
          <p className="hero-copy">Know what is ready, what moves next, and what leaves with whom.</p>
        </div>
        <div className="stage-badge">
          <span>Current stage</span>
          <strong>{currentStage.label}</strong>
        </div>
      </header>

      <main>
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">1. Household stage</p>
              <h2>Select the current stage</h2>
            </div>
            <p className="muted">The selected stage stays active until Nancy or Rick changes it.</p>
          </div>

          <div className="stage-grid">
            {stages.map((item) => (
              <button
                key={item.id}
                className={`stage-card ${stageClass(item.id)} ${stage === item.id ? 'selected' : ''}`}
                onClick={() => setStage(item.id)}
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={`panel action-panel ${stageClass(stage)}`}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">2. Do now</p>
              <h2>{currentStage.label}</h2>
            </div>
            <p className="muted">Operational tasks for the selected stage.</p>
          </div>

          <div className="task-list">
            {stageTasks[stage].map((task, index) => {
              const key = `${stage}-${index}`
              return (
                <label className={`task-row ${completed[key] ? 'done' : ''}`} key={key}>
                  <input
                    type="checkbox"
                    checked={Boolean(completed[key])}
                    onChange={(event) => setCompleted((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                  <span>{task}</span>
                </label>
              )
            })}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">3. Core readiness</p>
              <h2>Preparedness assets</h2>
            </div>
            <p className="muted">These readiness states are separate from the wildfire stage.</p>
          </div>

          <div className="asset-grid">
            <AssetCard title="RV" subtitle="Fuel • propane • water • sleeping-ready" value={statuses.rv} onChange={(value) => setAsset('rv', value)} options={['Ready', 'Check', 'Not Ready', 'Winterized']} />
            <AssetCard title="Power Depot" subtitle="Emergency power banks stored together and charged" value={statuses.power} onChange={(value) => setAsset('power', value)} options={['Ready', 'Check', 'Not Ready']} />
            <AssetCard title="6 Go Boxes" subtitle="Home location: gym • destination: RV at Alert" value={statuses.boxes} onChange={(value) => setAsset('boxes', value)} options={['Ready', 'Check', 'Not Ready', 'Loaded']} />
            <AssetCard title="Documents Binder" subtitle="Plastic carry binder • destination: RV at Alert" value={statuses.documents} onChange={(value) => setAsset('documents', value)} options={['Ready', 'Check', 'Not Ready', 'Loaded']} />
            <AssetCard title="Tucker" subtitle="Food • treats • leash • supplies • 14-day plan" value={statuses.tucker} onChange={(value) => setAsset('tucker', value)} options={['Ready', 'Check', 'Not Ready', 'Loaded']} />
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">4. Person-bound gear</p>
              <h2>Duffles follow the person</h2>
            </div>
            <p className="muted">Rick drives the SUV or RV and Nancy drives the other. Each person’s duffles stay with them.</p>
          </div>

          <div className="person-grid">
            <PersonCard name="Nancy" eStatus={statuses.nancyE} pStatus={statuses.nancyP} setE={(value) => setAsset('nancyE', value)} setP={(value) => setAsset('nancyP', value)} />
            <PersonCard name="Rick" eStatus={statuses.rickE} pStatus={statuses.rickP} setE={(value) => setAsset('rickE', value)} setP={(value) => setAsset('rickP', value)} />
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">5. Six-box system</p>
              <h2>Go boxes</h2>
            </div>
            <p className="muted">Boxes 1–5 are assigned. Box 6 stays open until a real gap appears.</p>
          </div>

          <div className="box-grid">
            {goBoxes.map((box) => (
              <article className="go-box" key={box.number}>
                <span className="box-number">{box.number}</span>
                <div>
                  <strong>{box.name}</strong>
                  <p>{box.location} → RV at Alert</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function AssetCard({ title, subtitle, value, onChange, options }: { title: string; subtitle: string; value: Status; onChange: (value: Status) => void; options: Status[] }) {
  return (
    <article className="asset-card">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <select value={value} onChange={(event) => onChange(event.target.value as Status)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </article>
  )
}

function PersonCard({ name, eStatus, pStatus, setE, setP }: { name: string; eStatus: Status; pStatus: Status; setE: (value: Status) => void; setP: (value: Status) => void }) {
  return (
    <article className="person-card">
      <h3>{name}</h3>
      <div className="duffle-row">
        <div>
          <strong>E-Duffle</strong>
          <span>Electronics</span>
        </div>
        <select value={eStatus} onChange={(event) => setE(event.target.value as Status)}>
          {['Ready', 'Check', 'Not Ready', 'Loaded'].map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>
      <div className="duffle-row">
        <div>
          <strong>P-Duffle</strong>
          <span>Personal clothing and essentials</span>
        </div>
        <select value={pStatus} onChange={(event) => setP(event.target.value as Status)}>
          {['Ready', 'Check', 'Not Ready', 'Loaded'].map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>
      {name === 'Nancy' && <p className="note">Alert load: computer, hard drive, keyboard, mouse and associated power/cables.</p>}
    </article>
  )
}
