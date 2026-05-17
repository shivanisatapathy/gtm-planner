import { icons } from 'lucide-react'

export default function Icon({ name, size = 14, className = '', strokeWidth = 2 }) {
  const key = name.replace(/(^|-|_)([a-z])/g, (_, __, c) => c.toUpperCase())
  const LucideIcon = icons[key]
  if (!LucideIcon) return null
  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      className={'inline-block shrink-0 ' + className}
    />
  )
}
