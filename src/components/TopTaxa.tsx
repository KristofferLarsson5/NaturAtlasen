type TopTaxon = {
  label: string
  scientificName: string
  count: number
}

type TopTaxaProps = {
  taxa: TopTaxon[]
}

export function TopTaxa({ taxa }: TopTaxaProps) {
  return (
    <section className="card list-card">
      <h2>Vanligaste art</h2>

      {taxa.length === 0 ? (
        <p className="empty-state">Inga taxa att visa för det valda området.</p>
      ) : (
        <ol className="taxa-list">
          {taxa.map((taxon, index) => (
            <li key={`${taxon.label}-${index}`} className="taxa-item">
              <div>
                <span className="rank">#{index + 1}</span>
                <strong>{taxon.label}</strong>
                <span className="scientific-name">{taxon.scientificName}</span>
              </div>
              <span className="taxa-count">{taxon.count}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
