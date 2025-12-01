import { FinancialProfile, ScenarioType, SimulationPoint, SimulationResult, Frequency } from '../types';

// Helper to parse date strings
const parseDate = (dateStr: string) => new Date(dateStr);

// Helper to check if a date is within a range
const isWithinRange = (current: Date, start: Date, end?: Date) => {
  if (current < start) return false;
  if (end && current > end) return false;
  return true;
};

// Calculate initial Net Worth from balance sheet
export const calculateNetWorth = (assets: any[], liabilities: any[]) => {
  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabs = liabilities.reduce((sum, item) => sum + item.amount, 0);
  return totalAssets - totalLiabs;
};

export const runSimulation = (profile: FinancialProfile, scenario: ScenarioType): SimulationResult => {
  const { personal, incomes, expenses, portfolio } = profile;

  // 1. Setup Parameters based on Scenario
  let annualReturn = portfolio.expectedReturn / 100;
  let annualVol = portfolio.stdDev / 100;
  let inflationRate = personal.expenseInflation / 100;
  let incomeGrowthRate = personal.incomeGrowth / 100;

  if (scenario === ScenarioType.WORST) {
    annualReturn = (portfolio.expectedReturn - 1.5 * portfolio.stdDev) / 100;
    inflationRate += 0.015; // +1.5% inflation shock
    incomeGrowthRate -= 0.01;
  } else if (scenario === ScenarioType.BEST) {
    annualReturn = (portfolio.expectedReturn + 1.0 * portfolio.stdDev) / 100;
    inflationRate -= 0.005; // -0.5% inflation cooling
    incomeGrowthRate += 0.005;
  }

  // Monthly conversions
  const monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;
  const monthlyInflation = Math.pow(1 + inflationRate, 1/12) - 1;
  const monthlyIncomeGrowth = Math.pow(1 + incomeGrowthRate, 1/12) - 1;

  // 2. Timeline Setup
  const startDate = parseDate(personal.simulationStartDate);
  const birthDate = parseDate(personal.birthday);
  const endAge = personal.lifeExpectancy;
  const endDate = new Date(birthDate);
  endDate.setFullYear(endDate.getFullYear() + endAge);

  let currentDate = new Date(startDate);
  let currentWealth = calculateNetWorth(profile.assets, profile.liabilities);
  let currentRealWealth = currentWealth;
  let cumulativeInflation = 1;

  const data: SimulationPoint[] = [];
  let monthIndex = 0;
  let hasRuined = false;

  const recurringStart = parseDate(portfolio.recurringStartDate);
  const recurringEnd = portfolio.recurringEndDate ? parseDate(portfolio.recurringEndDate) : undefined;

  // 3. Month-by-Month Loop
  while (currentDate <= endDate) {
    const age = (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    // Determine active cash flows
    let monthlyTotalIncome = 0;
    incomes.forEach(inc => {
        const start = parseDate(inc.startDate);
        const end = inc.endDate ? parseDate(inc.endDate) : undefined;
        if (isWithinRange(currentDate, start, end)) {
            // Apply income growth
            const monthsSinceStart = Math.max(0, (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
            monthlyTotalIncome += inc.monthlyAmount * Math.pow(1 + monthlyIncomeGrowth, monthsSinceStart);
        }
    });

    let monthlyTotalExpenses = 0;
    expenses.forEach(exp => {
        const start = parseDate(exp.startDate);
        const end = exp.endDate ? parseDate(exp.endDate) : undefined;
        if (isWithinRange(currentDate, start, end)) {
            // Apply expense inflation
            const monthsSinceStart = Math.max(0, (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
            monthlyTotalExpenses += exp.monthlyAmount * Math.pow(1 + monthlyInflation, monthsSinceStart);
        }
    });

    // Determine Portfolio Contributions
    let contribution = 0;
    if (isWithinRange(currentDate, recurringStart, recurringEnd)) {
        // Simplified: assuming monthly frequency for the simulation step, logic can be expanded for weekly/yearly
        if (portfolio.recurringFrequency === Frequency.MONTHLY) {
            contribution = portfolio.recurringAmount;
        } else if (portfolio.recurringFrequency === Frequency.YEARLY && monthIndex % 12 === 0) {
            contribution = portfolio.recurringAmount;
        } else if (portfolio.recurringFrequency === Frequency.WEEKLY) {
            contribution = portfolio.recurringAmount * 4.33;
        } else if (portfolio.recurringFrequency === Frequency.QUARTERLY && monthIndex % 3 === 0) {
            contribution = portfolio.recurringAmount;
        }
    }

    // Calculation Step
    const netCashFlow = monthlyTotalIncome - monthlyTotalExpenses + contribution;
    
    // Apply Market Return to existing wealth (simplified deterministic path for the line, Monte Carlo would be separate)
    // For "Probability of Ruin", we usually need true Monte Carlo. 
    // Here we project the deterministic path based on the scenario assumptions (which modify the return).
    
    const investmentReturn = currentWealth * monthlyReturn;
    currentWealth = currentWealth + investmentReturn + netCashFlow;

    // Deflate for Real Wealth
    cumulativeInflation *= (1 + monthlyInflation);
    currentRealWealth = currentWealth / cumulativeInflation;

    if (currentWealth < 0) hasRuined = true;

    data.push({
        date: currentDate.toISOString().slice(0, 7), // YYYY-MM
        age: parseFloat(age.toFixed(1)),
        monthIndex,
        netWorth: Math.round(currentWealth),
        realNetWorth: Math.round(currentRealWealth),
        cashFlow: Math.round(netCashFlow),
        isRetired: monthlyTotalIncome < 1000 // Heuristic for retirement status if no specific date given
    });

    // Advance Month
    currentDate.setMonth(currentDate.getMonth() + 1);
    monthIndex++;
  }

  return {
      scenario,
      data,
      metrics: {
          endingNetWorth: Math.round(currentWealth),
          medianOutcome: Math.round(currentWealth), // Deterministic proxy
          ruinProbability: hasRuined ? 100 : 0, // In a single deterministic run, it's binary
          lowestPoint: Math.min(...data.map(d => d.netWorth))
      }
  };
};