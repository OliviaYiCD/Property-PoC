export type StructuredAddress = {
    formattedAddress: string;
    lat: number | null;
    lng: number | null;
    unit?: string | null;             // subpremise (e.g., Unit 5)
    streetNumber?: string | null;     // street_number
    street?: string | null;           // route
    suburb?: string | null;           // locality / postal_town
    state?: string | null;            // administrative_area_level_1
    postcode?: string | null;         // postal_code
    country?: string | null;          // country short_name
  };
  
  export function parsePlace(place: google.maps.places.PlaceResult): StructuredAddress {
    const comp = place.address_components || [];
    const get = (type: string, field: "short_name" | "long_name" = "short_name") =>
      comp.find(c => c.types.includes(type))?.[field] ?? null;
  
    const lat = place.geometry?.location?.lat?.() ?? null;
    const lng = place.geometry?.location?.lng?.() ?? null;
  
    return {
      formattedAddress: place.formatted_address || "",
      lat, lng,
      unit: get("subpremise"),
      streetNumber: get("street_number"),
      street: get("route", "long_name"),
      suburb: get("locality", "long_name") || get("postal_town", "long_name"),
      state: get("administrative_area_level_1"),
      postcode: get("postal_code"),
      country: get("country"),
    };
  }
  