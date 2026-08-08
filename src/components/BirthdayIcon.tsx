import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'

type IconVariant = 'gold' | 'rose' | 'white' | 'champagne'
type IconAnimation = 'float' | 'pulse' | 'beat' | 'sparkle' | 'none'

interface BirthdayIconProps {
  icon: PhosphorIcon
  size?: number
  variant?: IconVariant
  animate?: IconAnimation
  className?: string
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
}

const COLORS: Record<IconVariant, string> = {
  gold: '#f5d078',
  rose: '#f4a4b8',
  white: '#ffffff',
  champagne: '#fff5e0',
}

const GLOW: Record<IconVariant, string> = {
  gold: 'drop-shadow(0 0 8px rgba(245,208,120,0.55)) drop-shadow(0 0 16px rgba(245,208,120,0.25))',
  rose: 'drop-shadow(0 0 8px rgba(244,164,184,0.55)) drop-shadow(0 0 16px rgba(244,164,184,0.25))',
  white: 'drop-shadow(0 0 6px rgba(255,255,255,0.4))',
  champagne: 'drop-shadow(0 0 8px rgba(255,245,224,0.5))',
}

function getMotionProps(animate: IconAnimation) {
  switch (animate) {
    case 'float':
      return {
        animate: { y: [0, -5, 0] },
        transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
      }
    case 'pulse':
      return {
        animate: { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
      }
    case 'beat':
      return {
        animate: { scale: [1, 1.18, 1, 1.12, 1] },
        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const },
      }
    case 'sparkle':
      return {
        animate: { rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] },
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
      }
    default:
      return {}
  }
}

export function BirthdayIcon({
  icon: Icon,
  size = 20,
  variant = 'gold',
  animate = 'none',
  className = '',
  weight = 'duotone',
}: BirthdayIconProps) {
  const motionProps = getMotionProps(animate)

  return (
    <motion.span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ filter: GLOW[variant] }}
      {...motionProps}
      whileHover={{ scale: 1.15 }}
    >
      <Icon size={size} weight={weight} color={COLORS[variant]} />
    </motion.span>
  )
}

interface IconBadgeProps {
  icon: PhosphorIcon
  children: ReactNode
  variant?: IconVariant
}

export function IconBadge({ icon, children, variant = 'gold' }: IconBadgeProps) {
  return (
    <motion.div
      className="birthday-chip flex items-center gap-2 rounded-full px-3.5 py-2 sm:px-4"
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <BirthdayIcon icon={icon} size={16} variant={variant} animate="pulse" weight="duotone" />
      <span className="font-body text-sm font-medium">{children}</span>
    </motion.div>
  )
}
