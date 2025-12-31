import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Calculator, FileText, MapPin, Users } from "lucide-react";
import raapLogoPath from "@assets/raap-logo-new.png";

export default function Landing() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={raapLogoPath} alt="RaaP Logo" className="h-12 w-auto" />
              <div className="text-gray-400">|</div>
              <h1 className="text-lg font-medium text-raap-dark">ModularFeasibility</h1>
            </div>
            
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-raap-dark mb-6">
            ModularFeasibility Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive feasibility assessment platform for modular construction projects. Evaluate viability, 
            analyze costs, connect with industry partners, plan logistics, and generate professional reports—all in one integrated application.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            size="lg" 
            className="bg-raap-green hover:bg-green-700 text-lg px-8 py-3"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-raap-dark mb-8 text-center">
            Comprehensive Feasibility Platform
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feasibility Assessment */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-raap-dark text-lg">Feasibility Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  6-criteria scoring system evaluating zoning, massing, cost, sustainability, logistics, and build time
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Weighted scoring algorithm</li>
                  <li>• Detailed justifications</li>
                  <li>• Project type optimization</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-raap-dark text-lg">Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  MasterFormat breakdown comparing site-built vs modular construction costs across 14 categories
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Per-unit & per-SF metrics</li>
                  <li>• Cost savings calculations</li>
                  <li>• Export to CSV/PDF</li>
                </ul>
              </CardContent>
            </Card>

            {/* Partner Marketplace */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle className="text-raap-dark text-lg">Partner Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  18+ construction partners including fabricators, GCs, AORs, transportation, consultants, and engineering
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Interactive partner mapping</li>
                  <li>• Detailed partner profiles</li>
                  <li>• Ratings & certifications</li>
                </ul>
              </CardContent>
            </Card>

            {/* Logistics Planning */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-raap-dark text-lg">Logistics Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  Transportation analysis from factory to site with route mapping and delivery planning
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Distance calculations</li>
                  <li>• Route visualization</li>
                  <li>• Staging considerations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Professional Reporting */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle className="text-raap-dark text-lg">Professional Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  Generate comprehensive PDF reports with scoring, cost analysis, and recommendations
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Executive summaries</li>
                  <li>• Charts & visualizations</li>
                  <li>• Stakeholder-ready format</li>
                </ul>
              </CardContent>
            </Card>

            {/* Project Types */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-cyan-600" />
                </div>
                <CardTitle className="text-raap-dark text-lg">Multiple Project Types</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  Support for affordable, senior, student, workforce housing, plus hotels and hostels
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Customized scoring logic</li>
                  <li>• Type-specific metrics</li>
                  <li>• Flexible unit configurations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">
              All features integrated into a single streamlined application for efficient feasibility assessment
            </p>
          </div>
        </div>

        {/* Sample Project Showcase */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-raap-dark mb-6 text-center">
            Sample Project: Serenity Village Feasibility Assessment
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300" 
                alt="Serenity Village development site" 
                className="w-full h-48 rounded-lg object-cover mb-4"
              />
              <div className="space-y-2">
                <h3 className="font-semibold text-raap-dark">5224 Chestnut Road, Olivehurst CA</h3>
                <p className="text-sm text-gray-600">Affordable Housing • 24 Units • 3 Stories</p>
                <p className="text-sm text-gray-600">146' × 66' • Type V-A Construction</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-raap-green mb-2">8.9/10</div>
                <div className="text-sm text-gray-600">Overall Feasibility Score</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">1%</div>
                  <div className="text-xs text-gray-600">Cost Savings</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">4 months</div>
                  <div className="text-xs text-gray-600">Time Saved</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Zoning Feasibility</span>
                  <span className="font-semibold text-raap-dark">4.5/5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Cost Analysis</span>
                  <span className="font-semibold text-raap-dark">4.5/5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Logistics</span>
                  <span className="font-semibold text-raap-dark">4.0/5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Build Time</span>
                  <span className="font-semibold text-raap-dark">4.5/5</span>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <strong>Strong candidate for modular construction</strong> with favorable scores across 
                all feasibility criteria. Partner marketplace identified 5+ qualified fabricators within 
                200-mile radius.
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-raap-dark mb-4">
            Ready to Assess Your Project's Feasibility?
          </h2>
          <p className="text-gray-600 mb-8">
            Join multifamily developers using ModularFeasibility to evaluate projects, analyze costs, connect with partners, and generate professional reports
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            size="lg" 
            className="bg-raap-green hover:bg-green-700 text-lg px-8 py-3"
            data-testid="button-begin-assessment"
          >
            Begin Assessment
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={raapLogoPath} alt="RaaP Logo" className="h-10 w-auto" />
              <div className="text-sm text-gray-500">
                © 2025 RaaP. Professional modular construction assessment platform.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
