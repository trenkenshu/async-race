import React, { useReducer } from 'react';
import { ICar, IReducerAction, IReducerState } from '../interface/interface';

const emptyCar: ICar = { id: 0, name: '', color: '' };

const rs: IReducerState = {
    raceNow: [],
    crash: [],
    drive: [],
    timeToFinish: [],
    finished: -1,
    selectedCar: emptyCar,
    totalCars: 0,
    inputs: {
        name: '',
        color: '',
    },
    position: {
        interval: [],
        position: [],
    },
    garagePageNum: 1,
    garageTotalPages: 1,
};

// interface IReducerAction {
//     type:
//         | 'addRace'
//         | 'removeRace'
//         | 'addCrash'
//         | 'removeCrash'
//         | 'addDrive'
//         | 'removeDrive'
//         | 'setFinish'
//         | 'setTimeToFinish'
//         | 'selectCar'
//         | 'setTotalCars'
//         | 'setInputName'
//         | 'setInputColor'
//         | 'setPosImterval'
//         | 'setPosPosition'
//         | 'setGaragePageNum'
//         | 'setGarageTotalPages';
//     id: number;
//     value?: string | number | boolean | ICar;
// }

const garageReducer = (state: IReducerState, action: IReducerAction) => {
    switch (action.type) {
        case 'addRace': {
            state.raceNow[action.id] = true;
            return state;
        }
        case 'removeRace': {
            state.raceNow[action.id] = false;
            return state;
        }
        case 'addCrash': {
            state.crash[action.id] = true;
            return state;
        }
        case 'removeCrash': {
            state.crash[action.id] = false;
            return state;
        }
        case 'addDrive': {
            state.drive[action.id] = true;
            return state;
        }
        case 'removeDrive': {
            state.drive[action.id] = false;
            return state;
        }
        case 'setFinish': {
            state.finished = action.id;
            return state;
        }
        case 'setTimeToFinish': {
            if (typeof action.value == 'number') state.timeToFinish[action.id] = action.value;
            else console.log('wrong type setTimeToFinish, id:', action.id);
            return state;
        }
        case 'selectCar': {
            if (action.car) state.selectedCar = action.car;
            else console.log('wrong type selectCar, id:', action.id);
            return state;
        }
        case 'setTotalCars': {
            if (typeof action.value == 'number') state.totalCars = action.value;
            else console.log('wrong type setTotalCars, id:', action.id);
            return state;
        }
        case 'setInputName': {
            if (typeof action.value == 'string') state.inputs.name = action.value;
            else console.log('wrong type setInputName, id:', action.id);
            return state;
        }
        case 'setInputColor': {
            if (typeof action.value == 'string') state.inputs.name = action.value;
            else console.log('wrong type setInputColor, id:', action.id);
            return state;
        }
        case 'setPosInterval': {
            state.position.interval[action.id] = window.setInterval(() => {
                if (action.raceData)
                    state.position.position[action.id] += (action.raceData.velocity / action.raceData.distance) * 450;
            }, 1);
            if (!action.raceData) console.log('missing or wrong setPosInterval, id:', action.id);
            return state;
        }
        case 'setPosPosition': {
            if (typeof action.value == 'number') state.position.position[action.id] = action.value;
            return state;
        }
        case 'setGaragePageNum': {
            if (typeof action.value == 'number') state.garagePageNum = action.value;
            return state;
        }
        case 'setGarageTotalPages': {
            if (typeof action.value == 'number') state.garageTotalPages = action.value;
            return state;
        }
    }
};
