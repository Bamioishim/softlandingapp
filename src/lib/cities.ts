// World city data for the destination picker. Mock/static for now.
// `supported` indicates same-city sample availability, not Qloo coverage.

export type City = {
  name: string;
  country: string;
  lat: number;
  lng: number;
  supported: boolean;
};

import { SUPPORTED_CITY_NAMES } from "./city-data";
import worldCities from "./world-cities.json";

const RAW_CITIES: City[] = [
  // Availability is derived from each city's own mock dataset below.
  { name: "New York City", country: "USA", lat: 40.7128, lng: -74.006, supported: true },
  { name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437, supported: true },
  { name: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298, supported: true },
  { name: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194, supported: true },
  { name: "Miami", country: "USA", lat: 25.7617, lng: -80.1918, supported: true },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, supported: true },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, supported: true },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405, supported: true },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, supported: true },
  { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038, supported: true },
  { name: "Barcelona", country: "Spain", lat: 41.3874, lng: 2.1686, supported: true },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, supported: true },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393, supported: true },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, supported: true },
  { name: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023, supported: true },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.978, supported: true },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, supported: true },
  { name: "Hong Kong", country: "China", lat: 22.3193, lng: 114.1694, supported: true },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, supported: true },
  { name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777, supported: true },
  { name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025, supported: true },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, supported: true },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, supported: true },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, supported: true },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, supported: true },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219, supported: true },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241, supported: true },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, supported: true },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631, supported: true },
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lng: 174.7633, supported: true },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, supported: true },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207, supported: true },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, supported: true },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, supported: true },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729, supported: true },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816, supported: true },
  { name: "Bogotá", country: "Colombia", lat: 4.711, lng: -74.0721, supported: true },
  { name: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428, supported: true },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686, supported: true },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683, supported: true },

  // Well-known but not yet supported — used to snap to nearest supported city
  { name: "Boston", country: "USA", lat: 42.3601, lng: -71.0589, supported: false },
  { name: "Seattle", country: "USA", lat: 47.6062, lng: -122.3321, supported: false },
  { name: "Austin", country: "USA", lat: 30.2672, lng: -97.7431, supported: false },
  { name: "Denver", country: "USA", lat: 39.7392, lng: -104.9903, supported: false },
  { name: "Atlanta", country: "USA", lat: 33.749, lng: -84.388, supported: false },
  { name: "Montreal", country: "Canada", lat: 45.5017, lng: -73.5673, supported: false },
  { name: "Manchester", country: "UK", lat: 53.4808, lng: -2.2426, supported: false },
  { name: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603, supported: false },
  { name: "Munich", country: "Germany", lat: 48.1351, lng: 11.582, supported: false },
  { name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738, supported: false },
  { name: "Prague", country: "Czechia", lat: 50.0755, lng: 14.4378, supported: false },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122, supported: false },
  { name: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275, supported: false },
  { name: "Milan", country: "Italy", lat: 45.4642, lng: 9.19, supported: false },
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417, supported: false },
  { name: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522, supported: false },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lng: 24.9384, supported: false },
  { name: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681, supported: false },
  { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, supported: false },
  { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737, supported: false },
  { name: "Taipei", country: "Taiwan", lat: 25.033, lng: 121.5654, supported: false },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lng: 101.6869, supported: false },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456, supported: false },
  { name: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946, supported: false },
  { name: "Tel Aviv", country: "Israel", lat: 32.0853, lng: 34.7818, supported: false },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753, supported: false },
  { name: "Accra", country: "Ghana", lat: 5.6037, lng: -0.187, supported: false },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473, supported: false },
  { name: "Brisbane", country: "Australia", lat: -27.4698, lng: 153.0251, supported: false },
  { name: "Wellington", country: "New Zealand", lat: -41.2865, lng: 174.7762, supported: false },
  { name: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693, supported: false },
  { name: "Medellín", country: "Colombia", lat: 6.2442, lng: -75.5812, supported: false },
  { name: "Havana", country: "Cuba", lat: 23.1136, lng: -82.3666, supported: false },
];

export const CITIES: City[] = RAW_CITIES.map((c) => ({ ...c, supported: SUPPORTED_CITY_NAMES.includes(c.name) }));

const SUPPORTED = CITIES.filter((c) => c.supported);

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const WORLD_CITY_INDEX = new Map<string, City>();
for (const row of worldCities) {
  const [aliases, lat, lng, country] = row;
  if (!Array.isArray(aliases) || typeof lat !== "number" || typeof lng !== "number" || typeof country !== "string") continue;
  const name = aliases[0];
  if (typeof name !== "string") continue;
  for (const alias of aliases) {
    if (typeof alias === "string" && !WORLD_CITY_INDEX.has(norm(alias))) {
      WORLD_CITY_INDEX.set(norm(alias), { name, lat, lng, country, supported: false });
    }
  }
}

function haversineKm(a: City, b: City): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function searchCities(query: string, limit = 6): City[] {
  const q = norm(query);
  if (!q) return [];
  // Curated cities come last so they win the name dedupe over GeoNames entries.
  const matches = [...new Map([...WORLD_CITY_INDEX.values()].map((c) => [c.name, c])).values(), ...CITIES];
  return [...new Map(matches.filter((c) => norm(c.name).includes(q) || norm(c.country).includes(q)).map((c) => [c.name, c])).values()].slice(0, limit);
}

export type CityResolution = {
  city: City; // the city actually used
  snappedFrom?: City; // set when the requested city wasn't supported
  distanceKm?: number;
};

export function resolveCity(query: string): CityResolution | null {
  const q = norm(query);
  if (!q) return null;

  const exact = CITIES.find((c) => norm(c.name) === q);
  if (exact) return { city: exact };
  const worldwide = WORLD_CITY_INDEX.get(q);
  return worldwide ? { city: worldwide } : null;
}

export function nearestSupported(from: City): City {
  const first = SUPPORTED[0];
  if (!first) throw new Error("No supported destinations available");
  return SUPPORTED.reduce((best, c) => (haversineKm(from, c) < haversineKm(from, best) ? c : best), first);
}

// ISO-3166 alpha-2 codes for the countries in the city list, used to build flag emoji.
const COUNTRY_CODES: Record<string, string> = {
  USA: "US", UK: "GB", France: "FR", Germany: "DE", Netherlands: "NL", Spain: "ES", Italy: "IT",
  Portugal: "PT", Japan: "JP", "South Korea": "KR", Singapore: "SG", China: "CN", Thailand: "TH",
  India: "IN", UAE: "AE", Turkey: "TR", Egypt: "EG", Nigeria: "NG", Kenya: "KE", "South Africa": "ZA",
  Australia: "AU", "New Zealand": "NZ", Canada: "CA", Mexico: "MX", Brazil: "BR", Argentina: "AR",
  Colombia: "CO", Peru: "PE", Sweden: "SE", Denmark: "DK", Ireland: "IE", Austria: "AT", Czechia: "CZ",
  Greece: "GR", Switzerland: "CH", Norway: "NO", Finland: "FI", Taiwan: "TW", Malaysia: "MY",
  Indonesia: "ID", Israel: "IL", "Saudi Arabia": "SA", Ghana: "GH", Chile: "CL", Cuba: "CU",
};

/** Flag emoji for a country name, or "" when unknown. */
export function flagForCountry(country: string): string {
  const code = COUNTRY_CODES[country.trim()];
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((ch) => 0x1f1e6 + (ch.charCodeAt(0) - 65)),
  );
}

/** Flag emoji for a city's country. */
export function flagForCity(city: City): string {
  return flagForCountry(city.country);
}
