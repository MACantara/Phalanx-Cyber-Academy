import type { SimulationContent } from '../types';

export function applyAdaptive(content: SimulationContent): SimulationContent | undefined {
  if (!content.adaptive?.enabled || !content.adaptive.variants?.length) {
    return undefined;
  }

  const mutated = structuredClone(content);
  for (const variant of content.adaptive.variants) {
    const value = variant.pool[Math.floor(Math.random() * variant.pool.length)];
    setValue(mutated, variant.field, value);
  }
  return mutated;
}

function setValue(obj: unknown, path: string, value: string): void {
  const keys = path.split('.');
  let current: unknown = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (current == null) return;
    current = (current as Record<string, unknown>)[keys[i]];
  }

  if (current == null) return;
  (current as Record<string, unknown>)[keys[keys.length - 1]] = value;
}
