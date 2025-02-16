import React, { createContext, useContext } from 'react';

interface WildfireContextType {
    safetyScore: number | null;
    riskValue: string;
    userCoordinates: [number, number] | null;
    fireData: any; // you can type this more strictly if desired
    setSafetyScore: (score: number | null) => void;
    setRiskValue: (risk: string) => void;
    setUserCoordinates: (coords: [number, number]) => void;
}

const WildfireContext = createContext<WildfireContextType | undefined>(undefined);

export const WildfireProvider: React.FC<{
    safetyScore: number | null;
    riskValue: string;
    userCoordinates: [number, number] | null;
    fireData: any;
    setSafetyScore: (score: number | null) => void;
    setRiskValue: (risk: string) => void;
    setUserCoordinates: (coords: [number, number]) => void;
    children: React.ReactNode;
}> = ({
    safetyScore,
    riskValue,
    userCoordinates,
    fireData,
    setSafetyScore,
    setRiskValue,
    setUserCoordinates,
    children,
}) => {
        return (
            <WildfireContext.Provider value={{ safetyScore, riskValue, userCoordinates, fireData, setSafetyScore, setRiskValue, setUserCoordinates }}>
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
