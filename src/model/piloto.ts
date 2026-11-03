/** Cifras y cálculos del piloto. Una sola fuente para todas las pantallas. */

export const PILOT = {
  homes: 10,
  investmentPerHome: 5632.96,
  investmentTotal: 56329.6,
  omMonthlyTotal: 398.3,
  omAnnual: 4779.6,
  generationPerHome: { p10: 720, p50: 803, p90: 870 },
  kwhPrice: 2,
  co2Factor: 0.38,
  co2Source: 'gas natural de ciclo combinado',
  bimestresPerYear: 6,
  horizonYears: 20,
  snapshotYear: 5,
}

export type Band = 'p10' | 'p50' | 'p90'

export type HomeStatus = 'Al corriente' | 'Atraso' | 'En revisión' | 'Recién instalada'

export type Home = {
  id: string
  name: string
  baselineKwh: number
  currentBillKwh: number
  measuredGenerationKwh: number
  status: HomeStatus
  /** Bimestres en los que la cuota se aplicó al capital. Corte del año 5. */
  periodsPaid: number
}

export type SiteBar = { label: string; score: number; why: string }

export type Site = {
  id: string
  name: string
  score: number
  lat: number
  lng: number
  /** 1 reproduce los 803 kWh de la ficha. */
  generationFactor: number
  bars: readonly SiteBar[]
}

/** Junta auxiliar de Metepec, Atlixco. No es Metepec, Estado de México. */
export const METEPEC = { lat: 18.9359757, lng: -98.472796 }

/** Recuadro de búsqueda: Metepec y la cabecera de Atlixco. */
export const SEARCH_BBOX = { minLng: -98.55, minLat: 18.85, maxLng: -98.38, maxLat: 18.98 }

export type Assumptions = {
  /** Pesos por kWh. */
  price: number
  /** Fracción de la cuota que no se cobra. */
  delinquency: number
  /** Caída anual de la generación. */
  degradation: number
  /** Fracción de la generación que se pierde por fallas. */
  failures: number
  /** Interés anual sobre el capital todavía no devuelto. */
  financialCost: number
  /** El año 1 no tiene cuota ni gasto de operación. */
  firstYearIdle: boolean
}

export const BASE_ASSUMPTIONS: Assumptions = {
  price: PILOT.kwhPrice,
  delinquency: 0,
  degradation: 0,
  failures: 0,
  financialCost: 0,
  firstYearIdle: false,
}

export const HOMES: readonly Home[] = [
  { id: 'casa-01', name: 'Casa 01 · Calle Hidalgo', baselineKwh: 210, currentBillKwh: 78, measuredGenerationKwh: 132, status: 'Al corriente', periodsPaid: 30 },
  { id: 'casa-02', name: 'Casa 02 · Calle Morelos', baselineKwh: 204, currentBillKwh: 70, measuredGenerationKwh: 134, status: 'Al corriente', periodsPaid: 29 },
  { id: 'casa-03', name: 'Casa 03 · Calle Juárez', baselineKwh: 220, currentBillKwh: 88, measuredGenerationKwh: 130, status: 'Atraso', periodsPaid: 22 },
  { id: 'casa-04', name: 'Casa 04 · Calle Reforma', baselineKwh: 198, currentBillKwh: 96, measuredGenerationKwh: 134, status: 'Al corriente', periodsPaid: 28 },
  { id: 'casa-05', name: 'Casa 05 · Calle Matamoros', baselineKwh: 190, currentBillKwh: 70, measuredGenerationKwh: 128, status: 'En revisión', periodsPaid: 26 },
  { id: 'casa-06', name: 'Casa 06 · Camino Real', baselineKwh: 208, currentBillKwh: 74, measuredGenerationKwh: 136, status: 'Al corriente', periodsPaid: 30 },
  { id: 'casa-07', name: 'Casa 07 · Priv. Hidalgo', baselineKwh: 226, currentBillKwh: 86, measuredGenerationKwh: 140, status: 'Al corriente', periodsPaid: 30 },
  { id: 'casa-08', name: 'Casa 08 · Calle 5 de Mayo', baselineKwh: 196, currentBillKwh: 78, measuredGenerationKwh: 120, status: 'Atraso', periodsPaid: 21 },
  { id: 'casa-09', name: 'Casa 09 · Calle Zaragoza', baselineKwh: 212, currentBillKwh: 80, measuredGenerationKwh: 132, status: 'Al corriente', periodsPaid: 28 },
  { id: 'casa-10', name: 'Casa 10 · Calle Los Pinos', baselineKwh: 200, currentBillKwh: 200, measuredGenerationKwh: 22, status: 'Recién instalada', periodsPaid: 2 },
]

