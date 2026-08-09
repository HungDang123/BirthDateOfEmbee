import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Particles from '@tsparticles/react'
import type { ISourceOptions } from '@tsparticles/engine'
import SwarmCursor from './SwarmCursor'
import DriftWall from './DriftWall'
import CircularGallery from './CircularGallery'


const OVERLAY_URL =
  'https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png'

const YOUTUBE_VIDEO_ID = 'GH-2rEDXWOI'
const START_SECONDS = 55

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
const LANTERNS = [
  { x: 6,  delay: 0,    dur: 7,  sway: 12 },
  { x: 18, delay: 1.2,  dur: 8,  sway: 9  },
  { x: 30, delay: 0.5,  dur: 7.5,sway: 14 },
  { x: 42, delay: 1.8,  dur: 9,  sway: 10 },
  { x: 55, delay: 0.9,  dur: 6.5,sway: 11 },
  { x: 68, delay: 2.1,  dur: 8.5,sway: 13 },
  { x: 82, delay: 0.3,  dur: 7.2,sway: 8  },
  { x: 94, delay: 1.5,  dur: 9.5,sway: 15 },
]

// ─── Floating balloons ──────────────────────────────────────────────────────
const BALLOONS = [
  { left: 8,  delay: 0,   dur: 14, hue: 350 },
  { left: 22, delay: 2,   dur: 16, hue: 45  },
  { left: 38, delay: 1,   dur: 13, hue: 180 },
  { left: 55, delay: 3,   dur: 15, hue: 330 },
  { left: 70, delay: 0.5, dur: 17, hue: 15  },
  { left: 88, delay: 2.5, dur: 12, hue: 60  },
]

// ─── Petals / confetti particles ───────────────────────────────────────────
const peachBlossomSrc = '/peach-blossom.svg'

function FallingEffects() {
  const petalOptions = useMemo<ISourceOptions>(() => ({
    fullScreen: { enable: false },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: { value: 18 },
      color: { value: '#ffb7c5' },
      shape: { type: 'image', options: { image: { src: peachBlossomSrc, width: 48, height: 48 } } },
      opacity: { value: { min: 0.25, max: 0.7 } },
      size: { value: { min: 10, max: 20 } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 30, sync: false } },
      move: {
        enable: true, direction: 'bottom', speed: 0.5,
        random: true, straight: false,
        outModes: { default: 'out', bottom: 'out' },
        drift: { min: -0.3, max: 0.3 },
        gravity: { enable: true, acceleration: 0.02 },
      },
    },
    interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
  }), [])

  const confettiOptions = useMemo<ISourceOptions>(() => ({
    fullScreen: { enable: false },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: { value: 14 },
      shape: {
        type: 'emoji',
        options: { emoji: { value: ['🎊', '🎉', '✨', '🌸', '💫', '⭐'] } },
      },
      opacity: { value: { min: 0.35, max: 0.8 } },
      size: { value: { min: 10, max: 18 } },
      rotate: { value: { min: -30, max: 30 }, animation: { enable: true, speed: 2, sync: false } },
      move: {
        enable: true, direction: 'bottom', speed: { min: 0.3, max: 0.7 },
        random: true, straight: false,
        outModes: { default: 'out', bottom: 'out' },
        drift: { min: -0.5, max: 0.5 },
        gravity: { enable: true, acceleration: 0.025 },
      },
    },
    interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
  }), [])

  const layerStyle = { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', pointerEvents: 'none' as const }

  return (
    <div className="pointer-events-none absolute inset-0 z-[4]" aria-hidden="true">
      <Particles id="petals" options={petalOptions} style={layerStyle} />
      <Particles id="confetti" options={confettiOptions} style={layerStyle} />
    </div>
  )
}

// ─── Play button ─────────────────────────────────────────────────────────────
function PlayButton({ onClick }: { onClick: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onClick()
  }
  return (
    <div className="play-btn-wrap">
      <button
        className="play-btn"
        onClick={handleClick}
        aria-label="Phát nhạc"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
    </div>
  )
}

