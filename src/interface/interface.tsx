export interface ICar extends Record<string, number | string> {
    name: string;
    color: string;
    id: number;
}

export interface IRace extends Record<string, number> {
    velocity: number;
    distance: number;
}

export interface IDrive extends Record<string, boolean> {
    success: boolean;
}

export interface IWinner extends Record<string, number> {
    id: number;
    wins: number;
    time: number;
}
