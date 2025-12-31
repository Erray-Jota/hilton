import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import studioImg from "@assets/STUDIO_1761778234023.png";
import oneBedJrImg from "@assets/1BDJR_1761778234023.png";
import oneBedImg from "@assets/1BD_1761778234023.png";
import twoBedAImg from "@assets/2BDA_1761778234022.png";
import twoBedBImg from "@assets/2BDB_1761778234022.png";

interface FloorPlanVisualizerProps {
  title?: string;
}

type UnitType = 'STUDIO' | '1BDJR' | '1BD' | '2BDA' | '2BDB' | 'STAIR' | 'COMMON' | 'EMPTY';

interface Bay {
  width: number;          // Width in feet
  northUnit: {
    type: UnitType;
    label: string;
    dimensions: string;
  } | null;
  southUnit: {
    type: UnitType;
    label: string;
    dimensions: string;
  } | null;
  spanBays?: number;      // For units that span multiple bays (like common area)
}

export default function FloorPlanVisualizer({ 
  title = "Building B - Typical Floor Plan"
}: FloorPlanVisualizerProps) {
  
  // Unit image mapping
  const unitImages: Record<string, string> = {
    'STUDIO': studioImg,
    '1BDJR': oneBedJrImg,
    '1BD': oneBedImg,
    '2BDA': twoBedAImg,
    '2BDB': twoBedBImg,
  };
  
  // Define the building as BAYS (vertical columns) - this is the single source of truth
  // Each bay has a width and defines what's in the north (top) and south (bottom) positions
  const bays: Bay[] = [
    {
      width: 28,
      northUnit: { type: '2BDA', label: '2-BED TYPE A', dimensions: "28' × 28'" },
      southUnit: null, // Empty
    },
    {
      width: 10,
      northUnit: { type: 'STAIR', label: 'STAIR', dimensions: "10' × 14'" },
      southUnit: { type: '1BDJR', label: '1-BD JR', dimensions: "15' × 28'" },
    },
    {
      width: 15.5,
      northUnit: { type: 'STUDIO', label: 'STUDIO', dimensions: "16' × 28'" },
      southUnit: { type: 'STUDIO', label: 'STUDIO', dimensions: "16' × 28'" },
    },
    {
      width: 27,
      northUnit: { type: '1BD', label: '1-BED', dimensions: "27' × 28'" },
      southUnit: { type: '1BDJR', label: '1-BD JR', dimensions: "15' × 28'" },
    },
    {
      width: 60,
      northUnit: { type: 'COMMON', label: 'COMMON AREA', dimensions: "60' × 13'" },
      southUnit: null, // Common area spans full height
      spanBays: 1, // Just this bay
    },
    {
      width: 40,
      northUnit: { type: '2BDB', label: '2-BED TYPE B', dimensions: "40' × 28'" },
      southUnit: { type: '1BDJR', label: '1-BD JR', dimensions: "15' × 28'" },
    },
    {
      width: 27,
      northUnit: { type: '1BD', label: '1-BED', dimensions: "27' × 28'" },
      southUnit: null, // Empty
    },
    {
      width: 28,
      northUnit: { type: '2BDA', label: '2-BED TYPE A', dimensions: "28' × 28'" },
      southUnit: { type: 'STAIR', label: 'STAIR', dimensions: "10' × 14'" },
    },
  ];
  
  // Calculate total building length
  const buildingLength = bays.reduce((sum, bay) => sum + bay.width, 0);
  
  // Scale factor: feet to pixels (architect recommendation: use fixed pixel widths)
  const FT_TO_PX = 8;
  
  // Create grid template with FIXED PIXEL WIDTHS (not fr units!)
  const gridTemplateColumns = bays.map(bay => `${bay.width * FT_TO_PX}px`).join(' ');
  const containerWidth = buildingLength * FT_TO_PX;

  // Render a unit cell - SIMPLIFIED per architect: just images, no overlays
  const renderUnit = (unit: { type: UnitType; label: string; dimensions: string } | null, bayIndex: number, position: 'north' | 'south') => {
    const key = `${position}-${bayIndex}`;
    
    if (!unit) {
      return <div key={key} className="bg-white border border-gray-300" />;
    }
    
    if (unit.type === 'STAIR') {
      return (
        <div key={key} className="bg-gray-200 border-2 border-black flex items-center justify-center">
          <div className="text-xs font-bold text-gray-700">STAIR</div>
        </div>
      );
    }
    
    if (unit.type === 'COMMON') {
      // Common area spans all 3 rows
      return (
        <div 
          key={key} 
          className="bg-yellow-200 border-4 border-black flex items-center justify-center"
          style={{ gridRow: '1 / 4', gridColumn: bayIndex + 1 }}
        >
          <div className="font-bold">COMMON AREA</div>
        </div>
      );
    }
    
    // Regular unit - just the image, no overlay text
    return (
      <div key={key} className="border-2 border-black overflow-hidden">
        <img 
          src={unitImages[unit.type]} 
          alt={unit.label}
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="text-sm text-gray-600">
          Building Length: {Math.round(buildingLength)}'-0" | Width: 56'-0" | Central 6' Corridor
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto bg-white p-6">
          {/* Building dimensions labels */}
          <div className="text-center font-bold text-sm mb-2">
            {Math.round(buildingLength)}'-0"
          </div>
          
          <div className="flex gap-2">
            {/* Left dimension label */}
            <div className="flex items-center justify-center">
              <div className="transform -rotate-90 whitespace-nowrap font-bold text-sm">
                56'-0"
              </div>
            </div>
            
            {/* CSS GRID Floor Plan with FIXED PIXEL WIDTHS for perfect alignment */}
            <div 
              className="border-4 border-black"
              style={{
                display: 'grid',
                gridTemplateColumns: gridTemplateColumns, // Fixed pixel widths!
                gridTemplateRows: '140px 16px 140px', // North row, corridor, south row
                width: `${containerWidth}px`, // Explicit container width
                gap: 0,
              }}
            >
              {/* Render north units (row 1) */}
              {bays.map((bay, idx) => {
                if (bay.northUnit?.type === 'COMMON') {
                  // Common area renders itself and spans all rows
                  return renderUnit(bay.northUnit, idx, 'north');
                }
                return renderUnit(bay.northUnit, idx, 'north');
              })}
              
              {/* Corridor row (row 2) - white stripe across all bays except common area */}
              {bays.map((bay, idx) => {
                if (bay.northUnit?.type === 'COMMON') {
                  return null; // Common area already spans this position
                }
                return <div key={`corridor-${idx}`} className="bg-white border-t border-b border-black" />;
              })}
              
              {/* Render south units (row 3) */}
              {bays.map((bay, idx) => {
                if (bay.northUnit?.type === 'COMMON') {
                  return null; // Common area already spans this position
                }
                return renderUnit(bay.southUnit, idx, 'south');
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
