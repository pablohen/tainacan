import React from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/solid';

const ThemeToggler = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <button className="flex text-white" onClick={toggleTheme}>
      {resolvedTheme === 'light' ? (
        <SunIcon className="h-6" />
      ) : (
        <MoonIcon className="h-6" />
      )}
    </button>
  );
};

export default ThemeToggler;
