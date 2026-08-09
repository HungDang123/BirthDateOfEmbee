import { useMemo } from 'react'
import Particles from '@tsparticles/react'
import type { ISourceOptions } from '@tsparticles/engine'

const peachBlossomSrc = './peach-blossom.svg'

export function FallingPetals() {
  const blossomOptions = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 22 },
        color: { value: '#ffb7c5' },
        shape: {
          type: 'image',
          options: {
            image: {
              src: peachBlossomSrc,
              width: 48,
              height: 48,
            },
          },
        },
        opacity: {
          value: { min: 0.3, max: 0.75 },
          animation: {
            enable: true,
            speed: 0.3,
            sync: false,
          },
        },
        size: {
          value: { min: 12, max: 24 },
        },
        rotate: {
          value: { min: 0, max: 360 },
          animation: {
            enable: true,
            speed: { min: 0.5, max: 2 },
            sync: false,
          },
        },
        move: {
          enable: true,
          direction: 'bottom',
          speed: { min: 0.15, max: 0.45 },
          random: true,
          straight: false,
          outModes: {
            default: 'out',
            bottom: 'out',
          },
          drift: { min: -0.3, max: 0.3 },
          gravity: {
            enable: true,
            acceleration: 0.02,
          },
        },
      },
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
        },
      },
    }),
    [],
  )

  const giftOptions = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 6 },
        shape: {
          type: 'emoji',
          options: {
            emoji: {
              value: ['🎁', '💝', '🎀'],
            },
          },
        },
        opacity: {
          value: { min: 0.4, max: 0.85 },
        },
        size: {
          value: { min: 16, max: 24 },
        },
        rotate: {
          value: { min: -15, max: 15 },
          animation: {
            enable: true,
            speed: 1,
            sync: false,
          },
        },
        move: {
          enable: true,
          direction: 'bottom',
          speed: { min: 0.1, max: 0.3 },
          random: true,
          straight: false,
          outModes: {
            default: 'out',
            bottom: 'out',
          },
          drift: { min: -0.2, max: 0.2 },
          gravity: {
            enable: true,
            acceleration: 0.015,
          },
        },
      },
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
        },
      },
    }),
    [],
  )

  const layerStyle = {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[3]" aria-hidden="true">
      <Particles id="petals" options={blossomOptions} style={layerStyle} />
      <Particles id="gifts" options={giftOptions} style={layerStyle} />
    </div>
  )
}
