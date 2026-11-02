type YearEntry = {
  year: number
  count: number
}

type YearChartProps = {
  data: YearEntry[]
}

export function YearChart({ data }: YearChartProps) {
  const maxValue = Math.max(...data.map((item) => item.count), 1)

  return (
    <section className="card chart-card">
      <h2>Observationer per år</h2>

      {data.length === 0 ? (
        <p className="empty-state">Inga identifierbara årsuppgifter hittades.</p>
      ) : (
        <div className="bars" aria-label="Observationer per år">
          {data.map((item) => (
            <div key={item.year} className="bar-row">
              <span className="bar-label">{item.year}</span>
              <div className="bar-track">
                <span
                  className="bar-fill bar-fill--sand"
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
