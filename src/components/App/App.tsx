import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Error404 from '../../pages/Error404';
import Garage from '../../pages/Garage';
import Winners from '../../pages/Winners';

const App = () => {
    return (
        <BrowserRouter basename="/">
            <Routes>
                <Route path="/" element={<Garage />} />
                <Route path="/garage" element={<Garage />} />
                <Route path="/winners" element={<Winners />} />
                <Route path="/*" element={<Error404 />} />
            </Routes>
        </BrowserRouter>
    );
};
export default App;
