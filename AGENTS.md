<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Live Qloo calls cross the agent.functions.ts server boundary; qloo.ts validates and maps provider responses while sample-agent.ts contains isolated failure-only samples, so secrets remain server-only and UI stays shared.
- Recommendations require a recognized explicit destination, independent of sample coverage; never substitute another city, to retain destination integrity.
- Keep city photograph references centralized in src/lib/photos.ts so destination imagery changes consistently without changing the mock agent.
- Neighborhood photo lookup uses city-and-neighborhood keys with source attribution; unavailable exact-location photos are explicitly labeled city views to avoid false geographic claims.
- Use shared Button, NeighborhoodCard and Timeline presentation for landing previews and chat so both experiences retain consistent controls and checklist storage.
- Resolve cities from the local GeoNames index (CC BY 4.0) without geographic snapping; unrecognized text remains unselected to prevent arbitrary destinations.
- Map verified Qloo place locality labels to neighborhood cards and estimate affinity from nearby heatmap cells explicitly; never fabricate labels, housing prices, or missing scores.
- City requests use an insert-only public table with no visitor read permission, so visitors can submit requests without exposing other submissions.
