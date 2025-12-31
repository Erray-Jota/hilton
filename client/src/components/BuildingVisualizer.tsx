import { Card } from "@/components/ui/card";
import { 
  selectFloorPlan, 
  calculateUnitsPerFloor, 
  getBuildingRendering,
  UNIT_PLANS,
  type FloorPlanOption
} from "@/lib/floorPlanLibrary";

interface BuildingVisualizerProps {
  totalUnits: number;
  stories: number;
  unitMix?: {
    studio?: number;
    oneBed?: number;
    twoBed?: number;
    threeBed?: number;
  };
}

export function BuildingVisualizer({ totalUnits, stories, unitMix }: BuildingVisualizerProps) {
  // Calculate units per floor and select best floor plan
  const unitsPerFloor = calculateUnitsPerFloor(totalUnits, stories);
  const selectedPlan = selectFloorPlan(unitsPerFloor);
  const buildingImage = getBuildingRendering(selectedPlan, stories);

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Units</p>
            <p className="text-2xl font-bold" data-testid="text-total-units">{totalUnits}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stories</p>
            <p className="text-2xl font-bold" data-testid="text-stories">{stories}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Units/Floor</p>
            <p className="text-2xl font-bold" data-testid="text-units-per-floor">{unitsPerFloor}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Floor Plan</p>
            <p className="text-2xl font-bold" data-testid="text-selected-plan">{selectedPlan.unitsPerFloor}-Unit</p>
          </div>
        </div>
      </Card>

      {/* 3D Building Rendering */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Building Visualization</h3>
        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={buildingImage}
            alt={`${stories}-story building with ${selectedPlan.unitsPerFloor} units per floor`}
            className="w-full h-auto"
            data-testid="img-building-rendering"
          />
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-md shadow-lg">
            <p className="text-sm font-medium" data-testid="text-building-label">
              {stories}-Story | {selectedPlan.unitsPerFloor} Units/Floor
            </p>
          </div>
        </div>
      </Card>

      {/* 2D Floor Plan */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Floor Plan Layout</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {selectedPlan.description} - Optimized for your {totalUnits}-unit project
        </p>
        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={selectedPlan.floorPlan2D}
            alt={`Floor plan showing ${selectedPlan.unitsPerFloor} units per floor`}
            className="w-full h-auto"
            data-testid="img-floor-plan"
          />
        </div>
      </Card>

      {/* Unit Mix Display */}
      {unitMix && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Unit Mix</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {unitMix.studio && unitMix.studio > 0 && (
              <div className="text-center">
                <img
                  src={UNIT_PLANS.studio}
                  alt="Studio unit plan"
                  className="w-full h-auto rounded-lg mb-2"
                  data-testid="img-unit-studio"
                />
                <p className="font-medium" data-testid="text-studio-count">Studio</p>
                <p className="text-sm text-muted-foreground">{unitMix.studio} units</p>
              </div>
            )}
            {unitMix.oneBed && unitMix.oneBed > 0 && (
              <div className="text-center">
                <img
                  src={UNIT_PLANS.oneBed}
                  alt="1-bedroom unit plan"
                  className="w-full h-auto rounded-lg mb-2"
                  data-testid="img-unit-1bed"
                />
                <p className="font-medium" data-testid="text-1bed-count">1 Bedroom</p>
                <p className="text-sm text-muted-foreground">{unitMix.oneBed} units</p>
              </div>
            )}
            {unitMix.twoBed && unitMix.twoBed > 0 && (
              <div className="text-center">
                <img
                  src={UNIT_PLANS.twoBed}
                  alt="2-bedroom unit plan"
                  className="w-full h-auto rounded-lg mb-2"
                  data-testid="img-unit-2bed"
                />
                <p className="font-medium" data-testid="text-2bed-count">2 Bedroom</p>
                <p className="text-sm text-muted-foreground">{unitMix.twoBed} units</p>
              </div>
            )}
            {unitMix.threeBed && unitMix.threeBed > 0 && (
              <div className="text-center">
                <img
                  src={UNIT_PLANS.threeBed}
                  alt="3-bedroom unit plan"
                  className="w-full h-auto rounded-lg mb-2"
                  data-testid="img-unit-3bed"
                />
                <p className="font-medium" data-testid="text-3bed-count">3 Bedroom</p>
                <p className="text-sm text-muted-foreground">{unitMix.threeBed} units</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
