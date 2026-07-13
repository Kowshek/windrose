import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Pledge from './pages/Pledge';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pledge" element={<Pledge />} />
    </Routes>
  );
}

export default App;
