import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Only mount React. Product screens belong to their feature issues and Figma references.
const container = document.getElementById('root');
if (!container) throw new Error('Missing React root');
createRoot(container).render(<StrictMode>{null}</StrictMode>);
