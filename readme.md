The idea is to sync two Jotai atoms by basically making writing to synced atom to write to original atom.

# Definitions

- **source atom** - atom that is declared/used higher in React tree
- **target atom** - atom that should be synced with _source atom_ meaning that writing to it will write the same value to the source atom

> Backwards should work too. Writing to _source atom_ should change value in _target atom_

# Rules

- If the atom is not synced writing to it means writing to original atom
- If the atom is _target atom_ then writing operation writes to associated _source atom_
- If the atom is _source atom_ then writing operation writes to the atom and _target atom_ is updated automatically because _target atom_ is basically the reference to _source atom_

# Usage

```jsx
import { atom } from 'jotai';
import { SyncScopeProvider } from 'jotai-sync-scope';

const sourceAtom = atom(0);
const targetAtom = atom(0);

const App = () => {
  const [state] = useAtom(sourceAtom);

  return (
    <>
      <p>Source: {state}</p>
      <Sync />
    </>
  );
};

const Sync = (props) => {
  return (
    <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
      <Component />
    </SyncScopeProvider>
  );
};

const Component = () => {
  const [state, setState] = useAtom(targetAtom);

  return (
    <>
      <p>Target: {state}</p>
      <button onClick={() => setState((s) => s + 1)}>+1</button>
    </>
  );
};
```
