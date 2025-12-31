import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";
import { Button } from "@/components/ui/button";

export interface LocationData {
    zipCode: string;
    city: string;
    state: string;
    lat: number | null;
    lng: number | null;
    formattedAddress: string;
}

interface LocationAutocompleteProps {
    value: string; // Display string
    onLocationSelect: (data: LocationData) => void;
    placeholder?: string;
    className?: string;
    testId?: string;
}

export function LocationAutocomplete({
    value,
    onLocationSelect,
    placeholder = "Enter City, State or Zip",
    className,
    testId
}: LocationAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [displayValue, setDisplayValue] = useState(value || "");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    useEffect(() => {
        let active = true;

        const initAutocomplete = async () => {
            if (!inputRef.current) return;

            try {
                setIsLoading(true);
                await loadGoogleMaps();

                if (!active || !inputRef.current) return;

                // Initialize Autocomplete
                const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
                    types: ["(regions)"], // Allows Cities and Zip Codes
                    componentRestrictions: { country: "us" },
                    fields: ["address_components", "formatted_address", "geometry"],
                });

                autocomplete.addListener("place_changed", () => {
                    const place = autocomplete.getPlace();

                    if (!place.geometry) {
                        // User entered name but didn't select suggestion, or API failure
                        return;
                    }

                    // Extract components
                    let zip = "";
                    let city = "";
                    let state = "";

                    if (place.address_components) {
                        for (const c of place.address_components) {
                            if (c.types.includes("postal_code")) zip = c.short_name;
                            if (c.types.includes("locality")) city = c.long_name;
                            if (c.types.includes("administrative_area_level_1")) state = c.short_name;
                        }
                    }

                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const formattedAddress = place.formatted_address || "";

                    // If city/state missing but formatted address exists, try basic parse
                    if ((!city || !state) && formattedAddress) {
                        const parts = formattedAddress.split(',');
                        if (parts.length >= 2) {
                            if (!city) city = parts[0].trim();
                            // State is harder to parse reliably without components, but usually 2nd part
                        }
                    }

                    const locationData: LocationData = {
                        zipCode: zip,
                        city,
                        state,
                        lat,
                        lng,
                        formattedAddress
                    };

                    setDisplayValue(formattedAddress);
                    onLocationSelect(locationData);
                });

                autocompleteRef.current = autocomplete;

            } catch (err) {
                console.error("Failed to load maps", err);
            } finally {
                if (active) setIsLoading(false);
            }
        };

        initAutocomplete();

        return () => {
            active = false;
            if (autocompleteRef.current) {
                (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDisplayValue(e.target.value);
    };

    return (
        <div className={`relative ${className}`}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
            <Input
                ref={inputRef}
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
                disabled={isLoading}
                className="pl-9 h-10 border-gray-300 text-sm w-full bg-white shadow-sm"
                data-testid={testId}
                autoComplete="off"
            />
        </div>
    );
}
