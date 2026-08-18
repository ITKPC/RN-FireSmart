import { useEffect, useMemo, useState } from 'react'

type Stage = 'NORMAL' | 'ELEVATED' | 'ALERT' | 'ORDER' | 'EVACUATED' | 'STAND_DOWN'
type Status = 'Ready' | 'Check' | 'Not Ready' | 'Winterized' | 'Loaded'
type Vehicle = 'RV' | 'SUV'

type StageInfo = {
  id: Stage
  label: string
  shortLabel: string
  instruction: string
  description: string
}

type TaskGroup = {
  title: string
  tasks: string[]
}

const stages: StageInfo[] = [
  {
    id: 'NORMAL',
    label: 'Normal / Fire-Season Ready',
    shortLabel: 'Fire-Season Ready',
    instruction: 'Maintain the baseline.',
    description: 'Keep the household ready before there is a threat.',
  },
  {
    id: 'ELEVATED',
    label: 'Elevated Readiness',
    shortLabel: 'Elevated Readiness',
    instruction: 'Get ready to leave before an Alert.',
    description: 'Prepare now so an Evacuation Alert requires almost no thinking.',
  },
  {
    id: 'ALERT',
    label: 'Evacuation Alert',
    shortLabel: 'Evacuation Alert',
    instruction: 'Load and stage for immediate departure.',
    description: 'Move the planned gear now. The goal is to be able to leave immediately.',
  },
  {
    id: 'ORDER',
    label: 'Evacuation Order / Leave Now',
    shortLabel: 'Leave Now',
    instruction: 'Leave now. Do not delay for possessions.',
    description: 'People, Tucker, keys, phones and already-staged gear. Go.',
  },
  {
    id: 'EVACUATED',
    label: 'Evacuated',
    shortLabel: 'Evacuated',
    instruction: 'Account for everyone and manage displacement.',
    description: 'Track safety, location, expenses and what left the property.',
  },
  {
    id: 'STAND_DOWN',
    label: 'Stand Down / Return When Permitted',
    shortLabel: 'Stand Down',
    instruction: 'Threat has passed. Restore deliberately.',
    description: 'Return only when permitted, then restock and reset without losing readiness information.',
  },
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

const taskGroups: Record<Stage, TaskGroup[]> = {
  NORMAL: [
    {
      title: 'Household baseline',
      tasks: [
        'Verify all six go boxes are in the gym and ready.',
        'Keep RV fuel, propane, water, bedding and sleeping setup ready.',
        'Keep emergency power banks together, charged and periodically verified.',
        'Keep Nancy and Rick E-Duffles and P-Duffles organized for fast loading.',
        'Keep the 14-day food, water and Tucker plan current.',
        'Review the household emergency plan together.',
        'Keep Emergency Support Services information and accommodation contacts available.',
      ],
    },
    {
      title: 'BC FireSmart property baseline',
      tasks: [
        'Keep roof and gutters clear of leaves, pine needles and other debris.',
        'Keep grass within 10 metres of the house short.',
        'Clear dead plants, leaves and weeds within 10 metres of the home and maintain the non-combustible zone around the house and deck.',
        'Keep home vents in good condition and make sure openings are not damaged or poorly attached.',
        'Keep combustible storage away from attic and crawl-space vents where practical.',
      ],
    },
  ],
  ELEVATED: [
    {
      title: 'Make departure easy',
      tasks: [
        'Load dry goods and 14-day consumables into the RV.',
        'Recheck RV fuel, propane, water and sleeping readiness.',
        'Top up and verify the Power Depot.',
        'Locate passports, certificates, medications and current-use critical items.',
        'Verify Nancy and Rick E-Duffles and P-Duffles are ready to load.',
        'Confirm Tucker food, treats, leash and supplies are current.',
        'Confirm Nancy and Rick vehicle assignments.',
      ],
    },
    {
      title: 'Quickly address outside surroundings',
      tasks: [
        'Move combustible items within 10 metres of the home, including cushions, toys, decorative items, firewood and potted plants, into a safer location where practical.',
        'Remove combustible material from around any large stationary propane tank.',
        'If a combustible fence attaches to the home, clear vegetation and debris along it and prepare the gate to remain open if needed.',
        'Do a full walk-around of the home and property for ember-prone debris and combustibles.',
      ],
    },
  ],
  ALERT: [
    {
      title: 'Load now',
      tasks: [
        'Move all six go boxes from the gym into the RV.',
        'Move the personal documents carry binder into the RV.',
        'Pack Nancy computer, hard drive, keyboard, mouse and associated power/cables into Nancy E-Duffle.',
        'Pack Rick electronics into Rick E-Duffle.',
        'Load each person’s E-Duffle and P-Duffle into the vehicle that person is driving.',
        'Load any remaining current-use Tucker items.',
        'Confirm each driver has keys and phone.',
      ],
    },
    {
      title: 'Final home actions — only while there is time',
      tasks: [
        'Check exterior, foundation and roof vents for obvious ember-entry problems; use temporary non-combustible covering only where appropriate and remember it must be removed on return.',
        'Move easily ignited cardboard or similar material away from attic or crawl-space vents where accessible.',
        'Before leaving, turn off air conditioning.',
        'Before leaving, close exterior doors, garage doors, windows and skylights.',
        'Do not turn off natural gas unless directed by officials or you suspect a gas leak.',
      ],
    },
  ],
  ORDER: [
    {
      title: 'Leave now',
      tasks: [
        'Nancy is in her assigned vehicle.',
        'Rick is in his assigned vehicle.',
        'Tucker is in a vehicle.',
        'Phones and keys are confirmed.',
        'Leave the property now.',
      ],
    },
  ],
  EVACUATED: [
    {
      title: 'Account for people and essentials',
      tasks: [
        'Confirm Nancy, Rick and Tucker are safe.',
        'Record where you are staying.',
        'Confirm which vehicle each person has.',
        'Track evacuation expenses and receipts.',
        'Record what was taken and what remained behind.',
      ],
    },
  ],
  STAND_DOWN: [
    {
      title: 'Restore without losing readiness',
      tasks: [
        'Return only when authorities permit re-entry.',
        'Remove any temporary vent coverings installed before evacuation.',
        'Decide what remains staged and what returns to normal locations.',
        'Replace consumed food, water, medications and Tucker supplies.',
        'Recharge and verify the Power Depot.',
        'Return go boxes to the gym when appropriate.',
        'Update RV readiness instead of automatically resetting it.',
        'Record anything moved, missing, expired or needing maintenance.',
      ],
    },
  ],
}

const assetDefinitions: { key: string; title: string; subtitle: string; options: Status[] }[] = [
  { key: 'rv', title: 'RV', subtitle: 'Fuel • propane • water • sleeping-ready', options: ['Ready', 'Check', 'Not Ready', 'Winterized'] },
  { key: 'power', title: 'Power Depot', subtitle: 'Dedicated emergency power banks stored together and charged', options: ['Ready', 'Check', 'Not Ready'] },
  { key: 'boxes', title: '6 Go Boxes', subtitle: 'Gym → RV at Alert', options: ['Ready', 'Check', 'Not Ready', 'Loaded'] },
  { key: 'documents', title: 'Documents Binder', subtitle: 'Shared plastic carry binder → RV at Alert', options: ['Ready', 'Check', 'Not Ready', 'Loaded'] },
  { key: 'tucker', title: 'Tucker', subtitle: 'Food • treats • leash • supplies • 14-day plan', options: ['Ready', 'Check', 'Not Ready', 'Loaded'] },
]

function stageClass(stage: Stage) {
  return `stage-${stage.toLowerCase().replace('_', '-')}`
}

function readStage(): Stage {
  const saved = localStorage.getItem('rn-firesmart-stage') as Stage | null
  return saved && stages.some((item) => item.id === saved) ? saved : 'NORMAL'
}

function readStatuses(): Record<string, Status> {
  try {
    const saved = localStorage.getItem('rn-firesmart-assets')
    return saved ? { ...defaultAssetStatus, ...JSON.parse(saved) } : defaultAssetStatus
  } catch {
    return defaultAssetStatus
  }
}

function readCompleted(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem('rn-firesmart-tasks')
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function readNancyVehicle(): Vehicle {
  return localStorage.getItem('rn-firesmart-nancy-vehicle') === 'RV' ? 'RV' : 'SUV'
}

function statusClass(value: Status) {
  return `status-${value.toLowerCase().replaceAll(' ', '-').replace('winterized', 'winterized')}`
}

export default function App() {
  const [stage, setStage] = useState<Stage>(readStage)
  const [showStagePicker, setShowStagePicker] = useState(false)
  const [showReference, setShowReference] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, Status>>(readStatuses)
  const [completed, setCompleted] = useState<Record<string, boolean>>(readCompleted)
  const [nancyVehicle, setNancyVehicle] = useState<Vehicle>(readNancyVehicle)

  useEffect(() => {
    localStorage.setItem('rn-firesmart-stage', stage)
  }, [stage])

  useEffect(() => {
    localStorage.setItem('rn-firesmart-assets', JSON.stringify(statuses))
  }, [statuses])

  useEffect(() => {
    localStorage.setItem('rn-firesmart-tasks', JSON.stringify(completed))
  }, [completed])

  useEffect(() => {
    localStorage.setItem('rn-firesmart-nancy-vehicle', nancyVehicle)
  }, [nancyVehicle])

  const currentStage = useMemo(() => stages.find((item) => item.id === stage)!, [stage])
  const rickVehicle: Vehicle = nancyVehicle === 'RV' ? 'SUV' : 'RV'

  const stageTaskKeys = taskGroups[stage].flatMap((group, groupIndex) =>
    group.tasks.map((_, taskIndex) => `${stage}-${groupIndex}-${taskIndex}`),
  )
  const doneCount = stageTaskKeys.filter((key) => completed[key]).length
  const totalTasks = stageTaskKeys.length
  const progress = totalTasks === 0 ? 0 : Math.round((doneCount / totalTasks) * 100)

  const readinessKeys = ['rv', 'power', 'boxes', 'documents', 'tucker', 'nancyE', 'nancyP', 'rickE', 'rickP']
  const readyCount = readinessKeys.filter((key) => ['Ready', 'Loaded'].includes(statuses[key])).length
  const readinessPercent = Math.round((readyCount / readinessKeys.length) * 100)
  const blockers = readinessKeys.filter((key) => !['Ready', 'Loaded'].includes(statuses[key]))

  const setAsset = (key: string, value: Status) => {
    setStatuses((current) => ({ ...current, [key]: value }))
  }

  const changeStage = (nextStage: Stage) => {
    setStage(nextStage)
    setShowStagePicker(false)
    setShowReference(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetStageChecklist = () => {
    const prefixes = stageTaskKeys
    setCompleted((current) => {
      const next = { ...current }
      prefixes.forEach((key) => delete next[key])
      return next
    })
  }

  const showReadinessByDefault = stage === 'NORMAL'
  const hideReferenceEntirely = stage === 'ORDER'

  return (
    <div className={`app-shell ${stageClass(stage)}`}>
      <header className={`hero ${stageClass(stage)}`}>
        <div className="hero-main">
          <p className="eyebrow">RN-FireSmart</p>
          <p className="hero-stage-name">{currentStage.shortLabel}</p>
          <h1>{currentStage.instruction}</h1>
          <p className="hero-copy">{currentStage.description}</p>
        </div>
        <div className="stage-badge">
          <span>Current household stage</span>
          <strong>{currentStage.label}</strong>
          <button className="change-stage-button" onClick={() => setShowStagePicker((current) => !current)}>
            {showStagePicker ? 'Close stage choices' : 'Change stage'}
          </button>
        </div>
      </header>

      <main className={stage === 'ORDER' ? 'order-main' : ''}>
        {showStagePicker && (
          <section className="panel stage-picker-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Household stage</p>
                <h2>Change the current stage</h2>
              </div>
              <p className="muted">Nothing changes automatically. The selected stage remains active until one of you changes it.</p>
            </div>
            <div className="stage-grid">
              {stages.map((item) => (
                <button
                  key={item.id}
                  className={`stage-card ${stageClass(item.id)} ${stage === item.id ? 'selected' : ''}`}
                  onClick={() => changeStage(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {stage === 'NORMAL' && (
          <section className="readiness-summary-grid">
            <article className="summary-card">
              <span className="summary-label">Fire-season readiness</span>
              <strong className="summary-number">{readinessPercent}%</strong>
              <span>{blockers.length === 0 ? 'Core assets ready' : `${blockers.length} readiness item${blockers.length === 1 ? '' : 's'} need attention`}</span>
            </article>
            <article className="summary-card">
              <span className="summary-label">Current checklist</span>
              <strong className="summary-number">{doneCount}/{totalTasks}</strong>
              <span>Beginning-of-season and property checks</span>
            </article>
            <article className="summary-card assignment-summary">
              <span className="summary-label">Evacuation vehicles</span>
              <strong>Nancy → {nancyVehicle}</strong>
              <strong>Rick → {rickVehicle}</strong>
              <button className="text-button" onClick={() => setNancyVehicle(nancyVehicle === 'RV' ? 'SUV' : 'RV')}>Swap vehicles</button>
            </article>
          </section>
        )}

        {blockers.length > 0 && stage !== 'ORDER' && stage !== 'EVACUATED' && (
          <section className="blocker-strip">
            <div>
              <p className="eyebrow">Needs attention</p>
              <strong>{blockers.length} readiness item{blockers.length === 1 ? '' : 's'} could slow departure</strong>
            </div>
            <button className="secondary-button" onClick={() => setShowReference(true)}>Review blockers</button>
          </section>
        )}

        {(stage === 'ELEVATED' || stage === 'ALERT') && (
          <section className="vehicle-assignment panel compact-panel">
            <div>
              <p className="eyebrow">Vehicle assignment</p>
              <h2>Nancy → {nancyVehicle} &nbsp;&nbsp; Rick → {rickVehicle}</h2>
              <p className="muted">E-Duffle and P-Duffle follow the person into that vehicle.</p>
            </div>
            <button className="secondary-button" onClick={() => setNancyVehicle(nancyVehicle === 'RV' ? 'SUV' : 'RV')}>Swap vehicles</button>
          </section>
        )}

        <section className={`panel mission-panel ${stageClass(stage)} ${stage === 'ORDER' ? 'leave-now-panel' : ''}`}>
          <div className="mission-heading">
            <div>
              <p className="eyebrow">Do now</p>
              <h2>{stage === 'ORDER' ? 'LEAVE NOW' : currentStage.shortLabel}</h2>
              {stage !== 'ORDER' && <p className="muted">Work from top to bottom. The app remembers completed items.</p>}
            </div>
            <div className="progress-wrap" aria-label={`${doneCount} of ${totalTasks} tasks complete`}>
              <div className="progress-copy"><strong>{doneCount} of {totalTasks}</strong><span> complete</span></div>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            </div>
          </div>

          <div className="task-groups">
            {taskGroups[stage].map((group, groupIndex) => (
              <div className="task-group" key={group.title}>
                {taskGroups[stage].length > 1 && <h3>{group.title}</h3>}
                <div className="task-list">
                  {group.tasks.map((task, taskIndex) => {
                    const key = `${stage}-${groupIndex}-${taskIndex}`
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
              </div>
            ))}
          </div>

          {stage === 'ALERT' && progress === 100 && (
            <div className="ready-to-leave">READY TO LEAVE — planned Alert actions are complete.</div>
          )}
          {stage === 'ORDER' && (
            <div className="order-warning">Do not go back for possessions. Leave using the safest available route and follow official direction.</div>
          )}
          {stage !== 'ORDER' && (
            <button className="text-button reset-button" onClick={resetStageChecklist}>Reset this stage checklist</button>
          )}
        </section>

        {!hideReferenceEntirely && (
          <>
            {!showReadinessByDefault && (
              <button className="reference-toggle" onClick={() => setShowReference((current) => !current)}>
                {showReference ? 'Hide readiness & reference' : 'View readiness & reference'}
              </button>
            )}

            {(showReadinessByDefault || showReference) && (
              <div className="reference-area">
                <section className="panel">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Readiness & reference</p>
                      <h2>Core preparedness assets</h2>
                    </div>
                    <p className="muted">Tap a status to move to its next state. These states do not reset when the wildfire stage changes.</p>
                  </div>
                  <div className="asset-grid">
                    {assetDefinitions.map((asset) => (
                      <AssetCard
                        key={asset.key}
                        title={asset.title}
                        subtitle={asset.subtitle}
                        value={statuses[asset.key]}
                        onChange={(value) => setAsset(asset.key, value)}
                        options={asset.options}
                      />
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Person-bound gear</p>
                      <h2>Duffles follow the person</h2>
                    </div>
                    <p className="muted">Nancy → {nancyVehicle}. Rick → {rickVehicle}.</p>
                  </div>
                  <div className="person-grid">
                    <PersonCard name="Nancy" vehicle={nancyVehicle} eStatus={statuses.nancyE} pStatus={statuses.nancyP} setE={(value) => setAsset('nancyE', value)} setP={(value) => setAsset('nancyP', value)} />
                    <PersonCard name="Rick" vehicle={rickVehicle} eStatus={statuses.rickE} pStatus={statuses.rickP} setE={(value) => setAsset('rickE', value)} setP={(value) => setAsset('rickP', value)} />
                  </div>
                </section>

                <section className="panel">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Six-box system</p>
                      <h2>Go boxes</h2>
                    </div>
                    <p className="muted">Boxes 1–5 are assigned. Box 6 remains open until a real gap appears.</p>
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

                <p className="source-note">Property-preparation actions are incorporated from the BC FireSmart / PreparedBC Emergency Wildfire Preparedness Checklist you provided.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function AssetCard({ title, subtitle, value, onChange, options }: { title: string; subtitle: string; value: Status; onChange: (value: Status) => void; options: Status[] }) {
  const nextStatus = () => {
    const currentIndex = options.indexOf(value)
    onChange(options[(currentIndex + 1) % options.length])
  }

  return (
    <article className="asset-card">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <button className={`status-button ${statusClass(value)}`} onClick={nextStatus} title="Tap to change status">
        <strong>{value}</strong>
        <span>tap to change</span>
      </button>
    </article>
  )
}

function PersonCard({ name, vehicle, eStatus, pStatus, setE, setP }: { name: string; vehicle: Vehicle; eStatus: Status; pStatus: Status; setE: (value: Status) => void; setP: (value: Status) => void }) {
  return (
    <article className="person-card">
      <div className="person-title-row">
        <h3>{name}</h3>
        <span className="vehicle-chip">{vehicle}</span>
      </div>
      <DuffleStatus label="E-Duffle" subtitle="Electronics" value={eStatus} onChange={setE} />
      <DuffleStatus label="P-Duffle" subtitle="Personal clothing and essentials" value={pStatus} onChange={setP} />
      {name === 'Nancy' && <p className="note">Alert load: computer, hard drive, keyboard, mouse and associated power/cables.</p>}
    </article>
  )
}

function DuffleStatus({ label, subtitle, value, onChange }: { label: string; subtitle: string; value: Status; onChange: (value: Status) => void }) {
  const options: Status[] = ['Ready', 'Check', 'Not Ready', 'Loaded']
  const nextStatus = () => {
    const currentIndex = options.indexOf(value)
    onChange(options[(currentIndex + 1) % options.length])
  }

  return (
    <div className="duffle-row">
      <div>
        <strong>{label}</strong>
        <span>{subtitle}</span>
      </div>
      <button className={`status-button compact ${statusClass(value)}`} onClick={nextStatus} title="Tap to change status">
        <strong>{value}</strong>
      </button>
    </div>
  )
}
