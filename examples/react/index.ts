/**
 * React-oriented state debugging (framework-agnostic demo).
 */
import { dbg } from '../../dist/index.js';

function useDebugState<T extends object>(initial: T, label: string): T {
  return dbg.watch(initial, label);
}

const state = useDebugState({ count: 0, user: { name: 'Gurjot' } }, 'reactState');
state.count += 1;
state.user.name = 'Ada';
