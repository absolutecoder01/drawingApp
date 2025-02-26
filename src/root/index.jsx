import { useEffect, useState, createContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Comet from '../components/Comet';

export const GlobalContext = createContext({
  isLightTheme: true,
  setIsLightTheme: () => {
    throw new Error('Global context is not initialized');
  },
});

export const App = () => {
  const [isLightTheme, setIsLightTheme] = useState(() => {
    // Initialize theme from localStorage or default to true
    const storedTheme = localStorage.getItem('isLightTheme');
    return storedTheme !== null ? JSON.parse(storedTheme) : true;
  });

  useEffect(() => {
    const { body } = document;

    body.style.setProperty('--toolbar', isLightTheme ? '#ececec' : '#252525');
    body.style.setProperty('--main', isLightTheme ? '#f5f5f5' : '#161616');
    body.style.setProperty('--text', isLightTheme ? '#020202' : '#fff');
    body.style.setProperty('--btn-bg', isLightTheme ? '#007bff' : '#4d0e81');
    body.style.setProperty('--btn-hover', isLightTheme ? '#0056b3' : '#7a09a7');

    // Save theme to localStorage
    localStorage.setItem('isLightTheme', JSON.stringify(isLightTheme));
  }, [isLightTheme]);

  return (
    <GlobalContext.Provider value={{ isLightTheme, setIsLightTheme }}>
      <div>
        <BrowserRouter>
          <Comet />
        </BrowserRouter>
      </div>
    </GlobalContext.Provider>
  );
};
