import React, { createContext, useContext } from 'react';

interface WildfireContextType {
  safetyScore: number | null;
  riskValue: string;
  userCoordinates: [number, number] | null;
  fireData: any; // you can type this more strictly if desired
  routeData: any; // holds the directions route (geometry, distance, duration, steps, etc.)
  setSafetyScore: (score: number | null) => void;
  setRiskValue: (risk: string) => void;
  setUserCoordinates: (coords: [number, number]) => void;
  setRouteData: (route: any) => void;
}

const WildfireContext = createContext<WildfireContextType | undefined>(undefined);

export const WildfireProvider: React.FC<{
  safetyScore: number | null;
  riskValue: string;
  userCoordinates: [number, number] | null;
  fireData: any;
  routeData: any;
  setSafetyScore: (score: number | null) => void;
  setRiskValue: (risk: string) => void;
  setUserCoordinates: (coords: [number, number]) => void;
  setRouteData: (route: any) => void;
  children: React.ReactNode;
}> = ({
  safetyScore,
  riskValue,
  userCoordinates,
  fireData,
  routeData,
  setSafetyScore,
  setRiskValue,
  setUserCoordinates,
  setRouteData,
  children,
}) => {
  return (
    <WildfireContext.Provider
      value={{
        safetyScore,
        riskValue,
        userCoordinates,
        fireData,
        routeData,
        setSafetyScore,
        setRiskValue,
        setUserCoordinates,
        setRouteData,
      }}
    >
      {children}
    </WildfireContext.Provider>
  );
};

export const useWildfireContext = () => {
  const context = useContext(WildfireContext);
  if (!context) {
    throw new Error("useWildfireContext must be used within a WildfireProvider");
  }
  return context;
};
