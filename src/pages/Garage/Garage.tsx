import React, { createContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rest from '../../api/rest';
import { ICar, IDrive, IGarage, IRace, IWinner } from '../../interface/interface';
import AddCarBlock from '../../components/addCarBlock';
import CarImg from '../../assets/car2.svg';
import GarageContext from '../../context/garageContext';
import { addAbortSignal } from 'stream';

const api = new Rest();


const Garage = () => {
    const emptyCar = {id: 0, name: '', color: ''};
    const [cars, setCars] = useState<ICar[]>([]);
    const [selectedCar, setSelectedCar] = useState(emptyCar);
    const [color, setColor] = useState("");
    const [name, setName] = useState("");
    const [pages, setPages] = useState<number[]>([]);
    const [curentPageNum, setCurentPageNum] = useState(1);
    const [total, setTotal] = useState(0);
    const [started, setStarted] = useState<number[]>([]);
    const [drive, setDrive] = useState<number[]>([]);
    const [crashed, setCrashed] = useState<number[]>([]);
    const [position, setPosition] = useState<{interval: number, position: number}[]>([]);
    const [animation, setAnimation] = useState<any[]>([]);

    const raceArr: Promise<IRace>[] = [];

    const track = document.querySelector('.racingTrack') as HTMLDivElement;

    const refreshCars = (page: number, api: Rest, setCars: (arg: ICar[]) => void) => {
        api.getCars(page, 7).then(response => {
            const totalCars = Number(response.headers.get('X-Total-Count'))
            setTotal(totalCars);
            const pagesCount = Math.ceil(totalCars / 7);
            setPages(Array.from({length: pagesCount}).map((item, index) => index + 1));
            return response.json();
        })
            .then((data) => {
                setCars(data);
                //console.log('initial getCars', data);
        })
            .catch((err: Error) => console.log('initial getCars error', err.message));
    }

    useEffect(() => {
        refreshCars(curentPageNum, api, setCars);
    }, []);

    const garageVals:IGarage = {
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
        raceArr
    }

    const add = (prev: number[], id: number) => {
        const next = prev.slice(0);
        next.push(id);

        return next;
    };

    const remove = (prev: number[], id: number) => {
        const next = prev.slice(0);
        const ind = next.indexOf(id);
        next.splice(ind, 1);

        return next;
    }

    const animate = (id: number) => {
        const el = document.querySelector(`#car-${id}`) as HTMLElement;
        if(el) el.style.left = position[id].position.toString() + '%';
        if(el && Number(el.style.left.slice(0, -1)) > 90) {
            el.style.left = '90%';
        } else {
            window.requestAnimationFrame(() => animate(id));
        }
    }


    return (
        <GarageContext.Provider value={garageVals}>
        <>
            <h1 className='header' >Garage <span>{total ? `(${total})` : ''}</span></h1>
            <div style={{height: '2rem'}}>Go to <Link className='link' to="/winners">Winners</Link></div>
            <AddCarBlock />
            <div className="racingTrack">{ cars.map(item => {

                return (<div className='singleTrack' key={item.id} onClick={() => {
                }}>
                            <div className='singleCarName'>
                                {item.name} <span className="started">{(started.indexOf(item.id) >= 0
                                    ? 'started'
                                    : '')}</span> <span className="drive">{(drive.indexOf(item.id) >= 0
                                        ? 'drive'
                                        : '')}</span><span className="crashed">{(crashed.indexOf(item.id) >= 0
                                            ? 'crashed'
                                            : '')}</span>

                            </div>

                            <div className="editCar">
                                <button onClick={() => {
                                        setSelectedCar(item);
                                        setColor(item.color);
                                        setName(item.name);
                                    }}
                                    className="btn">Edit car
                                </button>

                                <button onClick={() => {
                                        api.deleteOne(item.id, 'garage').then(() => {
                                            if(cars.length === 1) {
                                                setCurentPageNum(prev =>  prev- 1);
                                                refreshCars(pages.length - 1, api, setCars);
                                            } else {
                                                refreshCars(curentPageNum, api, setCars);
                                            }
                                        })
                                    }}
                                    className="btn">Delete
                                </button>

                                <button onClick={() => {
                                        return api.startEngine(item.id)
                                            .then((data) => {
                                                setStarted((prev: number[]) => add(prev, item.id));
                                                console.log(data);
                                                setPosition(prev => {
                                                    prev[item.id] = {
                                                        interval: window.setInterval(() => {
                                                            prev[item.id].position += (data.velocity / data.distance) * 1000;
                                                            // console.log(prev[item.id]);
                                                        }, 20),
                                                        position: 0
                                                    };
                                                    return prev;
                                                });
                                                // const go = requestAnimationFrame(() => { animate(item.id)});
                                                // animation[item.id] = go;
                                                setAnimation(prev => {
                                                    const go = window.requestAnimationFrame(() => { animate(item.id)});
                                                    prev.push({anim: go, id: item.id});
                                                    console.log(prev);

                                                    return prev;
                                                });
                                                return api.driveEngine(item.id);

                                            }).then((res: Response) => {
                                                if(res.status == 500) {
                                                    //setCrashed((prev: number[]) => add(prev, item.id));
                                                    setPosition(prev => {
                                                        clearInterval(prev[item.id].interval);

                                                        return prev;
                                                    });
                                                } else {
                                                    if(started.includes(item.id)) setDrive((prev: number[]) => add(prev, item.id));
                                                    //const interval = setInterval(animate, 1);
                                                }
                                                return res.json() as Promise<IDrive>
                                            })
                                    }}
                                    disabled={started.includes(item.id)}
                                    className="btn">Start
                                </button>

                                <button onClick={() => {
                                        api.stopEngine(item.id).then(() => {
                                            setStarted((prev: number[]) => remove(prev, item.id));
                                            setDrive((prev: number[]) => remove(prev, item.id));
                                            setCrashed((prev: number[]) => remove(prev, item.id));
                                            setPosition(prev => {
                                                clearInterval(prev[item.id].interval);
                                                prev[item.id].position = 0;
                                                const el = document.querySelector(`#car-${item.id}`) as HTMLElement;
                                                console.log(el);
                                                if(el) el.style.left = '0px';
                                                return prev;
                                            });

                                        });
                                        // cancelAnimationFrame(animation[item.id]);
                                        //window.cancelAnimationFrame(animation.find(el => el.id === item.id).anim);
                                        // setAnimation(prev => {
                                        //     console.log(prev.find(el => el.id === item.id));
                                        //     const go = prev.find(el => el.id === item.id).anim;
                                        //     window.cancelAnimationFrame(go);

                                        //     return prev;
                                        // });

                                    }}
                                    disabled={!started.includes(item.id)}
                                    className="btn">Stop
                                </button>

                            </div>
                            <CarImg id={'car-' + item.id.toString()}
                            className='svg'
                            fill={item.color}
                            style={{width: track
                                ? track.offsetWidth / 11 + 'px'
                                : '100px'}}
                                />
                            <div className="finish"></div>
                    </div>)
            })}</div>
            <div className="pagination">{
                pages.map(i => {
                    return (
                        <span key={i * 100000}>
                            <span
                                className={i !== curentPageNum ? 'page link' : 'page link active'}
                                key={i}
                                onClick={() =>{
                                    setCurentPageNum(i);
                                    refreshCars(i, api, setCars);
                                }}>{i}</span><b key={i * 1000}> </b>
                        </span>
                    )
                })
            }</div>
        </>
        </GarageContext.Provider>
    );
};

export default Garage;
