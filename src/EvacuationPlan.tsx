import { useEffect, useMemo, useState } from 'react'
import './evacuation-plan.css'

type RouteId = 'EAST' | 'SOUTHEAST' | 'NORTH' | 'NORTHWEST' | 'WEST_WHISTLER' | 'SOUTH' | 'SOUTHWEST_5A' | 'MERRITT_PRINCETON'
type StayType = 'RV' | 'HOTEL'
type StayStatus = 'Not called' | 'Available' | 'Full' | 'No answer' | 'Unavailable'

type StayOption = {
  name: string
  type: StayType
  phone: string
  address: string
  verifiedOn: string
  pet?: string
  rv?: string
  note?: string
  url?: string
}

type TownStop = { name: string; note?: string; stays: StayOption[] }
type RoutePlan = { id: RouteId; shortName: string; highway: string; corridor: string; guidance: string; branchNote?: string; towns: TownStop[] }

const VERIFIED = '2026-08-18'

const vancouverStays: StayOption[] = [
  {
    name: 'Burnaby Cariboo RV Park & Campground',
    type: 'RV',
    phone: '604-420-1722',
    address: '8765 Cariboo Place, Burnaby, BC V3N 4T2',
    verifiedOn: VERIFIED,
    pet: 'Pets welcome in the RV park; Tucker must remain leashed and supervised.',
    rv: 'Full-hookup sites; Destination Vancouver lists accommodation for any size motorhome. Convenient from the Hwy 1 east approach.',
    url: 'https://bcrvpark.com/',
  },
  {
    name: 'Capilano River RV Park',
    type: 'RV',
    phone: '604-987-4722',
    address: '295 Tomahawk Avenue, West Vancouver, BC V7P 1C5',
    verifiedOn: VERIFIED,
    pet: 'Pet-friendly RV park with dog-walking areas.',
    rv: 'Full-service RV sites. Particularly convenient from Whistler/Hwy 99. Entrance clearance is 13 ft 6 in; confirm motorhome height and current RV-age rules when calling.',
    url: 'https://www.capilanoriverrvpark.com/',
  },
  {
    name: 'Best Western Plus Sands',
    type: 'HOTEL',
    phone: '604-682-1831',
    address: '1755 Davie Street, Vancouver, BC V6G 1W5',
    verifiedOn: VERIFIED,
    pet: 'Pet-friendly rooms allow up to two dogs, subject to room availability.',
    rv: 'Hotel option for people + Tucker; do not assume motorhome parking. Use an RV park or separately confirmed RV parking for the motorhome.',
    url: 'https://www.bestwestern.com/en_US/book/vancouver/hotel-rooms/best-western-plus-sands/propertyCode.62025.html',
  },
]

