import React, { useState } from 'react';
import { FinancialProfile, BalanceItem, CashFlowItem, Frequency } from '../types';
import { Card, Input, Button, SectionHeader, Slider } from './UIComponents';
import { Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { calculateNetWorth } from '../utils/simulation';

interface SettingsProps {
  profile: FinancialProfile;
  setProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onRunSimulation: () => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, setProfile, onRunSimulation }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'balance' | 'income' | 'portfolio'>('personal');

  // Generic handler for nested updates
  const updatePersonal = (field: keyof typeof profile.personal, value: any) => {
    setProfile(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const updatePortfolio = (field: keyof typeof profile.portfolio, value: any) => {
    setProfile(prev => ({ ...prev, portfolio: { ...prev.portfolio, [field]: value } }));
  };

  // List Management Helpers
  const addItem = (listKey: 'assets' | 'liabilities' | 'incomes' | 'expenses') => {
    const newItem: any = listKey === 'incomes' || listKey === 'expenses' 
      ? { id: Date.now().toString(), description: 'New Item', monthlyAmount: 0, startDate: new Date().toISOString().slice(0, 10) }
      : { id: Date.now().toString(), description: 'New Item', amount: 0 };
    
    setProfile(prev => ({ ...prev, [listKey]: [...prev[listKey], newItem] }));
  };

  const updateItem = (listKey: string, id: string, field: string, value: any) => {
    setProfile((prev: any) => ({
      ...prev,
      [listKey]: prev[listKey].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (listKey: string, id: string) => {
    setProfile((prev: any) => ({
      ...prev,
      [listKey]: prev[listKey].filter((item: any) => item.id !== id)
    }));
  };

  const netWorth = calculateNetWorth(profile.assets, profile.liabilities);
  const totalMonthlyIncome = profile.incomes.reduce((sum, i) => sum + i.monthlyAmount, 0);
  const totalMonthlyExpense = profile.expenses.reduce((sum, i) => sum + i.monthlyAmount, 0);

  return (
    <div className="h-full flex flex-col bg-institutional-bg">
      {/* Sidebar / Tabs */}
      <div className="flex border-b border-institutional-border bg-white sticky top-0 z-10">
        {(['personal', 'balance', 'income', 'portfolio'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-medium tracking-wide border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-institutional text-institutional' 
                : 'border-transparent text-institutional-muted hover:text-institutional-text'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Personal & Economic Data */}
        {activeTab === 'personal' && (
          <div className="animate-fade-in">
            <SectionHeader title="Personal Assumptions" subtitle="Define the core timeline and economic variables." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Timeline">
                    <Input label="Birthday" type="date" value={profile.personal.birthday} onChange={(e) => updatePersonal('birthday', e.target.value)} />
                    <Input label="Sim Start Date" type="date" value={profile.personal.simulationStartDate} onChange={(e) => updatePersonal('simulationStartDate', e.target.value)} />
                    <Input label="Life Expectancy (Years)" type="number" value={profile.personal.lifeExpectancy} onChange={(e) => updatePersonal('lifeExpectancy', parseInt(e.target.value))} />
                </Card>
                <Card title="Economic Factors">
                    <Slider label="Inflation (Expenses)" value={profile.personal.expenseInflation} min={0} max={10} step={0.1} unit="%" onChange={(e) => updatePersonal('expenseInflation', parseFloat(e.target.value))} />
                    <Slider label="Income Growth" value={profile.personal.incomeGrowth} min={0} max={10} step={0.1} unit="%" onChange={(e) => updatePersonal('incomeGrowth', parseFloat(e.target.value))} />
                </Card>
            </div>
          </div>
        )}

        {/* Balance Sheet */}
        {activeTab === 'balance' && (
          <div className="animate-fade-in space-y-6">
            <SectionHeader title="Balance Sheet" subtitle={`Net Worth: $${netWorth.toLocaleString()}`} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Assets">
                    {profile.assets.map(item => (
                        <div key={item.id} className="flex gap-2 mb-2 items-center">
                            <input className="flex-1 text-sm border-b border-institutional-border bg-transparent outline-none pb-1" value={item.description} onChange={(e) => updateItem('assets', item.id, 'description', e.target.value)} />
                            <input className="w-28 text-sm font-mono text-right border-b border-institutional-border bg-transparent outline-none pb-1" type="number" value={item.amount} onChange={(e) => updateItem('assets', item.id, 'amount', parseFloat(e.target.value))} />
                            <button onClick={() => removeItem('assets', item.id)} className="text-institutional-muted hover:text-institutional-danger"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    <Button variant="ghost" onClick={() => addItem('assets')} className="mt-2 w-full flex items-center justify-center gap-1 text-xs uppercase"><Plus size={14}/> Add Asset</Button>
                </Card>

                <Card title="Liabilities">
                    {profile.liabilities.map(item => (
                        <div key={item.id} className="flex gap-2 mb-2 items-center">
                            <input className="flex-1 text-sm border-b border-institutional-border bg-transparent outline-none pb-1" value={item.description} onChange={(e) => updateItem('liabilities', item.id, 'description', e.target.value)} />
                            <input className="w-28 text-sm font-mono text-right border-b border-institutional-border bg-transparent outline-none pb-1" type="number" value={item.amount} onChange={(e) => updateItem('liabilities', item.id, 'amount', parseFloat(e.target.value))} />
                            <button onClick={() => removeItem('liabilities', item.id)} className="text-institutional-muted hover:text-institutional-danger"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    <Button variant="ghost" onClick={() => addItem('liabilities')} className="mt-2 w-full flex items-center justify-center gap-1 text-xs uppercase"><Plus size={14}/> Add Liability</Button>
                </Card>
            </div>
          </div>
        )}

        {/* Income Statement */}
        {activeTab === 'income' && (
          <div className="animate-fade-in space-y-6">
            <SectionHeader title="Cash Flow" subtitle={`Monthly Net: $${(totalMonthlyIncome - totalMonthlyExpense).toLocaleString()}`} />
            
            <Card title="Income Sources">
                <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-institutional-muted uppercase">
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-3 text-center">Start</div>
                    <div className="col-span-3 text-center">End</div>
                    <div className="col-span-1"></div>
                </div>
                {profile.incomes.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center text-sm">
                        <input className="col-span-3 bg-transparent border-b border-institutional-border outline-none" value={item.description} onChange={(e) => updateItem('incomes', item.id, 'description', e.target.value)} />
                        <input className="col-span-2 text-right font-mono bg-transparent border-b border-institutional-border outline-none" type="number" value={item.monthlyAmount} onChange={(e) => updateItem('incomes', item.id, 'monthlyAmount', parseFloat(e.target.value))} />
                        <input className="col-span-3 bg-transparent border-b border-institutional-border outline-none" type="date" value={item.startDate} onChange={(e) => updateItem('incomes', item.id, 'startDate', e.target.value)} />
                        <input className="col-span-3 bg-transparent border-b border-institutional-border outline-none" type="date" value={item.endDate || ''} onChange={(e) => updateItem('incomes', item.id, 'endDate', e.target.value)} />
                        <button onClick={() => removeItem('incomes', item.id)} className="col-span-1 flex justify-center text-institutional-muted hover:text-institutional-danger"><Trash2 size={14} /></button>
                    </div>
                ))}
                <Button variant="ghost" onClick={() => addItem('incomes')} className="mt-2 w-full flex items-center justify-center gap-1 text-xs uppercase"><Plus size={14}/> Add Income</Button>
            </Card>

            <Card title="Expenses">
                {profile.expenses.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center text-sm">
                        <input className="col-span-3 bg-transparent border-b border-institutional-border outline-none" value={item.description} onChange={(e) => updateItem('expenses', item.id, 'description', e.target.value)} />
                        <input className="col-span-2 text-right font-mono bg-transparent border-b border-institutional-border outline-none" type="number" value={item.monthlyAmount} onChange={(e) => updateItem('expenses', item.id, 'monthlyAmount', parseFloat(e.target.value))} />
                        <input className="col-span-3 bg-transparent border-b border-institutional-border outline-none" type="date" value={item.startDate} onChange={(e) => updateItem('expenses', item.id, 'startDate', e.target.value)} />
                        <input className="col-span-3 bg-transparent border-b border-institutional-border outline-none" type="date" value={item.endDate || ''} onChange={(e) => updateItem('expenses', item.id, 'endDate', e.target.value)} />
                        <button onClick={() => removeItem('expenses', item.id)} className="col-span-1 flex justify-center text-institutional-muted hover:text-institutional-danger"><Trash2 size={14} /></button>
                    </div>
                ))}
                <Button variant="ghost" onClick={() => addItem('expenses')} className="mt-2 w-full flex items-center justify-center gap-1 text-xs uppercase"><Plus size={14}/> Add Expense</Button>
            </Card>
          </div>
        )}

        {/* Portfolio */}
        {activeTab === 'portfolio' && (
          <div className="animate-fade-in space-y-6">
             <SectionHeader title="Portfolio Construction" subtitle="Define return assumptions and contribution schedules." />
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Market Assumptions">
                    <Slider label="Expected Annual Return" value={profile.portfolio.expectedReturn} min={0} max={15} step={0.1} unit="%" onChange={(e) => updatePortfolio('expectedReturn', parseFloat(e.target.value))} />
                    <Slider label="Standard Deviation (Risk)" value={profile.portfolio.stdDev} min={0} max={25} step={0.1} unit="%" onChange={(e) => updatePortfolio('stdDev', parseFloat(e.target.value))} />
                    <p className="text-xs text-institutional-muted mt-4 p-3 bg-institutional-bg rounded-sm border border-institutional-border">
                        Worst case scenario simulates a return of {(profile.portfolio.expectedReturn - 1.5 * profile.portfolio.stdDev).toFixed(2)}% (Mean - 1.5σ).
                    </p>
                </Card>
                <Card title="Recurring Contributions">
                    <Input label="Contribution Amount" type="number" value={profile.portfolio.recurringAmount} onChange={(e) => updatePortfolio('recurringAmount', parseFloat(e.target.value))} />
                    <div className="flex flex-col gap-1.5 mb-3">
                         <label className="text-xs font-semibold text-institutional-muted uppercase tracking-wide">Frequency</label>
                         <select 
                            className="border border-institutional-border bg-institutional-bg/50 rounded-sm px-3 py-2 text-sm text-institutional-text focus:border-institutional focus:ring-1 focus:ring-institutional outline-none"
                            value={profile.portfolio.recurringFrequency}
                            onChange={(e) => updatePortfolio('recurringFrequency', e.target.value)}
                        >
                            <option value={Frequency.WEEKLY}>Weekly</option>
                            <option value={Frequency.MONTHLY}>Monthly</option>
                            <option value={Frequency.QUARTERLY}>Quarterly</option>
                            <option value={Frequency.YEARLY}>Yearly</option>
                         </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Start Date" type="date" value={profile.portfolio.recurringStartDate} onChange={(e) => updatePortfolio('recurringStartDate', e.target.value)} />
                        <Input label="End Date (Optional)" type="date" value={profile.portfolio.recurringEndDate || ''} onChange={(e) => updatePortfolio('recurringEndDate', e.target.value)} />
                    </div>
                </Card>
             </div>
          </div>
        )}
      </div>
      
      {/* Floating Action Bar for Mobile/Desktop */}
      <div className="p-4 bg-white border-t border-institutional-border flex justify-end gap-3 sticky bottom-0 z-20 shadow-lg">
        <Button variant="primary" onClick={onRunSimulation} className="flex items-center gap-2">
            <RotateCcw size={16} />
            Recalculate Model
        </Button>
      </div>
    </div>
  );
};

export default Settings;