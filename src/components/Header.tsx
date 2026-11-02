type HeaderProps = {
  areaName: string
  radius: number
  onRadiusChange: (value: number) => void
  onFetchData: () => void
  loading: boolean
}

const radiusOptions = [250, 500]

export function Header({
  areaName,
  radius,
  onRadiusChange,
  onFetchData,
  loading,
}: HeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Naturatlasen</p>
        <h1>Upptäck naturen och den biologiska mångfalden nära Mariehamn.</h1>
      </div>

      <div className="header-meta">
        <div className="area-pill">Aktuellt område: {areaName}</div>

        <div className="radius-picker" aria-label="Välj sökradie">
          {radiusOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={option === radius ? 'radius-button is-active' : 'radius-button'}
              onClick={() => onRadiusChange(option)}
            >
              {option} meter
            </button>
          ))}
        </div>

        <button type="button" className="fetch-button" onClick={onFetchData} disabled={loading}>
          {loading ? 'Hämtar data…' : 'Hämta data från FinBIF'}
        </button>
      </div>
    </header>
  )
}
