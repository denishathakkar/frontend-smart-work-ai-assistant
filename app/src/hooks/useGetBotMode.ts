import { useEffect, useState } from 'react'

export type BotMode = 'app' | 'web'

export const useGetBotMode = () => {
  const [mode, setMode] = useState<BotMode>('app')

  useEffect(() => {
    const checkMode = () => {
      // Check viewport width to determine mode
      const isPhone = window.innerWidth <= 500; // You can adjust this threshold
      setMode(isPhone ? 'web' : 'app');
    };

    // Set the initial mode
    checkMode();

    // Add a resize event listener to handle window size changes
    window.addEventListener('resize', checkMode);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', checkMode);
    };
  }, []);

  return mode;
};