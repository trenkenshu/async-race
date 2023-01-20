import React, { createContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rest from '../../api/rest';
import { ICar, IGarage, IWinner } from '../../interface/interface';
import AddCarBlock from '../../components/addCarBlock';
import CarImg from '../../assets/car2.svg';
import GarageContext from '../../context/garageContext';

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
                console.log('initial getCars', data);
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
        curentPageNum
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
                            <h3 className='singleCarName'>{item.name}</h3>
                            <div className="editCar">
                                <button onClick={() => {
                                    setSelectedCar(item);
                                    setColor(item.color);
                                    setName(item.name);
                                }}>Select car</button>

                                <button onClick={() => {
                                    api.deleteOne(item.id, 'garage').then(() => {
                                        console.log(cars.length, curentPageNum);
                                        if(cars.length === 1) {
                                            setCurentPageNum(prev =>  prev- 1);
                                            refreshCars(pages.length - 1, api, setCars);
                                        } else {
                                            refreshCars(curentPageNum, api, setCars);
                                        }
                                    })
                                }}>Delete</button>
                            </div>

                            <CarImg className='svg' fill={item.color}/>
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
