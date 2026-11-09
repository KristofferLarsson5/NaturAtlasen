type GroupEntry = {
  name: string
  count: number
}

type GroupChartProps = {
  data: GroupEntry[]
}

export function GroupChart({ data }: GroupChartProps) {
  const maxValue = Math.max(...data.map((item) => item.count), 1)

  return (
    <section className="card chart-card">
      <h2>Observationer</h2>

      {data.length === 0 ? (
        <p className="empty-state">Inga observationer att visa i den valda radien.</p>
      ) : (
        <div className="bars" aria-label="Observationer">
          {data.map((item) => (
            <div key={item.name} className="bar-row">
              <span className="bar-label">{item.name}</span>
              <div className="bar-track">
                <span
                  className="bar-fill"
                  style={{ width: `${Math.max((item.count / maxValue) * 100, 8)}%` }}
                />
              </div>
              <span className="bar-value">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
