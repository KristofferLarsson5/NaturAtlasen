# Naturatlasen

## 1. Om Naturatlasen

Naturatlasen är en interaktiv webbapplikation för att utforska biologisk mångfald och naturinventeringar i Mariehamn på Åland. Den första versionen fokuserar på området Nabben och visar observationer från FinBIF i realtid, filtrerade med en geospatial radie baserad på en preliminär sökpunkt.

## 2. Projektets syfte

Syftet med projektet är att göra det enkelt att se vilka arter och organismgrupper som har observerats nära Mariehamn, vilka taxon som är vanligast och hur observationerna fördelar sig över tid. Grundtanken är att skapa en lättbegriplig portal för utforskning och inte en administrativ datamodell.

## 3. Funktioner

- Val mellan sökradie 250 m och 500 m.
- Hämta observationer från FinBIF via Vite-proxy i utvecklingsläge.
- Haversine-baserad geografisk filtrering för att hålla endast observationer inom vald radie.
- Statistiköversikt med antalet observationer, unika taxa, organismgrupper och observationsår.
- Stapeldiagram för observationer per organismgrupp.
- Stapeldiagram för observationer per år i kronologisk ordning.
- Lista över de 15 vanligaste taxa.
- Tydliga felmeddelanden när API eller data inte kan hämtas.

## 4. Teknik och verktyg

- React
- TypeScript
- Vite
- CSS
- FinBIF OpenAPI

## 5. Datakällor

Projektet använder offentligt tillgängliga observationer från FinBIF, som hämtas från följande samling:

- https://ogcapi.laji.fi/collections/lajiapi-connection/items

Detta är initierat som "All Data as Center Points" och ligger till grund för de visuella tabellerna och statistiken i applikationen.

## 6. Installation

Installera beroenden:

```bash
npm install
```

## 7. Starta projektet lokalt

Starta utvecklingsservern:

```bash
npm run dev
```

Vite kommer då att köra appen lokalt, vanligtvis på:

```text
http://localhost:5173/
```

## 8. Projektstruktur

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

## 9. Hur FinBIF API används

Applikationen hämtar data via en Vite-proxy för att undvika CORS-problem i utvecklingsmiljön:

```text
/api/finbif/collections/lajiapi-connection/items
```

Proxy-konfigurationen i Vite omdirigerar anropet mot FinBIF, och appen skickar med parametrar för:

- bbox
- limit
- offset
- f=json

Det finns även en geografisk filtrering i TypeScript efter hämtning, så att observationer som ligger utanför vald radie inte visas i statistiken.

## 10. Geografisk filtrering

Den första versionen använder Nabben som område:

- Latitud: 60.1137829
- Longitud: 19.9472856

Koordinaterna är preliminära och får inte ses som en officiell gräns för ett naturreservat eller ett definierat naturområde. Appen hämtar först observationer i en geografisk bbox omkring den valda sökpunkt och filtrerar därefter i TypeScript med haversine-formeln. Detta säkerställer att endast observationer inom den valda radien används i statistikuppdateringen.

## 11. Datakvalitet och begränsningar

- Data kommer från offentliga observationer i FinBIF.
- Vissa observationer kan ha ungefärliga eller förskjutna koordinater.
- Känsliga arter kan ha begränsade eller dolda positionsuppgifter.
- Observationer är observationer, inte nödvändigtvis antal individer.
- Vissa fält kan saknas eller vara null.
- Appen hanterar saknade värden utan att krascha.

## 12. Licenser och källhänvisning

- Datakällan är FinBIF och dess offentligt tillgängliga observationer.
- Relevanta licenser och användningsvillkor kan variera mellan olika datamängder, bilder och metadata.
- Fotografier och andra material får inte återanvändas utan att licensen har kontrollerats.
- Denna applikation visar endast data som hämtats från API:t och presenterar poster utan att lögga in eller exponera hemliga nycklar.

## 13. Kända problem

- Vissa observationsposter kan sakna eller ha ofullständiga namn och koordinater.
- FinBIF kan ibland ge få eller inga resultat för en mycket liten bbox.
- Appen är avsiktligt enkel och förlitar sig på CSV-liknande geodata från API:t, utan större kartbibliotek.

## 14. Planerade funktioner

- Lägg till fler områden i Mariehamn.
- Utöka appen med en naturdagbok för användaren.
- Lägga till karta i ett senare utvecklingssteg.
- Exponera mer detaljerad taxonomisk information och filter.

## 15. Felsökning

### Problem: Appen visar fel om hämtning från FinBIF

Kontrollera att Vite-proxyn är aktiv och att du kör appen med `npm run dev`.

### Problem: Inga observationer visas

- Kontrollera att radien är vald korrekt.
- Kontrollera om området har observationer nära Nabben.
- Se efter felmeddelandet i applikationen.

### Problem: Byggfel i TypeScript

Kör:

```bash
npm run build
```

Om fel uppstår, kontrollera att typdefinitioner och importvägar stämmer.

## Bygg projektet

```bash
npm run build
```

Detta kör TypeScript-kontrollen och bygger en produktionsversion av appen.

## Notering om statistik

Statistiken i appen avser observationer i den valda radien, inte automatiskt antal individer. Det innebär att en observation kan representera en händelse eller ett fynd, men inte alltid ett exakt antal levande individer.
