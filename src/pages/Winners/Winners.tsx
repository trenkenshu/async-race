import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rest from '../../api/rest';
import { ICar, IWinner } from '../../interface/interface';

const api = new Rest();

const Winners = () => {
    const [winners, setWinners] = useState<{winner: IWinner, name: string}[]>([]);
    let winnersBuffer: IWinner[];
    useEffect(() => {
        api.getWinners()
            .then((data) => {
                const promiseArray:Promise<ICar>[] = [];
                data.forEach(item => {
                    promiseArray.push(api.getOne<ICar>(item.id, 'garage'));
                });
                winnersBuffer = data;
                return Promise.all(promiseArray);
            }).then(cars => {
                console.log(cars);
                const winnersWithNames: {winner: IWinner, name: string}[] = [];
                winnersBuffer.forEach(item => {
                    const name: string | undefined = cars.find(i => i.id === item.id)?.name;
                    winnersWithNames.push({winner: item, name: name || 'no name' });
                });
                setWinners(winnersWithNames);
            })
            .catch((err: Error) => console.log('getCars', err.message));
    }, []);
    return (
        <div>
            <h1 className='header'>Winners</h1>
            Go to <Link className='link' to="/garage">Garage</Link>
            {winners.map(line => {
                return <div key={line.winner.id} className="singleWinner">{`${line.winner.id} ${line.name} ${line.winner.wins} ${line.winner.time}`}</div>
            })}
        </div>
    );
};

export default Winners;
