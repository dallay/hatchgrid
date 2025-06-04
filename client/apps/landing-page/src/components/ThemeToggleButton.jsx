import React, { useState, useEffect } from 'react';
import { applyTheme, getInitialTheme, saveTheme } from '../utils/theme.js';

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState(getInitialTheme());

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    saveTheme(newTheme);
    setTheme(newTheme);
  };

  // Apply theme on initial mount in case it changed via OS settings
  // after localStorage was set, or if localStorage is empty.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button onClick={handleToggle}>
      {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    </button>
  );
};

export default ThemeToggleButton;
