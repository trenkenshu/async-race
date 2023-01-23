import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rest from '../../api/rest';
import { ICar, IWinner } from '../../interface/interface';
import CarImg from '../../assets/car2.svg';

const api = new Rest();

const Winners = () => {
    const [winners, setWinners] = useState<{ winner: IWinner; name: string | undefined; color: string | undefined }[]>(
        []
    );
    const [pages, setPages] = useState<number[]>([]);
    const [curentPageNum, setCurentPageNum] = useState(1);
    const [sort, setSort] = useState<'time' | 'id' | 'wins' | undefined>(undefined);
    const [ascDesc, setAscDesc] = useState<'ASC' | 'DESC' | undefined>(undefined);

    let winnersBuffer: IWinner[];
    const refreshWinners = (
        page: number,
        sort?: 'time' | 'id' | 'wins' | undefined,
        order?: 'ASC' | 'DESC' | undefined
    ) => {
        api.getWinners(10, page, sort, order)
            .then((response: Response) => {
                const totalCars = Number(response.headers.get('X-Total-Count'));
                const pagesCount = Math.ceil(totalCars / 10);
                setPages(Array.from({ length: pagesCount }).map((item, index) => index + 1));
                return response.json() as Promise<IWinner[]>;
            })
            .then((data) => {
                const promiseArray: Promise<ICar>[] = [];
                data.forEach((item) => {
                    promiseArray.push(api.getOne<ICar>(item.id, 'garage'));
                });
                winnersBuffer = data;
                return Promise.all(promiseArray);
            })
            .then((cars) => {
                // console.log(cars);
                const winnersWithNames: { winner: IWinner; name: string | undefined; color: string | undefined }[] = [];
                winnersBuffer.forEach((item) => {
                    const name: string | undefined = cars.find((i) => i.id === item.id)?.name;
                    const color: string | undefined = cars.find((i) => i.id === item.id)?.color;
                    winnersWithNames.push({ winner: item, name, color });
                });
                setWinners(winnersWithNames);
            })
            .catch((err: Error) => console.log('getCars', err.message));
    };
    useEffect(() => {
        refreshWinners(1);
    }, []);

    const changeSort = (newSort: 'time' | 'id' | 'wins') => {
        if (sort === newSort) {
            const order = ascDesc === 'ASC' ? 'DESC' : 'ASC';
            setAscDesc(order);
            refreshWinners(curentPageNum, newSort, order);
        } else {
            setSort(newSort);
            setAscDesc('ASC');
            refreshWinners(curentPageNum, newSort, 'ASC');
        }
    };
    return (
        <div>
            <h1 className="header">Winners</h1>
            <div style={{ height: '2rem' }}>
                Go to{' '}
                <Link className="link" to="/garage">
                    Garage
                </Link>
            </div>
            <div className="tableLine head">
                <div className="tableItem">№</div>
                <div className={(sort === 'id' ? 'active ' : '') + 'tableItem search'} onClick={() => changeSort('id')}>
                    ID <span className="asc-desc">{sort === 'id' ? ascDesc : ''}</span>
                </div>
                <div className="tableItem flex3">Name</div>
                <div className="tableItem flex2">Car</div>
                <div
                    className={(sort === 'wins' ? 'active ' : '') + 'tableItem search'}
                    onClick={() => changeSort('wins')}
                >
                    Wins <span className="asc-desc">{sort === 'wins' ? ascDesc : ''}</span>
                </div>
                <div
                    className={(sort === 'time' ? 'active ' : '') + 'tableItem search'}
                    onClick={() => changeSort('time')}
                >
                    Time <span className="asc-desc">{sort === 'time' ? ascDesc : ''}</span>
                </div>
            </div>
            {winners.map((line, index) => {
                return (
                    <div className="tableLine" key={line.winner.id}>
                        <div className="tableItem">
                            {curentPageNum - 1
                                ? ((curentPageNum - 1) * 10 + (index + 1)).toString()
                                : (index + 1).toString()}
                        </div>
                        <div className="tableItem">{line.winner.id}</div>
                        <div className="tableItem flex3">{line.name}</div>
                        <div
                            className="tableItem flex2"
                            //style={{background: line.color}}
                        >
                            <CarImg fill={line.color} className="svg" />
                        </div>
                        <div className="tableItem">{line.winner.wins}</div>
                        <div className="tableItem">{line.winner.time}</div>
                    </div>
                );
            })}
            <div className="pagination">
                {pages.map((i) => {
                    return (
                        <span key={i * 100000}>
                            <span
                                className={i !== curentPageNum ? 'page link' : 'page link active'}
                                key={i}
                                onClick={() => {
                                    setCurentPageNum(i);
                                    refreshWinners(i, sort, ascDesc);
                                }}
                            >
                                {i}
                            </span>
                            <b key={i * 1000}> </b>
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default Winners;
