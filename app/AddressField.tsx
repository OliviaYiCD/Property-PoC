"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  onVerified?: (ok: boolean) => void; // true when Google verifies the address
};

export default function AddressField({
  value = "",
  onChange,
  onVerified,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [ready, setReady] = useState(false);

  // Detect when Google Places script has loaded
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    function checkReady() {
      if ((window as any).google?.maps?.places?.Autocomplete) {
        setReady(true);
      } else {
        timeout = setTimeout(checkReady, 150);
      }
    }
    checkReady();
    return () => clearTimeout(timeout);
  }, []);

  // Initialize Autocomplete once ready
  useEffect(() => {
    if (!ready || !inputRef.current) return;

    const { google } = window as any;
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["address_components", "formatted_address", "geometry"],
      types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const formatted = place?.formatted_address || inputRef.current!.value;
      onChange?.(formatted);
      onVerified?.(!!place?.address_components);
    });

    return () => google.maps.event.clearInstanceListeners(autocomplete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div className="w-full">

<input
  ref={inputRef}
  type="text"
  value={value}                          // <— was defaultValue
  placeholder="Enter an address"
  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-[#cc3369]"
  onChange={(e) => {
    onChange?.(e.target.value);
    onVerified?.(false);                 // typing clears verification until Google confirms
  }}
/>


      {!ready && (
        <div className="mt-1 text-sm text-gray-500">
          Loading address suggestions…
        </div>
      )}
    </div>
  );
}