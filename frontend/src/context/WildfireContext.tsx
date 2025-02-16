"use client"

import React, { useState, createContext, useContext } from 'react';

interface WeatherResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    relative_humidity_2m: number[];
  };
}

interface AirQualityResponse {
  hourly: {
    time: string[];
    us_aqi: number[];
  };
}

interface WildfireContextType {
  safetyScore: number | null;
  riskValue: string;
  userCoordinates: [number, number] | null;
  fireData: any; // you can type this more strictly if desired
  routeData: any; // holds the directions route data
  weatherData: WeatherResponse | null;
  airQualityData: AirQualityResponse | null;
  setSafetyScore: (score: number | null) => void;
  setRiskValue: (risk: string) => void;
  setUserCoordinates: (coords: [number, number]) => void;
  setRouteData: (route: any) => void;
  setWeatherData: (data: WeatherResponse | null) => void;
  setAirQualityData: (data: AirQualityResponse | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAddress: any | null;
  setSelectedAddress: (address: any) => void;
  shouldAutoSearch: boolean;
  setShouldAutoSearch: (flag: boolean) => void;
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
  activeTab?: string;
  selectedAddress?: any;
  shouldAutoSearch?: boolean;
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
  const [activeTab, setActiveTab] = useState<string>("alerts");
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [shouldAutoSearch, setShouldAutoSearch] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityResponse | null>(null);

  return (
    <WildfireContext.Provider
      value={{
        safetyScore,
        riskValue,
        userCoordinates,
        fireData,
        routeData,
        weatherData,
        airQualityData,
        setSafetyScore,
        setRiskValue,
        setUserCoordinates,
        setRouteData,
        setWeatherData,
        setAirQualityData,
        activeTab,
        setActiveTab,
        selectedAddress,
        setSelectedAddress,
        shouldAutoSearch,
        setShouldAutoSearch,
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
