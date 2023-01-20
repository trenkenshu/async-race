import React, { useContext, useRef, useState } from "react";
import Rest from "../../api/rest";
import { HexColorPicker } from 'react-colorful';
import garageContext from "../../context/garageContext";

const api = new Rest()

const AddCarBlock = () => {
    const [colorPickerDisplay, setColorPickerDisplay] = useState<string>('none');
    const inputName = useRef<HTMLInputElement | null>(null);
    const inputColor = useRef<HTMLInputElement | null>(null);
    const { cars, setCars, emptyCar, selectedCar, setSelectedCar, color, name, setColor, setName, refreshCars, curentPageNum} = useContext(garageContext)
    const make100cars = (): void => {
        api.newRandomCars(100)
            .then((data) => {
                refreshCars(curentPageNum, api, setCars);
            })
            .catch((err: Error) => console.log('newCar', err.message));

    };

    const saveAddCar = () => {
        if(selectedCar.id === 0) {
            api.createCar(color, name).then(data => {
                    setName('');
                    setColor('');
                    setColorPickerDisplay('none');
                    refreshCars(curentPageNum, api, setCars);
            })
        } else {
            api.updateCar(selectedCar.id,
                color,
                name).then(() => {

                setSelectedCar(emptyCar);
                setColor('');
                setName('');
                refreshCars(curentPageNum, api, setCars);
                setColorPickerDisplay('none');
            });
        }
    };

    const cancelEdit = () => {
        setSelectedCar(emptyCar);
        setColor('');
        setName('');
        setColorPickerDisplay('none');
    }

    return (
        <div className="addCarBlock">
            <div className="addOneCar">
                <input type="text" value={name} placeholder="Enter Car Name" ref={inputName} onChange={(event) => {
                    setName(event.target.value);
                }} />
                <div className="colorPicker">
                    <input type="text" className="colorString" readOnly placeholder="Choose Car color" value={color}  ref={inputColor} onFocus={() => {
                        setColorPickerDisplay('block');
                    }} />
                    <div  className="colorPickerWindow" style={{display: colorPickerDisplay}} >
                        <HexColorPicker color={color} onChange={setColor} />
                        <button className="colorPickerButton" onClick={() => {
                            setColorPickerDisplay('none');
                        }}>Ok</button>
                    </div>
                </div>
                <div className="colorButtons">
                    <button onClick={saveAddCar}>{selectedCar.id ? 'Save Car' : 'Add car'}</button>
                    <button style={{display: selectedCar.id ? 'inline' : 'none'}}
                        onClick={cancelEdit}>Cancel</button>
                </div>
            </div>
            <div className="add100Cars">
                <button onClick={make100cars}>Add 100 random cars</button>
            </div>

        </div>
    )
}

export default AddCarBlock;