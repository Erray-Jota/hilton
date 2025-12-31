// Floor Plan Library - Static assets for 12, 14, 15, 19, 21 unit configurations

// Individual Unit Plans (3D Isometric Views)
import studioUnit from "@assets/studio_1761784059305.png";
import oneBedUnit from "@assets/one_bedroom_1761784059305.png";
import twoBedUnit from "@assets/two_bedroom_1761784059306.png";
import threeBedUnit from "@assets/three_bedroom_1761784059306.png";

// 2D Floor Plans
import plan12 from "@assets/12_1761783826501.png";
import plan14 from "@assets/14_1761783826502.png";
import plan15 from "@assets/15_1761783826502.png";
import plan19 from "@assets/19_1761783826502.png";
import plan21 from "@assets/21_1761783826502.png";

// 3D Building Renderings - 3 Story
import building3_12 from "@assets/3-12_1761783803855.png";
import building3_14 from "@assets/3-14_1761783803856.png";
import building3_15 from "@assets/3-15_1761783803856.png";
import building3_19 from "@assets/3-19_1761783803856.png";
import building3_21 from "@assets/3-21_1761783803856.png";

// 3D Building Renderings - 4 Story
import building4_12 from "@assets/4-12_1761783803857.png";
import building4_14 from "@assets/4-14_1761783803857.png";
import building4_15 from "@assets/4-15_1761783803857.png";
import building4_19 from "@assets/4-19_1761783803857.png";
import building4_21 from "@assets/4-21_1761783803858.png";

export interface FloorPlanOption {
  unitsPerFloor: number;
  floorPlan2D: string;
  building3Story: string;
  building4Story: string;
  description: string;
}

export const FLOOR_PLAN_OPTIONS: FloorPlanOption[] = [
  {
    unitsPerFloor: 12,
    floorPlan2D: plan12,
    building3Story: building3_12,
    building4Story: building4_12,
    description: "Compact 12-unit floor plan"
  },
  {
    unitsPerFloor: 14,
    floorPlan2D: plan14,
    building3Story: building3_14,
    building4Story: building4_14,
    description: "14-unit floor plan"
  },
  {
    unitsPerFloor: 15,
    floorPlan2D: plan15,
    building3Story: building3_15,
    building4Story: building4_15,
    description: "15-unit floor plan"
  },
  {
    unitsPerFloor: 19,
    floorPlan2D: plan19,
    building3Story: building3_19,
    building4Story: building4_19,
    description: "Extended 19-unit floor plan"
  },
  {
    unitsPerFloor: 21,
    floorPlan2D: plan21,
    building3Story: building3_21,
    building4Story: building4_21,
    description: "Large 21-unit floor plan"
  }
];

export const UNIT_PLANS = {
  studio: studioUnit,
  oneBed: oneBedUnit,
  twoBed: twoBedUnit,
  threeBed: threeBedUnit,
};

/**
 * Select the closest floor plan option based on target units per floor
 */
export function selectFloorPlan(targetUnitsPerFloor: number): FloorPlanOption {
  // Find the closest match
  let closest = FLOOR_PLAN_OPTIONS[0];
  let minDiff = Math.abs(targetUnitsPerFloor - closest.unitsPerFloor);
  
  for (const option of FLOOR_PLAN_OPTIONS) {
    const diff = Math.abs(targetUnitsPerFloor - option.unitsPerFloor);
    if (diff < minDiff) {
      minDiff = diff;
      closest = option;
    }
  }
  
  return closest;
}

/**
 * Calculate units per floor from total units and stories
 */
export function calculateUnitsPerFloor(totalUnits: number, stories: number): number {
  return Math.round(totalUnits / stories);
}

/**
 * Get the appropriate building rendering based on stories
 */
export function getBuildingRendering(floorPlan: FloorPlanOption, stories: number): string {
  // Default to 3-story if not 3 or 4
  if (stories === 4) {
    return floorPlan.building4Story;
  }
  return floorPlan.building3Story;
}
