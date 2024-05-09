import { Provider, useStore } from 'jotai';
import { PropsWithChildren, useState } from 'react';
import { AnyAtom, AnyWritableAtom, AtomsToSync } from './types';
import { areMapsEqual } from './utils';

export interface SyncScopeProviderProps extends PropsWithChildren {
  atoms: AtomsToSync[];
}

export const SyncScopeProvider = (props: SyncScopeProviderProps) => {
  const { atoms, children } = props;

  const store = useStore();

  const targetsMap = new Map<AnyAtom, AnyAtom>(
    atoms.map(([sourceAtom, targetAtom]) => [targetAtom, sourceAtom])
  );

  const initialize = () => {
    const atomClones = new WeakMap<AnyAtom, AnyAtom>();

    /** Clones atom that handles read/write and translates commands to the original atom */
    const cloneAtom = (originalAtom: AnyWritableAtom) => {
      /** If derived atom read/write is called then we try to find the original atom that was derived from.
       * If the original atom is set then we just return the original atom.
       */
      const routeAtom = <A extends AnyAtom>(target: A) => {
        if (target === (originalAtom as unknown as A)) {
          return target;
        }
        return getCorrectAtom(target);
      };

      const clone: typeof originalAtom = {
        ...originalAtom,
        ...('read' in originalAtom && {
          read: (get, options) => {
            // TODO: get the correct atom
            return originalAtom.read(
              (atomToRead) => get(routeAtom(atomToRead)),
              options
            );
          },
        }),
        ...('write' in originalAtom && {
          write: (get, set, ...args) => {
            // TODO: get the correct atom
            return originalAtom.write(
              (atomToRead) => get(routeAtom(atomToRead)),
              (atomToWrite, ...v) => set(routeAtom(atomToWrite), ...v),
              ...args
            );
          },
        }),
      };
      return clone;
    };

    /** Function to get the correct atom
     * - if atom is not synced -> return the original atom
     * - if atom is _target atom_ -> return the _source atom_
     * - if atom is _source atom_ -> return the original atom
     */
    const getCorrectAtom = <A extends AnyAtom>(atom: A) => {
      if (targetsMap.has(atom)) {
        atom = targetsMap.get(atom)! as A;
      }
      if (atomClones.has(atom)) {
        return atomClones.get(atom)! as typeof atom;
      }
      const clone = cloneAtom(atom as unknown as AnyWritableAtom);
      atomClones.set(atom, clone);
      return clone;
    };

    /** Store with patched methods for providing the correct atoms to the hooks */
    const patchedStore: typeof store = {
      ...store,
      get: (atom, ...args) => store.get(getCorrectAtom(atom), ...args),
      set: (atom, ...args) =>
        store.set(getCorrectAtom(atom) as typeof atom, ...args),
      sub: (atom, ...args) => store.sub(getCorrectAtom(atom), ...args),
    };

    return { originalStore: store, patchedStore, targetsMap };
  };

  const [state, setState] = useState(initialize);

  /** If store changed or provided atoms changed update the state */
  if (
    store !== state.originalStore ||
    !areMapsEqual(state.targetsMap, targetsMap)
  ) {
    setState(initialize);
  }

  return <Provider store={state.patchedStore}>{children}</Provider>;
};
