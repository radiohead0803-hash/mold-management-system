import Matter from 'matter-js';
import { PHYSICS } from '../constants';
import type { BallEntity, Pocket, WorldEntities } from '../entities/setupWorld';

type Time = { delta: number };

const STOP_THRESHOLD = 0.05;

export const PhysicsSystem = (entities: WorldEntities, { time }: { time: Time }) => {
  const { engine } = entities.physics;
  Matter.Engine.update(engine, time.delta);
  return entities;
};

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const PocketSystem = (entities: WorldEntities) => {
  const pockets: Pocket[] = entities.table.pockets;
  Object.keys(entities).forEach((key) => {
    if (key === 'physics' || key === 'table') return;
    const ent = entities[key] as BallEntity;
    if (!ent?.body || ent.pocketed) return;
    for (const p of pockets) {
      if (distance(ent.body.position, p) < p.radius - 4) {
        ent.pocketed = true;
        Matter.World.remove(entities.physics.world, ent.body);
        if (ent.isCue) {
          Matter.Body.setPosition(ent.body, { x: p.x - 200, y: p.y });
          Matter.Body.setVelocity(ent.body, { x: 0, y: 0 });
          Matter.World.add(entities.physics.world, ent.body);
          ent.pocketed = false;
        }
        break;
      }
    }
  });
  return entities;
};

export const RestSystem = (entities: WorldEntities) => {
  Object.keys(entities).forEach((key) => {
    if (key === 'physics' || key === 'table') return;
    const ent = entities[key] as BallEntity;
    if (!ent?.body || ent.pocketed) return;
    const v = ent.body.velocity;
    if (Math.hypot(v.x, v.y) < STOP_THRESHOLD) {
      Matter.Body.setVelocity(ent.body, { x: 0, y: 0 });
    }
  });
  return entities;
};

export const isWorldAtRest = (entities: WorldEntities) => {
  return Object.keys(entities).every((key) => {
    if (key === 'physics' || key === 'table') return true;
    const ent = entities[key] as BallEntity;
    if (!ent?.body || ent.pocketed) return true;
    return Math.hypot(ent.body.velocity.x, ent.body.velocity.y) < STOP_THRESHOLD;
  });
};

export const applyCueShot = (
  cueBall: BallEntity,
  direction: { x: number; y: number },
  power: number,
) => {
  const clamped = Math.min(1, Math.max(0, power));
  const magnitude = clamped * PHYSICS.maxShotPower;
  const length = Math.hypot(direction.x, direction.y) || 1;
  Matter.Body.setVelocity(cueBall.body, {
    x: (direction.x / length) * magnitude,
    y: (direction.y / length) * magnitude,
  });
};
