
import { useState, Fragment } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type CostData } from "./types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface CostBreakdownTableProps {
    data1: CostData;
    data2: CostData;
}

const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

const formatPct = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(val / 100);

// Helpers to categorize divisions
const groups = [
    {
        id: "concrete",
        label: "Concrete, Masonry & Metals (Estimate)",
        prefixes: ["03", "04", "05"]
    },
    {
        id: "rooms",
        label: "Rooms",
        prefixes: ["06", "07", "08", "09"]
    },
    {
        id: "equip",
        label: "Equipment & Special Construction",
        prefixes: ["10", "11", "12", "13", "14"]
    },
    {
        id: "mep",
        label: "MEPs",
        prefixes: ["21", "22", "23", "26", "27", "28"]
    },
    {
        id: "site",
        label: "Site Work (Estimate)",
        prefixes: ["31", "32", "33", "Site_Work"]
    },
    {
        id: "charges",
        label: "GC Charges (Estimate)",
        prefixes: ["GC", "Charges", "01"]
    }
];

// Custom label mapping for specific prefixes
const labelOverrides: Record<string, string> = {
    "06": "06 Wood & Plastics",
    "07": "07 Protection"
};

const AssemblyDetailDialog = ({ item, title }: { item: any; title: string }) => {
    if (!item.assemblies || item.assemblies.length === 0) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2 group">
                    <span>{title}</span>
                    <Info className="h-4 w-4 text-blue-500 opacity-100" />
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#003f87] mb-2">{title} - Detailed Breakdown</DialogTitle>
                    <DialogDescription>
                        Breakdown of assemblies and costs for this division.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="w-auto md:w-[200px] font-bold text-gray-900 text-sm md:text-lg px-2">Assembly Name</TableHead>
                                <TableHead className="hidden md:table-cell w-[300px] font-bold text-gray-900 text-lg">Description</TableHead>
                                <TableHead className="font-bold text-gray-900 text-sm md:text-lg text-right px-2">Unit</TableHead>
                                <TableHead className="font-bold text-gray-900 text-sm md:text-lg text-right px-2">Value</TableHead>
                                <TableHead className="hidden md:table-cell font-bold text-gray-900 text-lg text-right">% of Div</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {item.assemblies.map((asm: any, idx: number) => (
                                <TableRow key={idx} className="hover:bg-gray-50">
                                    <TableCell className="font-semibold text-gray-800 text-sm md:text-base align-top px-2">{asm.name}</TableCell>
                                    <TableCell className="hidden md:table-cell text-gray-700 text-base whitespace-normal align-top leading-snug">
                                        {asm.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-sm md:text-base text-gray-900 font-mono align-top text-nowrap px-2">
                                        {asm.quantity.toLocaleString()} {asm.unit}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-gray-900 text-sm md:text-base align-top px-2">
                                        {formatCurrency(asm.totalCost)}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-right text-base text-gray-600 align-top">
                                        {item.localCost > 0 ? formatPct((asm.totalCost / item.localCost) * 100) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                <TableCell colSpan={2} className="text-sm md:text-lg text-[#003f87] px-2 text-right md:text-left">Division Total</TableCell>
                                <TableCell className="hidden md:table-cell text-right"></TableCell>
                                <TableCell className="text-right text-sm md:text-lg text-[#003f87] px-2">{formatCurrency(item.localCost)}</TableCell>
                                <TableCell className="hidden md:table-cell text-right text-lg">100%</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ScenarioTable = ({ data, title, headerColor }: { data: CostData, title: string, headerColor: string }) => {
    // Helper to process data into groups
    const processData = (data: CostData) => {
        const grouped = groups.map(g => ({ ...g, items: [] as typeof data.breakdown, total: 0 }));
        const otherItems: typeof data.breakdown = [];

        data.breakdown.forEach(item => {
            const label = item.label;
            const matchedGroup = grouped.find(g => g.prefixes.some(p => label.trim().startsWith(p)));

            if (matchedGroup) {
                matchedGroup.items.push(item);
                matchedGroup.total += item.localCost;
            } else {
                otherItems.push(item);
            }
        });

        return { grouped, otherItems, total: data.totalLocal };
    };

    const d = processData(data);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        concrete: true, rooms: true, equip: true, mep: true, site: true, charges: true
    });
    const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="py-2 px-3 text-white font-bold text-sm" style={{ backgroundColor: headerColor }}>
                <span className="hidden lg:inline">{title} - </span>Cost Breakdown
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="py-2 px-3">Division</th>
                            <th className="py-2 px-3 text-right">Cost</th>
                            <th className="py-2 px-3 text-right text-xs text-gray-700 font-bold">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {d.grouped.map((g) => {
                            const gPct = d.total > 0 ? (g.total / d.total) : 0;
                            const isExpanded = expanded[g.id];

                            return (
                                <Fragment key={g.id}>
                                    <tr
                                        className="bg-gray-100 hover:bg-gray-200 cursor-pointer border-b border-gray-200 transition-colors duration-150"
                                        onClick={() => toggle(g.id)}
                                    >
                                        <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2 text-base">
                                            <motion.span
                                                initial={false}
                                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronRight className="h-5 w-5 text-gray-700" />
                                            </motion.span>
                                            {g.label}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-gray-900 text-base">{formatCurrency(g.total)}</td>
                                        <td className="py-3 px-4 text-right text-sm text-gray-700 font-semibold">{formatPct(gPct * 100)}</td>
                                    </tr>
                                    <AnimatePresence>
                                        {isExpanded && g.items.map((item, idx) => {
                                            const iPct = d.total > 0 ? (item.localCost / d.total) : 0;

                                            // Determine Label
                                            let label = item.label;
                                            const prefix = label.substring(0, 2);
                                            if (labelOverrides[prefix]) {
                                                label = labelOverrides[prefix];
                                            } else {
                                                label = label === 'Charges_Fees' ? 'Charges & Fees' : label.replace(/_/g, ' ');
                                            }

                                            return (
                                                <motion.tr
                                                    key={idx}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-100"
                                                >
                                                    <td className="py-3 px-4 pl-10 text-gray-800 truncate text-sm font-medium">
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            {item.assemblies && item.assemblies.length > 0 ? (
                                                                <AssemblyDetailDialog item={item} title={label} />
                                                            ) : (
                                                                <span>{label}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-gray-900 text-sm">{formatCurrency(item.localCost)}</td>
                                                    <td className="py-3 px-4 text-right text-sm text-gray-700">{formatPct(iPct * 100)}</td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </Fragment>
                            );
                        })}
                        <tr className="bg-[#f0f9ff] font-bold text-sm border-t-2 border-gray-200">
                            <td className="py-4 px-4 uppercase text-[#003f87] text-lg">Total</td>
                            <td className="py-4 px-4 text-right text-[#003f87] text-lg">{formatCurrency(d.total)}</td>
                            <td className="py-4 px-4 text-right text-sm opacity-100 text-gray-900">100%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const CostBreakdownTable = ({ data1, data2 }: CostBreakdownTableProps) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-8 space-y-2">
            <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 p-0 hover:bg-transparent text-[#003f87] text-lg font-bold">
                        {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        Detailed Cost Breakdown
                        <span className="text-xs font-normal text-gray-500 ml-2">(Click to toggle)</span>
                    </Button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    <ScenarioTable data={data1} title="Scenario A" headerColor="#003f87" />
                    <div className="hidden lg:block">
                        <ScenarioTable data={data2} title="Scenario B" headerColor="#003f87" />
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
