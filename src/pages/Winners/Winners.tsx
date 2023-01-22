import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rest from '../../api/rest';
import { ICar, IWinner } from '../../interface/interface';

const api = new Rest();

const Winners = () => {
    const [winners, setWinners] = useState<{winner: IWinner, name: string | undefined, color: string | undefined}[]>([]);
    const [pages, setPages] = useState<number[]>([]);
    const [curentPageNum, setCurentPageNum] = useState(1);
    
    let winnersBuffer: IWinner[];
    const refreshWinners = (page: number) => {
        api.getWinners(10, page)
            .then((response: Response) => {
                const totalCars = Number(response.headers.get('X-Total-Count'))
                const pagesCount = Math.ceil(totalCars / 10);
                setPages(Array.from({length: pagesCount}).map((item, index) => index + 1));
                return response.json() as Promise<IWinner[]>;
            })
            .then((data) => {
                const promiseArray:Promise<ICar>[] = [];
                data.forEach(item => {
                    promiseArray.push(api.getOne<ICar>(item.id, 'garage'));
                });
                winnersBuffer = data;
                return Promise.all(promiseArray);
            }).then(cars => {
                // console.log(cars);
                const winnersWithNames: {winner: IWinner, name: string | undefined, color: string | undefined}[] = [];
                winnersBuffer.forEach(item => {
                    const name: string | undefined = cars.find(i => i.id === item.id)?.name;
                    const color: string | undefined = cars.find(i => i.id === item.id)?.color;
                    winnersWithNames.push({winner: item, name, color});
                });
                setWinners(winnersWithNames);
            })
            .catch((err: Error) => console.log('getCars', err.message));
    
    }
    useEffect(() => {
        refreshWinners(1);
     }, []);
    return (
        <div>
            <h1 className='header'>Winners</h1>
            <div style={{height: '2rem'}}>
                Go to <Link className='link' to="/garage">Garage</Link>
            </div>
            <div className="tableLine">
                <div className="tableItem">#</div>
                <div className="tableItem">Name</div>
                <div className="tableItem">Color</div>
                <div className="tableItem">Wins</div>
                <div className="tableItem">Time</div>
            </div>
            {winners.map(line => {
                return (<div className="tableLine"
                        key={line.winner.id}>
                            <div className="tableItem">{line.winner.id}</div>
                            <div className="tableItem">{line.name}</div>
                            <div className="tableItem"
                                style={{background: line.color}}>{line.color}</div>
                            <div className="tableItem">{line.winner.wins}</div>
                            <div className="tableItem">{line.winner.time}</div>
                        </div>
                )
            })}
            <div className="pagination">{
                pages.map(i => {
                    return (
                        <span key={i * 100000}>
                            <span
                                className={i !== curentPageNum ? 'page link' : 'page link active'}
                                key={i}
                                onClick={() =>{
                                    setCurentPageNum(i);
                                    refreshWinners(i);
                                }}>{i}</span><b key={i * 1000}> </b>
                        </span>
                    )
                })
            }</div>
        </div>
    );
};

export default Winners;
