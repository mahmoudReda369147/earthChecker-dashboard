export default function Sparkline({ data = [0], color = '#00d4ff', height = 36 }) {
  const safeData = data.length > 0 ? data : [0, 0]
  const min = Math.min(...safeData)
  const max = Math.max(...safeData)
  const range = max - min || 1
  const width = 120

  const points = safeData
    .map((val, i) => {
      const x = (i / Math.max(1, safeData.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 8) - 4
      return `${x},${y}`
    })
    .join(' ')

  const fillPoints = `0,${height} ${points} ${width},${height}`
  const gradientId = `grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}
