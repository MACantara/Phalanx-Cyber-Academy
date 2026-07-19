import { LevelOne } from './LevelOne';
import { LevelTwo } from './LevelTwo';
import { LevelThree } from './LevelThree';
import { LevelFour } from './LevelFour';
import { LevelFive } from './LevelFive';

const levelComponents: Record<number, React.ComponentType> = {
  1: LevelOne,
  2: LevelTwo,
  3: LevelThree,
  4: LevelFour,
  5: LevelFive,
};

export function getLevelComponent(levelId: number) {
  return levelComponents[levelId] ?? LevelOne;
}

export { LevelOne, LevelTwo, LevelThree, LevelFour, LevelFive };
