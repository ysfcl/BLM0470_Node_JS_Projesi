import { createContext, useContext } from 'react';
import { useSensor } from '../hooks/useSensor';

const SensorContext = createContext(null);

export function SensorProvider({ children }) {
  const sensor = useSensor();
  return (
    <SensorContext.Provider value={sensor}>
      {children}
    </SensorContext.Provider>
  );
}

export const useSensorContext = () => useContext(SensorContext);