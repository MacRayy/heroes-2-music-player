import { SCOPE_LABELS, SCOPE_ORDER } from '@/data/tracks'
import { usePlayerContext } from '@/state/PlayerContext'

/** A small filter row that scopes what the transport (next/prev/shuffle) walks. Not a track list. */
export function ScopeChips(): React.JSX.Element {
  const { scope, setScope } = usePlayerContext()
  return (
    <div className="scopes" role="group" aria-label="Filter tracks by category">
      {SCOPE_ORDER.map((value) => (
        <button
          key={value}
          type="button"
          className="scope-chip"
          aria-pressed={scope === value}
          onClick={() => {
            setScope(value)
          }}
        >
          {SCOPE_LABELS[value]}
        </button>
      ))}
    </div>
  )
}
