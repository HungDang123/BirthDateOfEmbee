import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Heavy components intentionally disabled for performance — see perf commits.
// import SwarmCursor from './SwarmCursor'
// import DriftWall from './DriftWall'
import CircularGallery from './CircularGallery'

// Detect low-power / mobile devices — disable heavy GPU effects
function isLowPower(): boolean {
  if (typeof navigator === 'undefined') return false
  // @ts-expect-error - non-standard but widely supported
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return true
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true
  const ua = navigator.userAgent || ''
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return true
  return false
}
const LOW_POWER = isLowPower()


const OVERLAY_URL =
  'https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png'

const PHOTOS = [
  '/photo_1.jpg',
  '/photo_2.jpg',
  '/photo_3.jpg',
  '/photo_4.jpg',
  '/photo_5.jpg',
  '/photo_6.jpg',
  '/photo_7.jpg',
  '/photo_8.jpg',
  '/photo_9.jpg',
  '/photo_10.jpg',
  '/photo_11.jpg',
]

// Gallery items for CircularGallery
const GALLERY_ITEMS = PHOTOS.map((photo) => ({
  image: photo,
  title: '',
}))

// ─── Lantern positions ───────────────────────────────────────────────────────
// ─── Music visualizer bars ──────────────────────────────────────────────────
function MusicBars({ active }: { active: boolean }) {
  const heights = [0.6, 1, 0.7, 0.9, 0.5, 0.8]
  return (
    <AnimatePresence>
      {active && (
        <div className="music-bars pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-end gap-1">
          {heights.map((h, i) => (
            <motion.div
              key={i}
              className="music-bar"
              style={{ height: `${h * 32}px` }}
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Floating lanterns ────────────────────────────────────────────────────────

// ─── Twinkling stars ────────────────────────────────────────────────────────
function TwinklingStars() {
  const starCount = LOW_POWER ? 6 : 12
  const stars = Array.from({ length: starCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 60}%`,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 4,
    dur: 2 + Math.random() * 3,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 z-[3]" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star-twinkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Ripple on click ───────────────────────────────────────────────────────
interface Ripple {
  id: number
  x: number
  y: number
  color: string
}

function RippleEffect({ ripples }: { ripples: Ripple[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-25 overflow-hidden">
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="ripple-circle absolute rounded-full"
          style={{ left: r.x, top: r.y, background: r.color }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 320, height: 320, opacity: 0, marginLeft: -160, marginTop: -160 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ─── Music glow ────────────────────────────────────────────────────────────
function MusicGlow({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="music-glow pointer-events-none absolute inset-0 z-[2]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </AnimatePresence>
  )
}

// ─── HTML5 audio player (replaces YouTube iframe for faster load) ───────────
function useBirthdayAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audio = new Audio('/birthday.mp3')
    audio.loop = true
    audio.volume = 0.7
    audioRef.current = audio

    // Browser autoplay policy: try muted first, then unmute on first user gesture.
    audio.muted = true
    const tryPlay = () => audio.play().catch(() => {})
    tryPlay()

    const unmuteAndPlay = () => {
      audio.muted = false
      tryPlay()
      setIsPlaying(true)
      window.removeEventListener('pointerdown', unmuteAndPlay)
      window.removeEventListener('keydown', unmuteAndPlay)
    }
    window.addEventListener('pointerdown', unmuteAndPlay, { once: true })
    window.addEventListener('keydown', unmuteAndPlay, { once: true })

    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))

    return () => {
      window.removeEventListener('pointerdown', unmuteAndPlay)
      window.removeEventListener('keydown', unmuteAndPlay)
      audio.pause()
      audio.src = ''
    }
  }, [])

  const resume = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = false
    audio.play().then(() => setIsPlaying(true)).catch(() => {})
  }, [])

  return { isPlaying, resume }
}

// ─── Main App ───────────────────────────────────────────────────────────────
function App() {
  const { isPlaying, resume } = useBirthdayAudio()
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleIdRef = useRef(0)

  const handleSceneClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      resume()

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const colors = ['rgba(245,208,120,0.4)', 'rgba(244,164,184,0.35)', 'rgba(255,255,255,0.25)']
      const rid = rippleIdRef.current++
      setRipples((r) => [...r, { id: rid, x, y, color: colors[rid % colors.length] }])
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== rid)), 1200)
    },
    [resume],
  )

  return (
    <>
    {/* Heavy WebGL cursor disabled for performance — see issue: lag

    <SwarmCursor
      color="#ff6b9d"
      accentColor="#ff8fab"
      count={LOW_POWER ? 0 : 8}
      size={5}
      spread={70}
      speed={2.0}
      wander={0.2}
      trail={0.6}
      enabled={!LOW_POWER}
      scatterOnClick
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', pointerEvents: 'none', zIndex: 1 }}
    />
    */}

    <section
      className="relative h-screen w-full cursor-pointer overflow-hidden bg-black"
      onClick={handleSceneClick}
      style={{ position: 'relative', zIndex: 2 }}
    >
        {/* ── Centered gallery only (DriftWall disabled for performance) ── */}
        <div className="three-col-layout">
          <div className="three-col-layout__center" style={{ gridColumn: '1 / -1' }}>
            <div className="circular-gallery-wrapper">
              <CircularGallery
                items={GALLERY_ITEMS}
                bend={1}
                textColor="#ffffff"
                borderRadius={0.04}
                scrollSpeed={2}
                scrollEase={0.05}
                fontUrl=""
              />
            </div>
          </div>
        </div>

        {/* Play button — visible only when not playing */}

        {/* Train overlay */}
      <img
        src={OVERLAY_URL}
        alt=""
        className="train-bob pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover"
        aria-hidden="true"
      />

      {/* Warm vignette */}
      <div className="birthday-vignette pointer-events-none absolute inset-0 z-[2]" aria-hidden="true" />

      {/* Visual layers */}
      <MusicGlow active={isPlaying} />
      <TwinklingStars />

      {/* Ripples */}
      <RippleEffect ripples={ripples} />

      {/* Music bars */}
      <MusicBars active={isPlaying} />
    </section>

    {/* (Play button removed — music auto-plays on load and any click resumes it) */}
  </>
  )
}

export default App
