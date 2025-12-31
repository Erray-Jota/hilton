import Header from "@/components/Header";
import FloorPlanVisualizer from "@/components/FloorPlanVisualizer";
import FloorPlanTable from "@/components/FloorPlanTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function FloorPlanTest() {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-raap-green hover:text-green-700 mb-4 p-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold text-raap-dark mb-2">
          Floor Plan Generator - MVP Preview
        </h1>
        <p className="text-gray-600 mb-8">
          Manual floor plan visualization based on Building B Schedule
        </p>
        
        {/* Building Schedule */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Building B Unit Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Bay</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">SF</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"># Units</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total SF</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2-BED TYPE A</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">780</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-raap-green">3</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">2,340</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1-BED</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">750</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-raap-green">2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">1,500</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2-BED TYPE B</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">3</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">1,120</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-raap-green">1</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">1,120</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">JR. 1-BED</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">1</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">435</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-raap-green">4</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">1,740</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">STUDIO</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">1</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">430</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-raap-green">2</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">860</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Common area</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">4</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">685</td>
                  </tr>
                  <tr className="bg-raap-green bg-opacity-10">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-raap-dark">TOTAL</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-raap-green">12</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-raap-dark">8,245</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* HTML Table Layout Example */}
        <FloorPlanTable />
        
        {/* CSS Grid Layout (previous attempt) */}
        <div className="mt-8">
          <FloorPlanVisualizer />
        </div>
        
        {/* Key Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Building Dimensions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Length:</span>
                  <span className="text-sm font-semibold">235'-0"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Width:</span>
                  <span className="text-sm font-semibold">56'-0"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Area/Floor:</span>
                  <span className="text-sm font-semibold">8,245 SF</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Unit Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">2-Bed:</span>
                  <span className="text-sm font-semibold">4 units (33%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">1-Bed:</span>
                  <span className="text-sm font-semibold">6 units (50%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Studio:</span>
                  <span className="text-sm font-semibold">2 units (17%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Layout Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Corridor:</span>
                  <span className="text-sm font-semibold">6' Central</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Common Area:</span>
                  <span className="text-sm font-semibold">4-Bay (685 SF)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stairs:</span>
                  <span className="text-sm font-semibold">2 (Corners)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
