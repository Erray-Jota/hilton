
import { type CostData } from "./types";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

interface ComparisonSectionProps {
    data1: CostData;
    data2: CostData;
    rooms1: number;
    rooms2: number;
}

export const ComparisonSection = ({ data1, data2, rooms1, rooms2 }: ComparisonSectionProps) => {
    const costDiff = data2.totalLocal - data1.totalLocal;
    const keyDiff = data2.costPerKey - data1.costPerKey;

    // Use exact room counts passed from parents
    const rDiff = rooms2 - rooms1;

    return (
        <div className="mt-8 bg-[#fff9c4] border border-yellow-200 rounded-lg p-4">
            <h3 className="text-[#003f87] font-bold text-lg mb-4">Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow-sm text-center">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Cost Difference</div>
                    <div className={`text-xl font-bold ${costDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {costDiff > 0 ? "+" : ""}{formatCurrency(costDiff)}
                    </div>
                    <div className="text-[10px] text-gray-400">Scenario B {costDiff > 0 ? 'higher' : 'lower'}</div>
                </div>
                <div className="bg-white p-4 rounded shadow-sm text-center">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Room Difference</div>
                    <div className="text-xl font-bold text-[#003f87]">
                        {rDiff > 0 ? "+" : ""}{rDiff}
                    </div>
                    <div className="text-[10px] text-gray-400">Scenario B {rDiff > 0 ? 'larger' : 'smaller'}</div>
                </div>
                <div className="bg-white p-4 rounded shadow-sm text-center">
                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Cost/Room Diff</div>
                    <div className={`text-xl font-bold ${keyDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {keyDiff > 0 ? "+" : ""}{formatCurrency(keyDiff)}
                    </div>
                    <div className="text-[10px] text-gray-400">Per room</div>
                </div>
            </div>
        </div>
    );
};
