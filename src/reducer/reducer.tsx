import Rest from '../api/rest';
import { ICar, IReducerAction, IReducerState, IWinner } from '../interface/interface';

const emptyCar: ICar = { id: 0, name: '', color: '' };

const api = new Rest();

// const modal = document.querySelector('.modal') as HTMLDivElement;

const rsNulled: IReducerState = {
    racePage: [],
    winSort: '',
    winDirection: '',
    winPage: 1,
    raceNow: [],
    crash: [],
    drive: [],
    timeToFinish: [],
    finished: -1,
    selectedCar: emptyCar,
    totalCars: 0,
    totalWinners: 0,
    inputs: {
        name: '',
        color: '',
    },
    position: {
        interval: [],
        position: [],
    },
    garagePageNum: 1,
    garageTotalPages: [1],
    colorPickerDisplay: 'none',
};

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
            const x = state.crash.slice(0);
            x[action.id] = true;
            return { ...state, crash: x };
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
            return { ...state, finished: action.id };
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
        case 'setTotalWinners': {
            if (typeof action.value == 'number') state.totalWinners = action.value;
            else console.log('wrong type setTotalWinners, id:', action.id);
            return state;
        }
        case 'setInputName': {
            if (typeof action.value == 'string') state.inputs.name = action.value;
            else console.log('wrong type setInputName, id:', action.id);
            return state;
        }
        case 'setInputColor': {
            if (typeof action.value == 'string') state.inputs.color = action.value;
            else console.log('wrong type setInputColor, id:', action.id);
            return state;
        }
        case 'setPosInterval': {
            state.position.interval[action.id] = window.setInterval(() => {
                if (state.crash[action.id]) {
                    console.log('disabled on crash', action.id);
                    clearInterval(state.position.interval[action.id]);
                    return state;
                }
                if (action.raceData && state.position.position[action.id] < 90) {
                    state.position.position[action.id] += (action.raceData.velocity / action.raceData.distance) * 4500;
                } else {
                    clearInterval(state.position.interval[action.id]);
                    state.finished = action.id;
                    console.log('disabled on finish', action.id);
                    if (state.position.position.filter((item) => item >= 90).length === 1) {
                        const modal = document.querySelector('.modal') as HTMLDivElement;
                        if (modal) {
                            modal.classList.add('active');
                            // modal.style.top = '40vh';
                            modal.innerHTML =
                                String(action.cars?.find((e) => e.id === action.id)?.name) +
                                ' won in ' +
                                state.timeToFinish[action.id].toString() +
                                'sec';
                            setTimeout(() => modal.classList.remove('active') /*modal.style.top = '400vh'*/, 5000);
                        }

                        api.getOneResponse(action.id, 'winners')
                            .then((data) => {
                                if (data.status == 404) {
                                    api.createWinner(action.id, 1, state.timeToFinish[action.id])
                                        .then((winner) => {
                                            console.log('create winner, first win', winner);
                                        })
                                        .catch((err: Error) => console.log(err.message));
                                } else {
                                    data.json()
                                        .then((json: IWinner) => {
                                            const newTime =
                                                state.timeToFinish[action.id] > json.time
                                                    ? json.time
                                                    : state.timeToFinish[action.id];
                                            console.log('create winner, existing winner', json, newTime);
                                            api.updateWinner(action.id, json.wins + 1, newTime).catch((err: Error) =>
                                                console.log(err.message)
                                            );
                                        })
                                        .catch((err: Error) => console.log(err.message));
                                }
                            })
                            .catch((err: Error) => console.log(err.message));
                    }
                    //     clearInterval(state.position.interval[action.id]);
                    //     state.finished = action.id;
                    //     console.log('disabled on finish', action.id);
                }
            }, 30);
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
            if (action.pages) state.garageTotalPages = action.pages;
            return state;
        }
        case 'setWinPage': {
            if (typeof action.value == 'number') state.winPage = action.value;
            return state;
        }
        case 'setWinDirection': {
            if (action.value == 'ASC' || action.value == 'DESC') state.winDirection = action.value;
            return state;
        }
        case 'setWinSort': {
            if (action.value == 'id' || action.value == 'time' || action.value == 'wins') state.winSort = action.value;
            return state;
        }
        case 'setColorPickerDisplay': {
            if (action.value == 'none' || action.value == 'block') state.colorPickerDisplay = action.value;
            return state;
        }

        // default: {
        //     console.log('incorrent action, id:', action.id);
        // }
    }
};

export { rsNulled, garageReducer };
