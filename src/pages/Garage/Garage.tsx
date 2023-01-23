/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rest from '../../api/rest';
import { ICar, IGarage, IRace, IRaceState, IReducerState, IWinner } from '../../interface/interface';
import AddCarBlock from '../../components/addCarBlock';
import CarImg from '../../assets/car2.svg';
import GarageContext from '../../context/garageContext';
import RaceBlock from '../../components/raceBlock';
import { ReducerContext } from '../../components/App/App';
import { finished } from 'stream';

const api = new Rest();
const raceArr: Promise<IRace>[] = [];
const rs: IRaceState = {
    raceNow: [],
    crash: [],
    timeToFinish: [],
    finished: [],
};
const raceNow: number[] = [];

const Garage = () => {
    const { reducerState, dispatch } = useContext(ReducerContext);
    const emptyCar = { id: 0, name: '', color: '' };
    const [cars, setCars] = useState<ICar[]>([]);
    const [selectedCar, setSelectedCar] = useState(reducerState.selectedCar);
    const [color, setColor] = useState(reducerState.inputs.color);
    const [name, setName] = useState(reducerState.inputs.name);
    //const [pages, setPages] = useState<number[]>([]);
    const [curentPageNum, setCurentPageNum] = useState(1);
    //const [total, setTotal] = useState(0);
    const [started, setStarted] = useState<number[]>([]);
    const [drive, setDrive] = useState<number[]>([]);
    const [crashed, setCrashed] = useState<number[]>([]);
    const [position, setPosition] = useState<{ interval: number; position: number }[]>([]);

    //////////////// LOAD AND REFRESH ////////////////

    const refreshCars = (page: number, api: Rest, setCars: (arg: ICar[]) => void) => {
        api.getCars(page, 7)
            .then((response) => {
                const totalCars = Number(response.headers.get('X-Total-Count'));
                dispatch({ type: 'setTotalCars', value: totalCars, id: 0 });
                const pagesCount = Math.ceil(totalCars / 7);
                dispatch({
                    type: 'setGarageTotalPages',
                    pages: Array.from({ length: pagesCount }).map((item, index) => index + 1),
                    id: 0,
                });
                return response.json();
            })
            .then((data: ICar[]) => {
                setCars(data);
            })
            .catch((err: Error) => console.log('initial getCars error', err.message));
    };

    useEffect(() => {
        refreshCars(reducerState.garagePageNum, api, setCars);
    }, []);

    /////////////// ADD ////////////////////////

    const add = (prev: number[], id: number) => {
        const next = prev.slice(0);
        next.push(id);

        return next;
    };

    ///////////////// REMOVE ///////////////////

    const remove = (prev: number[], id: number) => {
        const next = prev.slice(0);
        const ind = next.indexOf(id);
        next.splice(ind, 1);

        return next;
    };

    //////////// CHECK AND ADD-UPDATE WINNER /////////////

    const checkAndAdd = (id: number) => {
        console.log(reducerState.finished, id);
        if (id) {
            /////////// MODAL ////////////////

            const modal = document.querySelector('.modal') as HTMLDivElement;
            if (modal) {
                modal.classList.add('active');
                modal.innerHTML =
                    String(cars.find((e) => e.id === id)?.name) +
                    ' won in ' +
                    reducerState.timeToFinish[id].toString() +
                    'sec';
                setTimeout(() => modal.classList.remove('active'), 4000);
            }

            // api.getOneResponse(id, 'winners')
            //     .then((data) => {
            //         if (data.status == 404) {
            //             api.createWinner(id, 1, reducerState.timeToFinish[id])
            //                 .then((winner) => {
            //                     console.log('create winner on finish', winner);
            //                 })
            //                 .catch((err: Error) => console.log(err.message));
            //         } else {
            //             data.json()
            //                 .then((json: IWinner) => {
            //                     const newTime =
            //                         reducerState.timeToFinish[id] > json.time
            //                             ? json.time
            //                             : reducerState.timeToFinish[id];
            //                     console.log('existing winner', json, newTime);
            //                     api.updateWinner(id, json.wins + 1, newTime).catch((err: Error) =>
            //                         console.log(err.message)
            //                     );
            //                 })
            //                 .catch((err: Error) => console.log(err.message));
            //         }
            //     })
            //     .catch((err: Error) => console.log(err.message));
        }
    };

    ////////////////// ANIMATE //////////////////////

    const animate = (id: number, rs: IRaceState) => {
        const el = document.querySelector(`#car-${id}`) as HTMLElement;

        if (el && reducerState.position.position[id])
            el.style.left = reducerState.position.position[id].toString() + '%';

        if (el && reducerState.position.position[id] > 90 && !reducerState.crash[id]) {
            //clearInterval(reducerState.position.interval[id]);
            //console.log('disabled on finish');

            if (reducerState.raceNow[id] && reducerState.position.position.filter((el) => el >= 90).length === 1) {
                //dispatch({ type: 'setFinish', id: id });
                checkAndAdd(id);
            }
        } else if (reducerState.crash[id]) {
            clearInterval(reducerState.position.interval[id]);

            console.log('disabled on crush');
        } else {
            window.requestAnimationFrame(() => animate(id, rs));
        }
    };

    //////////////// SINGLE RACE ////////////////////////

    const singleCarRace = (id: number, raceNow: number[]) => {
        api.startEngine(id)
            .then((data) => {
                setStarted((prev: number[]) => add(prev, id));
                !reducerState.raceNow[id] && dispatch({ type: 'addRace', id: id });
                dispatch({
                    type: 'setTimeToFinish',
                    id: id,
                    value: Number((data.distance / data.velocity / 900).toFixed(2)),
                });

                rs.timeToFinish[id] = Number((data.distance / data.velocity / 900).toFixed(2));

                dispatch({
                    type: 'setPosPosition',
                    id: id,
                    value: 0,
                });
                dispatch({
                    type: 'setPosInterval',
                    id: id,
                    raceData: data,
                    cars: cars.slice(),
                });

                setPosition((prev) => {
                    prev[id] = {
                        interval: window.setInterval(() => {
                            prev[id].position += (data.velocity / data.distance) * 450;
                        }, 1),
                        position: 0,
                    };
                    return prev;
                });

                requestAnimationFrame(() => {
                    animate(id, rs);
                });

                return api.driveEngine(id);
            })
            .then((res: Response) => {
                if (res.status == 500) {
                    console.log('broken', id);
                    reducerState.raceNow[id] && dispatch({ type: 'addCrash', id: id });
                    reducerState.raceNow[id] && rs.crash.push(id);
                    clearInterval(reducerState.position.interval[id]);
                    setPosition((prev) => {
                        clearInterval(prev[id].interval);

                        return prev;
                    });
                } else if (res.status == 404) {
                    console.log('double start', id);
                } else {
                    reducerState.raceNow[id] && dispatch({ type: 'addDrive', id: id });
                }
            })
            .catch((err: Error) => console.log(err.message));
    };

    ///////////////// SINGLE STOP ///////////////////////////

    const singleCarStop = (id: number, rs: IRaceState) => {
        let ind = rs.raceNow.indexOf(id);
        rs.raceNow.splice(ind, 1);

        ind = rs.finished.indexOf(id);
        rs.finished.splice(ind, 1);
        ind = rs.crash.indexOf(id);
        rs.crash.splice(ind, 1);
        delete rs.timeToFinish[id];

        clearInterval(reducerState.position.interval[id]);

        dispatch({
            type: 'removeRace',
            id: id,
        });
        dispatch({
            type: 'removeDrive',
            id: id,
        });
        dispatch({
            type: 'removeCrash',
            id: id,
        });
        dispatch({
            type: 'setTimeToFinish',
            id: 0,
            value: 0,
        });
        api.stopEngine(id)
            .then(() => {
                dispatch({
                    type: 'setPosPosition',
                    id: id,
                    value: 0,
                });
                const el = document.querySelector(`#car-${id}`) as HTMLElement;
                if (el) el.style.left = '0px';

                setStarted((prev: number[]) => remove(prev, id));
                setDrive((prev: number[]) => remove(prev, id));
                setCrashed((prev: number[]) => remove(prev, id));

                // setPosition((prev) => {
                //     //window.clearInterval(prev[id].interval);
                //     prev[id].position = 0;

                //     return prev;
                // });
            })
            .catch((err: Error) => console.log(err.message));
    };

    /////////////// SAVE/GET STATE ////////////////

    ////////////////// CONTEXT ////////////////

    const garageVals: IGarage = {
        cars,
        emptyCar,
        setCars,
        selectedCar,
        setSelectedCar,
        color,
        name,
        setColor,
        setName,
        refreshCars,
        curentPageNum,
        raceArr,
        singleCarRace,
        singleCarStop,
        raceNow,
        started,
        rs,
        reducerState,
        dispatch,
    };

    return (
        <GarageContext.Provider value={garageVals}>
            <>
                <h1
                    className="header"
                    onClick={() => {
                        console.log(reducerState);
                    }}
                >
                    Garage <span>{reducerState.totalCars ? `(${reducerState.totalCars})` : ''}</span>
                    <span className="numPage">{reducerState.garagePageNum} page</span>
                </h1>
                <div style={{ height: '2rem' }}>
                    Go to{' '}
                    <Link className="link" to="/winners">
                        Winners
                    </Link>
                </div>
                <AddCarBlock />
                <RaceBlock />
                <div className="racingTrack">
                    {cars.map((item) => {
                        return (
                            <div className="singleTrack" key={item.id}>
                                <div className="singleCarName">
                                    {item.id} {item.name}{' '}
                                    <span className="started">
                                        {reducerState.raceNow.find((i, ind) => ind === item.id) ? ' started' : ''}
                                    </span>{' '}
                                    <span className="drive">
                                        {/*reducerState.drive.find((i, ind) => ind === item.id) ? 'ok' : ''*/}
                                    </span>{' '}
                                    <span className="crashed">
                                        {reducerState.crash.find((i, ind) => ind === item.id) ? 'crashed' : ''}
                                    </span>
                                </div>

                                <div className="editCar">
                                    <button
                                        onClick={() => {
                                            setSelectedCar(item);
                                            dispatch({
                                                type: 'selectCar',
                                                id: 0,
                                                car: item,
                                            });
                                            setColor(item.color);
                                            setName(item.name);
                                            dispatch({
                                                type: 'setInputColor',
                                                id: 0,
                                                value: item.color,
                                            });
                                            dispatch({
                                                type: 'setInputName',
                                                id: 0,
                                                value: item.name,
                                            });
                                        }}
                                        className="btn"
                                    >
                                        Edit car
                                    </button>

                                    <button
                                        onClick={() => {
                                            api.deleteOne(item.id, 'garage')
                                                .then((data) => {
                                                    console.log('deleted ', data);
                                                    return api.getOneResponse(item.id, 'winners');
                                                })
                                                .then((res) => {
                                                    if (res.status === 200) {
                                                        api.deleteOne(item.id, 'winners').catch((err: Error) =>
                                                            console.log(err.message)
                                                        );
                                                    }

                                                    if (cars.length === 1) {
                                                        setCurentPageNum((prev) => prev - 1);
                                                        refreshCars(
                                                            reducerState.garageTotalPages.length - 1,
                                                            api,
                                                            setCars
                                                        );
                                                    } else {
                                                        refreshCars(curentPageNum, api, setCars);
                                                    }
                                                })
                                                .catch((err: Error) => console.log(err.message));
                                        }}
                                        className="btn"
                                    >
                                        Delete
                                    </button>

                                    <button
                                        onClick={() => {
                                            singleCarRace(item.id, rs.raceNow);
                                        }}
                                        disabled={reducerState.raceNow[item.id]}
                                        className="btn"
                                    >
                                        Start
                                    </button>

                                    <button
                                        onClick={() => {
                                            singleCarStop(item.id, rs);
                                        }}
                                        disabled={!reducerState.raceNow[item.id]}
                                        className="btn"
                                    >
                                        Stop
                                    </button>
                                </div>

                                <CarImg
                                    id={'car-' + item.id.toString()}
                                    className="svg"
                                    fill={item.color}
                                    style={{
                                        left:
                                            reducerState.position.position[item.id] && reducerState.raceNow[item.id]
                                                ? reducerState.position.position[item.id].toString() + '%'
                                                : '0%',
                                    }}
                                />

                                <div className="finish"></div>
                            </div>
                        );
                    })}
                </div>

                <div className="pagination">
                    {reducerState.garageTotalPages.map((i) => {
                        return (
                            <span key={i * 100000}>
                                <span
                                    className={i !== reducerState.garagePageNum ? 'page link' : 'page link active'}
                                    key={i}
                                    onClick={() => {
                                        //setCurentPageNum(i);
                                        dispatch({
                                            value: i,
                                            type: 'setGaragePageNum',
                                            id: 0,
                                        });
                                        refreshCars(i, api, setCars);
                                    }}
                                >
                                    {i}
                                </span>
                                <b key={i * 1000}> </b>
                            </span>
                        );
                    })}
                </div>
                <div className="modal"></div>
            </>
        </GarageContext.Provider>
    );
};

export default Garage;
