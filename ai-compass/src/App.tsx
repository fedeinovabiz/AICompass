import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 text-white bg-slate-900 min-h-screen">AI Compass</div>} />
    </Routes>
  );
}
