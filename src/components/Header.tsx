import type { AreaConfig } from '../data/locations'

type HeaderProps = {
  areas: AreaConfig[]
  selectedArea: AreaConfig
  onAreaChange: (areaName: string) => void
  radius: number
  onRadiusChange: (value: number) => void
  onFetchData: () => void
  loading: boolean
}

const radiusOptions = [250, 500]

export function Header({
  areas,
  selectedArea,
  onAreaChange,
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
        <label className="area-picker">
          <span>Välj område</span>
          <select
            value={selectedArea.name}
            onChange={(event) => onAreaChange(event.target.value)}
            disabled={loading}
          >
            {areas.map((area) => (
              <option key={area.name} value={area.name}>
                {area.name}
              </option>
            ))}
          </select>
        </label>

        <div className="radius-picker" aria-label="Välj sökradie">
          {radiusOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={option === radius ? 'radius-button is-active' : 'radius-button'}
              onClick={() => onRadiusChange(option)}
              disabled={loading}
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
