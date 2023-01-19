import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rest from '../../api/rest';
import { ICar, IWinner } from '../../interface/interface';

const api = new Rest();
// const x = api.getCars();

const Garage = () => {
    const [bg, setBg] = useState('#555555');
    const [cars, setCars] = useState<ICar[]>([]);
    useEffect(() => {
        api.getCars(1,100)
            .then((data) => {
                setCars(data);
            })
            .catch((err: Error) => console.log('getCars', err.message));
    }, []);

    const load = (): void => {
        api.newRandomCars()
            .then((data) => setBg(data.color))
            .catch((err: Error) => console.log('newCar', err.message));

        // api.getOne<ICar>(Math.floor(Math.random() * 70), 'garage')
        //     .then((data) => {
        //         console.log('getCar', data);
        //         setBg(data.color);
        //     })
        //     .catch((err: Error) => console.log('getCar', err.message));

        api.getWinners()
            .then((data) => console.log('getWinners', data))
            .catch((err: Error) => console.log('getCar', err.message));

        // api.createWinner(2, 2, 12);

    };

    return (
        <>
            <h1 style={{ background: bg }}>Garage</h1>
            <span onClick={load}>Load</span>
            <Link to="/winners">Winners</Link>
            <div className="racingTrack">{ cars.map(item => {
                return <div className='singleTrack' key={item.id}>{item.name}</div>
            })}</div>
        </>
    );
};

export default Garage;
