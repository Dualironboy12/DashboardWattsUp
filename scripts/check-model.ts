import {
  BASE_ASSUMPTIONS,
  HOMES,
  METEPEC,
  PILOT,
  SITES,
  alternativesNear,
  answerScenario,
  distanceMeters,
  hasDispute,
  periodSavings,
  portfolioSnapshot,
  projectFund,
  waterfall,
} from '../src/model/piloto.ts'

function assertClose(name: string, actual: number | null, expected: number, tolerance = 0.05) {
  if (actual === null || Math.abs(actual - expected) > tolerance) {
    throw new Error(`${name}: esperaba ${expected}, obtuvo ${actual}`)
  }
}

const base = projectFund(BASE_ASSUMPTIONS)
assertClose('recuperación base', base.paybackYears, 6.98, 0.02)
assertClose('TIR base', base.irr, 0.131, 0.001)
if (base.newHomesIn5.p50 !== 0) throw new Error(`casas en 5 años: ${base.newHomesIn5.p50}`)
if (base.homesAtYear10 <= PILOT.homes) throw new Error('al año 10 el fondo ya debería alcanzar para alguna casa')
if (!base.coversOperation) throw new Error('el caso base sí cubre la operación')

const idle = projectFund({ ...BASE_ASSUMPTIONS, firstYearIdle: true })
assertClose('recuperación sin año 1', idle.paybackYears, 7.98, 0.03)
assertClose('TIR sin año 1', idle.irr, 0.112, 0.002)

assertClose('recuperación $1.50', projectFund({ ...BASE_ASSUMPTIONS, price: 1.5 }).paybackYears, 11.6, 0.05)
assertClose('recuperación $1.20', projectFund({ ...BASE_ASSUMPTIONS, price: 1.2 }).paybackYears, 19.23, 0.08)
assertClose('recuperación $1.00', projectFund({ ...BASE_ASSUMPTIONS, price: 1 }).paybackYears, 34.26, 0.1)

const tight = projectFund({ ...BASE_ASSUMPTIONS, price: 0.7 })
if (tight.coversOperation) throw new Error('a $0.70 no debe cubrir la operación')
if (tight.paybackYears !== null) throw new Error('a $0.70 no hay recuperación')

const books = portfolioSnapshot(HOMES)
const manualSavings = HOMES.reduce((sum, home) => sum + periodSavings(home).mxn, 0)
if (Math.abs(books.savings - manualSavings) > 0.01) throw new Error('el ahorro de cartera no suma la tabla')
const arrears = HOMES.filter(home => home.status === 'Atraso')
if (books.pendingCount !== arrears.length) throw new Error('las cuotas en atraso no coinciden')
if (books.collected >= books.savings * 0.8) throw new Error('la cuota recibida no debe incluir los atrasos')

const casa04 = HOMES.find(home => home.id === 'casa-04')
if (!casa04 || !hasDispute(casa04)) throw new Error('Casa 04 debe marcar diferencia de medición')
if (periodSavings(casa04).kwh !== 102) throw new Error('el ahorro de Casa 04 debe ser 102 kWh')

for (const home of HOMES) {
  const quota = periodSavings(home).quota
  const split = waterfall(quota)
  const total = split.om + split.repayment + split.reserve + split.fund
  if (Math.abs(total - quota) > 0.01) throw new Error(`la cascada de ${home.name} no suma la cuota`)
  if (split.reserve !== 0 || split.fund !== 0) throw new Error('reserva y fondo deben esperar a la liquidación')
}

const tariff = answerScenario('¿Y si la tarifa baja 20%?', BASE_ASSUMPTIONS)
if (!tariff.recognized || !tariff.summary.includes('1.60')) throw new Error('el asistente no aplicó la baja de 20%')
const homes = answerScenario('¿Cuántas casas más puedo financiar en 3 años?', BASE_ASSUMPTIONS)
if (!homes.recognized || homes.range[1] !== '0') throw new Error('en 3 años no hay casas nuevas')

if (distanceMeters(SITES[0], METEPEC) > 800) throw new Error('Casa 04 no está en Metepec, Atlixco')
for (const site of SITES) {
  if (site.lat < 18.9 || site.lat > 18.98 || site.lng < -98.5 || site.lng > -98.45) throw new Error(`${site.name} quedó fuera de Metepec`)
}
for (const alternative of alternativesNear(SITES[0])) {
  if (alternative.distanceM <= 0 || alternative.distanceM > 500) throw new Error(`${alternative.name} queda a ${alternative.distanceM} m del círculo`)
}

console.log('Modelo en orden')
console.log(`Recuperación ${base.paybackYears?.toFixed(2)} años · TIR ${((base.irr ?? 0) * 100).toFixed(2)}%`)
console.log(`Casas nuevas en 5 años: ${base.newHomesIn5.p50}. Viviendas al año 10: ${base.homesAtYear10}`)
console.log(`Ahorro del bimestre ${books.savings.toFixed(2)} · cuota recibida ${books.collected.toFixed(2)} · capital ${books.capitalRecovered.toFixed(2)}`)
