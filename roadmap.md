# Roadmap

- [x] Clear copied Drizzle migrations and rescaffold empty migration set (journal already empty, no migration files)
- [x] Update QLOO_API_KEY secret (new value saved via secure form)
- [x] Live Qloo end to end: Paris shows live Qloo neighborhoods and places; sample data only on Qloo failure (fixed 20s timeout -> 60s; heatmap skipped when no taste tags)
- [x] When Qloo returns nothing: "<City> isn't available yet" + 2-3 similar cities + "Request <City>" button (verified with Lyon; insert-only policy confirmed)
- [x] Agent steps panel collapsed by default with real call timings (verified in browser)
- [x] Place insights send exactly filter.type, filter.location.query, take=20; real HTTP status/body shown in Agent steps on failure (Paris + Abuja verified live)
- [x] No design changes
- [x] Fixed city picker bug: curated cities (e.g. Paris, France) were hidden behind GeoNames namesakes (Paris, Texas)

Note: 2 pre-existing failures in src/test/city-selection.test.ts — runAgent calls a server function that needs the Start runtime, unavailable in vitest. Unrelated to these changes.
- [x] Neighborhood cards: distinct Qloo place photo per card, else plain cream card with name
- [x] Budget/pace only rank/filter results, never sent to Qloo
- [x] "Isn't available yet": 2-3 hardcoded similar cities (same country/region first; Ilorin -> Lagos, Abuja, Accra)
- [x] Pick-your-city panel: Moving/Visiting (day-by-day trip plan), Life stage, taste chips (Qloo interests), Climate (ranks similar cities)
