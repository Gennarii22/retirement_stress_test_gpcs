import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SimulationResult, ScenarioType, FinancialProfile } from '../types';
import { Card, Button } from './UIComponents';
import { TrendingUp, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { generateFinancialAnalysis } from '../services/geminiService';

interface DashboardProps {
  results: SimulationResult[];
  activeScenario: ScenarioType;
  setActiveScenario: (s: ScenarioType) => void;
  profile: FinancialProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ results, activeScenario, setActiveScenario, profile }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper to find data for specific scenario
  const getData = (type: ScenarioType) => results.find(r => r.scenario === type);
  const currentResult = getData(activeScenario) || getData(ScenarioType.BASE);
  const baseResult = getData(ScenarioType.BASE);
  const worstResult = getData(ScenarioType.WORST);
  const bestResult = getData(ScenarioType.BEST);

  // Combine data for comparison view
  const comparisonData = baseResult?.data.map((point, i) => ({
      date: point.date,
      Base: point.netWorth,
      Worst: worstResult?.data[i]?.netWorth,
      Best: bestResult?.data[i]?.netWorth,
      age: point.age
  }));

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatCompact = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact", maximumFractionDigits: 1 }).format(val);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await generateFinancialAnalysis(results, profile);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Scenario Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-institutional-text">Wealth Projection</h1>
            <p className="text-institutional-muted text-sm">Monte Carlo deterministic equivalent projection based on volatility assumptions.</p>
          </div>
          <div className="flex bg-white rounded-md border border-institutional-border p-1 shadow-sm">
             {[ScenarioType.WORST, ScenarioType.BASE, ScenarioType.BEST, ScenarioType.COMPARE].map(type => (
                 <button
                    key={type}
                    onClick={() => setActiveScenario(type)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all duration-200 ${
                        activeScenario === type 
                        ? 'bg-institutional text-white shadow-sm' 
                        : 'text-institutional-muted hover:text-institutional-text hover:bg-institutional-bg'
                    }`}
                 >
                    {type === 'COMPARE' ? 'Compare All' : type.charAt(0) + type.slice(1).toLowerCase()}
                 </button>
             ))}
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-institutional">
            <p className="text-xs font-bold text-institutional-muted uppercase">Ending Net Worth</p>
            <p className="text-2xl font-mono font-bold text-institutional-text mt-1">
                {currentResult && formatCompact(currentResult.metrics.endingNetWorth)}
            </p>
            <div className="mt-2 text-xs text-institutional-muted">
                Nominal value at age {profile.personal.lifeExpectancy}
            </div>
        </Card>
        <Card className={`border-l-4 ${currentResult?.metrics.ruinProbability === 0 ? 'border-l-institutional-success' : 'border-l-institutional-danger'}`}>
             <p className="text-xs font-bold text-institutional-muted uppercase">Survival Status</p>
             <div className="flex items-center gap-2 mt-1">
                {currentResult?.metrics.ruinProbability === 0 ? (
                    <>
                        <ShieldCheck className="text-institutional-success" size={24}/>
                        <span className="text-xl font-bold text-institutional-text">Safe</span>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="text-institutional-danger" size={24}/>
                        <span className="text-xl font-bold text-institutional-text">Failure Risk</span>
                    </>
                )}
             </div>
             <div className="mt-2 text-xs text-institutional-muted">
                Based on {activeScenario.toLowerCase()} case
            </div>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
             <p className="text-xs font-bold text-institutional-muted uppercase">Lowest Balance</p>
             <p className="text-2xl font-mono font-bold text-institutional-text mt-1">
                {currentResult && formatCompact(currentResult.metrics.lowestPoint)}
            </p>
             <div className="mt-2 text-xs text-institutional-muted">
                Minimum liquidity point
            </div>
        </Card>
        <Card className="border-l-4 border-l-blue-400 flex flex-col justify-between">
             <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-institutional-muted uppercase">AI Analyst</p>
                <Cpu size={16} className="text-institutional-muted"/>
             </div>
             <Button variant="secondary" onClick={handleAiAnalysis} disabled={isAnalyzing} className="w-full text-xs mt-2">
                {isAnalyzing ? "Analyzing..." : "Generate Report"}
             </Button>
        </Card>
      </div>
      
      {/* AI Report */}
      {aiAnalysis && (
        <div className="bg-institutional-bg border border-institutional-border p-4 rounded-md animate-fade-in">
            <h3 className="text-sm font-bold text-institutional mb-2 flex items-center gap-2">
                <Cpu size={14}/> Analyst Report
            </h3>
            <div className="text-sm text-institutional-text leading-relaxed whitespace-pre-line font-sans">
                {aiAnalysis}
            </div>
        </div>
      )}

      {/* Main Chart */}
      <Card className="h-96 w-full p-4">
        <h3 className="text-sm font-bold text-institutional-muted mb-4 uppercase tracking-wide">Net Worth Trajectory</h3>
        <ResponsiveContainer width="100%" height="90%">
            {activeScenario === ScenarioType.COMPARE ? (
                <AreaChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#556B2F" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#556B2F" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6B7280'}} minTickGap={50} />
                    <YAxis tick={{fontSize: 10, fill: '#6B7280', fontFamily: 'monospace'}} tickFormatter={formatCompact} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #D3D6DB', borderRadius: '4px', fontSize: '12px' }} 
                        formatter={(val: number) => formatCurrency(val)}
                    />
                    <Area type="monotone" dataKey="Worst" stroke="#B84242" fill="none" strokeWidth={2} dot={false} name="Worst Case" />
                    <Area type="monotone" dataKey="Base" stroke="#556B2F" fill="url(#colorBase)" strokeWidth={2} dot={false} name="Base Case" />
                    <Area type="monotone" dataKey="Best" stroke="#3B82F6" fill="none" strokeWidth={2} dot={false} name="Best Case" />
                </AreaChart>
            ) : (
                <AreaChart data={currentResult?.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#556B2F" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#556B2F" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6B7280'}} minTickGap={50} />
                    <YAxis tick={{fontSize: 10, fill: '#6B7280', fontFamily: 'monospace'}} tickFormatter={formatCompact} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #D3D6DB', borderRadius: '4px', fontSize: '12px' }} 
                        formatter={(val: number) => formatCurrency(val)}
                        labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="netWorth" 
                        stroke="#556B2F" 
                        fill="url(#colorNetWorth)" 
                        strokeWidth={2} 
                        dot={false} 
                        animationDuration={500}
                        name="Net Worth"
                    />
                    <ReferenceLine y={0} stroke="#B84242" strokeDasharray="3 3" />
                </AreaChart>
            )}
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Simulation Details">
              <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-institutional-muted">Scenario</span>
                      <span className="font-mono font-bold text-institutional">{activeScenario}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-institutional-muted">Expected Return</span>
                      <span className="font-mono">
                          {activeScenario === ScenarioType.WORST ? (profile.portfolio.expectedReturn - 1.5 * profile.portfolio.stdDev).toFixed(2) : 
                           activeScenario === ScenarioType.BEST ? (profile.portfolio.expectedReturn + 1.0 * profile.portfolio.stdDev).toFixed(2) :
                           profile.portfolio.expectedReturn.toFixed(2)}%
                      </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-institutional-muted">Inflation Rate</span>
                      <span className="font-mono">
                           {activeScenario === ScenarioType.WORST ? (profile.personal.expenseInflation + 1.5).toFixed(2) : 
                           activeScenario === ScenarioType.BEST ? (profile.personal.expenseInflation - 0.5).toFixed(2) :
                           profile.personal.expenseInflation.toFixed(2)}%
                      </span>
                  </div>
                  <div className="flex justify-between pb-2">
                      <span className="text-institutional-muted">Simulation Duration</span>
                      <span className="font-mono">{currentResult?.data.length} months</span>
                  </div>
              </div>
          </Card>
      </div>
    </div>
  );
};

export default Dashboard;