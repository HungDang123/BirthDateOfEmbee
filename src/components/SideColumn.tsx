import { useEffect, useState } from 'react'

type SideColumnProps = {
  photos: string[]
  side: 'left' | 'right'
}

/**
 * Tall vertical column of rotating photos, blending into the dark scene.
 * Photos are taken from the same PHOTOS list so the design stays consistent.
 */
export default function SideColumn({ photos, side }: SideColumnProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (photos.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length)
    }, 4500)
    return () => clearInterval(id)
  }, [photos.length])

  const stack = photos.length > 0 ? photos : ['/photo_1.jpg']

  return (
    <div className={`side-column side-column--${side}`} aria-hidden="true">
      {stack.map((src, i) => {
        const offset = (i - index + stack.length) % stack.length
        // Only the first 3 cards are visible; rest are hidden behind the stack
        const visibility = offset <= 2 ? 1 : 0
        return (
          <div
            key={src + i}
            className="side-column__card"
            style={{
              transform: `translateY(${offset * 9}px) translateZ(${-offset * 28}px) scale(${1 - offset * 0.04})`,
              opacity: visibility ? (1 - offset * 0.35) : 0,
              zIndex: stack.length - offset,
            }}
          >
            <img src={src} alt="" loading="lazy" />
          </div>
        )
      })}
    </div>
  )
}
