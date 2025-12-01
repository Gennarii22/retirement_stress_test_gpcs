import React, { useState, useEffect, useCallback } from 'react';
import { FinancialProfile, Frequency, SimulationResult, ScenarioType } from './types';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';
import { runSimulation } from './utils/simulation';
import { LayoutDashboard, Sliders } from 'lucide-react';

const App: React.FC = () => {
  // --- Initial State Definition ---
  const [profile, setProfile] = useState<FinancialProfile>({
    personal: {
      birthday: '1985-06-15',
      simulationStartDate: new Date().toISOString().slice(0, 10),
      lifeExpectancy: 90,
      expenseInflation: 3.0,
      incomeGrowth: 2.0
    },
    assets: [
      { id: '1', description: '401k / IRA', amount: 450000 },
      { id: '2', description: 'Brokerage Account', amount: 120000 },
      { id: '3', description: 'Home Equity', amount: 300000 }
    ],
    liabilities: [
      { id: '1', description: 'Mortgage', amount: 250000 }
    ],
    incomes: [
      { id: '1', description: 'Salary', monthlyAmount: 12000, startDate: '2023-01-01', endDate: '2045-06-01' }
    ],
    expenses: [
      { id: '1', description: 'Living Expenses', monthlyAmount: 8500, startDate: '2023-01-01' }
    ],
    portfolio: {
      expectedReturn: 7.0,
      stdDev: 12.0,
      initialValue: 0, // Calculated dynamically in logic if 0
      recurringAmount: 1500,
      recurringFrequency: Frequency.MONTHLY,
      recurringStartDate: '2023-01-01',
      recurringEndDate: '2045-06-01'
    }
  });

  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [activeScenario, setActiveScenario] = useState<ScenarioType>(ScenarioType.BASE);
  const [activeView, setActiveView] = useState<'dashboard' | 'settings'>('dashboard');

  // --- Logic ---

  const executeSimulations = useCallback(() => {
    const base = runSimulation(profile, ScenarioType.BASE);
    const worst = runSimulation(profile, ScenarioType.WORST);
    const best = runSimulation(profile, ScenarioType.BEST);
    setSimulationResults([base, worst, best]);
  }, [profile]);

  // Run initial simulation on mount
  useEffect(() => {
    executeSimulations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div className="min-h-screen bg-institutional-bg font-sans text-institutional-text flex flex-col h-screen overflow-hidden">
      
      {/* Header */}
      <header className="bg-white border-b border-institutional-border h-16 flex-none flex items-center justify-between px-6 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-institutional rounded-sm flex items-center justify-center text-white font-bold font-mono">
            R
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-institutional-dark">RETIREMENT STRESS TEST</h1>
        </div>
        
        <div className="flex gap-1 bg-institutional-bg p-1 rounded-md border border-institutional-border">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-sm transition-all ${activeView === 'dashboard' ? 'bg-white text-institutional shadow-sm' : 'text-institutional-muted hover:text-institutional'}`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveView('settings')}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-sm transition-all ${activeView === 'settings' ? 'bg-white text-institutional shadow-sm' : 'text-institutional-muted hover:text-institutional'}`}
          >
            <Sliders size={16} /> Settings
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeView === 'dashboard' ? (
          <div className="h-full overflow-y-auto bg-gray-50/50">
             <Dashboard 
                results={simulationResults} 
                activeScenario={activeScenario} 
                setActiveScenario={setActiveScenario}
                profile={profile}
             />
          </div>
        ) : (
          <Settings 
            profile={profile} 
            setProfile={setProfile} 
            onRunSimulation={() => {
                executeSimulations();
                setActiveView('dashboard');
            }} 
          />
        )}
      </main>

    </div>
  );
};

export default App;