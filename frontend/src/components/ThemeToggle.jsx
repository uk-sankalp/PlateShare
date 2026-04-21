import React from 'react';
import './ThemeToggle.css';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <label className="cosmic-toggle">
        <input
          className="toggle"
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        <div className="slider">
          <div className="cosmos" />
          <div className="energy-line" />
          <div className="energy-line" />
          <div className="energy-line" />
          <div className="toggle-orb">
            <div className="inner-orb" />
            <div className="ring" />
          </div>
          <div className="particles">
            <div style={{ '--angle': '30deg' }} className="particle" />
            <div style={{ '--angle': '60deg' }} className="particle" />
            <div style={{ '--angle': '90deg' }} className="particle" />
            <div style={{ '--angle': '120deg' }} className="particle" />
            <div style={{ '--angle': '150deg' }} className="particle" />
            <div style={{ '--angle': '180deg' }} className="particle" />
          </div>
        </div>
      </label>
    </div>
  );
}

export default ThemeToggle;
