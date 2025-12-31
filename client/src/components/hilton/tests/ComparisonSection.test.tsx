import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComparisonSection } from '../ComparisonSection';
import { CostData } from '../types';

describe('ComparisonSection', () => {
    const emptyData: CostData = {
        totalLocal: 0, costPerSf: 0, costPerKey: 0, gsf: 0, buildingLength: 0, buildingWidth: 0,
        kingRooms: 0, queenRooms: 0, doubleQueenRooms: 0, adaRooms: 0, kingOneRooms: 0,
        breakdown: []
    };

    it('calculates room difference correctly using exact room counts', () => {
        // Scenario: User selects 100 vs 120 rooms.
        // Even if breakdown components don't sum perfectly, calculation should follow props.
        render(<ComparisonSection
            data1={{ ...emptyData, totalLocal: 1000000, costPerKey: 10000 }}
            data2={{ ...emptyData, totalLocal: 1200000, costPerKey: 10000 }}
            rooms1={100}
            rooms2={120}
        />);

        // Expect Room Difference to be +20
        expect(screen.getByText('+20')).toBeInTheDocument();
        expect(screen.getByText('Scenario B larger')).toBeInTheDocument();
    });

    it('calculates cost difference correctly', () => {
        render(<ComparisonSection
            data1={{ ...emptyData, totalLocal: 1000000 }}
            data2={{ ...emptyData, totalLocal: 1500000 }}
            rooms1={100}
            rooms2={100}
        />);

        // +$500,000
        // Note: formatCurrency usually adds $ and commas. exact match might be loose.
        // Let's check for the number part or text content.
        const diffEl = screen.getByText((content) => content.includes('500,000'));
        expect(diffEl).toBeInTheDocument();
        expect(diffEl).toHaveClass('text-red-600'); // Higher cost = red
    });
});
