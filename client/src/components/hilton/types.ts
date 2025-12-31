
export interface ScenarioState {
    id: string;
    brand: string;
    rooms: number;
    location: string;
    floors: number;
    lat?: number | null;
    lng?: number | null;
    zipFactor?: number;      // For display
    zipLocation?: string;    // For display
}

export interface CostData {
    totalLocal: number;
    costPerSf: number;
    costPerKey: number;
    gsf: number;
    buildingLength: number;
    buildingWidth: number;
    kingRooms: number;
    queenRooms: number;
    doubleQueenRooms: number;
    adaRooms: number;
    kingOneRooms: number;
    breakdown: Array<{
        label: string;
        localCost: number;
        pctOfTotal: number;
        assemblies?: Array<{
            name: string;
            description: string;
            quantity: number;
            unit: string;
            unitCost: number;
            totalCost: number;
        }>;
    }>;
}

export const initialCostData: CostData = {
    totalLocal: 0,
    costPerSf: 0,
    costPerKey: 0,
    gsf: 0,
    buildingLength: 0,
    buildingWidth: 0,
    kingRooms: 0,
    queenRooms: 0,
    doubleQueenRooms: 0,
    adaRooms: 0,
    kingOneRooms: 0,
    breakdown: [],
};
