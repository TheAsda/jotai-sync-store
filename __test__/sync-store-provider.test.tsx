import { describe, expect, test } from 'vitest';
import { SyncScopeProvider } from '../src/sync-store-provider';
import { atom, useAtom } from 'jotai';
import { act, renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';

describe(SyncScopeProvider, () => {
  test('simple sync', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);

    const Provider = (props: PropsWithChildren) => {
      return (
        <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
          {props.children}
        </SyncScopeProvider>
      );
    };

    const { result } = renderHook(
      () => {
        const [source, setSource] = useAtom(sourceAtom);
        const [target, setTarget] = useAtom(targetAtom);
        return {
          source,
          setSource,
          target,
          setTarget,
        };
      },
      { wrapper: Provider }
    );
    const { result: globalScope } = renderHook(() => {
      const [global, setGlobal] = useAtom(sourceAtom);
      return {
        global,
        setGlobal,
      };
    });

    expect(result.current.source).toBe(0);
    expect(result.current.target).toBe(0);
    expect(globalScope.current.global).toBe(0);

    act(() => {
      result.current.setTarget(10);
    });

    expect(result.current.source).toBe(10);
    expect(result.current.target).toBe(10);
    expect(globalScope.current.global).toBe(10);

    act(() => {
      result.current.setSource(20);
    });

    expect(result.current.source).toBe(20);
    expect(result.current.target).toBe(20);
    expect(globalScope.current.global).toBe(20);

    act(() => {
      globalScope.current.setGlobal(100);
    });

    expect(result.current.source).toBe(100);
    expect(result.current.target).toBe(100);
    expect(globalScope.current.global).toBe(100);
  });

  test('nested sync', () => {
    const sourceAtom = atom(0);
    const targetAtom = atom(0);
    const nestedAtom = atom(0);

    const Provider = (props: PropsWithChildren) => {
      return (
        <SyncScopeProvider atoms={[[sourceAtom, targetAtom]]}>
          {props.children}
        </SyncScopeProvider>
      );
    };
    const Provider2 = (props: PropsWithChildren) => {
      return (
        <Provider>
          <SyncScopeProvider atoms={[[targetAtom, nestedAtom]]}>
            {props.children}
          </SyncScopeProvider>
        </Provider>
      );
    };

    const { result: globalScope } = renderHook(() => {
      const [global, setGlobal] = useAtom(sourceAtom);
      return {
        global,
        setGlobal,
      };
    });
    const { result } = renderHook(
      () => {
        const [source, setSource] = useAtom(sourceAtom);
        const [target, setTarget] = useAtom(targetAtom);
        return {
          source,
          setSource,
          target,
          setTarget,
        };
      },
      { wrapper: Provider }
    );
    const { result: nestedScope } = renderHook(
      () => {
        const [nested, setNested] = useAtom(nestedAtom);
        return {
          nested,
          setNested,
        };
      },
      { wrapper: Provider2 }
    );

    expect(result.current.source).toBe(0);
    expect(result.current.target).toBe(0);
    expect(globalScope.current.global).toBe(0);
    expect(nestedScope.current.nested).toBe(0);

    act(() => {
      result.current.setTarget(10);
    });

    expect(result.current.source).toBe(10);
    expect(result.current.target).toBe(10);
    expect(globalScope.current.global).toBe(10);
    expect(nestedScope.current.nested).toBe(10);

    act(() => {
      result.current.setSource(20);
    });

    expect(result.current.source).toBe(20);
    expect(result.current.target).toBe(20);
    expect(globalScope.current.global).toBe(20);
    expect(nestedScope.current.nested).toBe(20);

    act(() => {
      globalScope.current.setGlobal(100);
    });

    expect(result.current.source).toBe(100);
    expect(result.current.target).toBe(100);
    expect(globalScope.current.global).toBe(100);
    expect(nestedScope.current.nested).toBe(100);
  });
});
