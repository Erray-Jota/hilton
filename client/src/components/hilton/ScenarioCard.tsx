
import { useState, useEffect, useRef, memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LocationAutocomplete, type LocationData } from "@/components/LocationAutocomplete";
import { type ScenarioState, type CostData } from "./types";

import home2Logo from "@assets/image_1761855288699.png";
import truLogo from "@assets/image_1761855297911.png";
import hamptonLogo from "@assets/image_1761855304033.png";
import livsmartLogo from "@assets/image_1761855309928.png";

const brandLogos: Record<string, string> = {
    "Home2 Suites": home2Logo,
    "Tru by Hilton": truLogo,
    "Hampton Inn & Suites": hamptonLogo,
    "LivSmart": livsmartLogo
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
};

interface ScenarioCardProps {
    title: string;
    scenario: ScenarioState;
    data: CostData;
    onUpdate: (updates: Partial<ScenarioState>) => void;
    headerColor: string;
    isMobile?: boolean;
    hideMetrics?: boolean;
    logoHeight?: string;
}

interface RoomOption {
    rooms: number;
    floors: number;
}

export const ScenarioCard = memo(({
    title,
    scenario,
    data,
    onUpdate,
    headerColor,
    isMobile = false,
    hideMetrics = false,
    logoHeight
}: ScenarioCardProps) => {

    const [localRooms, setLocalRooms] = useState(scenario.rooms);
    const [availableOptions, setAvailableOptions] = useState<RoomOption[]>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Fetch available options when brand changes
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Encode brand to handle spaces
                const res = await fetch(`/api/hilton/options/${encodeURIComponent(scenario.brand)}`);
                if (res.ok) {
                    const opts = await res.json();
                    setAvailableOptions(opts);
                }
            } catch (e) {
                console.error("Failed to fetch brand options", e);
            }
        };
        fetchOptions();
    }, [scenario.brand]);

    // Derived filtered room options based on current floors
    const validRooms = useMemo(() => {
        if (availableOptions.length === 0) return [];
        // Filter by current floor
        const byFloor = availableOptions.filter(o => o.floors === scenario.floors);
        // If no matches for floor, maybe fallback to all? Or strict? 
        // User wants "click to # rooms in database".
        // Let's show All if floor filtering yields nothing, otherwise strict floor match.
        const relevant = byFloor.length > 0 ? byFloor : availableOptions;

        // Extract unique room counts sorted
        const rooms = Array.from(new Set(relevant.map(r => r.rooms))).sort((a, b) => a - b);
        return rooms;
    }, [availableOptions, scenario.floors]);

    // Sync local rooms if scenario changes externally
    useEffect(() => {
        setLocalRooms(scenario.rooms);
    }, [scenario.rooms]);


    const handleRoomsChange = (val: number[]) => {
        // Validation: Slider returns an index if we map steps?
        // Actually, if we use 'step=1' but want to snap, we can't easily do it with standard range input unless we build a custom stepper or map index -> value.
        // Let's use Index mapping strategy.
        // val[0] is the Index. 
        const index = val[0];
        if (validRooms.length > 0 && index >= 0 && index < validRooms.length) {
            const snappedRooms = validRooms[index];
            setLocalRooms(snappedRooms);

            // Immediate update or debounce?
            // Debounce for network calls
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                onUpdate({ rooms: snappedRooms });
            }, 250);
        } else {
            // Fallback for when data is loading or empty -> treat as direct numeric input? 
            // Unlikely if logic is correct.
            setLocalRooms(index); // Should not happen with index logic
        }
    };

    const handleLocationSelect = (loc: LocationData) => {
        onUpdate({
            location: loc.formattedAddress,
            lat: loc.lat,
            lng: loc.lng
        });
    };

    // Find index of current rooms in validRooms for the slider position
    // If exact match not found (e.g. cross-contamination), find closest
    const currentSliderIndex = useMemo(() => {
        if (validRooms.length === 0) return 0;
        const exact = validRooms.indexOf(localRooms);
        if (exact !== -1) return exact;
        // Closest
        let closest = 0;
        let minDiff = Infinity;
        validRooms.forEach((r, i) => {
            const diff = Math.abs(r - localRooms);
            if (diff < minDiff) {
                minDiff = diff;
                closest = i;
            }
        });
        return closest;
    }, [validRooms, localRooms]);

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
            {/* 1. Header - hidden on mobile via CSS, visible on desktop */}
            <div
                className={`py-2 px-4 text-white font-bold text-lg ${isMobile ? 'hidden lg:block' : ''}`}
                style={{ backgroundColor: headerColor }}
            >
                {title}
            </div>

            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                {/* 2. Top Metrics Row - Conditional render */}
                {!hideMetrics && (
                    <div className={`sticky lg:static top-14 lg:top-0 z-40 bg-white -mx-3 px-3 py-2 lg:mx-0 lg:px-0 lg:py-0 ${isMobile ? 'hidden lg:block' : ''}`}>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                            {/* Total Cost - Dark Blue */}
                            <div className="bg-[#003f87] text-white p-2 md:p-3 rounded-lg shadow-sm min-h-[50px] md:min-h-[60px] transition-transform duration-200 hover:scale-[1.02]">
                                <div className="text-[10px] md:text-[10px] opacity-80 uppercase font-semibold tracking-wide">Total Cost</div>
                                <div className="text-base md:text-xl font-bold truncate mt-0.5" title={formatCurrency(data.totalLocal)}>
                                    {formatCurrency(data.totalLocal)}
                                </div>
                            </div>
                            {/* Cost/Room - White with Yellow Border */}
                            <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm border-t-4 border-yellow-400 border border-gray-100 min-h-[50px] md:min-h-[60px] transition-transform duration-200 hover:scale-[1.02]">
                                <div className="text-[10px] md:text-[10px] text-gray-500 uppercase font-bold tracking-wide">Cost/Room</div>
                                <div className="text-base md:text-xl font-bold text-[#003f87] truncate mt-0.5">
                                    {formatCurrency(data.costPerKey)}
                                </div>
                            </div>
                            {/* Cost/SF - White */}
                            <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm border border-gray-200 min-h-[50px] md:min-h-[60px] transition-transform duration-200 hover:scale-[1.02]">
                                <div className="text-[10px] md:text-[10px] text-gray-500 uppercase font-bold tracking-wide">Cost/SF</div>
                                <div className="text-base md:text-xl font-bold text-[#003f87] truncate mt-0.5">
                                    {formatCurrency(data.costPerSf)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Inputs Section - Compact spacing on mobile */}
                <div className="space-y-2 md:space-y-3">
                    {/* Brand Row */}
                    <div>
                        <label className="text-xs md:text-xs font-semibold text-gray-600 mb-1 block">Brand</label>
                        <div className="flex gap-2 md:gap-3 items-center">
                            <Select value={scenario.brand} onValueChange={(v) => onUpdate({ brand: v })}>
                                <SelectTrigger className="w-full min-h-[36px] h-9 md:h-10 text-sm transition-colors"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Home2 Suites">Home2 Suites</SelectItem>
                                    <SelectItem value="Tru by Hilton">Tru by Hilton</SelectItem>
                                    <SelectItem value="Hampton Inn & Suites">Hampton</SelectItem>
                                    <SelectItem value="LivSmart">LivSmart</SelectItem>
                                </SelectContent>
                            </Select>
                            {brandLogos[scenario.brand] && (
                                <div className="flex-shrink-0 flex justify-end ml-2">
                                    <img
                                        src={brandLogos[scenario.brand]}
                                        alt="Brand"
                                        className={`${logoHeight || 'h-8 md:h-12'} object-contain`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location & Floors Row */}
                    <div className="grid grid-cols-12 gap-2 md:gap-3">
                        <div className="col-span-8">
                            <label className="text-xs md:text-xs font-semibold text-gray-600 mb-1 block">Location</label>
                            <LocationAutocomplete
                                value={scenario.location}
                                onLocationSelect={handleLocationSelect}
                                placeholder="City or ZIP"
                                className="min-h-[36px] h-9 md:h-10 text-sm"
                            />
                            {scenario.zipLocation && (
                                <div className="text-[8px] md:text-[10px] text-green-600 flex items-center gap-1 mt-1">
                                    <span>✓</span> Factor: {scenario.zipFactor?.toFixed(2)}x
                                </div>
                            )}
                        </div>
                        <div className="col-span-4">
                            <label className="text-xs md:text-xs font-semibold text-gray-600 mb-1 block">Floors</label>
                            <Select value={scenario.floors.toString()} onValueChange={(v) => onUpdate({ floors: parseInt(v) })}>
                                <SelectTrigger className="min-h-[36px] h-9 md:h-10 w-full text-sm transition-colors"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Rooms Slider Row */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs md:text-xs font-semibold text-gray-600">Rooms</label>
                            <span className="text-base md:text-lg font-bold text-[#003f87]">{localRooms}</span>
                        </div>

                        {validRooms.length > 0 ? (
                            <Slider
                                value={[currentSliderIndex]}
                                min={0}
                                max={validRooms.length - 1}
                                step={1}
                                onValueChange={handleRoomsChange}
                                className="py-1"
                            />
                        ) : (
                            // Fallback if no data loaded yet
                            <Slider
                                value={[localRooms]}
                                min={60}
                                max={200}
                                step={1}
                                onValueChange={(v) => {
                                    setLocalRooms(v[0]);
                                    onUpdate({ rooms: v[0] });
                                }}
                                className="py-1"
                            />
                        )}

                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>{validRooms.length > 0 ? validRooms[0] : 60}</span>
                            <span>{validRooms.length > 0 ? validRooms[validRooms.length - 1] : 200}</span>
                        </div>
                    </div>
                </div>

                {/* 4. Secondary Metrics Row */}
                <div className="grid grid-cols-4 gap-1 md:gap-2 text-center">
                    <div className="border border-gray-100 rounded p-1 md:p-2 bg-gray-50">
                        <div className="text-[8px] md:text-[10px] text-gray-400 uppercase">Rooms</div>
                        <div className="font-bold text-gray-700 text-xs md:text-base">{scenario.rooms}</div>
                    </div>
                    <div className="border border-gray-100 rounded p-1 md:p-2 bg-gray-50">
                        <div className="text-[8px] md:text-[10px] text-gray-400 uppercase">Floors</div>
                        <div className="font-bold text-gray-700 text-xs md:text-base">{scenario.floors}</div>
                    </div>
                    <div className="border border-gray-100 rounded p-1 md:p-2 bg-gray-50">
                        <div className="text-[8px] md:text-[10px] text-gray-400 uppercase">Size</div>
                        <div className="font-bold text-gray-700 text-[10px] md:text-xs">{data.buildingLength}'x{data.buildingWidth}'</div>
                    </div>
                    <div className="border border-gray-100 rounded p-1 md:p-2 bg-gray-50">
                        <div className="text-[8px] md:text-[10px] text-gray-400 uppercase">GSF</div>
                        <div className="font-bold text-gray-700 text-[10px] md:text-xs">{formatNumber(data.gsf)}</div>
                    </div>
                </div>

                {/* 5. Accordions */}
                <Accordion type="multiple" className="w-full">
                    <AccordionItem value="mix">
                        <AccordionTrigger className="text-sm font-semibold text-[#003f87] py-2">Room Mix</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-4 gap-2 p-2">
                                {[
                                    { label: "King Suite", count: data.kingRooms }, // From KS
                                    { label: "Double Queen", count: data.doubleQueenRooms }, // From QQ
                                    { label: "King One", count: data.kingOneRooms }, // From K1
                                    { label: "ADA", count: data.adaRooms } // From ADA
                                ].filter(i => i.count > 0).map((item, idx) => {
                                    const pct = scenario.rooms > 0 ? Math.round((item.count / scenario.rooms) * 100) : 0;
                                    return (
                                        <div key={idx} className="border border-gray-200 rounded p-2 bg-white">
                                            <div className="text-[10px] text-gray-500">{item.label}</div>
                                            <div className="text-sm font-bold text-[#003f87]">
                                                {item.count} ({pct}%)
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </div>
        </div>
    );
});
