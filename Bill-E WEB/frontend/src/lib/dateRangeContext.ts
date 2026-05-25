import { createContext, useContext } from 'react';

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
const todayStr = today.toISOString().slice(0, 10);

export const defaultDesde = firstDay;
export const defaultHasta = todayStr;

export type DateRangeContextType = {
  desde: string;
  hasta: string;
  setDesde: (d: string) => void;
  setHasta: (h: string) => void;
};

export const DateRangeContext = createContext<DateRangeContextType>({
  desde: firstDay,
  hasta: todayStr,
  setDesde: () => {},
  setHasta: () => {},
});

export const useDateRange = () => useContext(DateRangeContext);
