import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Add debugging code
console.log('Initial dark class state:', document.documentElement.classList.contains('dark'));

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      console.log('Dark class changed:', document.documentElement.classList.contains('dark'));
    }
  });
});

observer.observe(document.documentElement, { attributes: true });