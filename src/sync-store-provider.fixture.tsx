import { atom, useAtom, useAtomValue } from 'jotai';
import { SyncScopeProvider } from './sync-store-provider';

const sourceAtom = atom(10);
const targetAtom = atom(0);

const Counter = () => {
  const [count, setCount] = useAtom(targetAtom);

  return (
    <div>
      <p>Counter: {count}</p>
      <button onClick={() => setCount((s) => s + 1)}>+1</button>
      <button onClick={() => setCount((s) => s - 1)}>-1</button>
    </div>
  );
};

export default () => {
  const source = useAtomValue(sourceAtom);

  return (
    <div>
      <p>Source Atom Value: {source}</p>
      <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
        <Counter></Counter>
      </SyncScopeProvider>
    </div>
  );
};
