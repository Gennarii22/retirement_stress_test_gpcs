export enum ScenarioType {
  BASE = 'BASE',
  WORST = 'WORST',
  BEST = 'BEST',
  COMPARE = 'COMPARE'
}

export enum Frequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export interface BalanceItem {
  id: string;
  description: string;
  amount: number;
}

export interface CashFlowItem {
  id: string;
  description: string;
  monthlyAmount: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

export interface PortfolioSettings {
  expectedReturn: number; // Annual %
  stdDev: number; // Annual %
  initialValue: number; // calculated from Net Worth usually, or specific override
  recurringAmount: number;
  recurringFrequency: Frequency;
  recurringStartDate: string;
  recurringEndDate?: string;
}

export interface PersonalSettings {
  birthday: string;
  simulationStartDate: string;
  lifeExpectancy: number;
  expenseInflation: number; // %
  incomeGrowth: number; // %
}

export interface FinancialProfile {
  personal: PersonalSettings;
  assets: BalanceItem[];
  liabilities: BalanceItem[];
  incomes: CashFlowItem[];
  expenses: CashFlowItem[];
  portfolio: PortfolioSettings;
}

export interface SimulationPoint {
  date: string; // YYYY-MM
  age: number;
  monthIndex: number;
  netWorth: number; // Nominal
  realNetWorth: number; // Adjusted for inflation
  cashFlow: number;
  isRetired: boolean;
}

export interface SimulationResult {
  scenario: ScenarioType;
  data: SimulationPoint[];
  metrics: {
    endingNetWorth: number;
    medianOutcome: number; // Simplified for deterministic run
    ruinProbability: number; // Simplified logic
    lowestPoint: number;
  }
}