const routes: RoutePlan[] = [
  {
    id: 'EAST', shortName: 'East', highway: 'Hwy 1',
    corridor: 'Kamloops → Chase → Salmon Arm → Sicamous → Revelstoke → Golden',
    guidance: 'Primary eastbound Trans-Canada corridor. Use only when official direction and current road conditions make it safe.',
    towns: [
      { name: 'Chase', note: 'No current Tucker-friendly overnight accommodation/RV fit has been verified for us yet.', stays: [] },
      { name: 'Salmon Arm', stays: [
        { name: 'Glen Echo Resorts', type: 'RV', phone: '250-832-5973', address: '6592 Trans Canada Hwy NW, Salmon Arm, BC V1E 3A2', verifiedOn: VERIFIED, pet: 'Pet-friendly amenities and dog park.', rv: 'RV sites.', url: 'https://www.glenechoresorts.com/' },
      ]},
      { name: 'Sicamous', note: 'Hwy 97A junction.', stays: [
        { name: 'Best Western Sicamous Inn', type: 'HOTEL', phone: '250-836-4117', address: '806 Trans Canada Highway E, Sicamous, BC V0E 2V0', verifiedOn: VERIFIED, pet: 'Pet-friendly rooms available.', rv: 'Large complimentary parking area; confirm motorhome fit when calling.', url: 'https://www.sicamousinn.ca/' },
      ]},
      { name: 'Revelstoke', stays: [
        { name: 'The Stoke Hotel', type: 'HOTEL', phone: '250-837-5221', address: '1911 Fraser Drive, Revelstoke, BC V0E 2S0', verifiedOn: VERIFIED, pet: 'Pet-friendly hotel.', url: 'https://www.stokehotel.ca/' },
      ]},
      { name: 'Golden', stays: [
        { name: 'Golden Municipal Campground & RV Park', type: 'RV', phone: '250-344-5412', address: '1411 9th Street South, Golden, BC', verifiedOn: VERIFIED, pet: 'Pet stays listed.', rv: '72 sites with power; sani-station, showers and laundry.', url: 'https://www.golden.ca/recreation-services/facilities/golden-municipal-campground-rv-park' },
      ]},
    ],
  },
  {
    id: 'SOUTHEAST', shortName: 'Southeast', highway: 'Hwy 97',
    corridor: 'Kamloops → Monte Creek → Falkland → Vernon',
    guidance: 'Southeast into the Okanagan. Vernon is a major decision point.',
    branchNote: 'From Vernon: continue south toward Kelowna/Osoyoos, or take Hwy 97A north via Armstrong and Enderby to Sicamous and reconnect with Hwy 1.',
    towns: [
      { name: 'Monte Creek', note: 'Transit point. No verified overnight accommodation/RV fit for us yet.', stays: [] },
      { name: 'Falkland', stays: [
        { name: 'Pillar Lake Resort', type: 'RV', phone: '250-379-2623', address: '4745 Chase Falkland Road, Falkland, BC V0E 1W0', verifiedOn: VERIFIED, pet: 'Pets welcome.', rv: 'RV sites with electrical hookups and sani-dump.', url: 'https://www.pillarlake.com/' },
      ]},
      { name: 'Vernon', note: 'Major branch point.', stays: [
        { name: 'Best Western Pacific Inn', type: 'HOTEL', phone: '250-558-1800', address: '4790 34 Street, Vernon, BC V1T 5Y9', verifiedOn: VERIFIED, pet: 'Pet-friendly rooms.', rv: 'Official Best Western listing includes truck/RV parking.', url: 'https://www.bestwestern.com/en_US/book/hotel-rooms.62133.html' },
      ]},
      { name: 'Armstrong', note: 'Hwy 97A north branch.', stays: [
        { name: 'Armstrong Kin RV Park', type: 'RV', phone: '250-546-4041', address: '3311 Park Drive, Armstrong, BC V0E 1B0', verifiedOn: VERIFIED, rv: '30/50 amp service and pull-through sites up to 80 ft.', url: 'https://www.armstrongkinrv.ca/' },
      ]},
      { name: 'Enderby', stays: [
        { name: 'Riverside RV Park & Campground', type: 'RV', phone: '250-838-0155', address: '112 Kildonan Avenue, Enderby, BC V4Y 4A7', verifiedOn: VERIFIED, pet: 'Dog friendly.', rv: 'Full-hookup and pull-through RV sites.', url: 'https://enderbycamping.com/' },
      ]},
      { name: 'Kelowna', note: 'Southbound continuation from Vernon.', stays: [
        { name: 'Recreation Inn & Suites', type: 'HOTEL', phone: '250-860-3982', address: '1891 Parkinson Way, Kelowna, BC V1Y 7V6', verifiedOn: VERIFIED, pet: 'Pet-friendly rooms; call for availability.', url: 'https://www.recreationinn.com/' },
      ]},
      { name: 'Osoyoos', note: 'Farther south fallback if Hwy 97 remains safe.', stays: [
        { name: 'Nk’Mip RV Park & Campground', type: 'RV', phone: '250-495-7279', address: '8000 45th Street, Osoyoos, BC', verifiedOn: VERIFIED, pet: 'Pets permitted under current campground rules.', rv: 'Large full-service RV destination; big rigs welcome.', url: 'https://campingosoyoos.com/' },
      ]},
    ],
  },
  {
    id: 'NORTH', shortName: 'North', highway: 'Hwy 5',
    corridor: 'Kamloops → Barriere → Little Fort → Clearwater → Blue River → Tête Jaune Cache',
    guidance: 'A geographically distinct northbound escape corridor.',
    towns: [
      { name: 'Barriere', stays: [
        { name: 'Y-5 Motel & Campground', type: 'RV', phone: '250-672-9739', address: '4325 Southern Yellowhead Hwy, Barriere, BC V0E 1E0', verifiedOn: VERIFIED, pet: 'Current property material includes guests travelling with pets.', rv: 'Pull-through campground with full hookups.', url: 'https://www.y5motel.com/' },
      ]},
      { name: 'Little Fort', stays: [
        { name: 'Fox & Maple RV Resort', type: 'RV', phone: '250-574-0024', address: '8919 Thuya Creek Road, Little Fort, BC V0E 2C0', verifiedOn: VERIFIED, pet: 'Dog park onsite.', rv: 'Full-service sites for larger RVs.', url: 'https://foxandmaple.ca/' },
      ]},
      { name: 'Clearwater', stays: [
        { name: 'Quality Inn & Suites Clearwater', type: 'HOTEL', phone: '250-674-3080', address: '360 Eden Road, Clearwater, BC V0E 1N1', verifiedOn: VERIFIED, pet: 'Pet-friendly designated rooms.', rv: 'Truck parking listed; confirm motorhome parking when calling.', url: 'https://www.choicehotels.com/en-ca/british-columbia/clearwater/quality-inn-hotels/cnb83' },
      ]},
      { name: 'Blue River', stays: [
        { name: 'Blue River Campground', type: 'RV', phone: '778-668-7423', address: '991 Blue River West Frontage Road, Blue River, BC V0E 1J0', verifiedOn: VERIFIED, pet: 'Pets free at RV sites.', rv: 'Full-service sites and extra-long pull-throughs.', url: 'https://bluerivercampground.ca/' },
      ]},
      { name: 'Tête Jaune Cache', note: 'Small junction community. No verified overnight fit for us here yet; use nearby Valemount if safe.', stays: [] },
      { name: 'Valemount', note: 'Practical accommodation fallback near Tête Jaune Cache.', stays: [
        { name: 'Best Western Plus Valemount Inn & Suites', type: 'HOTEL', phone: '250-566-0086', address: '1950 Highway 5 S, Valemount, BC V0E 2Z0', verifiedOn: VERIFIED, pet: 'Pet-friendly rooms available.', rv: 'Official Best Western listing includes truck/RV parking.', url: 'https://www.bestwestern.com/en_US/book/valemount/hotel-rooms/best-western-plus-valemount-inn-suites/propertyCode.62120.html' },
      ]},
    ],
  },
  {
    id: 'NORTHWEST', shortName: 'Northwest', highway: 'Hwy 1 / Hwy 97',
    corridor: 'Kamloops → Cache Creek → Clinton → 100 Mile House → Williams Lake → Quesnel → Prince George',
    guidance: 'Cariboo corridor. Hwy 97 continues north beyond Prince George toward Dawson Creek, Fort St. John and the Yukon.',
    towns: [
      { name: 'Cache Creek', stays: [
        { name: 'Cache Creek Campground & RV Park', type: 'RV', phone: '604-226-5088', address: '1621 Trans Canada Hwy, Cache Creek, BC V0K 1H0', verifiedOn: VERIFIED, pet: 'Pets welcome.', rv: 'Full-service and pull-through sites.', url: 'https://cachecreekcampground.com/' },
      ]},
      { name: 'Clinton', stays: [
        { name: 'Clinton Pines RV Park & Campground', type: 'RV', phone: '250-459-0030', address: '1204 Cariboo Avenue, Clinton, BC V0K 1K0', verifiedOn: VERIFIED, pet: 'Pet-friendly; pets free.', rv: 'Sites for trailers/RVs up to 40 ft; full-service sites available.', url: 'https://www.clintonpines.ca/' },
      ]},
      { name: '100 Mile House', stays: [
        { name: 'Super 8 by Wyndham 100 Mile House', type: 'HOTEL', phone: '250-395-8888', address: '989 Alder Avenue, 100 Mile House, BC V0K 2E0', verifiedOn: VERIFIED, pet: 'Pet-friendly hotel.', url: 'https://www.wyndhamhotels.com/en-ca/super-8/100-mile-house-british-columbia/super-8-one-hundred-mile-house/overview' },
      ]},
      { name: 'Williams Lake', stays: [
        { name: 'Sandman Hotel & Suites Williams Lake', type: 'HOTEL', phone: '250-392-6557', address: '664 Oliver Street, Williams Lake, BC V2G 1M6', verifiedOn: VERIFIED, pet: 'Pet-friendly rooms.', rv: 'Free parking listed; confirm motorhome fit when calling.', url: 'https://www.sandmanhotels.com/williams-lake' },
      ]},
      { name: 'Quesnel', stays: [
        { name: 'Quesnel Downtown RV Park & Campground', type: 'RV', phone: '250-983-4671', address: '21 Johnston Bridge Loop, Quesnel, BC', verifiedOn: VERIFIED, rv: 'Municipal campground with serviced RV sites.', note: 'Current tourism information notes a Johnston Bridge/Loop access detour; check current directions.', url: 'https://quesneldowntownrvpark.com/' },
      ]},
      { name: 'Prince George', stays: [
        { name: 'Northern Experience RV Park & Campground', type: 'RV', phone: '250-963-7577', address: '9180 Hwy 97 South, Prince George, BC V2N 6E2', verifiedOn: VERIFIED, pet: 'Dog-friendly.', rv: 'Big-rig pull-throughs and full-service hookups.', url: 'https://www.northernexperiencerv.com/' },
      ]},
    ],
  },
  {
    id: 'WEST_WHISTLER', shortName: 'West / Whistler back route', highway: 'Hwy 1 / Hwy 99',
    corridor: 'Kamloops → Cache Creek → Pavilion → Lillooet → Duffey Lake Road → Pemberton → Whistler → Vancouver',
    guidance: 'A distinct west/southwest corridor. Treat Duffey Lake Road as an alternate for the motorhome, not a preferred RV route. If the corridor remains open, Hwy 99 continues south from Whistler into Metro Vancouver.',
    branchNote: 'The Lillooet–Pemberton section is steep and mountainous. Check DriveBC immediately before committing to this corridor.',
    towns: [
      { name: 'Cache Creek', stays: [
        { name: 'Cache Creek Campground & RV Park', type: 'RV', phone: '604-226-5088', address: '1621 Trans Canada Hwy, Cache Creek, BC V0K 1H0', verifiedOn: VERIFIED, pet: 'Pets welcome.', rv: 'Full-service and pull-through sites.', url: 'https://cachecreekcampground.com/' },
      ]},
      { name: 'Pavilion', note: 'Small transit community. No verified overnight accommodation/RV fit for us yet.', stays: [] },
      { name: 'Lillooet', stays: [
        { name: 'Retasket Lodge & RV Park', type: 'RV', phone: '250-256-2090', address: '1264 Bouvette Road, Lillooet, BC V0K 1V0', verifiedOn: VERIFIED, rv: '20-room motel plus 8-site RV park.', url: 'https://www.retasketlodge.com/' },
      ]},
      { name: 'Pemberton', stays: [
        { name: 'Pemberton Valley Lodge', type: 'HOTEL', phone: '604-894-2000', address: '1490 Sea-to-Sky Highway, Pemberton, BC', verifiedOn: VERIFIED, pet: 'Dog-friendly accommodation is specifically offered.', url: 'https://www.pembertonvalleylodge.com/' },
      ]},
      { name: 'Whistler', stays: [
        { name: 'Whistler RV Park & Campground', type: 'RV', phone: '604-905-2523', address: '55 Highway 99, Whistler, BC V0N 1B0', verifiedOn: VERIFIED, pet: 'Pets welcome.', rv: 'RV sites of several sizes; confirm your exact motorhome length.', url: 'https://whistlerrvpark.com/' },
      ]},
      { name: 'Vancouver', note: 'Metro Vancouver destination after Whistler. Capilano River RV Park is the most direct RV option from the Hwy 99/North Shore approach.', stays: vancouverStays },
    ],
  },
  {
    id: 'SOUTH', shortName: 'South', highway: 'Hwy 5 / Hwy 1',
    corridor: 'Kamloops → Merritt → Hope → Vancouver',
    guidance: 'Coquihalla southbound corridor. Merritt is a major branching point; if the corridor remains open, continue west from Hope toward Vancouver.',
    branchNote: 'From Merritt, reassess toward Hope/Vancouver, Princeton/Southern Interior or another open corridor as directed.',
    towns: [
      { name: 'Merritt', stays: [
        { name: 'Claybanks RV Park', type: 'RV', phone: '250-378-6441', address: '1302 Voght Street, Merritt, BC V1K 1B8', verifiedOn: VERIFIED, pet: 'Leashed or kenneled pets welcome.', rv: 'Fully serviced sites suitable for RVs up to 65 ft long.', url: 'https://www.claybanksrv.ca/' },
      ]},
      { name: 'Hope', stays: [
        { name: 'WildRose Campground & RV Park', type: 'RV', phone: '604-869-9842', address: '62030 Flood Hope Road, Hope, BC V0X 1L2', verifiedOn: VERIFIED, pet: 'Pet-friendly campground; confirm current rules when calling.', rv: 'Year-round campground and RV park.', url: 'https://www.wildrosecamp.com/' },
      ]},
      { name: 'Vancouver', note: 'Metro Vancouver destination after Hope. Burnaby Cariboo RV Park is convenient from the Hwy 1 east approach.', stays: vancouverStays },
    ],
  },
  {
    id: 'SOUTHWEST_5A', shortName: 'Southwest alternate', highway: 'Hwy 5A',
    corridor: 'Kamloops → Quilchena → Merritt',
    guidance: 'Physical alternate between Kamloops and Merritt. Treat as an alternate for the motorhome rather than automatically preferring it over Hwy 5.',
    towns: [
      { name: 'Quilchena', note: 'Transit point. No verified Tucker + motorhome accommodation fit for us yet.', stays: [] },
      { name: 'Merritt', stays: [
        { name: 'Claybanks RV Park', type: 'RV', phone: '250-378-6441', address: '1302 Voght Street, Merritt, BC V1K 1B8', verifiedOn: VERIFIED, pet: 'Leashed or kenneled pets welcome.', rv: 'Fully serviced sites suitable for RVs up to 65 ft long.', url: 'https://www.claybanksrv.ca/' },
      ]},
    ],
  },
  {
    id: 'MERRITT_PRINCETON', shortName: 'Merritt → Princeton', highway: 'Hwy 5A / 97C connections',
    corridor: 'Merritt → Aspen Grove → Princeton / Southern Interior',
    guidance: 'A further branch from the Merritt area when official direction and road conditions support moving toward Princeton rather than Hope.',
    towns: [
      { name: 'Aspen Grove', note: 'Transit point. No verified Tucker + motorhome accommodation fit for us yet.', stays: [] },
      { name: 'Princeton', stays: [
        { name: 'Princeton Municipal Campground & RV Park', type: 'RV', phone: '250-295-7355', address: '365 Highway 3 East, Princeton, BC V0X 1W0', verifiedOn: VERIFIED, pet: 'Pets allowed under current park rules.', rv: 'Tent, RV, trailer and motorhome sites; open year-round.', url: 'https://www.princeton.ca/p/princeton-municipal-campground-rv-park' },
      ]},
    ],
  },
]

