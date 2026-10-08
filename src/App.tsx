import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DirectorDashboard from './pages/DirectorDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import { useStore } from './store';

export default function App() {
  const initSync = useStore((state) => state.initSync);

  useEffect(() => {
    const unsub = initSync();
    return () => unsub();
  }, [initSync]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/direcao" element={<DirectorDashboard />} />
        <Route path="/professor" element={<TeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
