export type StructuredAddress = {
    formattedAddress: string;
    lat: number | null;
    lng: number | null;
    unit?: string | null;
    streetNumber?: string | null;
    street?: string | null;
    suburb?: string | null;
    state?: string | null;
    postcode?: string | null;
    country?: string | null;
  };
  
  export function parsePlace(place: any): StructuredAddress {
    const comps = place?.address_components || [];
    const get = (
      type: string,
      field: "short_name" | "long_name" = "short_name"
    ) => comps.find((c: any) => c.types?.includes(type))?.[field] ?? null;
  
    const lat = place?.geometry?.location?.lat?.() ?? null;
    const lng = place?.geometry?.location?.lng?.() ?? null;
  
    return {
      formattedAddress: place?.formatted_address || "",
      lat,
      lng,
      unit: get("subpremise"),
      streetNumber: get("street_number"),
      street: get("route", "long_name"),
      suburb: get("locality", "long_name") || get("postal_town", "long_name"),
      state: get("administrative_area_level_1"),
      postcode: get("postal_code"),
      country: get("country"),
    };
  }
  