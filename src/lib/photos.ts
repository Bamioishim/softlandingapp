import neighborhood0 from "@/assets/neighborhood-harlem.jpg.asset.json";
import neighborhood1 from "@/assets/neighborhood-crown-heights.jpg.asset.json";
import neighborhood2 from "@/assets/neighborhood-astoria.jpg.asset.json";
import neighborhood3 from "@/assets/neighborhood-williamsburg.jpg.asset.json";
import neighborhood4 from "@/assets/neighborhood-lower-east-side.jpg.asset.json";
import neighborhood5 from "@/assets/neighborhood-park-slope.jpg.asset.json";
import neighborhood6 from "@/assets/neighborhood-peckham.jpg.asset.json";
import neighborhood7 from "@/assets/neighborhood-hackney.jpg.asset.json";
import neighborhood8 from "@/assets/neighborhood-little-jamaica.jpg.asset.json";
import neighborhood9 from "@/assets/neighborhood-kensington-market.jpg.asset.json";
import neighborhood10 from "@/assets/neighborhood-yaba.jpg.asset.json";
import neighborhood11 from "@/assets/neighborhood-prenzlauer-berg.jpg.asset.json";
import neighborhood12 from "@/assets/neighborhood-neukolln.jpg.asset.json";
import bridge from "@/assets/ny-bridge.jpg.asset.json";
import nyStreet from "@/assets/ny-street.jpg.asset.json";
import nySkyline from "@/assets/ny-skyline.jpg.asset.json";
import london from "@/assets/london.jpg.asset.json";
import londonStreet from "@/assets/london-street.jpg.asset.json";
import londonRiver from "@/assets/london-river.jpg.asset.json";
import berlin from "@/assets/berlin.jpg.asset.json";
import lagos from "@/assets/lagos.jpg.asset.json";
import paris from "@/assets/paris.jpg.asset.json";
import toronto from "@/assets/toronto.jpg.asset.json";
import amsterdam from "@/assets/amsterdam.jpg.asset.json";
import tokyo from "@/assets/tokyo.jpg.asset.json";
import dubai from "@/assets/dubai.jpg.asset.json";
import sydney from "@/assets/sydney.jpg.asset.json";
import sanFrancisco from "@/assets/san-francisco.jpg.asset.json";
import cafe from "@/assets/cafe.jpg.asset.json";
import food from "@/assets/food.jpg.asset.json";
import fallback from "@/assets/fallback.jpg.asset.json";
import fallbackStreet from "@/assets/fallback-street.jpg.asset.json";
import panel from "@/assets/city-panel.jpg.asset.json";

export const CITY_PHOTOS: Record<string, string[]> = {
  "New York City": [bridge.url, nyStreet.url, nySkyline.url, panel.url],
  London: [london.url, londonStreet.url, londonRiver.url],
  Berlin: [berlin.url],
  Lagos: [lagos.url],
  Paris: [paris.url],
  Toronto: [toronto.url],
  Amsterdam: [amsterdam.url],
  Tokyo: [tokyo.url],
  Dubai: [dubai.url],
  Sydney: [sydney.url],
  "San Francisco": [sanFrancisco.url],
};
export const HERO_PHOTOS = [
  { src: fallbackStreet.url, label: "A new city awaits" },
  { src: londonStreet.url, label: "London" },
  { src: cafe.url, label: "A familiar ritual" },
  { src: lagos.url, label: "Lagos" },
  { src: amsterdam.url, label: "Amsterdam" },
];
export const DEFAULT_PANEL_PHOTO = fallbackStreet.url;
export const CAFE_PHOTO = cafe.url;
export const FOOD_PHOTO = food.url;
export function cityPhoto(city: string, index = 0): string {
  const images = CITY_PHOTOS[city] ?? [fallback.url, fallbackStreet.url];
  return images[index % images.length] ?? fallback.url;
}

export type NeighborhoodPhoto = {
  src: string;
  alt: string;
  source?: string;
  photographer?: string;
};
const NEIGHBORHOOD_PHOTOS: Record<string, NeighborhoodPhoto> = {
  "New York City:Harlem": { src: neighborhood0.url, alt: "Harlem, New York City", source: "https://unsplash.com/photos/a-city-street-at-night-with-a-lot-of-traffic-YQindhLXRSk", photographer: "Nils Huenerfuerst" },
  "New York City:Crown Heights": { src: neighborhood1.url, alt: "Crown Heights, New York City", source: "https://unsplash.com/photos/multicolored-concrete-building-during-daytime-5udBKkXTUK8", photographer: "Avi Werde" },
  "New York City:Astoria": { src: neighborhood2.url, alt: "Astoria, New York City", source: "https://unsplash.com/photos/a-bridge-that-has-a-train-going-over-it-LW4SoLwSOr4", photographer: "Louis Colbee" },
  "New York City:Williamsburg": { src: neighborhood3.url, alt: "Williamsburg, New York City", source: "https://unsplash.com/photos/colorful-townhouses-line-a-street-with-parked-cars-kMrhCnrbIFQ", photographer: "Zoshua Colah" },
  "New York City:Lower East Side": { src: neighborhood4.url, alt: "Lower East Side, New York City", source: "https://unsplash.com/photos/aerial-view-of-city-buildings-during-daytime-BfgHKeXL8r8", photographer: "Jeffrey Blum" },
  "New York City:Park Slope": { src: neighborhood5.url, alt: "Park Slope, New York City", source: "https://unsplash.com/photos/two-people-on-a-fire-escape-of-a-brick-building-d6g56zepEAs", photographer: "Bradley Andrews" },
  "London:Peckham": { src: neighborhood6.url, alt: "Peckham, London", source: "https://unsplash.com/photos/red-and-white-open-signage-during-nighttime-v0gzamJRbsE", photographer: "Alfie Chapman" },
  "London:Hackney": { src: neighborhood7.url, alt: "Hackney, London", source: "https://unsplash.com/photos/high-rise-buidling-in-front-of-street-0VW-gdXqN3Q", photographer: "Jay Clark" },
  "Toronto:Little Jamaica": { src: neighborhood8.url, alt: "Little Jamaica, Toronto", source: "https://unsplash.com/photos/a-lit-up-sign-dominates-a-nighttime-scene-jWshdRO5VBc", photographer: "Yichen Wang" },
  "Toronto:Kensington Market": { src: neighborhood9.url, alt: "Kensington Market, Toronto", source: "https://unsplash.com/photos/people-sitting-at-outdoor-cafe-on-sunny-street-xMgzSfoy64E", photographer: "Harman Tatla" },
  "Lagos:Yaba": { src: neighborhood10.url, alt: "Yaba, Lagos", source: "https://unsplash.com/photos/city-skyline-at-daytime-EBcKOqWzc9M", photographer: "Stephen Olatunde" },
  "Berlin:Prenzlauer Berg": { src: neighborhood11.url, alt: "Prenzlauer Berg, Berlin", source: "https://unsplash.com/photos/a-city-street-filled-with-lots-of-traffic-next-to-tall-buildings-Rci43rcuOtM", photographer: "Dominik Hofer" },
  "Berlin:Neuk\u00f6lln": { src: neighborhood12.url, alt: "Neuk\u00f6lln, Berlin", source: "https://unsplash.com/photos/painted-house-interior-I2UEWKTgCng", photographer: "brandon siu" }
};

export function neighborhoodPhoto(city: string, neighborhood: string, index = 0): NeighborhoodPhoto {
  return NEIGHBORHOOD_PHOTOS[`${city}:${neighborhood}`] ?? {
    src: cityPhoto(city, index),
    alt: `${city} city view`,
  };
}
