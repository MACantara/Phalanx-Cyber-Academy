import type {
  EventMatcher,
  LevelEnvironment,
  Objective,
  ScoringEvent,
  WorldEvent,
} from '../types';

export interface WorldState {
  unlocked: Set<string>;
  objectivesDone: Set<string>;
  firedTriggers: Set<number>;
}

export function freshWorld(): WorldState {
  return {
    unlocked: new Set(),
    objectivesDone: new Set(),
    firedTriggers: new Set(),
  };
}

export function requiredObjectives(env?: LevelEnvironment): Objective[] {
  return env?.scenario?.objectives.filter((o) => o.required !== false) ?? [];
}

export function matchesEvent(matcher: EventMatcher, event: WorldEvent): boolean {
  if (matcher.app !== event.app || matcher.action !== event.action) return false;
  if (matcher.target !== undefined && matcher.target !== event.target) return false;
  if (matcher.data) {
    for (const [key, value] of Object.entries(matcher.data)) {
      if (event.data?.[key] !== value) return false;
    }
  }
  return true;
}

export interface EmitResult {
  next: WorldState;
  scoring: ScoringEvent[];
  notifications: { message: string; speaker?: string }[];
  openUrl?: string;
  completedNow: boolean;
}

/* Pure: applies one world event to prev state, returns the next state plus
   every side effect the shell must perform. Idempotent — objectives and
   unlocks are set-membership, `once` triggers only fire a single time. */
export function applyWorldEvent(
  env: LevelEnvironment | undefined,
  prev: WorldState,
  event: WorldEvent
): EmitResult {
  const result: EmitResult = {
    next: prev,
    scoring: [],
    notifications: [],
    completedNow: false,
  };
  const scenario = env?.scenario;
  if (!scenario) return result;

  const next: WorldState = {
    unlocked: new Set(prev.unlocked),
    objectivesDone: new Set(prev.objectivesDone),
    firedTriggers: new Set(prev.firedTriggers),
  };

  const completeObjective = (obj: Objective) => {
    if (next.objectivesDone.has(obj.id)) return;
    next.objectivesDone.add(obj.id);
    result.scoring.push({
      type: 'objective',
      id: obj.id,
      points: obj.points,
      app: event.app,
      action: event.action,
      target: event.target,
    });
  };

  for (const obj of scenario.objectives) {
    if (!next.objectivesDone.has(obj.id) && matchesEvent(obj.event, event)) {
      completeObjective(obj);
    }
  }

  scenario.triggers?.forEach((trigger, index) => {
    if (trigger.once && next.firedTriggers.has(index)) return;
    if (!matchesEvent(trigger.on, event)) return;
    next.firedTriggers.add(index);
    for (const effect of trigger.then) {
      if (effect.unlock) next.unlocked.add(effect.unlock);
      if (effect.notify) {
        result.notifications.push(
          typeof effect.notify === 'string'
            ? { message: effect.notify }
            : { message: effect.notify.text, speaker: effect.notify.speaker }
        );
      }
      if (effect.openUrl) result.openUrl = effect.openUrl;
      if (effect.objective) {
        const obj = scenario.objectives.find((o) => o.id === effect.objective);
        if (obj) completeObjective(obj);
      }
    }
  });

  const required = requiredObjectives(env);
  result.completedNow =
    required.length > 0 &&
    required.every((o) => next.objectivesDone.has(o.id)) &&
    !required.every((o) => prev.objectivesDone.has(o.id));

  result.next = next;
  return result;
}
