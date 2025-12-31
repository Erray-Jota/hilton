
import { assemblyService } from '../assemblyService';
import { describe, it, expect, beforeAll } from 'vitest';

describe('AssemblyService', () => {
    beforeAll(async () => {
        await assemblyService.init();
    });

    it('should load assemblies from CSV', () => {
        const concrete = assemblyService.getAssemblies('03 Concrete', 100000, { gsf: 10000, floors: 5, totalUnits: 100 });
        expect(concrete.length).toBeGreaterThan(0);
    });

    it('should calculate % GSF correctly', () => {
        const res = assemblyService.getAssemblies('Concrete', 100000, { gsf: 10000, floors: 1, totalUnits: 10 });
        const slab = res.find(a => a.name.includes("Slab on grade") || a.name.includes("Slab on Grade"));

        if (slab) {
            expect(slab.unit).toBe("SF");
            expect(slab.quantity).toBe(2500);
        }
    });

    it('should calculate Constant correctly', () => {
        const res = assemblyService.getAssemblies('Conveying', 100000, { gsf: 10000, floors: 4, totalUnits: 100 });
        const elevator = res.find(a => a.name.includes("Elevator"));

        if (elevator) {
            expect(elevator.quantity).toBe(2);
            expect(elevator.totalCost).toBe(100000 * 0.92);
        }
    });

    it('should enforce strict matching (no equipment overlap)', () => {
        // "14_Conveying_Equipment" should NOT match "Equipment" assemblies
        const conveying = assemblyService.getAssemblies('14_Conveying_Equipment', 100000, { gsf: 10000, floors: 5, totalUnits: 100 });

        const hasElevator = conveying.some(a => a.name.includes('Elevator'));
        // "Laundry Chutes" are in Conveying, but "Guest Laundry" (Equipment) should not be.
        const hasGuestLaundry = conveying.some(a => a.name.includes('Guest Laundry'));

        expect(hasElevator).toBe(true);
        expect(hasGuestLaundry).toBe(false);
    });
    it('Regression: Should map "07_Thermal_Moisture" to "Protection" assemblies', () => {
        const protection = assemblyService.getAssemblies('07_Thermal_Moisture', 100000, { gsf: 10000, floors: 5, totalUnits: 100 });
        // Assuming CSV has Protection data, length should be > 0. 
        // Note: Real CSV parsing happens in init, and we are using real CSV in beforeAll.
        // If local environment lacks the CSV, this might fail, but in this specific user env it exists.
        expect(protection.length).toBeGreaterThan(0);

        const hasRoof = protection.some(a => a.name.toLowerCase().includes('roof'));
        expect(hasRoof).toBe(true);
    });

    it('Regression: Should map "22_Plumbing" to "Plumbing" assemblies', () => {
        // This tests both the mapping logic AND the parser fix (handling missing % price in header)
        const plumbing = assemblyService.getAssemblies('22_Plumbing', 100000, { gsf: 10000, floors: 5, totalUnits: 100 });
        expect(plumbing.length).toBeGreaterThan(0);

        const hasToilet = plumbing.some(a => a.name.toLowerCase().includes('water closet'));
        expect(hasToilet).toBe(true);
    });
});
