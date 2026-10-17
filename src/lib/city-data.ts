// Mock per-city datasets. Replace with Qloo results later.
import type { Neighborhood, Place } from "./agent";

export type CityData = {
  neighborhoods: Neighborhood[];
  places: Place[];
  rent: Record<"$" | "$$" | "$$$", string>;
  transit: string;
  bank: string;
  local: string;
};

export const CITY_DATA: Record<string, CityData> = {
  "New York City": {
    rent: { $: "$1.6k–2.3k/mo", $$: "$2.3k–3.2k/mo", $$$: "$3.2k–4.5k/mo" },
    transit: "Get an OMNY card set up for the subway",
    bank: "Open a local bank account",
    local: "Find your go-to bodega — you're a New Yorker now",
    neighborhoods: [
      { name: "Bed-Stuy", borough: "Brooklyn", rent: "$$", tags: ["afrobeats", "caribbean", "spicy", "brownstone", "community", "budget", "music", "hip-hop"], why: "Brownstone blocks, West African & Caribbean food, and a deep music scene." },
      { name: "Harlem", borough: "Manhattan", rent: "$$", tags: ["afrobeats", "jazz", "soul", "spicy", "african", "student", "budget", "hip-hop", "music"], why: "Little Senegal, live jazz, and a strong student pocket near Columbia & CCNY." },
      { name: "Crown Heights", borough: "Brooklyn", rent: "$", tags: ["caribbean", "spicy", "afrobeats", "budget", "student", "coffee", "late-night"], why: "Jerk spots, roti shops and cheaper rents a short ride from Prospect Park." },
      { name: "Astoria", borough: "Queens", rent: "$$", tags: ["quiet", "coffee", "film", "indie", "greek", "food", "budget"], why: "Museum of the Moving Image, calm streets and endless cafés." },
      { name: "Williamsburg", borough: "Brooklyn", rent: "$$$", tags: ["indie", "film", "coffee", "nightlife", "vintage", "sneakers", "music"], why: "Indie cinemas, specialty coffee and boutique sneaker drops." },
      { name: "Jackson Heights", borough: "Queens", rent: "$", tags: ["spicy", "food", "budget", "student", "late-night", "diverse"], why: "One of the most diverse food streets on Earth — momos, tacos, biryani." },
      { name: "Lower East Side", borough: "Manhattan", rent: "$$$", tags: ["hip-hop", "sneakers", "late-night", "nightlife", "indie", "film"], why: "Sneaker boutiques, Metrograph cinema and late-night slices." },
      { name: "Park Slope", borough: "Brooklyn", rent: "$$$", tags: ["quiet", "coffee", "family", "indie", "film", "books"], why: "Leafy brownstone streets, bookstores and a cozy café on every corner." },
    ],
    places: [
      { name: "Accra Restaurant", category: "Restaurant", neighborhood: "Harlem", tags: ["afrobeats", "spicy", "african", "budget"], reason: "Ghanaian jollof and spicy shito at student prices." },
      { name: "Brooklyn Bazaar Afro Nights", category: "Venue", neighborhood: "Bed-Stuy", tags: ["afrobeats", "music", "nightlife"], reason: "Rotating Afrobeats & amapiano parties." },
      { name: "Glady's", category: "Restaurant", neighborhood: "Crown Heights", tags: ["spicy", "caribbean"], reason: "Jerk chicken and rum punch — Caribbean comfort." },
      { name: "Ali's Roti Shop", category: "Restaurant", neighborhood: "Bed-Stuy", tags: ["spicy", "budget", "caribbean"], reason: "Legendary Trini roti under $12." },
      { name: "Lenox Lounge Sessions", category: "Venue", neighborhood: "Harlem", tags: ["jazz", "music", "soul"], reason: "Intimate live sets in a historic room." },
      { name: "Museum of the Moving Image", category: "Venue", neighborhood: "Astoria", tags: ["film", "indie"], reason: "Rep screenings and film-history exhibits." },
      { name: "Kinship Coffee", category: "Cafe", neighborhood: "Astoria", tags: ["coffee", "quiet"], reason: "Bright, calm, laptop-friendly." },
      { name: "Nitehawk Cinema", category: "Venue", neighborhood: "Williamsburg", tags: ["film", "indie", "nightlife"], reason: "Indie films with dinner served to your seat." },
      { name: "Devoción", category: "Cafe", neighborhood: "Williamsburg", tags: ["coffee", "indie"], reason: "Fresh Colombian beans in a plant-filled loft." },
      { name: "Metrograph", category: "Venue", neighborhood: "Lower East Side", tags: ["film", "indie"], reason: "Curated 35mm screenings and a great bar." },
      { name: "Kith", category: "Shop", neighborhood: "Lower East Side", tags: ["sneakers", "hip-hop"], reason: "Drops, collabs and sneaker culture HQ." },
      { name: "Katz's Delicatessen", category: "Restaurant", neighborhood: "Lower East Side", tags: ["late-night", "food"], reason: "Pastrami at 2am — a NYC rite of passage." },
      { name: "Rocka Rolla", category: "Venue", neighborhood: "Williamsburg", tags: ["hip-hop", "nightlife", "music"], reason: "Dive bar with hip-hop DJ nights." },
      { name: "Lhasa Fast Food", category: "Restaurant", neighborhood: "Jackson Heights", tags: ["spicy", "budget", "late-night"], reason: "Hidden-in-a-phone-shop Tibetan momos." },
      { name: "Community Bookstore", category: "Shop", neighborhood: "Park Slope", tags: ["quiet", "books", "indie"], reason: "Neighborhood bookshop with a garden and a cat." },
      { name: "Joe's Pizza", category: "Restaurant", neighborhood: "Williamsburg", tags: ["late-night", "budget", "food"], reason: "Classic fold-in-half slice, open late." },
    ],
  },

  London: {
    rent: { $: "£1.3k–1.8k/mo", $$: "£1.8k–2.5k/mo", $$$: "£2.5k–3.8k/mo" },
    transit: "Set up contactless or an Oyster card for the Tube",
    bank: "Open a Monzo or high-street bank account",
    local: "Pick your local pub — you're a Londoner now",
    neighborhoods: [
      { name: "Peckham", borough: "South London", rent: "$", tags: ["afrobeats", "spicy", "budget", "student", "music", "hip-hop", "late-night", "food"], why: "Nigerian & Ghanaian food, rooftop bars and a buzzing Afro-Caribbean scene." },
      { name: "Hackney", borough: "East London", rent: "$$", tags: ["indie", "coffee", "film", "music", "sneakers", "nightlife", "jazz"], why: "Warehouse gigs, indie cinemas and specialty coffee on every corner." },
      { name: "Hampstead", borough: "North London", rent: "$$$", tags: ["quiet", "coffee", "books", "film", "family"], why: "The Heath, village lanes and calm bookshop-café afternoons." },
    ],
    places: [
      { name: "Chuku's", category: "Restaurant", neighborhood: "Peckham", tags: ["afrobeats", "spicy", "budget"], reason: "Nigerian tapas — suya, jollof and plantain." },
      { name: "Peckham Audio", category: "Venue", neighborhood: "Peckham", tags: ["afrobeats", "music", "hip-hop", "late-night"], reason: "Late-night Afroswing and grime sets." },
      { name: "Rio Cinema", category: "Venue", neighborhood: "Hackney", tags: ["film", "indie"], reason: "Art deco indie cinema since 1909." },
      { name: "Ozone Coffee", category: "Cafe", neighborhood: "Hackney", tags: ["coffee", "indie"], reason: "Roastery café with serious flat whites." },
      { name: "Kiln Ridley Road Market", category: "Shop", neighborhood: "Hackney", tags: ["spicy", "budget", "food"], reason: "Scotch bonnets, yams and street food stalls." },
      { name: "Daunt Books Hampstead", category: "Shop", neighborhood: "Hampstead", tags: ["quiet", "books"], reason: "Beautiful travel-led bookshop, perfect for slow Sundays." },
    ],
  },

  Toronto: {
    rent: { $: "C$1.9k–2.4k/mo", $$: "C$2.4k–3.0k/mo", $$$: "C$3.0k–4.0k/mo" },
    transit: "Get a PRESTO card for the TTC",
    bank: "Open an account at a big-five bank",
    local: "Grab a peameal bacon sandwich — you're a Torontonian now",
    neighborhoods: [
      { name: "Little Jamaica", borough: "Eglinton West", rent: "$", tags: ["caribbean", "spicy", "budget", "music", "hip-hop", "afrobeats"], why: "Reggae record shops, patty spots and real community roots." },
      { name: "Kensington Market", borough: "Downtown", rent: "$$", tags: ["indie", "coffee", "student", "budget", "film", "late-night", "food"], why: "Vintage stores, cheap eats and a student crowd from U of T." },
      { name: "The Annex", borough: "Midtown", rent: "$$$", tags: ["quiet", "books", "coffee", "film", "student"], why: "Victorian homes, bookshops and the Hot Docs cinema." },
    ],
    places: [
      { name: "Allwyn's Bakery", category: "Restaurant", neighborhood: "Little Jamaica", tags: ["spicy", "caribbean", "budget"], reason: "Jerk chicken and curry goat that locals swear by." },
      { name: "Afro Nights at Lula Lounge", category: "Venue", neighborhood: "Little Jamaica", tags: ["afrobeats", "music"], reason: "Afrobeats, soca and live bands." },
      { name: "Hot Docs Ted Rogers Cinema", category: "Venue", neighborhood: "The Annex", tags: ["film", "indie"], reason: "The world's biggest documentary cinema." },
      { name: "Pamenar Coffee", category: "Cafe", neighborhood: "Kensington Market", tags: ["coffee", "indie"], reason: "Third-wave coffee in the market's heart." },
      { name: "Seven Lives Tacos", category: "Restaurant", neighborhood: "Kensington Market", tags: ["spicy", "budget", "late-night"], reason: "Baja fish tacos with a permanent line." },
      { name: "Livestock", category: "Shop", neighborhood: "Kensington Market", tags: ["sneakers", "hip-hop"], reason: "Canada's sneaker boutique institution." },
    ],
  },

  Berlin: {
    rent: { $: "€900–1.2k/mo", $$: "€1.2k–1.6k/mo", $$$: "€1.6k–2.3k/mo" },
    transit: "Buy a Deutschlandticket for U-Bahn & S-Bahn",
    bank: "Do your Anmeldung and open an N26 account",
    local: "Find your Späti — you're a Berliner now",
    neighborhoods: [
      { name: "Neukölln", borough: "South-East", rent: "$", tags: ["budget", "student", "spicy", "late-night", "music", "afrobeats", "food"], why: "Cheap rent, Turkish & Arabic food streets and canal-side bars." },
      { name: "Kreuzberg", borough: "Central", rent: "$$", tags: ["hip-hop", "sneakers", "nightlife", "music", "indie", "late-night"], why: "Street art, döner at 3am and the city's hip-hop heartbeat." },
      { name: "Prenzlauer Berg", borough: "North", rent: "$$$", tags: ["quiet", "coffee", "film", "books", "family", "indie"], why: "Leafy squares, cafés and Sunday flea markets." },
    ],
    places: [
      { name: "Sahara Imbiss", category: "Restaurant", neighborhood: "Neukölln", tags: ["spicy", "budget", "african"], reason: "Sudanese peanut-sauce falafel for a few euros." },
      { name: "Afrobeats @ YAAM", category: "Venue", neighborhood: "Kreuzberg", tags: ["afrobeats", "music"], reason: "Riverside beach club with Afro & reggae nights." },
      { name: "Mustafa's Gemüse Kebap", category: "Restaurant", neighborhood: "Kreuzberg", tags: ["late-night", "budget", "food"], reason: "Berlin's most famous döner queue." },
      { name: "Overkill", category: "Shop", neighborhood: "Kreuzberg", tags: ["sneakers", "hip-hop"], reason: "Legendary sneaker store and graffiti culture hub." },
      { name: "Kino Babylon", category: "Venue", neighborhood: "Prenzlauer Berg", tags: ["film", "indie"], reason: "Historic cinema with silent films & live organ." },
      { name: "Bonanza Coffee", category: "Cafe", neighborhood: "Prenzlauer Berg", tags: ["coffee", "quiet"], reason: "One of the roasters that started Berlin's coffee wave." },
    ],
  },

  Dubai: {
    rent: { $: "AED 5k–7k/mo", $$: "AED 7k–11k/mo", $$$: "AED 11k–18k/mo" },
    transit: "Get a Nol card for the Metro",
    bank: "Get your Emirates ID and open a bank account",
    local: "Try karak chai at a corner cafeteria — you're a Dubai local now",
    neighborhoods: [
      { name: "Al Karama", borough: "Bur Dubai", rent: "$", tags: ["spicy", "budget", "food", "late-night", "student"], why: "Affordable flats and some of the city's best South Asian food." },
      { name: "Jumeirah Lake Towers", borough: "New Dubai", rent: "$$", tags: ["coffee", "music", "afrobeats", "nightlife", "hip-hop"], why: "Lakeside towers, cafés and easy access to Marina nightlife." },
      { name: "Al Barsha", borough: "Inland", rent: "$$$", tags: ["quiet", "family", "film", "sneakers", "coffee"], why: "Calm residential streets next to Mall of the Emirates." },
    ],
    places: [
      { name: "Ravi Restaurant", category: "Restaurant", neighborhood: "Al Karama", tags: ["spicy", "budget", "late-night"], reason: "Pakistani curries, open late since 1978." },
      { name: "Kizomba Afro Nights", category: "Venue", neighborhood: "Jumeirah Lake Towers", tags: ["afrobeats", "music", "nightlife"], reason: "Weekly Afrobeats & amapiano parties." },
      { name: "Nightjar Coffee", category: "Cafe", neighborhood: "Al Barsha", tags: ["coffee", "indie", "quiet"], reason: "Industrial roastery café in Alserkal-style." },
      { name: "Cinema Akil", category: "Venue", neighborhood: "Al Barsha", tags: ["film", "indie"], reason: "The UAE's only arthouse cinema." },
      { name: "Sole DXB pop-up", category: "Shop", neighborhood: "Al Barsha", tags: ["sneakers", "hip-hop"], reason: "Sneaker & streetwear culture festival drops." },
      { name: "Karama Market", category: "Shop", neighborhood: "Al Karama", tags: ["budget", "food"], reason: "Bargain stalls and street snacks." },
    ],
  },

  Lagos: {
    rent: { $: "₦250k–500k/mo", $$: "₦500k–1.2m/mo", $$$: "₦1.2m–3m/mo" },
    transit: "Learn the BRT routes and get a Cowry card",
    bank: "Open an account and set up a mobile money app",
    local: "Grab suya from your favorite mallam — you're a Lagosian now",
    neighborhoods: [
      { name: "Yaba", borough: "Mainland", rent: "$", tags: ["student", "budget", "indie", "coffee", "spicy", "music"], why: "Tech hub energy near UNILAG with cheap bukas and cafés." },
      { name: "Lekki Phase 1", borough: "Island", rent: "$$$", tags: ["afrobeats", "nightlife", "music", "hip-hop", "sneakers", "late-night"], why: "Lagos nightlife central — lounges, live Afrobeats and beach clubs." },
      { name: "Ikeja GRA", borough: "Mainland", rent: "$$", tags: ["quiet", "film", "coffee", "family", "food"], why: "Leafy, calmer streets with cinemas and the Afrikan Shrine nearby." },
    ],
    places: [
      { name: "New Afrika Shrine", category: "Venue", neighborhood: "Ikeja GRA", tags: ["afrobeats", "music", "jazz"], reason: "Fela's legendary home of Afrobeat." },
      { name: "Amala Shitta", category: "Restaurant", neighborhood: "Yaba", tags: ["spicy", "budget", "food"], reason: "Iconic amala and ewedu with peppery stew." },
      { name: "Hard Rock Lagos Afro Nights", category: "Venue", neighborhood: "Lekki Phase 1", tags: ["afrobeats", "nightlife", "hip-hop"], reason: "Big-name Afrobeats DJs by the beach." },
      { name: "Café Neo", category: "Cafe", neighborhood: "Yaba", tags: ["coffee", "student", "quiet"], reason: "Laptop-friendly Rwandan coffee near the tech hubs." },
      { name: "Filmhouse IMAX Lekki", category: "Venue", neighborhood: "Lekki Phase 1", tags: ["film"], reason: "Nollywood premieres on the big screen." },
      { name: "Alara Lagos", category: "Shop", neighborhood: "Lekki Phase 1", tags: ["sneakers", "indie"], reason: "Design concept store for African fashion." },
    ],
  },
};

export const SUPPORTED_CITY_NAMES = Object.keys(CITY_DATA);
