import React, { useContext, useRef, useState } from "react";
import Rest from "../../api/rest";
import garageContext from "../../context/garageContext";

const api = new Rest();
const fastest = [];
const RaceBlock = () => {
const {cars, started, raceArr, raceNow, singleCarRace, singleCarStop, rs} = useContext(garageContext);
    return (
        <div className="raceBlock">
            <h1 className="header-3">Race controls</h1>
            <button className="btn"
                onClick={() => {
                    cars.forEach(elem => {
                        singleCarRace(elem.id, rs.raceNow);
                    })
                }}
                disabled={Boolean(started.length)}> Start Race
            </button>

            <button className="btn"
                onClick={() => {
                    cars.forEach(elem => {
                        return singleCarStop(elem.id, rs);
                    })
                }}
                disabled={Boolean(!started.length)}>Reset
            </button>
        </div>
    )
}

export default RaceBlock;
