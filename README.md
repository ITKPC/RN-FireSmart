# RN-FireSmart

Household wildfire readiness and evacuation management app for Nancy, Rick and Tucker.

## Version 0.1 scope

This first version establishes the operating model before authentication or external alert integrations are added.

### Persistent household stage

The active stage is selected manually and stored in the browser until a user changes it:

- Normal / Fire-Season Ready
- Elevated Readiness
- Evacuation Alert
- Evacuation Order / Leave Now
- Evacuated
- Stand Down

### Core readiness assets

The app separately tracks readiness for:

- RV
- Power Depot
- Six Go Boxes
- Personal Documents Binder
- Tucker supplies
- Nancy E-Duffle and P-Duffle
- Rick E-Duffle and P-Duffle

The readiness state of an asset is independent of the household wildfire stage. For example, the household may be in Normal while the RV is Winterized.

### Six Go Boxes

1. Nancy Mementos
2. Rick Mementos
3. Tucker
4. Health / Medical
5. Household Valuables
6. Unassigned

The boxes live in the gym during fire season and move to the RV at Evacuation Alert.

### Person-bound duffles

Each person has:

- E-Duffle: electronics
- P-Duffle: clothing and personal essentials

The duffles follow the person, not the vehicle. Rick drives either the SUV or RV and Nancy drives the other.

### Preparedness standard

Food, water, Tucker supplies and other consumables are planned around a 14-day evacuation period.

## Technology

- React
- TypeScript
- Vite
- Netlify
- Browser localStorage for the first version

Microsoft Entra authentication and shared/persistent cloud data can be added later without changing the core readiness model.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Netlify is configured through `netlify.toml` to publish the Vite `dist` directory.
