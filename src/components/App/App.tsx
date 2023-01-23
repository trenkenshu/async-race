import React, { useReducer, createContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { IReducerAction, IReducerContext, IReducerState } from '../../interface/interface';
import Error404 from '../../pages/Error404';
import Garage from '../../pages/Garage';
import Winners from '../../pages/Winners';
import { garageReducer, rsNulled } from '../../reducer/reducer';

export const ReducerContext = createContext<IReducerContext>({} as IReducerContext);
const App = () => {
    const [reducerState, dispatch] = useReducer<React.Reducer<IReducerState, IReducerAction>>(garageReducer, rsNulled);
    const redVal = {
        reducerState,
        dispatch,
    };

    return (
        <ReducerContext.Provider value={redVal}>
            <BrowserRouter basename="/">
                <Routes>
                    <Route path="/" element={<Garage />} />
                    <Route path="/garage" element={<Garage />} />
                    <Route path="/winners" element={<Winners />} />
                    <Route path="/*" element={<Error404 />} />
                </Routes>
            </BrowserRouter>
        </ReducerContext.Provider>
    );
};
export default App;
