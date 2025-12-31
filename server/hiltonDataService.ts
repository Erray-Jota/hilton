import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { assemblyService } from './assemblyService';

// Types
export interface ScenarioParams {
  brand: string;
  rooms: number;
  floors: number;
  zipCode?: string;
  lat?: number;
  lng?: number;
}

export interface CityFactor {
  id: string;
  name: string;
  state: string;
  cost_factor: number;
  lat: number | null;
  lng: number | null;
}

export class HiltonDataService {
  private costData: any[] = [];
  private cities: CityFactor[] = [];
  private supabase: SupabaseClient | null = null;
  private isInitialized = false;

  private normalizeBrand(brand: string): string {
    const b = brand.toLowerCase();
    if (b.includes('home2')) return 'Home2';
    if (b.includes('tru')) return 'Tru';
    if (b.includes('hampton')) return 'Hampton';
    if (b.includes('livsmart')) return 'LivSmart';
    return brand; // Fallback
  }

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase credentials missing. Using fallback data only.");
      this.supabase = null;
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async init() {
    if (this.isInitialized) return;

    try {
      console.log('Initializing HiltonDataService...');

      // 1. Load Hilton Cost Data (CSV)
      const costPath = path.resolve(process.cwd(), 'server', 'data', 'Hilton Cost.csv');
      if (fs.existsSync(costPath)) {
        const costContent = fs.readFileSync(costPath, 'utf-8');
        this.costData = parse(costContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
        console.log(`Loaded ${this.costData.length} cost records.`);
      } else {
        console.error("Hilton Cost.csv not found!");
      }

      // 2. Load Cities from Supabase (Source of Truth for Factors)
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('cities')
          .select('*');

        if (error) {
          console.error("Failed to load cities from Supabase:", error);
        } else if (data) {
          // Ensure lat/lng are numbers
          this.cities = data.map(c => ({
            ...c,
            lat: c.lat ? parseFloat(c.lat) : null,
            lng: c.lng ? parseFloat(c.lng) : null
          }));
          console.log(`Loaded ${this.cities.length} cities from Supabase.`);
        }
      } else {
        console.log("Skipping Supabase cities load - no credentials configured.");
      }



      // 3. Initialize Assembly Service
      await assemblyService.init();

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing HiltonDataService:', error);
      throw error;
    }
  }

  // Find the closest RaaP city based on lat/lng or Name/State match
  private findBestCityMatch(lat?: number, lng?: number, cityStr?: string, stateStr?: string): CityFactor | null {
    if (!this.cities.length) return null;

    // 1. Try Exact City/State Match first if provided (most accurate user intent)
    if (cityStr && stateStr) {
      const match = this.cities.find(c =>
        c.name.toLowerCase() === cityStr.toLowerCase() &&
        c.state.toLowerCase() === stateStr.toLowerCase()
      );
      if (match) return match;
    }

    // 2. Try Geospatial Proximity if lat/lng available
    if (lat !== undefined && lng !== undefined) {
      let closest: CityFactor | null = null;
      let minDist = Infinity;

      for (const city of this.cities) {
        if (city.lat === null || city.lng === null) continue;
        const d = this.haversineDistance(lat, lng, city.lat, city.lng);
        if (d < minDist) {
          minDist = d;
          closest = city;
        }
      }
      return closest;
    }

    return null; // No match found
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Extract masterformat costs from CSV row
  private getDivisionCosts(row: any, localFactor: number) {
    const divisions: { label: string; localCost: number; pctOfTotal: number }[] = [];
    let totalLocal = 0;

    // Iterate 01-35 (standard divisions in file)
    // Keys format: "01 - General Requirements", "02 - Existing Conditions", etc.
    const keys = Object.keys(row);

    // Helper to find key starting with number
    const findDivKey = (num: string) => keys.find(k => k.trim().startsWith(num));

    const divNums = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '21', '22', '23', '26', '27', '28', '31', '32', '33'];
    // Add non-numeric columns explicitly
    const namedCols = ['Charges_Fees'];

    const processCol = (key: string) => {
      if (key && row[key]) {
        // CSV values are like "$1,234" or "1234"
        const valStr = row[key].replace(/[$,]/g, '');
        const baseCost = parseFloat(valStr);
        if (!isNaN(baseCost) && baseCost > 0) {
          const localCost = baseCost * localFactor;
          totalLocal += localCost;
          divisions.push({
            label: key.trim(),
            localCost: localCost,
            pctOfTotal: 0 // Calc later
          });
        }
      }
    };

    for (const num of divNums) {
      const key = findDivKey(num);
      if (key) processCol(key);
    }

    for (const name of namedCols) {
      // exact match or find? CSV keys might have whitespace?
      // processCol(name) implies direct access. Let's try direct access + trimmed check.
      // debug output showed 'Site_Work', 'GC_Charges', 'Charges_Fees' exactly.
      processCol(name);
    }

    // Calc percentages
    divisions.forEach(d => {
      d.pctOfTotal = totalLocal > 0 ? (d.localCost / totalLocal) * 100 : 0;
    });

    return { divisions, totalLocal };
  }


