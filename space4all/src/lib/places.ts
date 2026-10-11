import type { Lang } from "./i18n";

export type Category = "cafe" | "shop" | "public";
export type Noise = "quiet" | "moderate" | "loud";
export type Feature =
  | "wheelchair"
  | "stepFree"
  | "accessibleToilet"
  | "braille"
  | "hearingLoop"
  | "guideDog"
  | "parking"
  | "elevator";

export type Place = {
  id: string;
  name: string;
  category: Category;
  address: string;
  lat: number;
  lng: number;
  price: 1 | 2 | 3;
  noise: Noise;
  features: Feature[];
  description: Record<Lang, string>;
  priceList: { item: Record<Lang, string>; eur: number }[];
  transit: { mode: "bus" | "trolleybus"; lines: string[]; stop: string; walkMin: number; lowFloor: boolean };
};

export const FEATURES: Feature[] = [
  "wheelchair",
  "stepFree",
  "accessibleToilet",
  "elevator",
  "braille",
  "hearingLoop",
  "guideDog",
  "parking",
];

const coffee = { en: "Coffee (cappuccino)", lt: "Kava (kapučino)", ru: "Кофе (капучино)" };
const cake = { en: "Piece of cake", lt: "Pyrago gabalėlis", ru: "Кусок торта" };
const lunch = { en: "Lunch meal", lt: "Pietų patiekalas", ru: "Обед" };
const ticket = { en: "Entry ticket", lt: "Įėjimo bilietas", ru: "Входной билет" };
const groceries = { en: "Bread & milk", lt: "Duona ir pienas", ru: "Хлеб и молоко" };
const tshirt = { en: "T-shirt", lt: "Marškinėliai", ru: "Футболка" };
const free = { en: "Entry", lt: "Įėjimas", ru: "Вход" };

