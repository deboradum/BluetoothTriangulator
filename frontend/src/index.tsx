import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TablePage from './pages/TablePage';
import HeatMap from './pages/HeatMapPage';

import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
  <header className='App-header' id="header69">
      <ul>
        <li>
            <Link to='/'>Map</Link> {' '}
        </li>
        <li>
            <Link to='/table'>Found devices list</Link> {' '}
        </li>
      </ul>
    </header>
    <div id="yo"></div>

    <Routes>
      <Route path='/table' element={<TablePage/>} />
      <Route path='/' element={<HeatMap/>}/>
    </Routes>
  </BrowserRouter>
);