  async getCostData(params: ScenarioParams) {
    if (!this.isInitialized) await this.init();

    // 1. Get Location Factor
    let factor = 1.0;
    let locationName = "National Average";
    let closestCity: CityFactor | null = null;
    let cityId = "N/A";

    if (params.lat && params.lng) {
      closestCity = this.findBestCityMatch(params.lat, params.lng, undefined, undefined);
      if (closestCity) {
        factor = closestCity.cost_factor || 1.0;
        locationName = `${closestCity.name}, ${closestCity.state}`;
        cityId = closestCity.id;
      }
    } else if (params.zipCode) {
      // Try to parse text? Or just ignore zip search in favor of Lat/Lng which frontend sends now
      // But if frontend only sends text...
      // We'll skip for now. Frontend sends lat/lng is the rule.
    }

    // 2. Find Cost Record in CSV
    // 2. Find Cost Record in CSV
    // Filter by Brand
    const normalizedBrand = this.normalizeBrand(params.brand);
    const brandRows = this.costData.filter(r => r.Brand === normalizedBrand);

    if (!brandRows.length) {
      // Throw or return empty?
      console.warn(`No cost data found for brand ${params.brand}`);
      // Return dummy data to prevent crash
      return this.getEmptyResult();
    }

    // Filter by floors (approx)
    // Actually, just find the row with the minimal room difference among ALL rows for that brand.
    // The previous logic filtered by floors. Let's see if floors exist in data.
    // "STORIES" column.

    let bestRow = null;
    let minDiff = Infinity;

    // Try to match Floors if possible
    // Try to match Floors if possible
    const floorRows = brandRows.filter(r => parseInt(r.Floors || '0') === params.floors);
    const candidates = floorRows.length > 0 ? floorRows : brandRows; // Fallback to any floors if specific floor count missing

    for (const row of candidates) {
      const rRooms = parseInt(row.Rooms || '0');
      const diff = Math.abs(rRooms - params.rooms);
      if (diff < minDiff) {
        minDiff = diff;
        bestRow = row;
      }
    }

    // 3. Process Costs
    const { divisions, totalLocal } = this.getDivisionCosts(bestRow, factor);

    const baseRooms = parseInt(bestRow.Rooms || '100');

    // User requested NO CALCULATION / INTERPOLATION.
    // We snap to the nearest neighbor and use its data directly.
    const sizeRatio = 1.0;

    // We should technically tell the frontend that the "Actual Rooms" modeled is different, 
    // but the return type doesn't support it yet. 
    // For now, we return the raw costs of the nearest neighbor.

    const derivedDivisions = divisions.map(d => {
      const scaledLocalCost = d.localCost * sizeRatio;

      // Calculate GSF/Stats - Use Raw DB Values
      const gsfVal = bestRow['Total Building GSF'] || bestRow[' Total Building GSF '] || '0';
      const gsf = parseFloat(gsfVal.replace(/,/g, ''));
      const derivedGSF = gsf * sizeRatio;

      const assemblies = assemblyService.getAssemblies(d.label, scaledLocalCost, {
        gsf: derivedGSF,
        floors: params.floors,
        totalUnits: baseRooms // Use the database room count, not input params
      });

      return {
        ...d,
        localCost: scaledLocalCost,
        assemblies
      };
    });

    const derivedTotalLocal = totalLocal * sizeRatio;

    // GSF scaling 
    const gsfVal = bestRow['Total Building GSF'] || bestRow[' Total Building GSF '] || '0';
    const gsf = parseFloat(gsfVal.replace(/,/g, ''));
    const derivedGSF = gsf * sizeRatio;

    // Dimensions Estimation
    // No LENGTH/WIDTH in CSV. Estimate based on Floors and assumed Width (single loaded vs double)
    // Assume Double Loaded Corridor Width ~ 65ft
    const assumedWidth = 65;
    const derivedFootprint = params.floors > 0 ? derivedGSF / params.floors : 0;
    const derivedLength = derivedFootprint / assumedWidth; // Estimate

    // Room Mix - from KS, QQ, K1 cols + ADA
    // Map: KS -> King One (wait, user said "King One" is separate? "King Suite", "Double Queen", "King One"
    // Valid DB keys from dump: KS, QQ, K1, ADA.
    // Let's assume K1 = King One. KS = King Suite. QQ = Double Queen.
    const ks = parseFloat(bestRow.KS || '0');
    const qq = parseFloat(bestRow.QQ || '0');
    const k1 = parseFloat(bestRow.K1 || '0');
    const ada = parseFloat(bestRow.ADA || '0');
    const totalBaseMix = ks + qq + k1 + ada; // Should roughly equal rooms

    // Ratios
    const ksRatio = totalBaseMix > 0 ? ks / totalBaseMix : 0;
    const qqRatio = totalBaseMix > 0 ? qq / totalBaseMix : 0;
    const k1Ratio = totalBaseMix > 0 ? k1 / totalBaseMix : 0;
    const adaRatio = totalBaseMix > 0 ? ada / totalBaseMix : 0;

    const kingRooms = Math.round(params.rooms * ksRatio); // King Suite
    const doubleQueenRooms = Math.round(params.rooms * qqRatio);
    const kingOneRooms = Math.round(params.rooms * k1Ratio);
    const adaRooms = Math.round(params.rooms * adaRatio);
    const queenRooms = 0; // Deprecated/Unused in favor of specifics

    return {
      totalLocal: derivedTotalLocal,
      costPerSf: derivedGSF > 0 ? derivedTotalLocal / derivedGSF : 0,
      costPerKey: params.rooms > 0 ? derivedTotalLocal / params.rooms : 0,
      gsf: Math.round(derivedGSF),
      buildingLength: Math.round(derivedLength),
      buildingWidth: assumedWidth,
      kingRooms,
      queenRooms,
      doubleQueenRooms,
      adaRooms,
      kingOneRooms,
      breakdown: derivedDivisions,
      zipFactor: factor,
      zipUsed: cityId,
      zipLocation: locationName
    };
  }