export const PLACES: Place[] = [
  {
    id: "lnb-library",
    name: "Martynas Mažvydas National Library",
    category: "public",
    address: "Gedimino pr. 51, Vilnius",
    lat: 54.6898,
    lng: 25.2633,
    price: 1,
    noise: "quiet",
    features: ["wheelchair", "stepFree", "accessibleToilet", "elevator", "braille", "hearingLoop", "guideDog"],
    description: {
      en: "Bright, calm national library with ramps, lifts on every floor and a dedicated room with Braille and audio books.",
      lt: "Šviesi, rami nacionalinė biblioteka su pandusais, liftais visuose aukštuose ir atskira salė su Brailio bei garsinėmis knygomis.",
      ru: "Светлая, тихая национальная библиотека с пандусами, лифтами на всех этажах и залом с книгами Брайля и аудиокнигами.",
    },
    priceList: [{ item: free, eur: 0 }, { item: coffee, eur: 2.8 }],
    transit: { mode: "trolleybus", lines: ["7", "12", "15"], stop: "Tauro g.", walkMin: 3, lowFloor: true },
  },
  {
    id: "akropolis",
    name: "Akropolis Vilnius",
    category: "shop",
    address: "Ozo g. 25, Vilnius",
    lat: 54.7105,
    lng: 25.2635,
    price: 2,
    noise: "loud",
    features: ["wheelchair", "stepFree", "accessibleToilet", "elevator", "parking", "guideDog"],
    description: {
      en: "Large shopping centre, fully step-free with wide aisles, lifts and reserved parking near every entrance. Can be busy and loud on weekends.",
      lt: "Didelis prekybos centras be laiptų, su plačiais praėjimais, liftais ir rezervuotomis vietomis prie kiekvieno įėjimo. Savaitgaliais gali būti triukšminga.",
      ru: "Большой торговый центр без ступеней, с широкими проходами, лифтами и парковкой у каждого входа. В выходные бывает шумно.",
    },
    priceList: [{ item: tshirt, eur: 12 }, { item: lunch, eur: 8.5 }],
    transit: { mode: "bus", lines: ["2G", "3G", "10"], stop: "Akropolis", walkMin: 2, lowFloor: true },
  },
  {
    id: "cathedral-square",
    name: "Cathedral Square",
    category: "public",
    address: "Katedros a., Vilnius",
    lat: 54.6858,
    lng: 25.2877,
    price: 1,
    noise: "moderate",
    features: ["wheelchair", "stepFree", "guideDog"],
    description: {
      en: "The heart of the city. Flat, smooth paving across the square; the cathedral has a ramp on the side entrance.",
      lt: "Miesto širdis. Lygi aikštės danga; katedra turi pandusą prie šoninio įėjimo.",
      ru: "Сердце города. Ровное покрытие площади; у бокового входа собора есть пандус.",
    },
    priceList: [{ item: free, eur: 0 }],
    transit: { mode: "bus", lines: ["10", "33", "89"], stop: "Katedros a.", walkMin: 2, lowFloor: true },
  },
  {
    id: "caffeine-gedimino",
    name: "Caffeine Gedimino",
    category: "cafe",
    address: "Gedimino pr. 9, Vilnius",
    lat: 54.6872,
    lng: 25.2797,
    price: 2,
    noise: "moderate",
    features: ["wheelchair", "stepFree", "guideDog"],
    description: {
      en: "Popular coffee spot with a level entrance and movable chairs. Quieter in the morning before 10:00.",
      lt: "Populiari kavinė su lygiu įėjimu ir kilnojamomis kėdėmis. Ramiau ryte iki 10:00.",
      ru: "Популярная кофейня с ровным входом и передвижными стульями. Тише утром до 10:00.",
    },
    priceList: [{ item: coffee, eur: 3.6 }, { item: cake, eur: 4.2 }],
    transit: { mode: "trolleybus", lines: ["2", "3", "4"], stop: "Vinco Kudirkos a.", walkMin: 3, lowFloor: true },
  },
  {
    id: "vero-cafe",
    name: "Vero Cafe Vilniaus",
    category: "cafe",
    address: "Vilniaus g. 22, Vilnius",
    lat: 54.6853,
    lng: 25.278,
    price: 1,
    noise: "quiet",
    features: ["stepFree", "accessibleToilet", "guideDog"],
    description: {
      en: "Cozy and affordable café with soft lighting and calm music. Staff happy to read the menu aloud.",
      lt: "Jauki ir nebrangi kavinė su švelniu apšvietimu ir ramia muzika. Personalas mielai perskaito meniu.",
      ru: "Уютное недорогое кафе с мягким светом и спокойной музыкой. Персонал охотно прочитает меню вслух.",
    },
    priceList: [{ item: coffee, eur: 2.5 }, { item: cake, eur: 3.2 }],
    transit: { mode: "bus", lines: ["1", "33"], stop: "Vilniaus g.", walkMin: 4, lowFloor: true },
  },
  {
    id: "panorama",
    name: "Panorama Shopping Centre",
    category: "shop",
    address: "Saltoniškių g. 9, Vilnius",
    lat: 54.699,
    lng: 25.258,
    price: 2,
    noise: "moderate",
    features: ["wheelchair", "stepFree", "accessibleToilet", "elevator", "parking", "hearingLoop"],
    description: {
      en: "Modern mall with automatic doors, hearing loop at the info desk and accessible toilets on each floor.",
      lt: "Modernus centras su automatinėmis durimis, indukcine kilpa informacijoje ir pritaikytais tualetais kiekviename aukšte.",
      ru: "Современный центр с автоматическими дверями, индукционной петлёй на стойке информации и туалетами на каждом этаже.",
    },
    priceList: [{ item: tshirt, eur: 15 }, { item: groceries, eur: 2.4 }],
    transit: { mode: "trolleybus", lines: ["1", "7", "16"], stop: "Panorama", walkMin: 1, lowFloor: true },
  },
  {
    id: "hales-market",
    name: "Hales Market (Halės turgus)",
    category: "shop",
    address: "Pylimo g. 58, Vilnius",
    lat: 54.674,
    lng: 25.287,
    price: 1,
    noise: "loud",
    features: ["stepFree"],
    description: {
      en: "Historic food market with great prices. Lively and crowded; uneven floor in some areas.",
      lt: "Istorinis maisto turgus su geromis kainomis. Gyvas ir perpildytas; kai kur nelygios grindys.",
      ru: "Исторический продуктовый рынок с хорошими ценами. Шумно и людно; местами неровный пол.",
    },
    priceList: [{ item: groceries, eur: 1.9 }, { item: lunch, eur: 6 }],
    transit: { mode: "bus", lines: ["4G", "10", "11"], stop: "Halės turgus", walkMin: 1, lowFloor: true },
  },
  {
    id: "cac",
    name: "Contemporary Art Centre (CAC)",
    category: "public",
    address: "Vokiečių g. 2, Vilnius",
    lat: 54.6787,
    lng: 25.2855,
    price: 2,
    noise: "quiet",
    features: ["wheelchair", "stepFree", "accessibleToilet", "elevator", "guideDog"],
    description: {
      en: "Spacious art centre with lifts to all galleries and benches in every hall. Free entry on Wednesdays.",
      lt: "Erdvus meno centras su liftais į visas galerijas ir suolais kiekvienoje salėje. Trečiadieniais įėjimas nemokamas.",
      ru: "Просторный центр искусств с лифтами во все залы и скамейками. По средам вход бесплатный.",
    },
    priceList: [{ item: ticket, eur: 5 }, { item: coffee, eur: 3 }],
    transit: { mode: "bus", lines: ["10", "11", "33"], stop: "Vokiečių g.", walkMin: 3, lowFloor: true },
  },
  {
    id: "vingis-park",
    name: "Vingis Park",
    category: "public",
    address: "M. K. Čiurlionio g. 100, Vilnius",
    lat: 54.6835,
    lng: 25.235,
    price: 1,
    noise: "quiet",
    features: ["wheelchair", "stepFree", "guideDog", "parking"],
    description: {
      en: "Largest park in the city with long paved paths, plenty of benches and peaceful green spaces.",
      lt: "Didžiausias miesto parkas su ilgais asfaltuotais takais, daug suolų ir ramių žalių erdvių.",
      ru: "Крупнейший парк города с длинными асфальтированными дорожками, скамейками и тихой зеленью.",
    },
    priceList: [{ item: free, eur: 0 }],
    transit: { mode: "trolleybus", lines: ["7", "15"], stop: "Vingio parkas", walkMin: 5, lowFloor: true },
  },
  {
    id: "huracan-coffee",
    name: "Huracan Coffee",
    category: "cafe",
    address: "Trakų g. 7, Vilnius",
    lat: 54.6812,
    lng: 25.2802,
    price: 2,
    noise: "loud",
    features: ["guideDog"],
    description: {
      en: "Energetic café with great coffee and music. One small step at the entrance; staff will help with a portable ramp.",
      lt: "Energinga kavinė su puikia kava ir muzika. Prie įėjimo vienas laiptelis; personalas padės su nešiojamu pandusu.",
      ru: "Энергичное кафе с отличным кофе и музыкой. У входа одна ступенька; персонал поможет с переносным пандусом.",
    },
    priceList: [{ item: coffee, eur: 3.8 }, { item: cake, eur: 4.5 }],
    transit: { mode: "bus", lines: ["1", "4G"], stop: "Pylimo g.", walkMin: 4, lowFloor: false },
  },
];

export const directionsUrl = (p: Place) =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=transit`;
export const mapUrl = (p: Place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ", " + p.address)}`;
export const embedUrl = (p: Place, lang: Lang) =>
  `https://maps.google.com/maps?q=${p.lat},${p.lng}&z=16&hl=${lang}&output=embed`;
