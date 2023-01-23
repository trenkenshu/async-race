import React, { useContext, useRef, useState } from 'react';
import Rest from '../../api/rest';
import { HexColorPicker } from 'react-colorful';
import garageContext from '../../context/garageContext';

const api = new Rest();

const AddCarBlock = () => {
    const [colorPickerDisplay, setColorPickerDisplay] = useState<string>('none');
    const inputName = useRef<HTMLInputElement | null>(null);
    const inputColor = useRef<HTMLInputElement | null>(null);
    const {
        setCars,
        emptyCar,
        selectedCar,
        setSelectedCar,
        color,
        name,
        setColor,
        setName,
        refreshCars,
        curentPageNum,
    } = useContext(garageContext);
    const make100cars = (): void => {
        api.newRandomCars(100)
            .then(() => {
                refreshCars(curentPageNum, api, setCars);
            })
            .catch((err: Error) => console.log('newCar', err.message));
    };

    const saveAddCar = () => {
        if (selectedCar.id === 0) {
            api.createCar(color, name)
                .then(() => {
                    setName('');
                    setColor('');
                    setColorPickerDisplay('none');
                    refreshCars(curentPageNum, api, setCars);
                })
                .catch((err: Error) => console.log(err.message));
        } else {
            api.updateCar(selectedCar.id, color, name)
                .then(() => {
                    setSelectedCar(emptyCar);
                    setColor('');
                    setName('');
                    refreshCars(curentPageNum, api, setCars);
                    setColorPickerDisplay('none');
                })
                .catch((err: Error) => console.log(err.message));
        }
    };

    const cancelEdit = () => {
        setSelectedCar(emptyCar);
        setColor('');
        setName('');
        setColorPickerDisplay('none');
    };

    return (
        <div className="addCarBlock">
            <h3 className="header-3">New/Edit Car</h3>
            <div className="addOneCar">
                <input
                    type="text"
                    value={name}
                    placeholder="Enter Car Name"
                    ref={inputName}
                    onChange={(event) => {
                        setName(event.target.value);
                    }}
                />
                <div className="colorPicker">
                    <input
                        type="text"
                        className="colorString"
                        readOnly
                        placeholder="Choose Car color"
                        value={color}
                        ref={inputColor}
                        onFocus={() => {
                            setColorPickerDisplay('block');
                        }}
                    />
                    <div className="colorPickerWindow" style={{ display: colorPickerDisplay }}>
                        <HexColorPicker color={color} onChange={setColor} />
                        <button
                            className="colorPickerButton"
                            onClick={() => {
                                setColorPickerDisplay('none');
                            }}
                        >
                            Ok
                        </button>
                    </div>
                </div>
                <div className="colorButtons">
                    <button className="btn" onClick={saveAddCar} disabled={!(color !== '' && name !== '')}>
                        {selectedCar.id ? 'Save Car' : 'Add car'}
                    </button>
                    <button
                        className="btn"
                        style={{ display: selectedCar.id ? 'inline' : 'none' }}
                        onClick={cancelEdit}
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <div className="add100Cars">
                <h3 className="header-3">Add random cars</h3>
                <button className="btn" onClick={make100cars}>
                    Add 100 random cars
                </button>
            </div>
        </div>
    );
};

export default AddCarBlock;