const statusOptions: StayStatus[] = ['Not called', 'Available', 'Full', 'No answer', 'Unavailable']

function readRoute(): RouteId | null {
  const saved = localStorage.getItem('rn-firesmart-selected-route') as RouteId | null
  return routes.some((route) => route.id === saved) ? saved : null
}

function mapSearch(town: string, type: string) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${type} ${town} BC`)}`
}

export default function EvacuationPlan() {
  const [selectedRoute, setSelectedRoute] = useState<RouteId | null>(readRoute)
  const [selectedStay, setSelectedStay] = useState(() => localStorage.getItem('rn-firesmart-selected-destination') || '')
  const [rallyPoint, setRallyPoint] = useState(() => localStorage.getItem('rn-firesmart-rally-point') || '')
  const [statuses, setStatuses] = useState<Record<string, StayStatus>>(() => {
    try { return JSON.parse(localStorage.getItem('rn-firesmart-stay-statuses') || '{}') } catch { return {} }
  })

  useEffect(() => {
    if (selectedRoute) localStorage.setItem('rn-firesmart-selected-route', selectedRoute)
    else localStorage.removeItem('rn-firesmart-selected-route')
  }, [selectedRoute])
  useEffect(() => { localStorage.setItem('rn-firesmart-selected-destination', selectedStay) }, [selectedStay])
  useEffect(() => { localStorage.setItem('rn-firesmart-rally-point', rallyPoint) }, [rallyPoint])
  useEffect(() => { localStorage.setItem('rn-firesmart-stay-statuses', JSON.stringify(statuses)) }, [statuses])

  const activeRoute = routes.find((route) => route.id === selectedRoute)
  const selectedOption = useMemo(() => activeRoute?.towns.flatMap((town) => town.stays.map((stay) => ({ ...stay, town: town.name }))).find((stay) => stay.name === selectedStay), [activeRoute, selectedStay])

  const chooseRoute = (id: RouteId) => {
    if (id !== selectedRoute) setSelectedStay('')
    setSelectedRoute(id)
  }

  const townNeedsAttention = (town: TownStop) => {
    if (town.stays.length === 0) return true
    return town.stays.every((stay) => ['Full', 'Unavailable'].includes(statuses[stay.name] || 'Not called'))
  }

  return (
    <div className="evac-page">
      <header className="evac-hero">
        <div>
          <p className="evac-kicker">RN-FireSmart</p>
          <h1>Evacuation Decision Tree</h1>
          <p>Choose the regional corridor emergency officials direct us toward, then use the verified stops along that corridor.</p>
        </div>
        <div className="evac-rule">The actual route is incident-specific. First-responder and Voyent Alert directions override this household plan.</div>
      </header>

      <main className="evac-main">
        <section className="decision-panel">
          <div className="route-toolbar">
            <div>
              <div className="layer-title"><div><p className="evac-kicker">Regional corridor</p><h2>Which direction is open?</h2></div></div>
              <p>These are preplanned options, not “the evacuation route.” Check current roads and follow the route identified by emergency officials.</p>
            </div>
            <a className="drivebc-button" href="https://www.drivebc.ca/" target="_blank" rel="noopener noreferrer">Check DriveBC ↗</a>
          </div>

          <div className="route-grid">
            {routes.map((route) => (
              <button type="button" className={`route-card ${selectedRoute === route.id ? 'selected' : ''}`} key={route.id} onClick={() => chooseRoute(route.id)}>
                <div className="route-card-topline"><strong>{route.shortName}</strong><span>{route.highway}</span></div>
                <p className="route-corridor">{route.corridor}</p>
                <small>{route.guidance}</small>
                {selectedRoute === route.id && <b className="selected-badge">Selected</b>}
              </button>
            ))}
          </div>
        </section>

        {activeRoute && (
          <section className="corridor-panel">
            <div className="selected-route-command">
              <div><span>Selected corridor</span><strong>{activeRoute.shortName} — {activeRoute.highway}</strong></div>
              <p>{activeRoute.corridor}</p>
            </div>
            {activeRoute.branchNote && <div className="branch-note"><strong>Branch options:</strong> {activeRoute.branchNote}</div>}

            <div className="evac-heading">
              <div><p className="evac-kicker">Stops along this corridor</p><h2>Where can we stop?</h2></div>
              <p>Every listed accommodation has a current phone number and street address checked on August 18, 2026. Yellow means we do not have a verified fit for us, or all known options have been marked Full/Unavailable.</p>
            </div>

            <div className="town-stack">
              {activeRoute.towns.map((town, index) => {
                const needsAttention = townNeedsAttention(town)
                return (
                  <details className={`town-card ${needsAttention ? 'needs-options' : ''}`} key={town.name} open={index === 0}>
                    <summary>
                      <div><strong>{town.name}</strong><span>{town.stays.length ? `${town.stays.length} verified option${town.stays.length === 1 ? '' : 's'}` : 'No verified fit for us yet'}</span></div>
                      <span className="expand-label">{needsAttention ? 'Needs option' : 'Open'}</span>
                    </summary>
                    <div className="town-content">
                      {town.note && <p className="town-note">{town.note}</p>}
                      {town.stays.length > 0 ? (
                        <div className="stay-grid">
                          {town.stays.map((stay) => (
                            <article className={`stay-card ${selectedStay === stay.name ? 'selected' : ''}`} key={stay.name}>
                              <div className="stay-header"><span className={`stay-type ${stay.type.toLowerCase()}`}>{stay.type === 'HOTEL' ? 'Hotel / motel' : 'RV / campground'}</span>{selectedStay === stay.name && <b>Selected</b>}</div>
                              <h3>{stay.name}</h3>
                              <p className="stay-address"><strong>Address:</strong> {stay.address}</p>
                              <p className="verified-phone"><strong>Phone:</strong> <a href={`tel:${stay.phone.replace(/[^0-9+]/g, '')}`}>{stay.phone}</a></p>
                              <p className="phone-verified">Phone & address checked {stay.verifiedOn}</p>
                              {stay.pet && <p><strong>Tucker:</strong> {stay.pet}</p>}
                              {stay.rv && <p><strong>RV:</strong> {stay.rv}</p>}
                              {stay.note && <p>{stay.note}</p>}
                              <div className="stay-actions">
                                <a className="call-action" href={`tel:${stay.phone.replace(/[^0-9+]/g, '')}`}>Call</a>
                                {stay.url && <a href={stay.url} target="_blank" rel="noopener noreferrer">Website ↗</a>}
                                <select value={statuses[stay.name] || 'Not called'} onChange={(e) => setStatuses((current) => ({ ...current, [stay.name]: e.target.value as StayStatus }))} aria-label={`Call status for ${stay.name}`}>
                                  {statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}
                                </select>
                                <button type="button" onClick={() => setSelectedStay(stay.name)}>{selectedStay === stay.name ? 'Selected' : 'Select'}</button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : <div className="verify-box"><strong>YELLOW — NO VERIFIED FIT YET.</strong> Continue to the next town or use the live searches below. We do not add a property here until its current phone, street address and suitability are verified.</div>}

                      <div className="town-resources">
                        <a href={mapSearch(town.name, 'fuel')} target="_blank" rel="noopener noreferrer">Fuel ↗</a>
                        <a href={mapSearch(town.name, 'grocery')} target="_blank" rel="noopener noreferrer">Groceries ↗</a>
                        <a href={mapSearch(town.name, 'pharmacy')} target="_blank" rel="noopener noreferrer">Pharmacy ↗</a>
                        <a href={mapSearch(town.name, 'veterinary')} target="_blank" rel="noopener noreferrer">Vet ↗</a>
                        <a href="https://ess.gov.bc.ca/" target="_blank" rel="noopener noreferrer">ESS / ERA ↗</a>
                      </div>
                      <p className="ess-town-note">ESS reception locations are incident-specific. Follow the location provided in the evacuation order or by emergency officials.</p>
                    </div>
                  </details>
                )
              })}
            </div>
          </section>
        )}

        {activeRoute && (
          <section className="selected-destination-panel">
            <div><p className="evac-kicker">Selected destination</p><h2>{selectedOption ? `${selectedOption.name} — ${selectedOption.town}` : 'No destination selected yet'}</h2></div>
            <p>{selectedOption ? `${selectedOption.address} · Call ${selectedOption.phone} before relying on it. If unavailable, select another stop farther along the same safe corridor.` : 'Choose a verified accommodation card above once availability is confirmed.'}</p>
          </section>
        )}

        <section className="rally-command">
          <div><p className="evac-kicker">Rally Point</p><h2>If separated, where do we meet?</h2><p>Neither driver turns around. Both vehicles continue to the agreed rally point.</p></div>
          <label className="evac-field"><span>Agreed rally point</span><input value={rallyPoint} onChange={(event) => setRallyPoint(event.target.value)} placeholder="Enter agreed location" /></label>
        </section>

        <section className="depart-command">
          <div><p className="evac-kicker">Depart</p><h2>{selectedRoute && rallyPoint ? 'Route and separation plan are set.' : 'Set the safe corridor and rally point.'}</h2></div>
          <div className="depart-rules"><strong>Official directions first.</strong><span>RV sets the household pace when both vehicles can use the route.</span><span>If separated: DO NOT TURN AROUND.</span><span>Both vehicles continue to the rally point.</span></div>
        </section>

        <section className="ess-action-panel">
          <div><p className="evac-kicker">Emergency Support Services</p><h2>ESS / Evacuee Registration & Assistance</h2><p>Only register when support is required. Reception-centre instructions will be incident-specific.</p></div>
          <div className="ess-actions"><a className="primary-action" href="https://ess.gov.bc.ca/" target="_blank" rel="noopener noreferrer">Open ESS / ERA ↗</a><a className="phone-action" href="tel:18005859559">1-800-585-9559</a></div>
        </section>

        <div className="evac-footer-rule">Never delay evacuation to complete this plan. If ordered to leave, follow emergency officials and leave immediately.</div>
      </main>
    </div>
  )
}