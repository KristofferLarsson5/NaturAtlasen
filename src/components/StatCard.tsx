type StatCardProps = {
  label: string
  value: string | number
  accent?: 'green' | 'sand' | 'blue'
}

export function StatCard({ label, value, accent = 'green' }: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${accent}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </article>
  )
}
