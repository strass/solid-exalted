import { useContext } from "react";
import { createContext } from "react";

export const SolidContext =
  createContext<undefined | { dataInstances: string[] }>(undefined);

const useSolidContext = () => {
  const context = useContext(SolidContext);
  if (!context) {
    throw new Error("Must be used inside a context provider");
  }
  return context;
};

export default useSolidContext;
