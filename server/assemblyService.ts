import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

// Types
export interface AssemblyDef {
    division: string;
    name: string;
    description: string;
    inputBasis: string;
    inputValue: number;
    pctPrice: number; // 0-1
}

export interface AssemblyResult {
    name: string;
    description: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
}

export interface ProjectStats {
    gsf: number;
    floors: number;
    totalUnits: number;
}

export class AssemblyService {
    // Index by normalized division name for O(1) lookup
    private divisionIndex: Map<string, AssemblyDef[]> = new Map();
    private isInitialized = false;

    async init() {
        if (this.isInitialized) return;

        try {
            const csvPath = path.resolve(process.cwd(), 'server', 'data', 'Hilton Assemblies.csv');
            if (fs.existsSync(csvPath)) {
                const content = fs.readFileSync(csvPath, 'utf-8');
                // Parse with relaxed options to handle the messy file
                const records = parse(content, {
                    columns: false,
                    skip_empty_lines: true,
                    from_line: 6
                });

                this.processRecords(records);
                // console.log(`AssemblyService: Loaded ${this.getTotalAssemblies()} assemblies across ${this.divisionIndex.size} divisions.`);
            } else {
                console.log("AssemblyService: Hilton Assemblies.csv not found.");
            }
            this.isInitialized = true;
        } catch (error) {
            console.error("AssemblyService: Error loading CSV:", error);
        }
    }

    private getTotalAssemblies(): number {
        let count = 0;
        for (const asms of Array.from(this.divisionIndex.values())) {
            count += asms.length;
        }
        return count;
    }

    private processRecords(records: any[]) {
        let currentDivision = "";

        for (const row of records) {
            // Column mapping based on visual inspection
            const col0 = row[0]?.trim(); // Division or Name
            const col1 = row[1]?.trim(); // Description
            const col2 = row[2]?.trim(); // Input Basis
            const col3 = row[3]?.replace(/[%,]/g, '').trim(); // Input
            const col4 = row[4]?.replace(/[%,]/g, '').trim(); // % Price

            // Heuristic to detect Division Header
            // 1. "100%" in price OR Name equals Description (for Plumbing)
            // 2. AND no input basis
            const isHeader = (col4 === "100" || (col0 && col0 === col1)) && (!col2 || col2 === "");

            if (isHeader) {
                if (col0) {
                    currentDivision = col0;
                }
                continue;
            }

            // Detect Assembly Row
            if (col2 && col3 && col4 && currentDivision) {
                const inputVal = parseFloat(col3);
                const pricePct = parseFloat(col4);

                if (!isNaN(inputVal) && !isNaN(pricePct)) {
                    let name = col0;
                    if (!name) name = col1;

                    const asm: AssemblyDef = {
                        division: currentDivision,
                        name: name || "Unknown Assembly",
                        description: col1 || "",
                        inputBasis: col2,
                        inputValue: inputVal,
                        pctPrice: pricePct / 100
                    };

                    // Add to index
                    const normalizeDiv = this.normalizeKey(currentDivision);
                    if (!this.divisionIndex.has(normalizeDiv)) {
                        this.divisionIndex.set(normalizeDiv, []);
                    }
                    this.divisionIndex.get(normalizeDiv)?.push(asm);
                }
            }
        }
    }

    // Helper to normalize keys for indexing
    private normalizeKey(s: string): string {
        return s.replace(/^[0-9_.\s]+/, '').replace(/_/g, ' ').trim().toLowerCase();
    }

    getAssemblies(divisionLabel: string, divisionTotalCost: number, stats: ProjectStats): AssemblyResult[] {
        if (!this.isInitialized) {
            console.warn("AssemblyService not initialized");
            return [];
        }

        const divApp = this.normalizeKey(divisionLabel);

        // 1. Try Direct Lookup
        let relevant = this.divisionIndex.get(divApp) || [];

        // 2. If empty, try known aliases (Fixes for Protection, Plumbing, etc)
        if (relevant.length === 0) {
            if (divApp.includes('thermal')) {
                relevant = this.divisionIndex.get('protection') || [];
            } else if (divApp.includes('plumbing')) {
                relevant = this.divisionIndex.get('plumbing') || [];
            } else if (divApp.startsWith('wood')) {
                // Try finding any key that starts with wood
                for (const [key, val] of Array.from(this.divisionIndex.entries())) {
                    if (key.startsWith('wood')) {
                        relevant = val;
                        break;
                    }
                }
            }
        }

        return relevant.map(asm => {
            let quantity = 0;
            let unit = "";

            // Normalize Input Basis
            const basis = asm.inputBasis.toLowerCase();

            if (basis.includes("gsf")) {
                quantity = stats.gsf * (asm.inputValue / 100);
                unit = "SF";
            } else if (basis.includes("units")) {
                quantity = stats.totalUnits * (asm.inputValue / 100);
                unit = "EA";
            } else if (basis.includes("floors")) {
                quantity = stats.floors * (asm.inputValue / 100);
                unit = "EA";
            } else if (basis.includes("constrant") || basis.includes("constant")) {
                quantity = asm.inputValue;
                unit = "EA";
            } else {
                quantity = asm.inputValue;
                unit = "LS";
            }

            quantity = Math.max(1, Math.round(quantity));
            const totalCost = divisionTotalCost * asm.pctPrice;

            return {
                name: asm.name,
                description: asm.description,
                quantity,
                unit,
                unitCost: quantity > 0 ? totalCost / quantity : 0,
                totalCost
            };
        });
    }
}

export const assemblyService = new AssemblyService();
