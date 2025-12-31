import { useState } from "react";
import { BuildingVisualizer } from "@/components/BuildingVisualizer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FLOOR_PLAN_OPTIONS } from "@/lib/floorPlanLibrary";

export default function FloorPlanDemo() {
  const [totalUnits, setTotalUnits] = useState(60);
  const [stories, setStories] = useState(3);
  const [unitMix, setUnitMix] = useState({
    studio: 10,
    oneBed: 20,
    twoBed: 25,
    threeBed: 5,
  });

  const presets = [
    { name: "Small Project", units: 36, stories: 3, mix: { studio: 8, oneBed: 12, twoBed: 12, threeBed: 4 } },
    { name: "Medium Project", units: 60, stories: 3, mix: { studio: 10, oneBed: 20, twoBed: 25, threeBed: 5 } },
    { name: "Large Project", units: 84, stories: 4, mix: { studio: 15, oneBed: 30, twoBed: 30, threeBed: 9 } },
    { name: "High-Rise", units: 63, stories: 3, mix: { studio: 12, oneBed: 24, twoBed: 21, threeBed: 6 } },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Floor Plan Visualizer
        </h1>
        <p className="text-muted-foreground">
          Interactive demonstration of the static floor plan library system
        </p>
      </div>

      {/* Controls */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Project Parameters */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Project Parameters</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="totalUnits">Total Units</Label>
              <Input
                id="totalUnits"
                type="number"
                min="1"
                max="200"
                value={totalUnits}
                onChange={(e) => setTotalUnits(parseInt(e.target.value) || 0)}
                data-testid="input-total-units"
              />
            </div>
            <div>
              <Label htmlFor="stories">Number of Stories</Label>
              <Input
                id="stories"
                type="number"
                min="1"
                max="10"
                value={stories}
                onChange={(e) => setStories(parseInt(e.target.value) || 1)}
                data-testid="input-stories"
              />
            </div>
          </div>

          <h3 className="font-medium mb-3">Unit Mix</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studio">Studio Units</Label>
              <Input
                id="studio"
                type="number"
                min="0"
                value={unitMix.studio}
                onChange={(e) => setUnitMix({ ...unitMix, studio: parseInt(e.target.value) || 0 })}
                data-testid="input-studio"
              />
            </div>
            <div>
              <Label htmlFor="oneBed">1-Bedroom Units</Label>
              <Input
                id="oneBed"
                type="number"
                min="0"
                value={unitMix.oneBed}
                onChange={(e) => setUnitMix({ ...unitMix, oneBed: parseInt(e.target.value) || 0 })}
                data-testid="input-1bed"
              />
            </div>
            <div>
              <Label htmlFor="twoBed">2-Bedroom Units</Label>
              <Input
                id="twoBed"
                type="number"
                min="0"
                value={unitMix.twoBed}
                onChange={(e) => setUnitMix({ ...unitMix, twoBed: parseInt(e.target.value) || 0 })}
                data-testid="input-2bed"
              />
            </div>
            <div>
              <Label htmlFor="threeBed">3-Bedroom Units</Label>
              <Input
                id="threeBed"
                type="number"
                min="0"
                value={unitMix.threeBed}
                onChange={(e) => setUnitMix({ ...unitMix, threeBed: parseInt(e.target.value) || 0 })}
                data-testid="input-3bed"
              />
            </div>
          </div>
        </Card>

        {/* Presets */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Presets</h2>
          <div className="space-y-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setTotalUnits(preset.units);
                  setStories(preset.stories);
                  setUnitMix(preset.mix);
                }}
                data-testid={`button-preset-${preset.name.toLowerCase().replace(' ', '-')}`}
              >
                <div className="text-left">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.units} units, {preset.stories} stories
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-2">Available Floor Plans</h3>
            <div className="flex flex-wrap gap-2">
              {FLOOR_PLAN_OPTIONS.map((option) => (
                <div
                  key={option.unitsPerFloor}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-full text-sm font-medium"
                  data-testid={`badge-option-${option.unitsPerFloor}`}
                >
                  {option.unitsPerFloor}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Visualizer */}
      <BuildingVisualizer
        totalUnits={totalUnits}
        stories={stories}
        unitMix={unitMix}
      />
    </div>
  );
}