export const SITES: readonly Site[] = [
  {
    id: 'casa-04',
    name: 'Casa 04 · Calle Reforma',
    score: 8.7,
    lat: 18.936052,
    lng: -98.4715644,
    generationFactor: 0.98,
    bars: [
      { label: 'Rendimiento energético', score: 8.8, why: 'Buena irradiancia anual' },
      { label: 'Sombra', score: 8.2, why: 'Sombra leve después de las 16 h' },
      { label: 'Orientación del techo', score: 9.1, why: 'Techo orientado al suroeste' },
      { label: 'Consumo del hogar', score: 7.2, why: 'Aprovecharía cerca del 67%' },
      { label: 'Tarifa', score: 9.4, why: 'Valor actual favorable' },
    ],
  },
  {
    id: 'casa-07',
    name: 'Casa 07 · Priv. Hidalgo',
    score: 9.1,
    lat: 18.9332682,
    lng: -98.4714015,
    generationFactor: 1.06,
    bars: [
      { label: 'Rendimiento energético', score: 9.4, why: 'Techo despejado la mayor parte del día' },
      { label: 'Sombra', score: 9.0, why: 'Sin sombra relevante de construcciones' },
      { label: 'Orientación del techo', score: 9.3, why: 'Pendiente hacia el sur' },
      { label: 'Consumo del hogar', score: 8.4, why: 'El recibo aprovecha casi toda la generación' },
      { label: 'Tarifa', score: 9.4, why: 'Mismo supuesto de $2.00 por kWh' },
    ],
  },
  {
    id: 'casa-02',
    name: 'Casa 02 · Calle Morelos',
    score: 7.8,
    lat: 18.93376,
    lng: -98.4683661,
    generationFactor: 0.9,
    bars: [
      { label: 'Rendimiento energético', score: 7.6, why: 'Irradiancia menor por la orientación' },
      { label: 'Sombra', score: 6.4, why: 'Un árbol cubre parte de la mañana' },
      { label: 'Orientación del techo', score: 7.5, why: 'Techo hacia el sureste, con recortes' },
      { label: 'Consumo del hogar', score: 8.0, why: 'El consumo base sí absorbería el panel' },
      { label: 'Tarifa', score: 9.4, why: 'Mismo supuesto de $2.00 por kWh' },
    ],
  },
  {
    id: 'casa-09',
    name: 'Casa 09 · Calle Zaragoza',
    score: 7.4,
    lat: 18.9332536,
    lng: -98.4730437,
    generationFactor: 0.86,
    bars: [
      { label: 'Rendimiento energético', score: 7.2, why: 'Menos horas de sol directo' },
      { label: 'Sombra', score: 6.1, why: 'La casa vecina proyecta sombra' },
      { label: 'Orientación del techo', score: 6.8, why: 'Buena parte del techo mira al este' },
      { label: 'Consumo del hogar', score: 7.6, why: 'Consumo suficiente para el panel' },
      { label: 'Tarifa', score: 9.4, why: 'Mismo supuesto de $2.00 por kWh' },
    ],
  },
]

export type MapPlace = {
  id: string
  name: string
  score: number
  lat: number
  lng: number
  siteId: string | null
}

/** Viviendas que se ven en el mapa y no tienen ficha completa. */
const EXTRA_PLACES: readonly MapPlace[] = [
  { id: 'casa-11', siteId: null, name: 'Casa 11 · Calle Juárez', score: 8.9, lat: 18.9358374, lng: -98.475141 },
  { id: 'casa-06', siteId: null, name: 'Casa 06 · Camino Real', score: 8.8, lat: 18.9342053, lng: -98.4748465 },
]

