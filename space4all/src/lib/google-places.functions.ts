import { createServerFn } from "@tanstack/react-start";

export type GooglePlace = {
  id: string;
  name: string;
  address: string;
  rating?: number;
  ratingCount?: number;
  priceLevel?: string;
  mapsUri?: string;
  wheelchairEntrance?: boolean;
  wheelchairToilet?: boolean;
  wheelchairParking?: boolean;
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";
const FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.googleMapsUri",
  "places.accessibilityOptions",
  "nextPageToken",
].join(",");

export const startPlacesSession = createServerFn({ method: "POST" })
  .handler(async () => {
    const { useSession, getRequest } = await import("@tanstack/react-start/server");
    const password = process.env["VISITOR_SESSION_SECRET"];
    if (!password) throw new Error("Visitor browsing is not configured");
    const session = await useSession<{ visitorId: string }>({
      name: "space4all-visitor", password, maxAge: 24 * 60 * 60,
      cookie: { httpOnly: true, sameSite: "strict", secure: new URL(getRequest().url).protocol === "https:" },
    });
    if (!session.data.visitorId) await session.update({ visitorId: crypto.randomUUID() });
    return { ready: true };
  });

export const searchGooglePlaces = createServerFn({ method: "POST" })
  .inputValidator((d: { query: string; lang: string }) => {
    const query = String(d?.query ?? "").trim().slice(0, 100);
    if (query.length < 2) throw new Error("Query too short");
    const lang = ["en", "lt", "ru"].includes(d?.lang) ? d.lang : "en";
    return { query, lang };
  })
  .handler(async ({ data }) => {
    const { useSession, getRequest } = await import("@tanstack/react-start/server");
    const password = process.env["VISITOR_SESSION_SECRET"];
    if (!password) throw new Error("Visitor browsing is not configured");
    const session = await useSession<{ visitorId: string }>({
      name: "space4all-visitor", password, maxAge: 24 * 60 * 60,
      cookie: { httpOnly: true, sameSite: "strict", secure: new URL(getRequest().url).protocol === "https:" },
    });
    if (!session.data.visitorId) throw new Error("Start a visitor browsing session first");
    const LOVABLE_API_KEY = process.env["LOVABLE_API_KEY"];
    const GOOGLE_MAPS_API_KEY = process.env["GOOGLE_MAPS_API_KEY"];
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) throw new Error("Google Maps is not configured");

    const out: GooglePlace[] = [];
    let pageToken: string | undefined;
    // Up to 3 pages × 20 = 60 results (Google's maximum for one search)
    for (let i = 0; i < 3; i++) {
      const res = await fetch(`${GATEWAY}/places/v1/places:searchText`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
          "Content-Type": "application/json",
          "X-Goog-FieldMask": FIELDS,
        },
        body: JSON.stringify({
          textQuery: `${data.query} in Vilnius`,
          languageCode: data.lang,
          pageSize: 20,
          pageToken,
          locationRestriction: {
            rectangle: {
              low: { latitude: 54.57, longitude: 25.02 },
              high: { latitude: 54.83, longitude: 25.48 },
            },
          },
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error(`Places search failed [${res.status}]: ${body}`);
        if (out.length) break;
        throw new Error(`Google Maps search failed [${res.status}]`);
      }
      const json: any = await res.json();
      for (const p of json.places ?? []) {
        out.push({
          id: p.id,
          name: p.displayName?.text ?? "",
          address: p.formattedAddress ?? "",
          rating: p.rating,
          ratingCount: p.userRatingCount,
          priceLevel: p.priceLevel,
          mapsUri: p.googleMapsUri,
          wheelchairEntrance: p.accessibilityOptions?.wheelchairAccessibleEntrance,
          wheelchairToilet: p.accessibilityOptions?.wheelchairAccessibleRestroom,
          wheelchairParking: p.accessibilityOptions?.wheelchairAccessibleParking,
        });
      }
      pageToken = json.nextPageToken;
      if (!pageToken) break;
    }
    return out;
  });
