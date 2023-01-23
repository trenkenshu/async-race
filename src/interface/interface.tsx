import Rest from '../api/rest';

export interface ICar extends Record<string, number | string> {
    name: string;
    color: string;
    id: number;
}

export interface IRace extends Record<string, number> {
    velocity: number;
    distance: number;
}

export interface IRaceState extends Record<string, number[]> {
    raceNow: number[];
    crash: number[];
    timeToFinish: number[];
    finished: number[];
}

export interface IDrive extends Record<string, boolean> {
    success: boolean;
}

export interface IWinner extends Record<string, number> {
    id: number;
    wins: number;
    time: number;
}

export interface IGarage {
    cars: ICar[];
    emptyCar: ICar;
    setCars: (arg: ICar[]) => void;
    selectedCar: ICar;
    setSelectedCar: (arg: ICar) => void;
    color: string;
    name: string;
    setColor: (arg: string) => void;
    setName: (arg: string) => void;
    refreshCars: (page: number, api: Rest, setCars: (arg: ICar[]) => void) => void;
    curentPageNum: number;
    raceArr: Promise<IRace>[];
    raceNow: number[];
    rs: IRaceState;
    started: number[];
    singleCarRace: (arg: number, raceNow: number[]) => void;
    singleCarStop: (id: number, rs: IRaceState) => void;
}

export interface IReducerState {
    raceNow: boolean[];
    crash: boolean[];
    drive: boolean[];
    timeToFinish: number[];
    finished: number;
    selectedCar: ICar;
    inputs: {
        name: string;
        color: string;
    };
    totalCars: number;
    position: {
        interval: number[];
        position: number[];
    };
    garagePageNum: number;
    garageTotalPages: number;
}

export interface IReducerAction {
    type:
        | 'addRace'
        | 'removeRace'
        | 'addCrash'
        | 'removeCrash'
        | 'addDrive'
        | 'removeDrive'
        | 'setFinish'
        | 'setTimeToFinish'
        | 'selectCar'
        | 'setTotalCars'
        | 'setInputName'
        | 'setInputColor'
        | 'setPosInterval'
        | 'setPosPosition'
        | 'setGaragePageNum'
        | 'setGarageTotalPages';
    id: number;
    value?: string | number | boolean;
    car?: ICar;
    raceData?: IRace;
}