const ALTERNATIVE_IDS = ['casa-07', 'casa-11', 'casa-06'] as const

export const PLACES: readonly MapPlace[] = [
  ...SITES.map(site => ({ id: site.id, siteId: site.id, name: site.name, score: site.score, lat: site.lat, lng: site.lng })),
  ...EXTRA_PLACES,
]

export function distanceMeters(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const earth = 6_371_000
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const lat = toRadians(to.lat - from.lat)
  const lng = toRadians(to.lng - from.lng)
  const a = Math.sin(lat / 2) ** 2 + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(lng / 2) ** 2
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function alternativesNear(origin: { lat: number; lng: number }) {
  return ALTERNATIVE_IDS.map(id => {
    const place = PLACES.find(item => item.id === id)
    if (!place) throw new Error(`Falta la alternativa ${id}`)
    return { ...place, distanceM: Math.round(distanceMeters(origin, place)) }
  })
}

export const BASELINE_RECEIPTS = [
  { period: 'Jul—Ago 2024', kwh: 204, amount: 408, tariff: '1 · Básico', source: 'PDF' },
  { period: 'Sep—Oct 2024', kwh: 187, amount: 374, tariff: '1 · Básico', source: 'Foto' },
  { period: 'Nov—Dic 2024', kwh: 203, amount: 406, tariff: '1 · Básico', source: 'PDF' },
] as const

export const TARIFF_OPTIONS = ['1', '1A', '1B', '1C', '1D', '1E', '1F', 'DAC'] as const

export const UNCERTAINTY = [
  { id: 'irr', label: 'Irradiancia', share: 18 },
  { id: 'shadow', label: 'Sombra y pérdidas', share: 22 },
  { id: 'use', label: 'Consumo', share: 15 },
  { id: 'rate', label: 'Tarifa', share: 45 },
] as const

const moneyFormat = (digits: number) =>
  new Intl.NumberFormat('es-MX', { minimumFractionDigits: digits, maximumFractionDigits: digits })

const numberFormat = (digits: number) =>
  new Intl.NumberFormat('es-MX', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function formatMoney(value: number, digits = 2): string {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${moneyFormat(digits).format(Math.abs(value))}`
}

export function formatNumber(value: number, digits = 0): string {
  return numberFormat(digits).format(value)
}

export function formatYears(years: number | null): string {
  if (years === null || !Number.isFinite(years)) return 'No se recupera'
  if (years > 80) return 'Más de 80 años'
  return `${years.toFixed(1)} años`
}

export function formatPercent(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`
}

export function omPerHomeAnnual(): number {
  return PILOT.omAnnual / PILOT.homes
}

export function omPerHomeBimester(): number {
  return omPerHomeAnnual() / PILOT.bimestresPerYear
}

export function periodSavings(home: Home, price = PILOT.kwhPrice) {
  const kwh = Math.max(0, home.baselineKwh - home.currentBillKwh)
  const mxn = kwh * price
  return { kwh, mxn, quota: mxn * 0.8, household: mxn * 0.2 }
}

export function quotaCollected(home: Home, price = PILOT.kwhPrice): number {
  if (home.status === 'Atraso' || home.status === 'Recién instalada') return 0
  return periodSavings(home, price).quota
}

/** Mientras el capital no se devuelve, todo lo que queda después de operar se abona a financiadores. */
export function waterfall(quota: number) {
  const omDue = omPerHomeBimester()
  const om = Math.min(Math.max(quota, 0), omDue)
  const repayment = Math.max(0, quota - omDue)
  return { om, repayment, reserve: 0, fund: 0, omDue }
}

/** Acumulado al ritmo P50 de la ficha, no con la cuota atípica de este bimestre. */
export function p50RepaymentPerBimester(price = PILOT.kwhPrice): number {
  const quota = (PILOT.generationPerHome.p50 / PILOT.bimestresPerYear) * price * 0.8
  return Math.max(0, quota - omPerHomeBimester())
}

export function liquidationRatio(periodsPaid: number, price = PILOT.kwhPrice): number {
  const accumulated = periodsPaid * p50RepaymentPerBimester(price)
  return Math.min(1, accumulated / PILOT.investmentPerHome)
}

export function portfolioSnapshot(homes: readonly Home[] = HOMES, price = PILOT.kwhPrice) {
  const rows = homes.map(home => {
    const period = periodSavings(home, price)
    const collected = quotaCollected(home, price)
    const liquidation = liquidationRatio(home.periodsPaid, price)
    return { home, ...period, collected, liquidation, capital: liquidation * PILOT.investmentPerHome }
  })
  const savings = rows.reduce((sum, row) => sum + row.mxn, 0)
  const collected = rows.reduce((sum, row) => sum + row.collected, 0)
  const capitalRecovered = rows.reduce((sum, row) => sum + row.capital, 0)
  const pendingCount = rows.filter(row => row.home.status === 'Atraso').length
  return { rows, savings, collected, capitalRecovered, pendingCount, installed: homes.length }
}

export function measurementGap(home: Home): number {
  const savings = periodSavings(home).kwh
  const measured = home.measuredGenerationKwh
  const base = Math.max(measured, savings, 1)
  return Math.abs(savings - measured) / base
}

export function hasDispute(home: Home): boolean {
  if (home.status === 'Recién instalada') return false
  return measurementGap(home) >= 0.15
}

export function creditKwh(home: Home): number {
  return Math.max(0, home.measuredGenerationKwh - home.baselineKwh)
}

export type BimesterPoint = {
  label: string
  baseline: number
  bill: number
  measured: number
  expectedP10: number
  expectedP90: number
}

const BIMESTER_LABELS = ['M-A', 'M-J', 'J-A', 'S-O', 'N-D', 'E-F'] as const

export function verifySeries(home: Home): BimesterPoint[] {
  const expected = PILOT.generationPerHome.p50 / PILOT.bimestresPerYear
  const expectedP10 = PILOT.generationPerHome.p10 / PILOT.bimestresPerYear
  const expectedP90 = PILOT.generationPerHome.p90 / PILOT.bimestresPerYear
  return BIMESTER_LABELS.map((label, index) => {
    const last = index === BIMESTER_LABELS.length - 1
    const measured = last ? home.measuredGenerationKwh : expected * (0.96 + (index % 3) * 0.03)
    const bill = last ? home.currentBillKwh : Math.max(0, Math.round(home.baselineKwh - measured))
    return { label, baseline: home.baselineKwh, bill, measured, expectedP10, expectedP90 }
  })
}

export function panelSavingsBimester(price = PILOT.kwhPrice) {
  const at = (annualKwh: number) => (annualKwh / PILOT.bimestresPerYear) * price
  return {
    p10: at(PILOT.generationPerHome.p10),
    p50: at(PILOT.generationPerHome.p50),
    p90: at(PILOT.generationPerHome.p90),
  }
}

export function baselineAverage() {
  const kwh = BASELINE_RECEIPTS.reduce((sum, row) => sum + row.kwh, 0) / BASELINE_RECEIPTS.length
  const amount = BASELINE_RECEIPTS.reduce((sum, row) => sum + row.amount, 0) / BASELINE_RECEIPTS.length
  return { kwh, amount }
}

export type SiteBand = { kwh: number; savings: number; payback: number | null; co2: number }

export function siteOutlook(site: Site, price = PILOT.kwhPrice, co2Factor = PILOT.co2Factor) {
  const om = omPerHomeAnnual()
  const at = (annualKwh: number): SiteBand => {
    const net = annualKwh * price * 0.8 - om
    return {
      kwh: annualKwh,
      savings: annualKwh * price,
      payback: net > 0 ? PILOT.investmentPerHome / net : null,
      co2: (annualKwh / 1000) * co2Factor,
    }
  }
  return {
    p10: at(PILOT.generationPerHome.p10 * site.generationFactor),
    p50: at(PILOT.generationPerHome.p50 * site.generationFactor),
    p90: at(PILOT.generationPerHome.p90 * site.generationFactor),
  }
}

export function simpleReferenceKwh(): number {
  return PILOT.generationPerHome.p50
}

function generationFactor(band: Band): number {
  return PILOT.generationPerHome[band] / PILOT.generationPerHome.p50
}

/** Flujo del piloto de 10 casas, después de operación y del costo financiero. */
export function operatingCashFlow(assumptions: Assumptions, year: number, outstanding: number, band: Band = 'p50', homes = PILOT.homes): number {
  if (year === 1 && assumptions.firstYearIdle) return 0
  const aged = (1 - assumptions.degradation) ** Math.max(0, year - 1)
  const gen = PILOT.generationPerHome.p50 * generationFactor(band) * (1 - assumptions.failures) * aged * homes
  const quota = gen * assumptions.price * 0.8 * (1 - assumptions.delinquency)
  const om = omPerHomeAnnual() * homes
  const interest = Math.max(0, outstanding) * assumptions.financialCost
  return quota - om - interest
}

export function irr(cashflows: number[]): number | null {
  if (cashflows.length < 2) return null
  if (cashflows.slice(1).every(value => value <= 0)) return null
  let rate = 0.1
  for (let iteration = 0; iteration < 80; iteration += 1) {
    let npv = 0
    let derivative = 0
    for (let t = 0; t < cashflows.length; t += 1) {
      npv += cashflows[t] / (1 + rate) ** t
      if (t > 0) derivative += (-t * cashflows[t]) / (1 + rate) ** (t + 1)
    }
    if (Math.abs(derivative) < 1e-12) return null
    const next = rate - npv / derivative
    if (!Number.isFinite(next) || next <= -0.99) return null
    if (Math.abs(next - rate) < 1e-10) return next
    rate = next
  }
  return Number.isFinite(rate) ? rate : null
}

export function pilotIrr(assumptions: Assumptions): number | null {
  const flows = [-PILOT.investmentTotal]
  let outstanding = PILOT.investmentTotal
  for (let year = 1; year <= PILOT.horizonYears; year += 1) {
    const cash = operatingCashFlow(assumptions, year, outstanding)
    flows.push(cash)
    outstanding -= Math.min(outstanding, Math.max(0, cash))
  }
  return irr(flows)
}

export type YearPoint = {
  year: number
  homes: number
  added: number
  outstanding: number
  repaid: number
}

export type FundRun = {
  paybackYears: number | null
  points: YearPoint[]
  added: number
}

export function runFund(assumptions: Assumptions, years: number, band: Band = 'p50'): FundRun {
  let outstanding = PILOT.investmentTotal
  let cash = 0
  let homes = PILOT.homes
  let added = 0
  let paybackYears: number | null = null
  const points: YearPoint[] = []

  for (let year = 1; year <= years; year += 1) {
    const available = operatingCashFlow(assumptions, year, outstanding, band, homes)
    const started = outstanding
    if (available > 0 && outstanding > 0.5) {
      const payment = Math.min(outstanding, available)
      outstanding -= payment
      if (outstanding <= 0.5 && paybackYears === null) {
        paybackYears = year - 1 + started / available
        outstanding = 0
      }
      cash += available - payment
    } else if (available > 0) {
      outstanding = 0
      cash += available
    }

    if (outstanding <= 0.5) {
      while (cash >= PILOT.investmentPerHome - 0.01) {
        cash -= PILOT.investmentPerHome
        homes += 1
        added += 1
      }
    }

    points.push({
      year,
      homes,
      added,
      outstanding: Math.max(0, outstanding),
      repaid: PILOT.investmentTotal - Math.max(0, outstanding),
    })
  }

  return { paybackYears, points, added }
}

export function coversOperation(assumptions: Assumptions, band: Band = 'p50'): boolean {
  const probe = { ...assumptions, firstYearIdle: false }
  return operatingCashFlow(probe, 1, PILOT.investmentTotal, band) > 0
}

/** Fracción uniforme entre P10 y P90 cuya generación cubre la operación. */
export function coverProbability(assumptions: Assumptions): number {
  if (assumptions.price <= 0 || assumptions.delinquency >= 1) return 0.04
  const needed =
    (PILOT.omAnnual + PILOT.investmentTotal * assumptions.financialCost) /
    (assumptions.price * 0.8 * (1 - assumptions.delinquency) * (1 - assumptions.failures))
  const p10 = PILOT.generationPerHome.p10 * PILOT.homes
  const p90 = PILOT.generationPerHome.p90 * PILOT.homes
  if (needed <= p10) return 0.95
  if (needed >= p90) return Math.max(0.04, Math.min(0.15, (0.12 * p90) / needed))
  return (p90 - needed) / (p90 - p10)
}

export type FundProjection = {
  paybackYears: number | null
  paybackBand: Record<Band, number | null>
  irr: number | null
  newHomesIn5: Record<Band, number>
  coverProbability: number
  coversOperation: boolean
  homesByYear: Record<Band, number[]>
  repaidFractionByYear: number[]
  homesAtYear10: number
}

export function projectFund(assumptions: Assumptions): FundProjection {
  const long = {
    p10: runFund(assumptions, 80, 'p10'),
    p50: runFund(assumptions, 80, 'p50'),
    p90: runFund(assumptions, 80, 'p90'),
  }
  const decade = {
    p10: runFund(assumptions, 10, 'p10'),
    p50: runFund(assumptions, 10, 'p50'),
    p90: runFund(assumptions, 10, 'p90'),
  }
  const five = {
    p10: runFund(assumptions, 5, 'p10'),
    p50: runFund(assumptions, 5, 'p50'),
    p90: runFund(assumptions, 5, 'p90'),
  }
  return {
    paybackYears: long.p50.paybackYears,
    paybackBand: { p10: long.p10.paybackYears, p50: long.p50.paybackYears, p90: long.p90.paybackYears },
    irr: pilotIrr(assumptions),
    newHomesIn5: { p10: five.p10.added, p50: five.p50.added, p90: five.p90.added },
    coverProbability: coverProbability(assumptions),
    coversOperation: coversOperation(assumptions),
    homesByYear: {
      p10: decade.p10.points.map(point => point.homes),
      p50: decade.p50.points.map(point => point.homes),
      p90: decade.p90.points.map(point => point.homes),
    },
    repaidFractionByYear: decade.p50.points.map(point => point.repaid / PILOT.investmentTotal),
    homesAtYear10: decade.p50.points.at(-1)?.homes ?? PILOT.homes,
  }
}

export type ScenarioAnswer = {
  recognized: boolean
  summary: string
  rangeLabel: string
  range: [string, string, string]
  unit: string
  formula: string
  params: string[]
}

function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function yearsInQuestion(question: string, fallback: number): number {
  const match = normalizeQuestion(question).match(/(\d+)\s*anos/)
  const years = match ? Number(match[1]) : fallback
  return Math.min(20, Math.max(1, years))
}

export function answerScenario(question: string, assumptions: Assumptions = BASE_ASSUMPTIONS): ScenarioAnswer {
  const text = normalizeQuestion(question)
  const unrecognized: ScenarioAnswer = {
    recognized: false,
    summary: 'Solo puedo ejecutar cálculos registrados: tarifa, recuperación, casas nuevas o CO₂.',
    rangeLabel: 'Sin cálculo',
    range: ['—', '—', '—'],
    unit: '',
    formula: 'No se ejecutó un cálculo.',
    params: ['Pregunta fuera de los cálculos registrados'],
  }
  if (!text.trim()) return unrecognized

  if (text.includes('co2') || text.includes('carbono') || text.includes('dioxido')) {
    const tons = (band: Band) => (PILOT.generationPerHome[band] * PILOT.homes * PILOT.co2Factor) / 1000
    return {
      recognized: true,
      summary: `El piloto evita ${formatNumber(tons('p50'), 2)} t de CO₂ al año frente a ${PILOT.co2Source}. El factor 0.38 t/MWh es ilustrativo y sigue por definir.`,
      rangeLabel: 'CO₂ evitado del piloto',
      range: [formatNumber(tons('p10'), 2), formatNumber(tons('p50'), 2), formatNumber(tons('p90'), 2)],
      unit: 't/año',
      formula: 'CO₂ = generación del piloto (MWh) × factor',
      params: [
        `Generación P50: ${formatNumber(PILOT.generationPerHome.p50 * PILOT.homes)} kWh/año`,
        `Factor: ${PILOT.co2Factor} t/MWh, ilustrativo`,
        `Referencia: ${PILOT.co2Source}`,
      ],
    }
  }

  if (text.includes('casa') || text.includes('financi') || text.includes('fondo')) {
    const years = yearsInQuestion(question, 5)
    const added = (band: Band) => runFund(assumptions, years, band).added
    const payback = runFund(assumptions, 80).paybackYears
    const none = added('p50') === 0
    return {
      recognized: true,
      summary: none
        ? `En ${years} años el fondo no instala casas nuevas. La devolución del capital lleva ${formatYears(payback)} y, hasta entonces, el dinero se va a operación y a los financiadores.`
        : `En ${years} años, con estos supuestos, el fondo alcanza para ${added('p50')} casas nuevas después de devolver el capital.`,
      rangeLabel: `Casas nuevas en ${years} años`,
      range: [String(added('p10')), String(added('p50')), String(added('p90'))],
      unit: 'viviendas',
      formula: 'Casas nuevas = excedente acumulado después de devolver el capital ÷ inversión por vivienda',
      params: [
        `Tarifa: ${formatMoney(assumptions.price)}/kWh`,
        `Inversión por vivienda: ${formatMoney(PILOT.investmentPerHome)}`,
        `Horizonte: ${years} años`,
        assumptions.firstYearIdle ? 'El primer año no tiene ingresos' : 'Hay ingresos desde el año 1',
      ],
    }
  }

  const priceMatch = text.match(/\$?\s*(\d+(?:[.,]\d+)?)/)
  let price = assumptions.price
  if (text.includes('baja') && text.includes('20')) price = Math.round(assumptions.price * 0.8 * 100) / 100
  else if (text.includes('sube') && text.includes('20')) price = Math.round(assumptions.price * 1.2 * 100) / 100
  else if (priceMatch && (text.includes('tarifa') || text.includes('kwh') || text.includes('precio'))) {
    price = Number(priceMatch[1].replace(',', '.'))
  }

  if (text.includes('tarifa') || text.includes('kwh') || text.includes('precio') || text.includes('baja') || text.includes('sube') || text.includes('recuper') || text.includes('tir')) {
    const next = { ...assumptions, price }
    const current = projectFund(assumptions)
    const projected = projectFund(next)
    const band = (value: number | null) => (value === null ? '—' : value.toFixed(1))
    return {
      recognized: true,
      summary: `Con la tarifa en ${formatMoney(price)}/kWh, la recuperación simple es ${formatYears(projected.paybackYears)}. En el escenario de referencia (${formatMoney(assumptions.price)}/kWh) es ${formatYears(current.paybackYears)}.`,
      rangeLabel: 'Recuperación simple',
      range: [band(projected.paybackBand.p10), band(projected.paybackBand.p50), band(projected.paybackBand.p90)],
      unit: 'años',
      formula: 'Recuperación = inversión ÷ (cuota cobrada − operación y mantenimiento − costo financiero)',
      params: [
        `Inversión del piloto: ${formatMoney(PILOT.investmentTotal)}`,
        `Tarifa: ${formatMoney(price)}/kWh`,
        `Generación P50: ${formatNumber(PILOT.generationPerHome.p50 * PILOT.homes)} kWh/año`,
        `TIR a 20 años: ${projected.irr === null ? 'no aplica' : formatPercent(projected.irr)}`,
        `Morosidad: ${formatPercent(assumptions.delinquency, 0)} · Fallas: ${formatPercent(assumptions.failures, 0)} · Costo financiero: ${formatPercent(assumptions.financialCost, 1)}`,
      ],
    }
  }

  return unrecognized
}
