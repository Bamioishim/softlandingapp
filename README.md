# Soft Landing

**Move anywhere, feel at home.** Soft Landing is a voice-first AI relocation agent for people moving to — or just visiting — any city in the world. Pick your destination, tell it what you love (music, food, films, brands, vibe), and it uses Qloo's taste graph to match you with neighborhoods and places that fit, explains why each one fits, and builds a personalized plan.

Live demo: https://softlandingapp.lovable.app

Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com).

## Features
- Pick any city from a built-in city index, or type one and pick a suggestion
- Real Qloo Taste AI Insights API calls for places and neighborhoods in any city, made server-side with the `QLOO_API_KEY` secret (never exposed to the browser)
- Browser-based voice input (Web Speech API) and read-aloud answers (speech synthesis), with a typing fallback
- Taste chips (Food, Music, Art, Nightlife, Outdoors, Fashion, Books, Film) become Qloo interest signals
- Monthly budget and lifestyle pace are used only to rank and filter results — they are never sent to Qloo
- Life stage (Student, Young professional, Family, Retiree) adds fitting steps to your plan
- Moving mode builds a first-30-days checklist; Visiting mode builds a day-by-day trip plan
- Climate preference helps rank the similar-city suggestions
- Neighborhood cards show each neighborhood's own Qloo place photo at full resolution, or a plain card when Qloo has none — never a generic stock photo
- Match scores come from Qloo affinity signals and the taste heatmap, capped at 99%
- A "Qloo-grounded / Without Qloo" toggle: Without Qloo re-runs the search against built-in sample data, clearly labelled "Sample data, not from Qloo"
- When Qloo fails or a city isn't covered, the app says so and shows clearly labelled sample data or 2–3 similar supported cities (from a hardcoded list) instead of inventing results
- The first-30-days checklist is saved in the browser

## Tech stack
- React + Vite + TypeScript, Tailwind CSS (built with Lovable)
- Qloo Taste AI API (insights, tags, heatmap), called from a server function

## Run it locally
Requirements: Node.js 18+ and npm.

```bash
git clone https://github.com/Bamioishim/softlandingapp.git
cd softlandingapp
npm install
npm run dev
```
Then open the local URL shown in the terminal.

## API keys
Keys are never committed. Set them as environment variables / server secrets:
- `QLOO_API_KEY` - your Qloo hackathon key (base URL https://hackathon.api.qloo.com, header `X-Api-Key`)

Without a key, the app shows clearly labelled sample data instead of live Qloo results.

## License
MIT. See [LICENSE](LICENSE).