  // Helper to expose factor for a zip (approximate via city search)
  getZipFactor(zipCode: string) {
    // We don't have zip map anymore, so this is a best-effort fallback if used.
    // Maybe return 1.0 or try to find a city with that text?
    // Since the new workflow relies on Lat/Lng, we can deprecate this.
    // But to prevent crashes:
    return { factor: 1.0, zipCode, cityStateZip: "N/A" };
  }

  searchZipCodes(query: string, limit: number = 10) {
    if (!this.isInitialized) return []; // Should await init
    const q = query.toLowerCase();
    return this.cities
      .filter(c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q))
      .slice(0, limit)
      .map(c => ({
        zipCode: c.id, // Use ID as key
        cityStateZip: `${c.name}, ${c.state}`,
        factor: c.cost_factor
      }));
  }

  private getEmptyResult() {
    return {
      totalLocal: 0, costPerSf: 0, costPerKey: 0, gsf: 0, buildingLength: 0, buildingWidth: 0,
      kingRooms: 0, queenRooms: 0, doubleQueenRooms: 0, breakdown: [], zipFactor: 1
    };
  }

  async getBrandsAvailable() {
    if (!this.isInitialized) await this.init();
    const brands = new Set(this.costData.map(r => r.Brand));
    return Array.from(brands);
  }

  async getAvailableOptions(brand: string) {
    if (!this.isInitialized) await this.init();

    const normalizedBrand = this.normalizeBrand(brand);

    // Filter by brand
    const rows = this.costData.filter(r => r.Brand === normalizedBrand);

    // Extract Rooms/Floors pairs
    const options = rows.map(r => ({
      rooms: parseInt(r.Rooms || '0'),
      floors: parseInt(r.Floors || '0')
    })).filter(o => o.rooms > 0 && o.floors > 0);

    // Dedupe
    const unique = Array.from(new Set(options.map(o => JSON.stringify(o)))).map(s => JSON.parse(s));

    // Sort by rooms then floors
    unique.sort((a, b) => a.rooms - b.rooms || a.floors - b.floors);

    return unique;
  }
}

export const hiltonDataService = new HiltonDataService();
