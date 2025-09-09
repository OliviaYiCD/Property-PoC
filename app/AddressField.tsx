"use client";
import { useRef } from "react";
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import { parsePlace, type StructuredAddress } from "@/lib/address";

const libraries: ("places")[] = ["places"];

export default function AddressField({
  value,
  onChange,
  onVerified,
}: {
  value: string;
  onChange: (v: string) => void;
  onVerified: (details: StructuredAddress) => void; // returns structured details
}) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onPlaceChanged = () => {
    const auto = autocompleteRef.current;
    if (!auto) return;
    const place = auto.getPlace();
    if (!place || !place.formatted_address) return;

    const parsed = parsePlace(place);
    onChange(parsed.formattedAddress);
    onVerified(parsed); // pass structured data up
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY!} libraries={libraries}>
      <Autocomplete onLoad={(a) => (autocompleteRef.current = a)} onPlaceChanged={onPlaceChanged}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)} // typing clears verification in parent
          placeholder="Start typing address…"
          style={{
            width: "100%",
            padding: "12px 44px 12px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
            fontSize: 16,
            color: "#333333",
          }}
        />
      </Autocomplete>
    </LoadScript>
  );
}
