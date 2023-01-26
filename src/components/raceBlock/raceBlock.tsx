import React, { useContext } from 'react';
import garageContext from '../../context/garageContext';
import { ReducerContext } from '../App/App';

const RaceBlock = () => {
    const { cars, started, singleCarRace, singleCarStop, rs } = useContext(garageContext);
    const { reducerState, dispatch } = useContext(ReducerContext);

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
                disabled={reducerState.raceNow.find((el) => el == true)}
            >
                {' '}
                Start Race
            </button>

            <button
                className="btn"
                onClick={() => {
                    reducerState.raceNow.forEach((elem, ind) => {
                        if (elem === true) singleCarStop(ind, rs);
                    });
                }}
                disabled={!(reducerState.raceNow.filter((el) => el == true).length === cars.length)}
            >
                Reset
            </button>
        </div>
    );
};

export default RaceBlock;
