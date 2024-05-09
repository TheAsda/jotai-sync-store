import { atom, useAtom, useAtomValue } from 'jotai';
import { SyncScopeProvider } from './sync-store-provider';

const sourceAtom = atom(10);
const targetAtom = atom(0);
const globalAtom = atom(100);

const derivedTargetAtom = atom(
  (get) => (get(targetAtom) % 2 ? 'even' : 'odd'),
  (get, set, value: 'even' | 'odd') => {
    const target = get(targetAtom);
    if (value === 'even') {
      set(targetAtom, target % 2 === 1 ? target + 1 : target);
    } else {
      set(targetAtom, target % 2 === 0 ? target + 1 : target);
    }
  }
);

const Counter = () => {
  const [count, setCount] = useAtom(targetAtom);
  const [global, setGlobal] = useAtom(globalAtom);
  const [derivedTarget, setDerivedTarget] = useAtom(derivedTargetAtom);

  return (
    <div>
      <div>
        <p>Target Atom Value: {count}</p>
        <p>Derived Atom Value: {derivedTarget}</p>
        <button onClick={() => setCount((s) => s + 1)}>+1</button>
        <button onClick={() => setCount((s) => s - 1)}>-1</button>
        <button onClick={() => setDerivedTarget('even')}>
          Make Target Even
        </button>
        <button onClick={() => setDerivedTarget('odd')}>Make Target Odd</button>
      </div>
      <div>
        <p>Global Atom Value: {global}</p>
        <button onClick={() => setGlobal((s) => s + 1)}>+1</button>
        <button onClick={() => setGlobal((s) => s - 1)}>-1</button>
      </div>
    </div>
  );
};

export default () => {
  const source = useAtomValue(sourceAtom);
  const global = useAtomValue(globalAtom);

  return (
    <div>
      <p>Source Atom Value: {source}</p>
      <p>Global Atom Value: {global}</p>
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
        <Counter />
      </SyncScopeProvider>
    </div>
  );
};
