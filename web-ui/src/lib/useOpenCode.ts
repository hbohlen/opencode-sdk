import { useContext } from 'react';
import { OpenCodeContext, type OpenCodeContextType } from './OpenCodeContextDef';

export const useOpenCode = (): OpenCodeContextType => {
  const context = useContext(OpenCodeContext);
  if (context === undefined) {
    throw new Error('useOpenCode must be used within an OpenCodeProvider');
  }
  return context;
};
