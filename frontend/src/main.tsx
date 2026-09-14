import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return <main className="page">
    <section className="card">
      <h1>Management System</h1>
      <p>Railway-ready frontend is running.</p>
      <a href={import.meta.env.VITE_API_URL || '#'}>API URL</a>
    </section>
  </main>
}
createRoot(document.getElementById('root')!).render(<App />);
