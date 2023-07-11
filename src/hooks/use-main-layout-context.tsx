import {
  MainLayoutContext,
  MainLayoutContextValue
} from '@providers/MainLayoutProvider';
import { useContext } from 'react';

export const useMainLayoutContext = () => {
  const context = useContext(MainLayoutContext) as MainLayoutContextValue;
  if (!context) {
    throw new Error(
      `useMainLayoutContext must be used within MainLayoutProvider`
    );
  }

  return context;
};
