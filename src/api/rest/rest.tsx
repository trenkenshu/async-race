import { ICar, IDrive, IRace, IWinner } from '../../interface/interface';
import { brand, model } from '../../car-data/base';

export default class Rest {

    async getOne<T>(id: number, from: 'garage' | 'winners'): Promise<T> {
        const url = new URL(`http://localhost:3000/${from}/${id.toString()}`)
        const car = fetch(url, {
            method: 'GET',
        });

        car.then(data => {
            if(!data.ok) console.log('get error', data);
        });

        return (await car).json() as Promise<T>;
    }

    async deleteOne(id: number, from: 'garage' | 'winners'): Promise<object> {
        const url = new URL(`http://localhost:3000/${from}/${id.toString()}`)
        const car = fetch(url, {
                method: 'DELETE',
            });

        car.then(data => {
            if(!data.ok) console.log('delete error', data);
        });
        return car && (await car).json() as Promise<object>;
    }

    async getCars(page?: number, limit?: number): Promise<ICar[]> {
        const url = new URL('http://localhost:3000/garage');
        limit && url.searchParams.set('_limit', limit.toString());
        page && url.searchParams.set('_page', page.toString());
        const cars = fetch(url, {
            method: 'GET',
        });

        return (await cars).json() as Promise<ICar[]>;
    }

    async createCar(color: string, name: string): Promise<ICar> {
        const request = {
            name,
            color,
        };
        const url = new URL(`http://localhost:3000/garage`);
        const car = fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        return (await car).json() as Promise<ICar>;
    }

    async newRandomCars(): Promise<ICar> {
        let color: string =
            '#' +
            Math.floor(Math.random() * 256).toString(16) +
            Math.floor(Math.random() * 256).toString(16) +
            Math.floor(Math.random() * 256).toString(16);
        color =
            color.length < 7
                ? color +
                  Array(7 - color.length)
                      .fill('f')
                      .toString()
                : color;
        const request: { [key: string]: string } = {
            name: `${brand[Math.floor(Math.random() * brand.length)]} ${
                model[Math.floor(Math.random() * model.length)]
            }`,
            color: color,
        };
        const car = fetch('http://localhost:3000/garage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        return (await car).json() as Promise<ICar>;
    }

    async updateCar(id: number, color: string, name: string): Promise<ICar> {
        const request = {
            name,
            color,
            id,
        };
        const car = fetch('http://localhost:3000/garage/' + id.toString(), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        return (await car).json() as Promise<ICar>;
    }

    private engine(id: number, status: 'started' | 'stopped' | 'drive'): URL {
        const url = new URL('http://localhost:3000/engine');
        url.searchParams.set('id', id.toString());
        url.searchParams.set('status', status);

        return url;
    }

    async startEngine(id: number): Promise<IRace> {
        const url = this.engine(id, 'started');
        const start = fetch(url, {
            method: 'PATCH',
        });

        return (await start).json() as Promise<IRace>;
    }

    async stopEngine(id: number): Promise<IRace> {
        const url = this.engine(id, 'stopped');
        const start = fetch(url, {
            method: 'PATCH',
        });

        return (await start).json() as Promise<IRace>;
    }

    async driveEngine(id: number): Promise<IDrive> {
        const url = this.engine(id, 'drive');
        const start = fetch(url, {
            method: 'PATCH',
        });

        return (await start).json() as Promise<IDrive>;
    }

    async getWinners(limit?: number, page?: number, sort?: 'id' | 'wins' | 'time', order?: 'ASC' | 'DESC'): Promise<ICar[]> {
        const url = new URL('http://localhost:3000/winners');
        limit && url.searchParams.set('_limit', limit.toString());
        page && url.searchParams.set('_page', page.toString());
        sort && url.searchParams.set('_sort', sort.toString());
        order && url.searchParams.set('_order', order.toString());
        const winners = fetch(url, {
            method: 'GET',
        });
        winners.then(data => {
            if(!data.ok) console.log('get winners error', data);
        });

        return (await winners).json();
    }

    async createWinner(id: number, wins: number, time: number): Promise<IWinner> {
        const request = {
            id,
            wins,
            time,
        };
        const winner = fetch('http://localhost:3000/winners/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        winner.then(data => {
            if(!data.ok) console.log('create winner error', data);
        });

        return (await winner).json() as Promise<IWinner>;
    }

    async updateWinner(id: number, wins: number, time: number): Promise<IWinner> {
        const request = {
            wins,
            time,
        };
        const url = new URL(`http://localhost:3000/winners/${id.toString()}`)
        const winner = fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        return (await winner).json() as Promise<IWinner>;
    }

}

