import { createContext } from "react";
import { IGarage } from "../interface/interface";

const GarageContext = createContext<IGarage>({} as IGarage)
export default GarageContext;