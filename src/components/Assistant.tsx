import { useState } from 'react'
import { answerScenario, type Assumptions, type ScenarioAnswer } from '@/model/piloto'
import { Icon } from './Icon'
import { RangeValue } from './ui'

const suggestions = ['¿Y si la tarifa baja 20%?', '¿Cuántas casas más puedo financiar en 3 años?', '¿Cuánto CO₂ evita el piloto?']

export function Assistant({ open, onOpenChange, assumptions }: { open: boolean; onOpenChange: (open: boolean) => void; assumptions: Assumptions }) {
  const [draft, setDraft] = useState('')
  const [asked, setAsked] = useState('')
  const [answer, setAnswer] = useState<ScenarioAnswer | null>(null)
  const [folio, setFolio] = useState(41)
  const [folioLabel, setFolioLabel] = useState('')

  function ask(question: string) {
    const next = answerScenario(question, assumptions)
    setAsked(question)
    setAnswer(next)
    if (next.recognized) {
      const number = folio + 1
      setFolio(number)
      setFolioLabel(`CALC-${String(number).padStart(4, '0')}`)
    } else {
      setFolioLabel('')
    }
  }

  return (
    <>
      <button type="button" className="assistant-fab" onClick={() => onOpenChange(!open)} aria-expanded={open} aria-controls="asistente">
        <Icon name={open ? 'close' : 'spark'} size={22} />
        <span>{open ? 'Cerrar' : 'Explorar escenario'}</span>
      </button>
      {open ? (
        <aside className="assistant-panel" id="asistente">
          <div className="assistant-head">
            <div className="assistant-symbol">
              <Icon name="spark" />
            </div>
            <div>
              <strong>Asistente de escenarios</strong>
              <span>Ejecuta cálculos registrados</span>
            </div>
            <button type="button" onClick={() => onOpenChange(false)} aria-label="Cerrar asistente">
              <Icon name="close" />
            </button>
          </div>
          <div className="assistant-body">
            <div className="assistant-intro">
              <strong>¿Qué escenario quieres explorar?</strong>
              <p>Ejecuta los cálculos del modelo con la tarifa y los supuestos que están en el simulador. No inventa cifras.</p>
            </div>
            {suggestions.map(suggestion => (
              <button key={suggestion} type="button" className="suggestion" onClick={() => ask(suggestion)}>
                {suggestion}
              </button>
            ))}
            {answer ? (
              <div className="assistant-response">
                <div className="bot-label">
                  <Icon name="spark" size={15} /> Resultado del modelo
                </div>
                <p>
                  <em>{asked}</em>
                </p>
                <p>{answer.summary}</p>
                {answer.recognized ? (
                  <>
                    <RangeValue label={answer.rangeLabel} values={answer.range} unit={answer.unit} />
                    <details>
                      <summary>Cómo se calculó</summary>
                      <div>
                        <code>{answer.formula}</code>
                        {answer.params.map(param => (
                          <p key={param}>{param}</p>
                        ))}
                        <strong>{folioLabel}</strong>
                      </div>
                    </details>
                    <small className="registered">
                      <Icon name="check" size={14} /> Respuesta generada con cálculos registrados
                    </small>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
          <form
            className="assistant-input"
            onSubmit={event => {
              event.preventDefault()
              if (!draft.trim()) return
              ask(draft.trim())
              setDraft('')
            }}
          >
            <input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Escribe un escenario..." aria-label="Escribe un escenario" />
            <button type="submit" aria-label="Enviar">
              →
            </button>
          </form>
        </aside>
      ) : null}
    </>
  )
}
