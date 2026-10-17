# Soft Landing

**Move anywhere, feel at home.** Soft Landing is a voice-first AI relocation agent for people moving to any city in the world. Pick your destination, tell it what you love (music, food, films, brands, vibe), and it uses Qloo's taste graph to match you with neighborhoods, venues and communities that fit, explains why each one fits, and builds a personalized "first 30 days" plan.

Live demo: https://softlandingpj.lovable.app

Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com).

## Features
- Pick any city, or type one and snap to the nearest supported city
- Voice input and spoken answers (Web Speech API), with a typing fallback
- Taste-matched neighborhood cards with match %, tags and a "why it fits" line
- "Who's moving?" life stage: young adult/student, family, senior
- Optional needs: food allergies/diet and accessibility
- A first-30-days checklist, saved in the browser

## Tech stack
- React + Vite + TypeScript, Tailwind CSS (built with Lovable)
- Qloo Taste AI API (insights, tags, search)
- Gemini (free tier) for conversation, called server-side

## Run it locally
Requirements: Node.js 18+ and npm.

```bash
git clone https://github.com/Bamioishim/softlandingpj.git
cd softlandingpj
npm install
npm run dev
```
Then open the local URL shown in the terminal (usually http://localhost:5173 or :8080).

## API keys
Keys are never committed. Set them as environment variables / server secrets:
- `QLOO_API_KEY` - your Qloo hackathon key (base URL https://hackathon.api.qloo.com, header `X-Api-Key`)
- `GEMINI_API_KEY` - a Google AI Studio key

Without keys, the app runs on built-in sample data for a set of demo cities.

## License
MIT. See [LICENSE](LICENSE).
