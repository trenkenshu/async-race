import React, { useContext } from 'react';
import garageContext from '../../context/garageContext';

const RaceBlock = () => {
    const { cars, started, singleCarRace, singleCarStop, rs } = useContext(garageContext);
    return (
        <div className="raceBlock">
            <h1 className="header-3">Race controls</h1>
            <button
                className="btn"
                onClick={() => {
                    cars.forEach((elem) => {
                        singleCarRace(elem.id, rs.raceNow);
                    });
                }}
                disabled={Boolean(started.length)}
            >
                {' '}
                Start Race
            </button>

            <button
                className="btn"
                onClick={() => {
                    cars.forEach((elem) => {
                        return singleCarStop(elem.id, rs);
                    });
                }}
                disabled={Boolean(!started.length)}
            >
                Reset
            </button>
        </div>
    );
};

export default RaceBlock;
