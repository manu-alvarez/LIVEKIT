import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import Tables from './pages/Tables';
import Settings from './pages/Settings';
import Calls from './pages/Calls';
import MenuPage from './pages/MenuPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="reservations" element={<Reservations />} />
                <Route path="tables" element={<Tables />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="calls" element={<Calls />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    );
}

export default App;
