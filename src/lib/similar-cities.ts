import { resolveCity } from "./cities";

export type Climate = "warm" | "mild" | "cool";
type Supported = { name: string; code: string; climate: Climate; reason: string };

// Hardcoded comparison list (not Qloo data). Names must resolve in the city picker.
export const SUPPORTED_CITIES: Supported[] = [
  { name: "Lagos", code: "NG", climate: "warm", reason: "Nigeria's biggest city, with Afrobeats, food and creative energy" },
  { name: "Abuja", code: "NG", climate: "warm", reason: "Nigeria's planned capital, calmer and greener" },
  { name: "Accra", code: "GH", climate: "warm", reason: "West African culture, warm climate and a lively music scene" },
  { name: "Nairobi", code: "KE", climate: "mild", reason: "East Africa's tech hub with a mild highland climate" },
  { name: "Cape Town", code: "ZA", climate: "mild", reason: "Coastal South African city with outdoor living" },
  { name: "Johannesburg", code: "ZA", climate: "mild", reason: "South Africa's business and arts center" },
  { name: "Cairo", code: "EG", climate: "warm", reason: "North African history, food and nonstop city life" },
  { name: "London", code: "GB", climate: "cool", reason: "International culture, music and markets" },
  { name: "Paris", code: "FR", climate: "mild", reason: "Café life, art and French culture" },
  { name: "Lyon", code: "FR", climate: "mild", reason: "France's food capital, smaller and calmer than Paris" },
  { name: "Berlin", code: "DE", climate: "cool", reason: "Creative nightlife and moderate costs" },
  { name: "Amsterdam", code: "NL", climate: "cool", reason: "Bikes, canals and an international crowd" },
  { name: "Madrid", code: "ES", climate: "warm", reason: "Warm southern European food and street life" },
  { name: "Barcelona", code: "ES", climate: "warm", reason: "Beach city with design, food and nightlife" },
  { name: "Lisbon", code: "PT", climate: "warm", reason: "Sunny, hilly and relatively affordable" },
  { name: "Rome", code: "IT", climate: "warm", reason: "History, food and outdoor social life" },
  { name: "Stockholm", code: "SE", climate: "cool", reason: "Nordic design and calm city living" },
  { name: "New York City", code: "US", climate: "mild", reason: "Multicultural neighborhoods and major arts scenes" },
  { name: "Los Angeles", code: "US", climate: "warm", reason: "West Coast creative culture and sunshine" },
  { name: "Chicago", code: "US", climate: "cool", reason: "Music, food and lakefront neighborhoods" },
  { name: "Toronto", code: "CA", climate: "cool", reason: "One of the world's most multicultural cities" },
  { name: "Mexico City", code: "MX", climate: "mild", reason: "Latin American food and art at moderate costs" },
  { name: "Buenos Aires", code: "AR", climate: "mild", reason: "Café culture, tango and late nights" },
  { name: "Tokyo", code: "JP", climate: "mild", reason: "Excellent transit and endless food" },
  { name: "Seoul", code: "KR", climate: "mild", reason: "Fast-paced culture, fashion and food" },
  { name: "Singapore", code: "SG", climate: "warm", reason: "Tropical, safe and very diverse food" },
  { name: "Bangkok", code: "TH", climate: "warm", reason: "Street food, nightlife and low everyday costs" },
  { name: "Mumbai", code: "IN", climate: "warm", reason: "India's film and finance capital by the sea" },
  { name: "Dubai", code: "AE", climate: "warm", reason: "International Gulf city with desert heat" },
  { name: "Sydney", code: "AU", climate: "mild", reason: "Beaches and outdoor living" },
];

const REGION: Record<string, string> = {
  NG: "west-africa", GH: "west-africa", SN: "west-africa", CI: "west-africa", BJ: "west-africa", TG: "west-africa", CM: "west-africa",
  KE: "east-africa", TZ: "east-africa", UG: "east-africa", RW: "east-africa", ET: "east-africa",
  ZA: "south-africa", ZW: "south-africa", BW: "south-africa", NA: "south-africa",
  EG: "north-africa", MA: "north-africa", TN: "north-africa", DZ: "north-africa",
  GB: "europe", IE: "europe", FR: "europe", DE: "europe", NL: "europe", BE: "europe", ES: "europe", PT: "europe", IT: "europe", SE: "europe", NO: "europe", DK: "europe", FI: "europe", PL: "europe", CZ: "europe", AT: "europe", CH: "europe", GR: "europe",
  US: "north-america", CA: "north-america", MX: "latin-america", AR: "latin-america", BR: "latin-america", CO: "latin-america", PE: "latin-america", CL: "latin-america",
  JP: "east-asia", KR: "east-asia", CN: "east-asia", TW: "east-asia", SG: "southeast-asia", TH: "southeast-asia", MY: "southeast-asia", ID: "southeast-asia", VN: "southeast-asia", PH: "southeast-asia",
  IN: "south-asia", PK: "south-asia", BD: "south-asia", LK: "south-asia", AE: "middle-east", SA: "middle-east", QA: "middle-east", TR: "middle-east",
  AU: "oceania", NZ: "oceania",
};
// Curated cities use country names; the GeoNames index uses ISO codes.
const NAME_TO_CODE: Record<string, string> = {
  USA: "US", UK: "GB", France: "FR", Germany: "DE", Netherlands: "NL", Spain: "ES", Italy: "IT", Portugal: "PT", Japan: "JP", "South Korea": "KR", Singapore: "SG", China: "CN", Thailand: "TH", India: "IN", UAE: "AE", Turkey: "TR", Egypt: "EG", Nigeria: "NG", Ghana: "GH", Kenya: "KE", "South Africa": "ZA", Morocco: "MA", Canada: "CA", Mexico: "MX", Brazil: "BR", Argentina: "AR", Colombia: "CO", Australia: "AU", Sweden: "SE", Ireland: "IE", Belgium: "BE",
};
const code = (country: string) => NAME_TO_CODE[country] ?? country;

export function similarCities(city: string, climate?: Climate) {
  const target = resolveCity(city)?.city;
  const c = target ? code(target.country) : undefined;
  const region = c ? REGION[c] : undefined;
  return SUPPORTED_CITIES.filter((s) => s.name !== city && resolveCity(s.name))
    .map((s) => {
      const loc = resolveCity(s.name)!.city;
      const score = (s.code === c ? 100 : 0) + (region && REGION[s.code] === region ? 50 : 0) + (climate && s.climate === climate ? 30 : 0);
      const dist = target ? Math.hypot(loc.lat - target.lat, loc.lng - target.lng) : 0;
      return { s, score, dist };
    })
    .sort((a, b) => b.score - a.score || a.dist - b.dist)
    .slice(0, 3)
    .map(({ s }) => ({ name: s.name, reason: s.reason }));
}
