import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initDB } from './services/indexedDB';

// Initialize the database when the application starts
initDB()
    .then(() => {
        console.log('Database initialized successfully');
    })
    .catch((error) => {
        console.error('Failed to initialize database:', error);
    });

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);