import type { LevelEnvironment, SimulationContent } from '../types';

export function applyAdaptive(
  content: SimulationContent | LevelEnvironment
): SimulationContent | LevelEnvironment | undefined {
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
  if (!keys.length) return;

  let current: unknown = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (current == null || typeof current !== 'object') return;

    const key = keys[i];
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;

    const record = current as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(record, key)) return;
    current = record[key];
  }

  if (current == null || typeof current !== 'object') return;

  const finalKey = keys[keys.length - 1];
  if (finalKey === '__proto__' || finalKey === 'constructor' || finalKey === 'prototype') return;

  const record = current as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(record, finalKey)) return;
  record[finalKey] = value;
}
