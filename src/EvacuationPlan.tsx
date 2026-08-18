import { useEffect, useMemo, useState } from 'react'
import './evacuation-plan.css'

type RouteId = 'EAST' | 'SOUTHEAST' | 'NORTH' | 'NORTHWEST' | 'WEST_WHISTLER' | 'SOUTH' | 'SOUTHWEST_5A' | 'MERRITT_PRINCETON'
type StayType = 'RV' | 'HOTEL' | 'STOP'
type StayStatus = 'Not called' | 'Available' | 'Full' | 'No answer' | 'Unavailable'

type StayOption = { name: string; type: StayType; pet?: string; rv?: string; note?: string; url?: string; phone?: string }
type TownStop = { name: string; note?: string; stays: StayOption[] }
type RoutePlan = { id: RouteId; shortName: string; highway: string; corridor: string; guidance: string; branchNote?: string; towns: TownStop[] }

const routes: RoutePlan[] = [
  {
    id: 'EAST', shortName: 'East', highway: 'Hwy 1',
    corridor: 'Kamloops → Chase → Salmon Arm → Sicamous → Revelstoke → Golden',
    guidance: 'Primary eastbound Trans-Canada corridor. Use only when official direction and current road conditions make it safe.',
    towns: [
      { name: 'Chase', note: 'First practical eastbound stop.', stays: [
        { name: 'Overlander Motel', type: 'HOTEL', note: 'On the Trans-Canada in Chase.', url: 'https://www.overlandermotel.com/' },
        { name: 'Chase Plaza free RV parking', type: 'STOP', rv: 'Free RV parking listed by the Village of Chase.', note: 'Short-term staging rather than a campground.', url: 'https://chasebc.ca/experience-chase' },
      ]},
      { name: 'Salmon Arm', stays: [
        { name: 'Travelodge by Wyndham Salmon Arm', type: 'HOTEL', note: 'Directly on Hwy 1.', url: 'https://www.wyndhamhotels.com/en-ca/travelodge/salmon-arm-british-columbia/travelodge-by-wyndham-salmon-arm/overview' },
        { name: 'Glen Echo Resorts', type: 'RV', pet: 'Pet-friendly amenities listed.', rv: 'RV sites.', url: 'https://www.glenechoresorts.com/' },
      ]},
      { name: 'Sicamous', note: 'Junction with Hwy 97A; useful branching point.', stays: [
        { name: 'Anchor Riverfront Motel', type: 'HOTEL', pet: 'Designated pet-friendly rooms; confirm availability.', rv: 'Five self-contained RV spaces; large motorhomes can access them. No hookups.', url: 'https://anchormotel.ca/reserve/' },
        { name: 'Best Western Sicamous Inn', type: 'HOTEL', pet: 'Pet-friendly rooms available; book the pet room type.', url: 'https://www.sicamousinn.ca/html/pet.html' },
        { name: 'The Sicamous RV Park', type: 'RV', rv: 'Full-hookup RV sites; nightly rentals offered subject to availability.', url: 'https://www.sicamousrv.com/' },
      ]},
      { name: 'Revelstoke', stays: [
        { name: 'The Stoke Hotel', type: 'HOTEL', pet: 'Pet-friendly rooms.', url: 'https://www.stokehotel.ca/' },
        { name: 'The Reverie Campground', type: 'RV', pet: 'Pets welcome.', rv: 'Power and septic access; check current availability.', url: 'https://reveriecampground.ca/' },
      ]},
      { name: 'Golden', stays: [
        { name: 'Golden Municipal Campground & RV Park', type: 'RV', pet: 'Pet stays listed by Tourism Golden.', rv: '72 campsites; power, sani-station, showers and laundry.', phone: '250-344-5412', url: 'https://www.golden.ca/recreation-services/facilities/golden-municipal-campground-rv-park' },
        { name: 'Thousand Peaks Resort Campground', type: 'RV', rv: 'Big-rig friendly with long pull-through full-hookup sites.', phone: '250-939-9100', url: 'https://www.tourismgolden.com/accommodations/campgrounds/thousand-peaks-resort-and-campground' },
        { name: 'Rondo Motel', type: 'HOTEL', pet: 'Limited pet-friendly rooms available.', url: 'https://goldenrondomotel.com/' },
      ]},
    ],
  },
  {
    id: 'SOUTHEAST', shortName: 'Southeast', highway: 'Hwy 97',
    corridor: 'Kamloops → Monte Creek → Falkland → Vernon',
    guidance: 'Southeast into the Okanagan. Vernon is a major decision point.',
    branchNote: 'From Vernon: continue south toward Kelowna/Osoyoos, or take Hwy 97A north via Armstrong and Enderby to Sicamous and reconnect with Hwy 1.',
    towns: [
      { name: 'Monte Creek', note: 'Transit point. Monte Creek Park does not allow camping, so this stop remains yellow unless a suitable nearby property is verified.', stays: [] },
      { name: 'Falkland', stays: [
        { name: 'Pillar Lake Resort', type: 'RV', rv: 'RV sites and sani-dump listed.', url: 'https://www.pillarlake.com/' },
        { name: 'Falkland places to stay', type: 'STOP', note: 'Community accommodation listing.', url: 'https://falkland-bc.ca/places-to-stay/' },
      ]},
      { name: 'Vernon', note: 'Major branch point: south on 97 or north on 97A.', stays: [
        { name: 'Best Western Pacific Inn', type: 'HOTEL', pet: 'Pet friendly.', rv: 'Free parking; call to confirm motorhome suitability.', url: 'https://www.bestwestern.com/en_US/book/hotel-rooms.62133.html' },
        { name: 'Swan Lake RV Resort', type: 'RV', pet: 'Fully fenced dog park.', rv: 'Big-rig friendly.', url: 'https://www.swanlakervresort.com/' },
        { name: 'Sandman Hotel & Suites Vernon', type: 'HOTEL', pet: 'Pet-friendly rooms.', url: 'https://www.sandmanhotels.com/vernon/amenities/pet-friendly-hotel' },
      ]},
      { name: 'Armstrong', note: 'Hwy 97A branch north from Vernon.', stays: [
        { name: 'Armstrong Kin RV Park', type: 'RV', rv: 'RV park in Armstrong; verify site length for the motorhome.', url: 'https://www.armstrongkinrv.ca/' },
        { name: 'Overlander RV Park', type: 'RV', rv: 'RV stays at the Overlander Golf & Event Centre.', url: 'https://theoverlander.ca/rv-stay' },
      ]},
      { name: 'Enderby', note: 'Continue north on Hwy 97A toward Sicamous.', stays: [
        { name: 'Riverside RV Park & Campground', type: 'RV', pet: 'Dog friendly.', rv: 'RV park beside the Shuswap River near downtown.', url: 'https://enderbycamping.com/' },
        { name: 'Quilakwa RV Park & Campground', type: 'RV', rv: 'Spacious RV sites beside the Shuswap River.', url: 'https://www.quilakwarvpark.com/rv-campground' },
      ]},
      { name: 'Sicamous', note: 'Reconnect with Hwy 1.', stays: [
        { name: 'Anchor Riverfront Motel', type: 'HOTEL', pet: 'Designated pet-friendly rooms.', rv: 'Large motorhomes can access the five self-contained RV spaces; no hookups.', url: 'https://anchormotel.ca/reserve/' },
        { name: 'The Sicamous RV Park', type: 'RV', rv: 'Full-hookup RV sites; nightly rentals offered subject to availability.', url: 'https://www.sicamousrv.com/' },
      ]},
      { name: 'Kelowna', note: 'Southbound continuation from Vernon.', stays: [
        { name: 'Apple Valley Orchard & RV Park', type: 'RV', pet: 'Pet friendly.', rv: 'RV park in Kelowna.', url: 'https://applevalleyrv.ca/policies/' },
        { name: 'Recreation Inn & Suites', type: 'HOTEL', pet: 'Pet friendly.', url: 'https://www.recreationinn.com/' },
        { name: 'Kelowna Urban Farm & RV Park', type: 'RV', rv: 'Full-service RV amenities.', url: 'https://www.kelownaurbanfarmandrv.ca/rv-park' },
      ]},
      { name: 'Osoyoos', note: 'Farther south fallback if Hwy 97 remains safe.', stays: [
        { name: 'Best Western Plus Osoyoos Hotel & Suites', type: 'HOTEL', pet: 'Up to two dogs in a limited number of rooms.', rv: 'Free onsite truck/RV parking listed.', url: 'https://www.bestwesternosoyoos.com/site/pet-friendly-hotel-osoyoos' },
        { name: 'Nk’Mip Campground & RV Park', type: 'RV', rv: 'Large year-round RV campground.', url: 'https://campingosoyoos.com/' },
        { name: 'Coast Osoyoos Beach Hotel', type: 'HOTEL', pet: 'Pet-friendly accommodations available; confirm room.', url: 'https://osoyoosbeachhotel.com/' },
      ]},
    ],
  },
  {
    id: 'NORTH', shortName: 'North', highway: 'Hwy 5',
    corridor: 'Kamloops → Barriere → Little Fort → Clearwater → Blue River → Tête Jaune Cache',
    guidance: 'A geographically distinct northbound escape corridor.',
    towns: [
      { name: 'Barriere', stays: [
        { name: 'Y-5 Motel & Campground', type: 'RV', rv: 'Motel and campground.', url: 'https://www.y5motel.com/' },
        { name: 'Monte Carlo Motel', type: 'HOTEL', note: 'Located in Barriere on the Kamloops–Clearwater corridor.', url: 'https://www.montecarlomotelbarrierebc.com/contact-us' },
      ]},
      { name: 'Little Fort', stays: [
        { name: 'Fox & Maple RV Resort', type: 'RV', rv: 'RV resort and campground on Thuya Creek.', phone: '250-574-0024', url: 'https://foxandmaple.ca/' },
        { name: 'Rivermount Motel, Campground & RV Park', type: 'RV', rv: 'Motel plus RV park/campground just north of Little Fort.', url: 'https://www.rivermountmotel.com/rv-park-campground.htm' },
      ]},
      { name: 'Clearwater', stays: [
        { name: 'Jasper Way Inn', type: 'RV', pet: 'Pet friendly.', rv: 'RV and tent sites.', url: 'https://www.jasperwayinn.com/' },
        { name: 'Clearwater Country Inn & RV Resort', type: 'RV', rv: 'Hotel rooms plus RV resort.', url: 'https://clearwatercountryinn.com/index.php' },
        { name: 'Quality Inn & Suites Clearwater', type: 'HOTEL', pet: 'Pet friendly.', url: 'https://www.choicehotels.com/en-ca/columbia-britanica/clearwater/quality-inn-hotels/cnb83' },
      ]},
      { name: 'Blue River', stays: [
        { name: 'Blue River Campground', type: 'RV', pet: 'Pets are free at RV sites.', rv: 'Full-service, electric/water and electric RV sites available.', phone: '778-668-7423', url: 'https://bluerivercampground.ca/accommodation-category/rv-park/' },
        { name: 'Sandman Inn Blue River', type: 'HOTEL', pet: 'Pet-friendly hotel.', url: 'https://www.sandmanhotels.com/blue-river/amenities/pet-friendly-hotel' },
      ]},
      { name: 'Tête Jaune Cache', note: 'Small junction community. Use nearby Valemount for verified accommodation unless an incident-specific option is identified here.', stays: [] },
      { name: 'Valemount', note: 'Practical accommodation fallback near Tête Jaune Cache.', stays: [
        { name: 'Days Inn by Wyndham Valemount', type: 'HOTEL', pet: 'Pet friendly.', rv: 'Free parking for RVs/trucks listed.', url: 'https://www.wyndhamhotels.com/en-ca/days-inn/valemount-british-columbia/days-inn-valemount/overview' },
        { name: 'Yellowhead RV Park & Campground', type: 'RV', pet: 'Pet friendly.', url: 'https://visitvalemount.ca/directory-listings/listing/yellowhead-rv-park-campground/' },
        { name: 'Best Western Plus Valemount Inn & Suites', type: 'HOTEL', pet: 'Up to two dogs in limited pet-friendly rooms.', url: 'https://www.bestwestern.com/en_US/book/valemount/hotel-rooms/best-western-plus-valemount-inn-suites/propertyCode.62120.html' },
      ]},
    ],
  },
  {
    id: 'NORTHWEST', shortName: 'Northwest', highway: 'Hwy 1 / Hwy 97',
    corridor: 'Kamloops → Cache Creek → Clinton → 100 Mile House → Williams Lake → Quesnel → Prince George',
    guidance: 'Cariboo corridor. Hwy 97 continues north beyond Prince George toward Dawson Creek, Fort St. John and the Yukon.',
    towns: [
      { name: 'Cache Creek', stays: [
        { name: 'Cache Creek Campground & RV Park', type: 'RV', pet: 'Pet friendly.', rv: 'RV park on the Trans-Canada.', url: 'https://cachecreekcampground.com/' },
        { name: 'Sandman Inn Cache Creek', type: 'HOTEL', pet: 'Pet-friendly rooms.', url: 'https://www.sandmanhotels.com/cache-creek/amenities/pet-friendly-hotel' },
      ]},
      { name: 'Clinton', stays: [
        { name: 'Clinton Pines RV Park & Campground', type: 'RV', pet: 'Pet friendly for well-behaved pets.', rv: 'RV park in Clinton.', phone: '250-459-0030', url: 'https://www.clintonpines.ca/' },
        { name: 'Cariboo Lodge Resort', type: 'HOTEL', pet: 'Pet friendly.', phone: '250-459-7992', url: 'https://www.cariboolodgebc.com/location' },
      ]},
      { name: '100 Mile House', stays: [
        { name: 'Super 8 by Wyndham 100 Mile House', type: 'HOTEL', pet: 'Pet-friendly hotel.', url: 'https://www.wyndhamhotels.com/super-8/100-mile-house-british-columbia/super-8-one-hundred-mile-house/overview' },
        { name: '100 Mile Motel & RV Park', type: 'RV', rv: 'Motel and RV park.', url: 'https://100milemotelandrvpark.com/' },
      ]},
      { name: 'Williams Lake', stays: [
        { name: 'Sandman Hotel & Suites Williams Lake', type: 'HOTEL', pet: 'Pet-friendly rooms.', url: 'https://www.sandmanhotels.com/williams-lake/amenities/pet-friendly-hotel' },
        { name: 'Ramada by Wyndham Williams Lake', type: 'HOTEL', pet: 'Pet-friendly hotel.', rv: 'Free parking listed.', url: 'https://www.wyndhamhotels.com/en-ca/ramada/williams-lake-british-columbia/ramada-williams-lake-bc/overview' },
        { name: 'Stampede Park RV Campground', type: 'RV', rv: 'Municipal full-service RV campground and sani-dump.', url: 'https://williamslake.ca/Facilities/Facility/Details/Stampede-Park-3' },
      ]},
      { name: 'Quesnel', stays: [
        { name: 'Quesnel Downtown RV Park & Campground', type: 'RV', rv: 'Municipal campground on the Quesnel River.', url: 'https://www.quesnel.ca/arts-recreation/quesnel-downtown-rv-park-campground' },
        { name: 'Park Inn by Radisson Quesnel', type: 'HOTEL', pet: 'Pet friendly.', url: 'https://www.choicehotels.com/en-ca/british-columbia/quesnel/choice-hotels/cnc99' },
        { name: 'Ramada by Wyndham Quesnel', type: 'HOTEL', rv: 'Free bus, truck and RV parking.', url: 'https://www.wyndhamhotels.com/en-ca/ramada/quesnel-british-columbia/ramada-quesnel/overview' },
      ]},
      { name: 'Prince George', stays: [
        { name: 'Bon Voyage Inn', type: 'HOTEL', pet: 'Pet friendly.', rv: 'Large-RV parking with power and water hookups listed.', url: 'https://bonvoyageinn.ca/' },
        { name: 'Northern Experience RV Park & Campground', type: 'RV', pet: 'Dog friendly.', rv: 'RV park on Hwy 97 South.', url: 'https://www.northernexperiencerv.com/' },
        { name: 'Hyatt Place Prince George', type: 'HOTEL', pet: 'Up to two dogs accepted under current policy.', url: 'https://www.hyatt.com/hyatt-place/en-US/yxszp-hyatt-place-prince-george/policies' },
      ]},
    ],
  },
  {
    id: 'WEST_WHISTLER', shortName: 'West / Whistler back route', highway: 'Hwy 1 / Hwy 99',
    corridor: 'Kamloops → Cache Creek → Pavilion → Lillooet → Duffey Lake Road → Pemberton → Whistler',
    guidance: 'A distinct west/southwest escape corridor through Lillooet and the Sea-to-Sky. Treat the Duffey Lake section as an alternate for the motorhome, not a preferred RV route.',
    branchNote: 'Highway 99 between Lillooet and Pemberton is steep and mountainous with narrow sections and sharp curves. Check DriveBC immediately before committing to this corridor and confirm it is appropriate for the RV.',
    towns: [
      { name: 'Cache Creek', stays: [
        { name: 'Cache Creek Campground & RV Park', type: 'RV', pet: 'Pet friendly.', rv: 'RV park on the Trans-Canada.', url: 'https://cachecreekcampground.com/' },
        { name: 'Sandman Inn Cache Creek', type: 'HOTEL', pet: 'Pet-friendly rooms.', url: 'https://www.sandmanhotels.com/cache-creek/amenities/pet-friendly-hotel' },
      ]},
      { name: 'Pavilion', note: 'Small community/transit point. No verified accommodation or RV fit for us yet.', stays: [] },
      { name: 'Lillooet', note: 'Last major town before the Duffey Lake section toward Pemberton.', stays: [
        { name: 'Retasket Lodge & RV Park', type: 'RV', rv: '20-room motel plus 8-site RV park.', url: 'https://www.retasketlodge.com/' },
        { name: 'Fraser Cove Campground', type: 'RV', rv: 'Tent and RV camping just off Hwy 99.', url: 'https://www.frasercovecampground.com/' },
        { name: 'Texas Creek Campground', type: 'RV', rv: 'Five RV sites with power and water.', url: 'https://www.texascreekcampground.com/' },
      ]},
      { name: 'Pemberton', note: 'First major community after Duffey Lake Road.', stays: [
        { name: 'Pemberton Valley Lodge', type: 'HOTEL', pet: 'About half the hotel is set aside as dog-friendly accommodation.', url: 'https://www.pembertonvalleylodge.com/hotel/dog-packages/' },
        { name: 'Pemberton Hotel', type: 'HOTEL', pet: 'Pet-friendly hotel.', url: 'https://www.pembhotel.com/hotel-policies' },
      ]},
      { name: 'Whistler', stays: [
        { name: 'Whistler RV Park & Campground', type: 'RV', pet: 'Pets welcome for a fee.', rv: 'Full-hookup pull-through and back-in sites.', url: 'https://whistlerrvpark.com/rates/' },
        { name: 'Summit Lodge Boutique Hotel', type: 'HOTEL', pet: 'Featured by Whistler Blackcomb as pet-friendly accommodation.', url: 'https://www.whistlerblackcomb.com/plan-your-trip/stay/pet-friendly-whistler.aspx' },
      ]},
    ],
  },
  {
    id: 'SOUTH', shortName: 'South', highway: 'Hwy 5',
    corridor: 'Kamloops → Merritt → Hope',
    guidance: 'Coquihalla southbound corridor. Merritt is a major branching point; south does not require continuing all the way to Hope.',
    branchNote: 'From Merritt you can reassess toward Hope, Princeton/Southern Interior, or other open corridors as directed.',
    towns: [
      { name: 'Merritt', stays: [
        { name: 'Claybanks RV Park', type: 'RV', rv: 'City-linked RV park near downtown; seasonal operation.', url: 'https://www.claybanksrv.ca/' },
        { name: 'Ramada Limited Merritt', type: 'HOTEL', pet: 'Pet-friendly hotel.', url: 'https://www.wyndhamhotels.com/en-ca/ramada/merritt-british-columbia/ramada-limited-merritt/overview' },
        { name: 'Moon Shadows RV Park', type: 'RV', pet: 'Dog friendly.', url: 'https://www.campingrvbc.com/sites/bc/moon-shadows-rv-park-campground-merritt/' },
      ]},
      { name: 'Hope', stays: [
        { name: 'WildRose Campground & RV Park', type: 'RV', pet: 'Pet friendly on leash.', rv: 'RV park west of Hope.', url: 'https://www.wildrosecamp.com/' },
        { name: 'Park Motel', type: 'HOTEL', pet: 'Pet friendly.', url: 'https://parkmotel.ca/' },
        { name: 'Holiday Motel & RV Resort', type: 'RV', rv: 'Motel units, cottages and RV sites.', url: 'https://holiday-motel.com/' },
      ]},
    ],
  },
  {
    id: 'SOUTHWEST_5A', shortName: 'Southwest alternate', highway: 'Hwy 5A',
    corridor: 'Kamloops → Quilchena → Merritt',
    guidance: 'Physical alternate between Kamloops and Merritt. For the motorhome, treat it as an alternate rather than automatically preferring it over Hwy 5.',
    towns: [
      { name: 'Quilchena', note: 'Transit point. No verified Tucker + motorhome accommodation fit added yet.', stays: [] },
      { name: 'Merritt', note: 'Rejoin the broader Merritt decision tree.', stays: [
        { name: 'Claybanks RV Park', type: 'RV', rv: 'City-linked RV park near downtown; seasonal operation.', url: 'https://www.claybanksrv.ca/' },
        { name: 'Travelodge by Wyndham Merritt', type: 'HOTEL', pet: 'Pet-friendly hotel off Hwy 5A.', url: 'https://www.wyndhamhotels.com/en-ca/travelodge/merritt-british-columbia/travelodge-merritt-bc/overview' },
      ]},
    ],
  },
  {
    id: 'MERRITT_PRINCETON', shortName: 'Merritt → Princeton', highway: 'Hwy 5A / 97C connections',
    corridor: 'Merritt → Aspen Grove → Princeton / Southern Interior',
    guidance: 'A further branch from the Merritt area when official direction and road conditions support moving toward Princeton rather than Hope.',
    towns: [
      { name: 'Aspen Grove', note: 'Transit point. No verified Tucker + motorhome accommodation fit added yet.', stays: [] },
      { name: 'Princeton', stays: [
        { name: 'Princeton Municipal Campground & RV Park', type: 'RV', pet: 'Pet friendly.', rv: 'Municipal RV/tent campground.', url: 'https://www.princeton.ca/p/princeton-municipal-campground-rv-park' },
        { name: 'Princeton Golf Club RV Park', type: 'RV', pet: 'Pet friendly; leash required.', url: 'https://princetongolfclub.com/rv-park/' },
        { name: 'Ace Motel', type: 'HOTEL', pet: 'Pet-friendly rooms.', url: 'https://www.princetonacemotel.com/' },
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
          <p>First get safely out of Dallas from Chukar Drive. Then choose the regional corridor responders direct us toward.</p>
        </div>
        <div className="evac-rule">The actual route is incident-specific. First-responder and Voyent Alert directions override this household plan.</div>
      </header>

      <main className="evac-main">
        <section className="local-egress-panel">
          <div className="layer-number">1</div>
          <div>
            <p className="evac-kicker">Dallas / Chukar Drive</p>
            <h2>Get clear of Dallas first</h2>
            <p>This household plan starts from Chukar Drive in Dallas.</p>
            <div className="local-warning"><strong>Local rule:</strong> Use the route identified for Dallas by emergency officials. If an Evacuation Order is issued, follow first-responder or Voyent Alert directions.</div>
          </div>
          <a className="city-button" href="https://www.kamloops.ca/public-safety/emergency-management/emergency-preparedness" target="_blank" rel="noopener noreferrer">Kamloops evacuation guidance ↗</a>
        </section>

        <section className="decision-panel">
          <div className="route-toolbar">
            <div>
              <div className="layer-title"><span className="layer-number small">2</span><div><p className="evac-kicker">Regional corridor</p><h2>Once clear of the city, which direction is open?</h2></div></div>
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
              <p>Every stop should have a verified RV or Tucker-friendly accommodation. Yellow means we do not currently have a usable verified option, or every known option has been marked Full/Unavailable.</p>
            </div>

            <div className="town-stack">
              {activeRoute.towns.map((town, index) => {
                const needsAttention = townNeedsAttention(town)
                return (
                  <details className={`town-card ${needsAttention ? 'needs-options' : ''}`} key={town.name} open={index === 0}>
                    <summary>
                      <div><strong>{town.name}</strong><span>{town.stays.length ? `${town.stays.filter((s) => s.type === 'HOTEL').length} hotel · ${town.stays.filter((s) => s.type === 'RV').length} RV · ${town.stays.filter((s) => s.type === 'STOP').length} other` : 'No verified fit for us yet'}</span></div>
                      <span className="expand-label">{needsAttention ? 'Needs option' : 'Open'}</span>
                    </summary>
                    <div className="town-content">
                      {town.note && <p className="town-note">{town.note}</p>}
                      {town.stays.length > 0 ? (
                        <div className="stay-grid">
                          {town.stays.map((stay) => (
                            <article className={`stay-card ${selectedStay === stay.name ? 'selected' : ''}`} key={stay.name}>
                              <div className="stay-header"><span className={`stay-type ${stay.type.toLowerCase()}`}>{stay.type === 'HOTEL' ? 'Hotel / motel' : stay.type === 'RV' ? 'RV / campground' : 'Staging / directory'}</span>{selectedStay === stay.name && <b>Selected</b>}</div>
                              <h3>{stay.name}</h3>
                              {stay.pet && <p><strong>Tucker:</strong> {stay.pet}</p>}
                              {stay.rv && <p><strong>RV:</strong> {stay.rv}</p>}
                              {stay.note && <p>{stay.note}</p>}
                              <div className="stay-actions">
                                {stay.url && <a href={stay.url} target="_blank" rel="noopener noreferrer">Website ↗</a>}
                                {stay.phone && <a href={`tel:${stay.phone.replace(/[^0-9+]/g, '')}`}>Call</a>}
                                <select value={statuses[stay.name] || 'Not called'} onChange={(e) => setStatuses((current) => ({ ...current, [stay.name]: e.target.value as StayStatus }))} aria-label={`Call status for ${stay.name}`}>
                                  {statusOptions.map((status) => <option value={status} key={status}>{status}</option>)}
                                </select>
                                <button type="button" onClick={() => setSelectedStay(stay.name)}>{selectedStay === stay.name ? 'Selected' : 'Select'}</button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : <div className="verify-box"><strong>YELLOW — NO VERIFIED FIT YET.</strong> Use the live searches below or continue to the next town. Do not assume this stop can take Tucker and the motorhome.</div>}

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
            <p>{selectedOption ? 'Keep calling status current. If unavailable, select another stop farther along the same safe corridor.' : 'Choose an accommodation card above once availability is confirmed.'}</p>
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
