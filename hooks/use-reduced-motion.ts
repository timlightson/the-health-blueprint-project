import * as React from 'react'

/**
 * Tracks the user's `prefers-reduced-motion` setting.
 *
 * CSS handles reduced motion for `animation`/`transition`, but it can't stop
 * SVG SMIL (`<animateMotion>`, `<animateTransform>`, `<animate>`). Components
 * with SMIL read this hook and render a static frame instead.
 *
 * SSR-safe: returns `false` until mounted so the first paint matches the server.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
