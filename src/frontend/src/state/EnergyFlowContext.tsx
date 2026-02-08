import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EnergyInputPayload } from '../services/energyTypes';

interface EnergyFlowState {
  inputsSubmitted: boolean;
  latestInputs: EnergyInputPayload | null;
}

interface EnergyFlowContextValue extends EnergyFlowState {
  setInputsSubmitted: (payload: EnergyInputPayload) => void;
  clearInputs: () => void;
}

const EnergyFlowContext = createContext<EnergyFlowContextValue | undefined>(undefined);

export function EnergyFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EnergyFlowState>({
    inputsSubmitted: false,
    latestInputs: null,
  });

  const setInputsSubmitted = (payload: EnergyInputPayload) => {
    setState({
      inputsSubmitted: true,
      latestInputs: payload,
    });
  };

  const clearInputs = () => {
    setState({
      inputsSubmitted: false,
      latestInputs: null,
    });
  };

  return (
    <EnergyFlowContext.Provider
      value={{
        ...state,
        setInputsSubmitted,
        clearInputs,
      }}
    >
      {children}
    </EnergyFlowContext.Provider>
  );
}

export function useEnergyFlow() {
  const context = useContext(EnergyFlowContext);
  if (!context) {
    throw new Error('useEnergyFlow must be used within EnergyFlowProvider');
  }
  return context;
}
