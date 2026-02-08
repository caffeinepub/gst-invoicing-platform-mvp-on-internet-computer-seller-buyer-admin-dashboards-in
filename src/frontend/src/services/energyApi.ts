import {
  EnergyInputPayload,
  ConsumptionResponse,
  SolarAnalysisResponse,
  CostEstimationResponse,
  isConsumptionResponse,
  isSolarAnalysisResponse,
  isCostEstimationResponse,
} from './energyTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const TOKEN_KEY = 'auth_token';

class EnergyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'EnergyApiError';
  }
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(
  response: Response,
  validator: (data: unknown) => data is T
): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new EnergyApiError(
      `API request failed: ${response.statusText}`,
      response.status
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new EnergyApiError('Invalid JSON response from server', response.status, error);
  }

  if (!validator(data)) {
    throw new EnergyApiError('Invalid response structure from server', response.status);
  }

  return data;
}

export async function submitEnergyInputs(payload: EnergyInputPayload): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inputs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new EnergyApiError(
        `Failed to submit inputs: ${response.statusText}`,
        response.status
      );
    }
  } catch (error) {
    if (error instanceof EnergyApiError) {
      throw error;
    }
    throw new EnergyApiError(
      'Network error: Unable to connect to the energy API',
      undefined,
      error
    );
  }
}

export async function fetchConsumption(): Promise<ConsumptionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/consumption`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response, isConsumptionResponse);
  } catch (error) {
    if (error instanceof EnergyApiError) {
      throw error;
    }
    throw new EnergyApiError(
      'Network error: Unable to connect to the energy API',
      undefined,
      error
    );
  }
}

export async function fetchSolarAnalysis(): Promise<SolarAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/solar-analysis`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response, isSolarAnalysisResponse);
  } catch (error) {
    if (error instanceof EnergyApiError) {
      throw error;
    }
    throw new EnergyApiError(
      'Network error: Unable to connect to the energy API',
      undefined,
      error
    );
  }
}

export async function fetchCostEstimation(): Promise<CostEstimationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cost-estimation`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response, isCostEstimationResponse);
  } catch (error) {
    if (error instanceof EnergyApiError) {
      throw error;
    }
    throw new EnergyApiError(
      'Network error: Unable to connect to the energy API',
      undefined,
      error
    );
  }
}
