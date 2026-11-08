# NaturAtlasen

## 1. About NaturAtlasen

NaturAtlasen is an interactive web application for exploring biodiversity and nature observations in Mariehamn, Åland. The first version focuses on the Nabben area and displays observations from FinBIF, filtered by geographic radius around a preliminary search point.

## 2. Project purpose

The goal of this project is to make it easy to see which species and organism groups have been observed near Mariehamn, which taxa are most common, and how observations are distributed over time. The aim is to provide an accessible exploration portal, not an administrative data system.

## 3. Features

- Choose between search radii of 250 m and 500 m.
- Fetch observations from FinBIF through a Vite proxy in development mode.
- Filter observations geographically using the Haversine formula, keeping only those within the selected radius.
- View summary statistics for the number of observations, unique taxa, organism groups, and observation years.
- View a bar chart of observations by organism group.
- View a chronological bar chart of observations by year.
- Browse the 15 most common taxa.
- See clear error messages when the API or data cannot be reached.

## 4. Technologies

- React
- TypeScript
- Vite
- CSS
- FinBIF OpenAPI

## 5. Data sources

The project uses publicly available observations from FinBIF, retrieved from the following collection:

- https://ogcapi.laji.fi/collections/lajiapi-connection/items

The collection is called "All Data as Center Points" and provides the data used in the application's visualizations and statistics.

## 6. Installation

Install the dependencies:

```bash
npm install
```

## 7. Run the project locally

Start the development server:

```bash
npm run dev
```

Vite will run the app locally, usually at:

```text
http://localhost:5173/
```

## 8. Project structure

```text
src/
  components/
    Header.tsx
    StatCard.tsx
    GroupChart.tsx
    YearChart.tsx
    TopTaxa.tsx
  data/
    locations.ts
  services/
    finbif.ts
  types/
    observation.ts
  utils/
    distance.ts
    statistics.ts
  App.tsx
  main.tsx
  index.css
  App.css
```

## 9. How the FinBIF API is used

In development, the application fetches data through a Vite proxy to avoid CORS issues:

```text
/api/finbif/collections/lajiapi-connection/items
```

The Vite proxy forwards requests to FinBIF. The app sends the following parameters:

- `bbox`
- `limit`
- `offset`
- `f=json`

After fetching the data, the app also filters observations in TypeScript so that observations outside the selected radius are not included in the statistics.

## 10. Geographic filtering

The first version uses Nabben as its area of interest:

- Latitude: 60.1137829
- Longitude: 19.9472856

These coordinates are preliminary and should not be considered an official boundary for a nature reserve or other defined natural area. The app first fetches observations within a geographic bounding box around the search point, then filters them in TypeScript using the Haversine formula. This ensures that only observations within the selected radius are included in the statistics.

## 11. Data quality and limitations

- The data comes from publicly available observations in FinBIF.
- Some observations may have approximate or obscured coordinates.
- Location information for sensitive species may be restricted or hidden.
- Observations represent records, not necessarily counts of individual organisms.
- Some fields may be missing or null.
- The app handles missing values without crashing.

## 12. Licensing and attribution

- The data source is FinBIF and its publicly available observations.
- Applicable licenses and terms of use may vary between datasets, images, and metadata.
- Check the license before reusing photographs or other materials.
- This application displays data retrieved from the API. It does not require users to log in or expose secret keys.

## 13. Known issues

- Some observation records may have missing or incomplete names and coordinates.
- FinBIF may return few or no results for a very small bounding box.
- The app is intentionally simple and relies on geospatial data from the API rather than a full-featured mapping library.

## 14. Planned features

- Add more areas in Mariehamn.
- Add a nature journal for users.
- Add a map in a future development phase.
- Provide more detailed taxonomic information and filters.

## 15. Troubleshooting

### Problem: The app displays an error when fetching data from FinBIF

Make sure the Vite proxy is running and that you started the app with `npm run dev`.

### Problem: No observations are displayed

- Check that the selected radius is correct.
- Check whether there are observations near Nabben.
- Check the error message displayed in the app.

### Problem: TypeScript build errors

Run:

```bash
npm run build
```

If errors occur, check that the type definitions and import paths are correct.

## Build the project

```bash
npm run build
```

This runs the TypeScript checks and builds a production version of the app.

## Note about statistics

The app's statistics refer to observations within the selected radius, not automatically to the number of individual organisms. An observation may represent an event or a finding, but it does not always indicate an exact count of living individuals.
