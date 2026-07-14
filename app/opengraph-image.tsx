import { ImageResponse } from 'next/og'
import { BRAND_NAVY } from '@/components/site/BrandMark'
import { LABS } from '@/components/labs/labs-meta'

export const alt = 'The Health Blueprint — see what\'s actually happening inside your body'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand mark: navy circle + white cross, matching components/site/BrandMark.
const mark =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="32" fill="${BRAND_NAVY}"/><rect x="25" y="15" width="14" height="34" rx="1" fill="#fff"/><rect x="15" y="25" width="34" height="14" rx="1" fill="#fff"/></svg>`,
  )

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
          <img src={mark} width={52} height={52} alt="" />
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

        {/* Blueprint dots — a swatch, not a name list, so it never goes stale
            as Blueprints are added; count still reads from LABS directly. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
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
            <div style={{ display: 'flex', gap: 7 }}>
              {LABS.map((lab) => (
                <div key={lab.id} style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: lab.accent }} />
              ))}
            </div>
            {LABS.length} interactive Blueprints
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 22, color: '#97A0AB' }}>
            Evidence-based · built for teens
          </div>
        </div>
      </div>
    ),
    size,
  )
}
