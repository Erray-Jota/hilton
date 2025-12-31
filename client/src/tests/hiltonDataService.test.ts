import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HiltonDataService } from '../../../server/hiltonDataService';

// Mock fs to avoid reading real CSV and ensure deterministic data
vi.mock('fs', () => ({
    default: {
        readFileSync: vi.fn(),
        existsSync: vi.fn(),
    },
    readFileSync: vi.fn(),
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({ from: vi.fn() })),
}));

describe('HiltonDataService', () => {
    let service: HiltonDataService;

    beforeEach(() => {
        service = new HiltonDataService();
    });

    it('normalizes brand names correctly', () => {
        // Access private method via any cast or test effect on public API
        const s = service as any;
        expect(s.normalizeBrand('Home2 Suites')).toBe('Home2');
        expect(s.normalizeBrand('Hampton Inn & Suites')).toBe('Hampton');
        expect(s.normalizeBrand('Tru by Hilton')).toBe('Tru');
        expect(s.normalizeBrand('LivSmart')).toBe('LivSmart');

        // Testing case insensitivity
        expect(s.normalizeBrand('home2 suites')).toBe('Home2');
    });
});
