import { Icon } from './Icon'

export type ScreenId = 'evaluate' | 'receipts' | 'portfolio' | 'verify' | 'fund'

const navItems: { id: ScreenId; label: string; icon: 'location' | 'receipt' | 'homes' | 'chart' | 'cycle' }[] = [
  { id: 'evaluate', label: 'Evaluar un sitio', icon: 'location' },
  { id: 'receipts', label: 'Recibos', icon: 'receipt' },
  { id: 'portfolio', label: 'Cartera del piloto', icon: 'homes' },
  { id: 'verify', label: 'Verificar ahorro', icon: 'chart' },
  { id: 'fund', label: 'Fondo rotatorio', icon: 'cycle' },
]

const titles: Record<ScreenId, { title: string; subtitle: string }> = {
  evaluate: { title: 'Evaluar un sitio', subtitle: 'Compara viviendas candidatas antes de la visita técnica' },
  receipts: { title: 'Recibos', subtitle: 'Calcula el consumo base a partir de recibos de CFE' },
  portfolio: { title: 'Cartera del piloto', subtitle: 'Corte ilustrativo del año 5 · 10 viviendas de Metepec' },
  verify: { title: 'Verificación del ahorro', subtitle: 'Contrasta recibos, generación y cuotas por bimestre' },
  fund: { title: 'Simulador del fondo rotatorio', subtitle: 'Explora cómo crece la cooperativa en distintos escenarios' },
}

export function Sidebar({ screen, onChange }: { screen: ScreenId; onChange: (screen: ScreenId) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="sun" />
        </div>
        <div>
          <strong>Sol Común</strong>
          <span>Cooperativa energética</span>
        </div>
      </div>
      <nav aria-label="Navegación principal">
        <div className="nav-label">Herramientas</div>
        {navItems.map(item => (
          <button key={item.id} type="button" className={screen === item.id ? 'nav-item active' : 'nav-item'} aria-current={screen === item.id ? 'page' : undefined} onClick={() => onChange(item.id)}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.id === 'portfolio' ? <b>10</b> : null}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="phase">
          <span>Fase piloto</span>
          <strong>10 viviendas</strong>
          <div>
            <i />
          </div>
        </div>
      </div>
    </aside>
  )
}

export function Header({ screen }: { screen: ScreenId }) {
  return (
    <header className="topbar">
      <div>
        <h1>{titles[screen].title}</h1>
        <p>{titles[screen].subtitle}</p>
      </div>
      <div className="header-actions">
        <label className="community-select">
          <span>Comunidad</span>
          <select aria-label="Seleccionar comunidad" defaultValue="metepec">
            <option value="metepec">Metepec, Atlixco</option>
          </select>
        </label>
        <div className="avatar" title="Mesa de la cooperativa">
          MC
        </div>
      </div>
    </header>
  )
}
