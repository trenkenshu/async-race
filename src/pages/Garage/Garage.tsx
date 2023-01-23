import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rest from '../../api/rest';
import { ICar, IGarage, IRace, IRaceState, IWinner } from '../../interface/interface';
import AddCarBlock from '../../components/addCarBlock';
import CarImg from '../../assets/car2.svg';
import GarageContext from '../../context/garageContext';
import RaceBlock from '../../components/raceBlock';

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
    const emptyCar = { id: 0, name: '', color: '' };
    const [cars, setCars] = useState<ICar[]>([]);
    const [selectedCar, setSelectedCar] = useState(emptyCar);
    const [color, setColor] = useState('');
    const [name, setName] = useState('');
    const [pages, setPages] = useState<number[]>([]);
    const [curentPageNum, setCurentPageNum] = useState(1);
    const [total, setTotal] = useState(0);
    const [started, setStarted] = useState<number[]>([]);
    const [drive, setDrive] = useState<number[]>([]);
    const [crashed, setCrashed] = useState<number[]>([]);
    const [position, setPosition] = useState<{ interval: number; position: number }[]>([]);
    //const [animation, setAnimation] = useState<any[]>([]);

    const refreshCars = (page: number, api: Rest, setCars: (arg: ICar[]) => void) => {
        api.getCars(page, 7)
            .then((response) => {
                const totalCars = Number(response.headers.get('X-Total-Count'));
                setTotal(totalCars);
                const pagesCount = Math.ceil(totalCars / 7);
                setPages(Array.from({ length: pagesCount }).map((item, index) => index + 1));
                return response.json();
            })
            .then((data: ICar[]) => {
                setCars(data);
                //console.log('initial getCars', data);
            })
            .catch((err: Error) => console.log('initial getCars error', err.message));
    };

    useEffect(() => {
        refreshCars(curentPageNum, api, setCars);
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
        if (rs.finished.length === 1) {
            const modal = document.querySelector('.modal') as HTMLDivElement;
            console.log(modal);
            if (modal) {
                modal.classList.toggle('active');
                modal.innerHTML =
                    String(cars.find((e) => e.id === id)?.name) + ' won in ' + rs.timeToFinish[id].toString() + 'sec';
                setTimeout(() => modal.classList.toggle('active'), 2000);
            } //alert(String(cars.find((e) => e.id === id)?.name) + ' won in ' + rs.timeToFinish[id].toString() + 'sec');
            api.getOneResponse(id, 'winners')
                .then((data) => {
                    if (data.status == 404) {
                        api.createWinner(id, 1, rs.timeToFinish[id])
                            .then((winner) => {
                                console.log('create winner on finish', winner);
                            })
                            .catch((err: Error) => console.log(err.message));
                    } else {
                        data.json()
                            .then((json: IWinner) => {
                                const newTime = rs.timeToFinish[id] > json.time ? json.time : rs.timeToFinish[id];
                                console.log('existing winner', json, newTime);
                                api.updateWinner(id, json.wins + 1, newTime).catch((err: Error) =>
                                    console.log(err.message)
                                );
                            })
                            .catch((err: Error) => console.log(err.message));
                    }
                })
                .catch((err: Error) => console.log(err.message));
        }
    };

    ////////////////// ANIMATE //////////////////////

    const animate = (id: number, rs: IRaceState) => {
        //console.log(rs);
        const el = document.querySelector(`#car-${id}`) as HTMLElement;
        const numerical = Number(el.style.left.slice(0, -1));
        if (el) el.style.left = position[id].position.toString() + '%';
        if (el && numerical > 90 && !rs.crash.includes(id)) {
            // el.style.left = '90%';
            clearInterval(position[id].interval);
            console.log('disabled on finish');
            rs.raceNow.includes(id) && rs.finished.push(id);
            checkAndAdd(id);
        } else if (rs.crash.includes(id)) {
            clearInterval(position[id].interval);
            console.log('disabled on crush');
        } else {
            window.requestAnimationFrame(() => animate(id, rs));
        }
    };

    //////////////// SINGLE RACE ////////////////////////

    const singleCarRace = (id: number, raceNow: number[]) => {
        !raceNow.includes(id) && raceNow.push(id);
        api.startEngine(id)
            .then((data) => {
                // console.log('starrt log', raceNow);
                setStarted((prev: number[]) => add(prev, id));
                rs.timeToFinish[id] = Number((data.distance / data.velocity / 900).toFixed(2));
                console.log(id, 'time if finish', rs.timeToFinish[id]);
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
                // setAnimation((prev) => {
                //     const go = requestAnimationFrame(() => {
                //         animate(id, rs);
                //     });
                //     prev[id] = { anim: go, id: id };

                //     return prev;
                // });

                return api.driveEngine(id);
            })
            .then((res: Response) => {
                if (res.status == 500) {
                    //console.log('брокен log', raceNow, id, started)
                    raceNow.includes(id) && setCrashed((prev: number[]) => add(prev, id));
                    raceNow.includes(id) && rs.crash.push(id);
                    setPosition((prev) => {
                        clearInterval(prev[id].interval);

                        return prev;
                    });
                } else if (res.status == 404) {
                    console.log('double start', id);
                } else {
                    //console.log('гуд log', raceNow, id, started)
                    raceNow.includes(id) && setDrive((prev: number[]) => add(prev, id));
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
        console.log(rs);

        api.stopEngine(id)
            .then(() => {
                setStarted((prev: number[]) => remove(prev, id));
                setDrive((prev: number[]) => remove(prev, id));
                setCrashed((prev: number[]) => remove(prev, id));

                // setAnimation((prev) => {
                //     const ind = animation;
                //     cancelAnimationFrame(animation[id]?.go);
                //     prev[id] && prev.splice(id, 1);

                //     return prev;
                // });

                setPosition((prev) => {
                    window.clearInterval(prev[id].interval);
                    prev[id].position = 0;
                    const el = document.querySelector(`#car-${id}`) as HTMLElement;
                    if (el) el.style.left = '0px';
                    return prev;
                });
            })
            .catch((err: Error) => console.log(err.message));
    };

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
    };

    return (
        <GarageContext.Provider value={garageVals}>
            <>
                <h1 className="header">
                    Garage <span>{total ? `(${total})` : ''}</span>
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
                                    <span className="started">{started.indexOf(item.id) >= 0 ? ' started' : ''}</span>{' '}
                                    <span className="drive">{drive.indexOf(item.id) >= 0 ? 'ok' : ''}</span>
                                    <span className="crashed">{crashed.indexOf(item.id) >= 0 ? 'crashed' : ''}</span>
                                </div>

                                <div className="editCar">
                                    <button
                                        onClick={() => {
                                            setSelectedCar(item);
                                            setColor(item.color);
                                            setName(item.name);
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
                                                        refreshCars(pages.length - 1, api, setCars);
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
                                        disabled={started.includes(item.id)}
                                        className="btn"
                                    >
                                        Start
                                    </button>

                                    <button
                                        onClick={() => {
                                            //cancelAnimationFrame(animation[item.id]);
                                            singleCarStop(item.id, rs);
                                        }}
                                        disabled={!started.includes(item.id)}
                                        className="btn"
                                    >
                                        Return
                                    </button>
                                </div>

                                <CarImg id={'car-' + item.id.toString()} className="svg" fill={item.color} />

                                <div className="finish"></div>
                            </div>
                        );
                    })}
                </div>

                <div className="pagination">
                    {pages.map((i) => {
                        return (
                            <span key={i * 100000}>
                                <span
                                    className={i !== curentPageNum ? 'page link' : 'page link active'}
                                    key={i}
                                    onClick={() => {
                                        setCurentPageNum(i);
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