// ─── Music visualizer bars ──────────────────────────────────────────────────
function MusicBars({ active }: { active: boolean }) {
  const heights = [0.6, 1, 0.7, 0.9, 0.5, 1, 0.8, 0.6, 0.95, 0.7, 1, 0.65]
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
function FloatingLanterns() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden" aria-hidden="true">
      {LANTERNS.map((l, i) => (
        <div
          key={i}
          className="lantern-item"
          style={{
            left: `${l.x}%`,
            top: '-80px',
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.dur}s`,
            animationName: 'lanternFloat',
          }}
        >
          <img src="/lantern.svg" alt="" className="lantern-sway" />
        </div>
      ))}
    </div>
  )
}

// ─── Floating balloons ──────────────────────────────────────────────────────
function FloatingBalloons() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden" aria-hidden="true">
      {BALLOONS.map((b, i) => (
        <div
          key={i}
          className="balloon-item"
          style={{
            left: `${b.left}%`,
            bottom: '-100px',
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            ['--hue' as string]: b.hue,
          }}
        >
          <span className="balloon-body" />
          <span className="balloon-string" />
        </div>
      ))}
    </div>
  )
}

// ─── Twinkling stars ────────────────────────────────────────────────────────
function TwinklingStars() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
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

// ─── Tap hint (music pulse icon) ─────────────────────────────────────────────
function TapHint({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="tap-hint pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2 } }}
        >
          <motion.div
            className="flex flex-col items-center gap-3"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Music icon + animated sound waves */}
            <div className="tap-icon-ring">
              <div className="tap-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="sound-wave wave-1" />
              <div className="sound-wave wave-2" />
              <div className="sound-wave wave-3" />
            </div>
            <p className="font-display text-base italic text-white/80 drop-shadow-lg">
              Bấm để mở nhạc
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

// ─── YouTube player ──────────────────────────────────────────────────────────
declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: Record<string, unknown>
      ) => {
        playVideo: () => void
        pauseVideo: () => void
        seekTo: (seconds: number, allowSeekAhead: boolean) => void
        getPlayerState: () => number
        destroy: () => void
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

function loadYouTubeAPI() {
  return new Promise<void>((resolve) => {
    if (window.YT?.Player) { resolve(); return }
    window.onYouTubeIframeAPIReady = resolve
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
}

// ─── Main App ───────────────────────────────────────────────────────────────
function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleIdRef = useRef(0)
  const ytPlayerRef = useRef<{ playVideo: () => void; pauseVideo: () => void; seekTo: (s: number, a: boolean) => void } | null>(null)
  const ytContainerRef = useRef<HTMLDivElement>(null)

  // Load YouTube API once
  useEffect(() => {
    loadYouTubeAPI().then(() => {
      if (ytContainerRef.current && !ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            start: START_SECONDS,
            playsinline: 1,
          },
          events: {
            onReady: () => console.log('[YT] onReady'),
            onError: (e: { data: number }) => console.log('[YT] error', e.data),
            onStateChange: (event: { data: number }) => {
              console.log('[YT] state', event.data)
              // YT.PlayerState.PLAYING = 1, YT.PlayerState.PAUSED = 2, YT.PlayerState.ENDED = 0
              if (event.data === 1) setIsPlaying(true)
              if (event.data === 2 || event.data === 0) setIsPlaying(false)
            },
          },
        })
      }
    })
  }, [])

  // Auto-hide hint
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(t)
  }, [])

  const [cardOpened, setCardOpened] = useState(false)
  const [showLetter, setShowLetter] = useState(false)

  // Hide the letter after 20s of playback so the scene is visible
  useEffect(() => {
    if (!isPlaying) return
    if (!showLetter) return
    const t = setTimeout(() => setShowLetter(false), 20000)
    return () => clearTimeout(t)
  }, [isPlaying, showLetter])

  const handleSceneClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      setShowHint(false)

      // Ripple effect only — music controlled by play button
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const colors = ['rgba(245,208,120,0.4)', 'rgba(244,164,184,0.35)', 'rgba(255,255,255,0.25)']
      const rid = rippleIdRef.current++
      setRipples((r) => [...r, { id: rid, x, y, color: colors[rid % colors.length] }])
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== rid)), 1200)
    },
    [],
  )

  const handlePlayClick = useCallback(() => {
    console.log('[Play]', { ref: !!ytPlayerRef.current, isPlaying })
    if (!ytPlayerRef.current) return
    if (isPlaying) {
      ytPlayerRef.current.pauseVideo()
      setIsPlaying(false)
    } else {
      ytPlayerRef.current.seekTo(START_SECONDS, true)
      ytPlayerRef.current.playVideo()
      setIsPlaying(true)
      // Show letter on first play
      setShowLetter(true)
    }
  }, [isPlaying])

  return (
    <>
    <SwarmCursor
      color="#ff6b9d"
      accentColor="#ff8fab"
      count={12}
      size={6}
      spread={90}
      speed={2.5}
      wander={0.25}
      trail={0.75}
      scatterOnClick
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', pointerEvents: 'none', zIndex: 1 }}
    />

    <section
      className="relative h-screen w-full cursor-pointer overflow-hidden bg-black"
      onClick={handleSceneClick}
      style={{ position: 'relative', zIndex: 2 }}
    >
        {/* Hidden YouTube player */}
        <div ref={ytContainerRef} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', left: -9999 }} />

        {/* ── 3-column layout: driftWall | old gallery | driftWall ── */}
        <div className="three-col-layout">
          <div className="three-col-layout__side three-col-layout__side--left">
            <DriftWall
              items={GALLERY_ITEMS}
              columns={2}
              tileWidth={200}
              tileHeight={130}
              gap={8}
              tilt={10}
              turn={20}
              perspective={900}
              depth={60}
              speed={32}
              direction="up"
              variance={0.4}
              parallax={0.4}
              fade={0.7}
              dim={0.4}
              overlayColor="#1a0a14"
            />
          </div>

          <div className="three-col-layout__center">
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

          <div className="three-col-layout__side three-col-layout__side--right">
            <DriftWall
              items={GALLERY_ITEMS}
              columns={2}
              tileWidth={200}
              tileHeight={130}
              gap={8}
              tilt={10}
              turn={-20}
              perspective={900}
              depth={60}
              speed={32}
              direction="up"
              variance={0.4}
              parallax={0.4}
              fade={0.7}
              dim={0.4}
              overlayColor="#1a0a14"
            />
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
      <FloatingLanterns />
      <FloatingBalloons />
      <TwinklingStars />
      <FallingEffects />

      {/* Ripples */}
      <RippleEffect ripples={ripples} />

      {/* Tap hint */}
      <TapHint visible={showHint} />

      {/* Music bars */}
      <MusicBars active={isPlaying} />
    </section>

    {createPortal(
      <>
        <AnimatePresence mode="wait">
          {showLetter && (
            <motion.div
              key="letter-overlay"
              className="letter-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key="letter-card"
                className="letter-card"
                initial={{ rotateY: 0, scale: 0.85 }}
                animate={{ rotateY: cardOpened ? 180 : 0, scale: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="letter-card__front"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCardOpened(true)
                  }}
                >
                  <div className="letter-card__seal">🎂</div>
                  <p className="letter-card__hint">Bấm để đọc thư</p>
                </div>
                <div className="letter-card__back">
                  <button
                    className="letter-card__close"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCardOpened(false)
                    }}
                    aria-label="Đóng thư"
                    title="Đóng thư"
                  >
                    ✕
                  </button>
                  <h2 className="letter-card__title">Gửi Embee thân yêu 🌸</h2>
                  <p className="letter-card__msg">
                    Chúc em bé của anh một ngày sinh nhật thật ấm áp và rực rỡ như những đóa hoa đang nở rộ.
                    Mong mọi điều dịu dàng nhất sẽ đến với em — hôm nay và mãi về sau. 💗
                  </p>
                  <p className="letter-card__sign">— From your person 🌷</p>
                </div>
              </motion.div>
              <div className="letter-particles" aria-hidden="true">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span key={i} className={`letter-petal letter-petal--${i % 4}`} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showLetter && (
          <motion.button
            key="letter-toggle"
            className="letter-toggle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            onClick={(e) => {
              e.stopPropagation()
              setShowLetter(true)
            }}
            aria-label="Mở thư"
            title="Mở thư"
          >
            💌
          </motion.button>
        )}
      </>,
      document.body
    )}

    {/* Play button — fixed center of viewport */}
    {!isPlaying && <PlayButton onClick={handlePlayClick} />}
  </>
  )
}

export default App
