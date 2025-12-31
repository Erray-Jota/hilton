import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

interface ZipCodeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId?: string;
}

export function ZipCodeAutocomplete({ value, onChange, placeholder = "City or ZIP", testId }: ZipCodeAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const isInitialized = useRef(false);
  
  const [displayValue, setDisplayValue] = useState(value || "");
  
  // Track the formatted display separately from the ZIP code value
  const formattedDisplay = useRef<string>("");

  // Sync display value when value prop changes (but preserve formatted display if it's the same ZIP)
  useEffect(() => {
    if (!value) {
      setDisplayValue("");
      formattedDisplay.current = "";
      return;
    }
    
    // If we have a formatted display for this ZIP, keep using it
    if (formattedDisplay.current && formattedDisplay.current.includes(value)) {
      setDisplayValue(formattedDisplay.current);
    } else {
      // No formatted display yet, just show the ZIP
      setDisplayValue(value);
    }
  }, [value]);

  useEffect(() => {
    const initAutocomplete = async () => {
      // Only initialize once
      if (isInitialized.current || !inputRef.current) return;

      try {
        // Load Google Maps using global loader
        await loadGoogleMaps();

        if (!inputRef.current) return;

        // Create autocomplete instance
        const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
          types: ["geocode"],
          componentRestrictions: { country: "us" },
          fields: ["address_components", "formatted_address"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (place.address_components) {
            // Extract components
            const postalCode = place.address_components.find((component: any) =>
              component.types.includes("postal_code")
            );
            const city = place.address_components.find((c: any) => 
              c.types.includes("locality")
            )?.long_name;
            const state = place.address_components.find((c: any) => 
              c.types.includes("administrative_area_level_1")
            )?.short_name;

            if (postalCode) {
              // Found a ZIP code - use it for calculations
              const zipCode = postalCode.short_name;
              
              // Display as "City, ST ZIP" if we have all components
              let displayText = zipCode;
              if (city && state) {
                displayText = `${city}, ${state} ${zipCode}`;
              }
              
              // Track the formatted display for this ZIP
              formattedDisplay.current = displayText;
              
              // Update both display and value
              setDisplayValue(displayText);
              onChange(zipCode);
            } else if (city && state) {
              // No ZIP code in selection - just show city/state
              const displayText = `${city}, ${state}`;
              setDisplayValue(displayText);
              onChange("");
            }
          }
        });

        autocompleteRef.current = autocomplete;
        isInitialized.current = true;
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []); // Only run once on mount

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);

    // If user manually types a 5-digit ZIP, use it
    if (newValue.length === 5 && /^\d{5}$/.test(newValue)) {
      formattedDisplay.current = newValue;
      onChange(newValue);
    } else if (newValue === "") {
      formattedDisplay.current = "";
      onChange("");
    }
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-1.5 top-1.5 h-3 w-3 text-gray-400 z-10 pointer-events-none" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        className="pl-6 h-7 border border-gray-300 text-xs"
        data-testid={testId}
        autoComplete="off"
      />
    </div>
  );
}
