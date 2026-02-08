export interface ApplianceInput {
  name: string;
  powerRating: number;
  dailyUsageHours: number;
  quantity: number;
}

export interface EnergyInputPayload {
  appliances: ApplianceInput[];
  solarPanelCapacity: number;
  batteryStorage: number;
}

export interface ApplianceConsumption {
  name: string;
  powerRating: number;
  dailyUsageHours: number;
  quantity: number;
  dailyConsumption: number;
  monthlyConsumption: number;
}

export interface ConsumptionResponse {
  totalDailyConsumption: number;
  totalMonthlyConsumption: number;
  appliances: ApplianceConsumption[];
}

export interface SolarAnalysisResponse {
  solarUsed: number;
  gridUsed: number;
  excessEnergy: number;
  efficiencyPercentage: number;
  solarCapacity: number;
  batteryStorage: number;
}

export interface CostEstimationResponse {
  monthlySavings: number;
  annualSavings: number;
  solarROI: number;
  paybackPeriod: number;
  gridCostPerMonth: number;
  solarCostPerMonth: number;
}

export function isConsumptionResponse(data: unknown): data is ConsumptionResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.totalDailyConsumption === 'number' &&
    typeof obj.totalMonthlyConsumption === 'number' &&
    Array.isArray(obj.appliances)
  );
}

export function isSolarAnalysisResponse(data: unknown): data is SolarAnalysisResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.solarUsed === 'number' &&
    typeof obj.gridUsed === 'number' &&
    typeof obj.excessEnergy === 'number' &&
    typeof obj.efficiencyPercentage === 'number'
  );
}

export function isCostEstimationResponse(data: unknown): data is CostEstimationResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.monthlySavings === 'number' &&
    typeof obj.annualSavings === 'number' &&
    typeof obj.solarROI === 'number' &&
    typeof obj.paybackPeriod === 'number'
  );
}
