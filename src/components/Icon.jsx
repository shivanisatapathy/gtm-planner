import { icons } from 'lucide-react'

// Lightweight Lucide icon component using SVG data directly
export default function Icon({ name, size = 14, className = '', strokeWidth = 2 }) {
  // Convert kebab-case to PascalCase
  const key = name.replace(/(^|-|_)([a-z])/g, (_, __, c) => c.toUpperCase())
  const iconData = icons[key]
  if (!iconData) return null

  const [defaultAttrs, children] = iconData
  const attrs = { ...defaultAttrs, width: size, height: size, strokeWidth }

  return (
    <svg
      {...attrs}
      className={'inline-block shrink-0 ' + className}
      style={{ width: size, height: size, minWidth: size }}
      dangerouslySetInnerHTML={{ __html: children }}
    />
  )
}
