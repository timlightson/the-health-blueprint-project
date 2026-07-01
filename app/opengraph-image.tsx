import { ImageResponse } from 'next/og'

export const alt = 'The Health Blueprint — see what\'s actually happening inside your body'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand mark: the blueprint wave, drawn as an inline SVG data URI.
const mark =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg width="44" height="44" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="16" rx="4.5" fill="#0B1A2B"/><path d="M2 9 L5 9 L6.5 4 L9.5 12 L11 9 L14 9" stroke="#2DD4BF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  )

const labs = [
  { name: 'Sleep', color: '#0E8A7D' },
  { name: 'Energy', color: '#C9760F' },
  { name: 'Stress', color: '#D8443B' },
]

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: '#F7F5EF',
          backgroundImage:
            'radial-gradient(900px 700px at 8% -10%, rgba(14,138,125,0.20), transparent 60%), radial-gradient(820px 680px at 100% 0%, rgba(201,118,15,0.16), transparent 60%), radial-gradient(900px 820px at 70% 120%, rgba(37,99,235,0.12), transparent 60%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} width={44} height={44} alt="" />
          <div style={{ fontSize: 28, fontWeight: 600, color: '#0B1A2B', letterSpacing: '-0.01em' }}>
            The Health Blueprint
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-0.035em',
              color: '#0B1A2B',
              maxWidth: 940,
            }}
          >
            See what&apos;s actually happening inside your body.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: '#5A6675', maxWidth: 820, lineHeight: 1.4 }}>
            Pick a topic. Move the controls. Watch real data react in real time.
          </div>
        </div>

        {/* Lab chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {labs.map((lab) => (
            <div
              key={lab.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 22px',
                borderRadius: 999,
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(11,26,43,0.08)',
                fontSize: 26,
                fontWeight: 600,
                color: '#0B1A2B',
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: lab.color }} />
              {lab.name}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 22, color: '#97A0AB' }}>
            Evidence-based · built for teens
          </div>
        </div>
      </div>
    ),
    size,
  )
}
