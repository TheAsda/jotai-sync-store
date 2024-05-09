import { PropsWithChildren, createContext, useContext, useState } from 'react';
import { AtomsToSync, JotaiStore } from './types';
import { useStore } from 'jotai';

const ScopeContext = createContext<{
  originalJotaiStore?: JotaiStore;
}>({});

export interface SyncScopeProviderProps extends PropsWithChildren {
  atoms: AtomsToSync[];
}

export const SyncScopeProvider = (props: SyncScopeProviderProps) => {
  const { atoms, children } = props;

  const jotaiStore = useStore();
  const scopeContext = useContext(ScopeContext);

  const store = scopeContext.originalJotaiStore ?? jotaiStore;

  const initialize = () => {
    const 
  };

  const [state, setState] = useState(initialize);

  return (
    <ScopeContext.Provider value={{ originalJotaiStore: store }}>
      {children}
    </ScopeContext.Provider>
  );
};
