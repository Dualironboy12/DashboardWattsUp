import { useState } from 'react'
import { Assistant } from '@/components/Assistant'
import { Header, Sidebar, type ScreenId } from '@/components/Shell'
import { BASE_ASSUMPTIONS, type Assumptions } from '@/model/piloto'
import { EvaluateScreen } from '@/screens/EvaluateScreen'
import { FundScreen } from '@/screens/FundScreen'
import { PortfolioScreen } from '@/screens/PortfolioScreen'
import { ReceiptsScreen } from '@/screens/ReceiptsScreen'
import { VerifyScreen } from '@/screens/VerifyScreen'

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('evaluate')
  const [navOpen, setNavOpen] = useState(true)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assumptions, setAssumptions] = useState<Assumptions>(BASE_ASSUMPTIONS)

  return (
    <div className={navOpen ? 'app-shell' : 'app-shell nav-collapsed'}>
      <Sidebar screen={screen} onChange={setScreen} open={navOpen} />
      <div className="workspace">
        <div className="demo-banner">
          <span>Datos de demostración</span>
          <p>Las cifras son ilustrativas y no representan una cotización.</p>
        </div>
        <Header screen={screen} navOpen={navOpen} onToggleNav={() => setNavOpen(open => !open)} />
        <main>
          {screen === 'evaluate' ? <EvaluateScreen /> : null}
          {screen === 'receipts' ? <ReceiptsScreen /> : null}
          {screen === 'portfolio' ? <PortfolioScreen /> : null}
          {screen === 'verify' ? <VerifyScreen /> : null}
          {screen === 'fund' ? <FundScreen assumptions={assumptions} onChange={setAssumptions} /> : null}
        </main>
      </div>
      <Assistant open={assistantOpen} onOpenChange={setAssistantOpen} assumptions={assumptions} />
    </div>
  )
}
