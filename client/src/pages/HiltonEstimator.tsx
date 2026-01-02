
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, BookOpen } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { MethodologyDialog } from "@/components/hilton/MethodologyDialog";
import { apiRequest } from "@/lib/queryClient";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

import raapLogo from "@assets/raap-logo-new.png";

// Import types and sub-components
import { type ScenarioState, type CostData, initialCostData } from "@/components/hilton/types";
import { ScenarioCard } from "@/components/hilton/ScenarioCard";
import { ComparisonSection } from "@/components/hilton/ComparisonSection";
import { CostBreakdownTable } from "@/components/hilton/CostBreakdownTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ... existing imports ...



import { MessageSquare, Mail, Mic, Send, X, Loader2, Calculator } from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

// Sticky metrics bar for mobile


export default function HiltonEstimator() {
    const [scenario1, setScenario1] = useState<ScenarioState>({
        id: "s1", brand: "Home2 Suites", rooms: 100, floors: 3, location: "", lat: null, lng: null
    });
    const [data1, setData1] = useState<CostData>(initialCostData);

    const [scenario2, setScenario2] = useState<ScenarioState>({
        id: "s2", brand: "Hampton Inn & Suites", rooms: 120, floors: 4, location: "", lat: null, lng: null
    });
    const [data2, setData2] = useState<CostData>(initialCostData);

    const [showMethodology, setShowMethodology] = useState(false);

    // View State for Mobile (Estimator is default)
    const [activeView, setActiveView] = useState<'estimator' | 'assistant'>('estimator');

    // Chat & Voice State
    const [chatTranscript, setChatTranscript] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [voiceTarget, setVoiceTarget] = useState<'chat'>('chat'); // Track which input is receiving voice

    // Data Fetching for Scenario 1
    const mutation1 = useMutation({
        mutationFn: async (vars: any) => {
            const res = await apiRequest("POST", "/api/hilton/calculate", vars);
            return res.json();
        },
        onSuccess: (data) => setData1(data),
        onError: (err) => console.error("Error fetching scenario 1:", err)
    });

    // Data Fetching for Scenario 2
    const mutation2 = useMutation({
        mutationFn: async (vars: any) => {
            const res = await apiRequest("POST", "/api/hilton/calculate", vars);
            return res.json();
        },
        onSuccess: (data) => setData2(data),
        onError: (err) => console.error("Error fetching scenario 2:", err)
    });

    // Debounce and trigger updates
    useEffect(() => {
        const timer = setTimeout(() => {
            if (scenario1.brand && scenario1.rooms && scenario1.floors) {
                mutation1.mutate({
                    brand: scenario1.brand,
                    rooms: Number(scenario1.rooms),
                    floors: Number(scenario1.floors),
                    zipCode: scenario1.location, // Sending location as zipCode for now, service handles string lookup
                    lat: scenario1.lat,
                    lng: scenario1.lng
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [scenario1]); // Trigger when any field in scenario1 changes

    useEffect(() => {
        const timer = setTimeout(() => {
            if (scenario2.brand && scenario2.rooms && scenario2.floors) {
                mutation2.mutate({
                    brand: scenario2.brand,
                    rooms: Number(scenario2.rooms),
                    floors: Number(scenario2.floors),
                    zipCode: scenario2.location, // Sending location as zipCode for now
                    lat: scenario2.lat,
                    lng: scenario2.lng
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [scenario2]);


    const toggleListening = (target: 'chat') => {
        setVoiceTarget(target);
        if (isListening) {
            setIsListening(false);
            return;
        }

        // Capture current content as base.
        const currentBase = chatTranscript;

        // Sanitize base: remove any trailing [...] placeholder
        const cleanBase = currentBase.replace(/\s*\[\.\.\.\]\s*$/, '').trim();

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true; // Enable real-time transcription
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = 0; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Construct text using stable cleanBase + new results
                if (interimTranscript) {
                    const newText = cleanBase + (cleanBase ? ' ' : '') + interimTranscript + ' [...]';
                    setChatTranscript(newText);
                }

                if (finalTranscript) {
                    const newText = cleanBase + (cleanBase ? ' ' : '') + finalTranscript;
                    setChatTranscript(newText);
                }
            };
            recognition.start();
        } else {
            alert("Speech recognition not supported in this browser.");
        }
    };

    // Chat State
    const [chatData, setChatData] = useState({
        brand: "",
        location: "",
        floors: "4",
        rooms: ""
    });
    // Temp location data from Google Autocomplete
    const [tempLocationData, setTempLocationData] = useState<any>(null);
    const [botMessage, setBotMessage] = useState("");

    // Helper: Fuzzy match brand
    const fuzzyMatchBrand = (text: string): string | null => {
        const lowerText = text.toLowerCase();
        // Common STT error mappings
        const mappings: Record<string, string> = {
            "home two": "Home2 Suites",
            "home to": "Home2 Suites",
            "home 2": "Home2 Suites",
            "hampton": "Hampton Inn & Suites",
            "hampshire": "Hampton Inn & Suites",
            "true": "Tru by Hilton",
            "truth": "Tru by Hilton",
            "tru": "Tru by Hilton",
            "double tree": "DoubleTree by Hilton",
            "embassy": "Embassy Suites",
            "homewood": "Homewood Suites",
            "garden inn": "Hilton Garden Inn",
            "live smart": "LivSmart",
            "liv smart": "LivSmart",
            "lives mart": "LivSmart",
            "leaf smart": "LivSmart",
            "lift smart": "LivSmart",
            "livesmart": "LivSmart",
            "livsmart": "LivSmart"
        };

        for (const [key, value] of Object.entries(mappings)) {
            if (lowerText.includes(key)) return value;
        }

        // Exact substring match for known brands
        const brands = ["LivSmart", "Home2 Suites", "Hampton Inn & Suites", "Tru by Hilton", "Canopy by Hilton", "Tempo by Hilton", "Motto by Hilton", "DoubleTree by Hilton", "Embassy Suites", "Homewood Suites", "Hilton Garden Inn"];
        for (const brand of brands) {
            if (lowerText.includes(brand.toLowerCase())) return brand;
        }
        return null;
    };

    // Helper: Resolve Location via Google Maps
    const resolveLocation = async (query: string) => {
        try {
            // Ensure Maps loaded (simple check)
            if (!(window as any).google?.maps) {
                return;
            }

            const autocompleteService = new (window as any).google.maps.places.AutocompleteService();
            const geocoder = new (window as any).google.maps.Geocoder();

            // Get Predictions
            const predictionsWrapper = await new Promise<any>((resolve, reject) => {
                autocompleteService.getPlacePredictions({
                    input: query,
                    types: ['(regions)'], // Cities/Zips
                    componentRestrictions: { country: 'us' }
                }, (predictions: any, status: any) => {
                    if (status !== (window as any).google.maps.places.PlacesServiceStatus.OK || !predictions) {
                        resolve([]);
                    } else {
                        resolve(predictions);
                    }
                });
            });

            if (predictionsWrapper && predictionsWrapper.length > 0) {
                const bestPredict = predictionsWrapper[0];
                const placeId = bestPredict.place_id;

                // Geocode to get details
                geocoder.geocode({ placeId: placeId }, (results: any, status: any) => {
                    if (status === 'OK' && results[0]) {
                        const place = results[0];
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        const formattedAddress = place.formatted_address;

                        // Update State 
                        setTempLocationData({
                            lat,
                            lng,
                            formattedAddress
                        });

                        // Update chatData.location to match formatted one for visibility
                        setChatData(prev => ({ ...prev, location: formattedAddress }));
                    }
                });
            }
        } catch (e) {
            console.error("Location resolution failed", e);
        }
    };

    // Parse Transcript Effect
    useEffect(() => {
        if (!chatTranscript) return;

        const lowerText = chatTranscript.toLowerCase();
        const updates: any = {};

        // Parse Rooms (e.g., "100 rooms", "100 keys")
        const roomsMatch = lowerText.match(/(\d+)\s*(?:room|key|unit)s?/);
        if (roomsMatch) updates.rooms = roomsMatch[1];

        // Parse Floors (e.g., "4 floors", "4 stories")
        const floorsMatch = lowerText.match(/(\d+)\s*(?:floor|stor(?:y|ies)|level)s?/);
        if (floorsMatch) updates.floors = floorsMatch[1];

        // Parse Location
        let locationQuery = "";
        const zipMatch = lowerText.match(/\b\d{5}\b/);
        if (zipMatch) {
            updates.location = zipMatch[0];
            locationQuery = zipMatch[0];
        } else {
            // City extraction with "in" keyword
            const cityMatch = lowerText.match(/\bin\s+([a-zA-Z\s\.]+?)(?:\s+(?:with|and|for|keys|rooms|floors|\.|$)|$)/);
            if (cityMatch && cityMatch[1].trim().length > 2) {
                updates.location = cityMatch[1].trim();
                locationQuery = cityMatch[1].trim();
            }
        }

        // Fuzzy Match Brand
        const detectedBrand = fuzzyMatchBrand(chatTranscript);
        if (detectedBrand) updates.brand = detectedBrand;

        // Update parsed data
        setChatData(prev => {
            const next = { ...prev, ...updates };
            if (JSON.stringify(next) !== JSON.stringify(prev)) {
                return next;
            }
            return prev;
        });

        // Trigger Google Resolve if we have a location query
        if (locationQuery) {
            resolveLocation(locationQuery);
        }

    }, [chatTranscript]);

    // Update Bot Message when parsed data changes
    useEffect(() => {
        const parts = [];
        if (chatData.brand) parts.push(`a ${chatData.brand}`);
        if (chatData.rooms) parts.push(`${chatData.rooms} keys`);
        if (chatData.floors) parts.push(`${chatData.floors} floors`);
        if (chatData.location) parts.push(`in ${chatData.location}`);

        if (parts.length > 0) {
            setBotMessage(`I heard: ${parts.join(", ")}.`);
        } else if (chatTranscript) {
            setBotMessage("Listening... please mention brand, rooms, floors, or location.");
        } else {
            setBotMessage("");
        }
    }, [chatData, chatTranscript]);


    const handleUpdateEstimate = () => {
        setScenario1(prev => ({
            ...prev,
            brand: chatData.brand || prev.brand,
            rooms: chatData.rooms ? parseInt(chatData.rooms) : prev.rooms,
            floors: chatData.floors ? parseInt(chatData.floors) : prev.floors,
            // Use tempLocationData if available for full accuracy
            location: tempLocationData ? tempLocationData.formattedAddress : (chatData.location || prev.location),
            lat: tempLocationData ? tempLocationData.lat : prev.lat,
            lng: tempLocationData ? tempLocationData.lng : prev.lng
        }));
        setActiveView('estimator');
        // Clear chat for next time
        setChatTranscript("");
        setChatData({ brand: "", location: "", floors: "", rooms: "" });
        setTempLocationData(null);
    };

    const generateCSV = async () => {
        console.log("🔥 generateCSV called - SAVE PICKER VERSION");

        // Headers
        const headers = ["Inputs & Assumptions", "Scenario A", "Scenario B"];
        const rows = [
            ["Brand", scenario1.brand, scenario2.brand],
            ["Location", scenario1.location || "N/A", scenario2.location || "N/A"],
            ["Rooms", scenario1.rooms.toString(), scenario2.rooms.toString()],
            ["Floors", scenario1.floors.toString(), scenario2.floors.toString()],
            ["GSF", data1.gsf.toString(), data2.gsf.toString()],
            [], // Spacer
            ["Cost Breakdown", "Cost A", "Cost B", "Difference"]
        ];

        // Combine breakdown items
        data1.breakdown.forEach((item1) => {
            const item2 = data2.breakdown.find(i => i.label === item1.label) || { localCost: 0, pctOfTotal: 0 };
            const diff = item2.localCost - item1.localCost;
            rows.push([item1.label, item1.localCost.toString(), item2.localCost.toString(), diff.toString()]);
        });

        // Add Totals
        rows.push([]);
        rows.push(["TOTAL LOCAL COST", data1.totalLocal.toString(), data2.totalLocal.toString(), (data2.totalLocal - data1.totalLocal).toString()]);

        // Create CSV content with BOM for Excel compatibility
        const BOM = "\uFEFF";
        const csvContent = BOM + [headers, ...rows]
            .map(row => row.join(","))
            .join("\n");

        const filename = "RaaP_Estimate.csv";

        // Use showSaveFilePicker for proper filename (Chrome 86+)
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'CSV Files',
                        accept: { 'text/csv': ['.csv'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(csvContent);
                await writable.close();
                console.log("🔥 Saved via showSaveFilePicker");
                return;
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Save picker error:", err);
                }
            }
        }

        // Fallback for browsers without showSaveFilePicker
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleMobileEmailShare = async () => {
        const input = document.getElementById('pdf-content');
        if (!input) return;

        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const pdfBlob = pdf.output('blob');
            console.log("PDF Blob Size:", pdfBlob.size); // Debugging

            if (pdfBlob.size === 0) {
                alert("Error: PDF generation failed (Empty File).");
                return;
            }

            const file = new File([pdfBlob], "RaaP_Estimate.pdf", {
                type: "application/pdf",
                lastModified: new Date().getTime()
            });

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: 'Your RaaP Estimate',
                    text: `Here is your estimate for a ${scenario1.rooms} room, ${scenario1.floors} floors, ${scenario1.brand} in ${scenario1.location}.`
                });
            } else {
                alert("Sharing is not supported on this device/browser. Please use the PDF button.");
            }
        } catch (error) {
            console.error("Error sharing:", error);
            // Show the actual error message to the user for better debugging
            alert(`Share failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    const generatePDF = async () => {
        const input = document.getElementById('pdf-content');
        if (!input) return;

        const canvas = await html2canvas(input, { scale: 2 }); // High res
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        const filename = "RaaP_Estimate.pdf";

        // Use showSaveFilePicker for proper filename (Chrome 86+)
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'PDF Files',
                        accept: { 'application/pdf': ['.pdf'] },
                    }],
                });
                const writable = await handle.createWritable();
                const pdfBlob = pdf.output('blob');
                await writable.write(pdfBlob);
                await writable.close();
                console.log("🔥 PDF saved via showSaveFilePicker");
                return;
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Save picker error:", err);
                }
                // User cancelled, don't fall back
                return;
            }
        }

        // Fallback for browsers without showSaveFilePicker
        pdf.save(filename);
    };

    // Helper to render Assistant Content (Shared between Mobile & Desktop)
    const renderAssistantContent = () => (
        <div className="h-full flex flex-col">
            <div className="flex-1 space-y-2">
                {/* Update Button */}
                <Button onClick={() => { handleUpdateEstimate(); setActiveView('estimator'); }} className="w-full bg-[#003f87] h-10 text-sm mb-1">
                    Update Estimate
                </Button>

                <div className="relative bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Label className="text-[#003f87] font-semibold mb-1 block text-xs">Project Details</Label>
                    <div className="mt-1 relative">
                        <Textarea
                            value={chatTranscript}
                            onChange={(e) => setChatTranscript(e.target.value)}
                            placeholder="Tap mic to speak..."
                            className="h-20 pr-10 text-xs bg-white resize-none"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute bottom-1 right-1 h-8 w-8 ${isListening && voiceTarget === 'chat' ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}
                            onClick={() => toggleListening('chat')}
                        >
                            <Mic className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-0.5 col-span-1">
                        <Label className="text-[10px] uppercase text-gray-400">Flag / Brand</Label>
                        <Select value={chatData.brand} onValueChange={(v) => setChatData({ ...chatData, brand: v })}>
                            <SelectTrigger className="h-8 text-xs w-full">
                                <SelectValue placeholder="Select Brand" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Home2 Suites">Home2 Suites</SelectItem>
                                <SelectItem value="Tru by Hilton">Tru by Hilton</SelectItem>
                                <SelectItem value="Hampton Inn & Suites">Hampton</SelectItem>
                                <SelectItem value="LivSmart">LivSmart</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-0.5 col-span-1">
                        <Label className="text-[10px] uppercase text-gray-400">Location</Label>
                        <Input
                            value={chatData.location}
                            onChange={(e) => setChatData({ ...chatData, location: e.target.value })}
                            className="h-8 text-xs"
                            placeholder="City/Zip"
                        />
                    </div>
                    <div className="space-y-0.5">
                        <Label className="text-[10px] uppercase text-gray-400">Floors</Label>
                        <Select value={chatData.floors.toString()} onValueChange={(v) => setChatData({ ...chatData, floors: v })}>
                            <SelectTrigger className="h-8 text-xs w-full">
                                <SelectValue placeholder="#" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-0.5">
                        <Label className="text-[10px] uppercase text-gray-400">Rooms</Label>
                        <Input
                            type="number"
                            value={chatData.rooms}
                            onChange={(e) => setChatData({ ...chatData, rooms: e.target.value })}
                            className="h-8 text-xs"
                            placeholder="65"
                        />
                    </div>
                </div>

            </div>

        </div>
    );

    return (
        <div id="pdf-content" className="min-h-screen bg-white">
            {/* 
              CONDITIONAL VIEW RENDERING 
              We render different full-page views based on 'activeView' state.
            */}

            {/* --- VIEW: ESTIMATOR (Default) --- */}
            {activeView === 'estimator' && (
                <>
                    {/* Header */}
                    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
                        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-4">
                                <img src={raapLogo} alt="RaaP" className="h-8 md:h-10" />
                                <div className="hidden md:block h-10 w-px bg-gray-200 mx-2" />
                                <div>
                                    <h1 className="text-xl md:text-4xl font-bold text-[#003f87] leading-tight">Hilton Cost Estimator</h1>
                                </div>
                            </div>
                            <div className="hidden md:flex gap-2 md:gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[#003f87] border-[#003f87] hover:bg-[#003f87] hover:text-white transition-colors px-2 md:px-4 gap-2"
                                    onClick={() => setShowMethodology(true)}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden md:inline">Methodology</span>
                                    <span className="md:hidden">Info</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[#003f87] border-[#003f87] hover:bg-[#003f87] hover:text-white transition-colors px-2 md:px-4"
                                    onClick={generateCSV}
                                >
                                    <FileSpreadsheet className="h-4 w-4 md:mr-2" />
                                    <span className="hidden md:inline">CSV</span>
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-[#f0ab00] hover:bg-[#d49600] text-white border-0 transition-colors px-2 md:px-4"
                                    onClick={generatePDF}
                                >
                                    <FileDown className="h-4 w-4 md:mr-2" />
                                    <span className="hidden md:inline">PDF</span>
                                </Button>
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-[#003f87] border-[#003f87] hover:bg-[#003f87] hover:text-white transition-colors px-2 md:px-4 gap-2"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="hidden md:inline">AI Assistant</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                                        <SheetHeader className="mb-4">
                                            <SheetTitle className="flex items-center gap-2">
                                                <img src={raapLogo} alt="RaaP" className="h-6" />
                                                <span>RaaP Assistant</span>
                                            </SheetTitle>
                                        </SheetHeader>
                                        {renderAssistantContent()}
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </header>



                    {/* Content */}
                    {/* Content */}
                    <main id="main-content" className="max-w-[1400px] mx-auto px-3 md:px-4 py-3 md:py-6">

                        {/* Mobile Persistent Fixed Metrics */}
                        <div className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-white px-3 py-2 border-b border-gray-100 shadow-sm">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-[#003f87] text-white p-2 rounded-lg shadow-sm min-h-[50px]">
                                    <div className="text-[10px] opacity-80 uppercase font-semibold tracking-wide">Total Cost</div>
                                    <div className="text-base font-bold truncate mt-0.5" title={formatCurrency(data1.totalLocal)}>
                                        {formatCurrency(data1.totalLocal)}
                                    </div>
                                </div>
                                <div className="bg-white p-2 rounded-lg shadow-sm border-t-4 border-yellow-400 border border-gray-100 min-h-[50px]">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Cost/Room</div>
                                    <div className="text-base font-bold text-[#003f87] truncate mt-0.5">
                                        {formatCurrency(data1.costPerKey)}
                                    </div>
                                </div>
                                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 min-h-[50px]">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Cost/SF</div>
                                    <div className="text-base font-bold text-[#003f87] truncate mt-0.5">
                                        {formatCurrency(data1.costPerSf)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spacer for Fixed Metrics */}
                        <div className="lg:hidden h-[72px]" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                            <ScenarioCard
                                title="Scenario A"
                                headerColor="#003f87"
                                scenario={scenario1}
                                data={data1}
                                onUpdate={u => setScenario1(p => ({ ...p, ...u }))}
                                isMobile={true}
                                hideMetrics={true}
                                logoHeight="h-16 md:h-20"
                            />
                            <div className="hidden lg:block">
                                <ScenarioCard
                                    title="Scenario B"
                                    headerColor="#003f87"
                                    scenario={scenario2}
                                    data={data2}
                                    onUpdate={u => setScenario2(p => ({ ...p, ...u }))}
                                />
                            </div>
                        </div>

                        <CostBreakdownTable data1={data1} data2={data2} />
                        <div className="hidden lg:block">
                            <ComparisonSection data1={data1} data2={data2} rooms1={scenario1.rooms} rooms2={scenario2.rooms} />
                        </div>
                    </main>

                    {/* Methodology Dialog (Only relevant in Estimator View) */}
                    <MethodologyDialog open={showMethodology} onOpenChange={setShowMethodology} />
                </>
            )}



            {/* --- VIEW: ASSISTANT (Chat) --- */}
            {
                activeView === 'assistant' && (
                    <div className="min-h-screen bg-white pb-14 overflow-hidden">
                        <header className="border-b border-gray-200 bg-white p-3 sticky top-0 z-50 flex items-center gap-2">
                            <img src={raapLogo} alt="RaaP" className="h-6" />
                            <span className="bg-[#003f87] text-white px-2 py-0.5 rounded text-xs font-bold">ASSISTANT</span>
                        </header>

                        <main className="p-2 space-y-2">
                            {/* Update Button - Compact */}
                            <Button onClick={() => { handleUpdateEstimate(); setActiveView('estimator'); }} className="w-full bg-[#003f87] h-10 text-sm mb-1">
                                Update Estimate
                            </Button>

                            <div className="relative bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <Label className="text-[#003f87] font-semibold mb-1 block text-xs">Project Details</Label>
                                <div className="mt-1 relative">
                                    <Textarea
                                        value={chatTranscript}
                                        onChange={(e) => setChatTranscript(e.target.value)}
                                        placeholder="Tap mic to speak..."
                                        className="h-20 pr-10 text-xs bg-white resize-none"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`absolute bottom-1 right-1 h-8 w-8 ${isListening && voiceTarget === 'chat' ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}
                                        onClick={() => toggleListening('chat')}
                                    >
                                        <Mic className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="space-y-0.5 col-span-1">
                                    <Label className="text-[10px] uppercase text-gray-400">Flag / Brand</Label>
                                    <Select value={chatData.brand} onValueChange={(v) => setChatData({ ...chatData, brand: v })}>
                                        <SelectTrigger className="h-8 text-xs w-full">
                                            <SelectValue placeholder="Select Brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Home2 Suites">Home2 Suites</SelectItem>
                                            <SelectItem value="Tru by Hilton">Tru by Hilton</SelectItem>
                                            <SelectItem value="Hampton Inn & Suites">Hampton</SelectItem>
                                            <SelectItem value="LivSmart">LivSmart</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-0.5 col-span-1">
                                    <Label className="text-[10px] uppercase text-gray-400">Location</Label>
                                    <Input
                                        value={chatData.location}
                                        onChange={(e) => setChatData({ ...chatData, location: e.target.value })}
                                        className="h-8 text-xs"
                                        placeholder="City/Zip"
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-[10px] uppercase text-gray-400">Floors</Label>
                                    <Select value={chatData.floors.toString()} onValueChange={(v) => setChatData({ ...chatData, floors: v })}>
                                        <SelectTrigger className="h-8 text-xs w-full">
                                            <SelectValue placeholder="#" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="5">5</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-[10px] uppercase text-gray-400">Rooms</Label>
                                    <Input
                                        type="number"
                                        value={chatData.rooms}
                                        onChange={(e) => setChatData({ ...chatData, rooms: e.target.value })}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </main>
                    </div>
                )
            }

            {/* Sticky Footer for Mobile Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-1 z-50 flex justify-around items-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">

                {/* SLOT 1: Methodology (Toggle) */}
                {/* If activeView is NOT estimator, clicking this goes to Active View + Toggle? No, goes to Estimator + Toggle. */}
                {/* User Logic: "Estimator button should replace whatever button is clicked" */}
                {/* If Methodology IS OPEN (indicated by showMethodology=true AND activeView='estimator'), show Estimator button */}
                {(activeView === 'estimator' && showMethodology) ? (
                    <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-[#003f87] hover:bg-blue-50" onClick={() => setShowMethodology(false)}>
                        <Calculator className="h-5 w-5" />
                        <span className="text-[10px] font-medium leading-none">Estimator</span>
                    </Button>
                ) : (
                    <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-[#003f87] hover:bg-blue-50"
                        onClick={() => {
                            if (activeView !== 'estimator') setActiveView('estimator');
                            setShowMethodology(true);
                        }}
                    >
                        <BookOpen className="h-5 w-5" />
                        <span className="text-[10px] font-medium leading-none">Methodology</span>
                    </Button>
                )}

                {/* SLOT 2: Email (Smart Share) */}
                <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-[#003f87] hover:bg-blue-50"
                    onClick={handleMobileEmailShare}
                >
                    <Mail className="h-5 w-5" />
                    <span className="text-[10px] font-medium leading-none">Email</span>
                </Button>



                {/* SLOT 3: Assistant or Estimator (if Assistant Active) */}
                {activeView === 'assistant' ? (
                    <Button
                        variant="ghost"
                        className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-[#003f87] hover:bg-blue-50"
                        onClick={() => setActiveView('estimator')}
                    >
                        <Calculator className="h-5 w-5" />
                        <span className="text-[10px] font-medium leading-none">Estimator</span>
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-gray-500 hover:text-[#003f87] hover:bg-blue-50"
                        onClick={() => setActiveView('assistant')}
                    >
                        <MessageSquare className="h-5 w-5" />
                        <span className="text-[10px] font-medium leading-none">Assistant</span>
                    </Button>
                )}
            </div>
        </div >
    );
}
