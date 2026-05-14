import Matter from 'matter-js';
import { BALL, COLORS, POCKET, TABLE } from '../constants';

export type BallEntity = {
  body: Matter.Body;
  radius: number;
  color: string;
  isCue?: boolean;
  isEight?: boolean;
  pocketed?: boolean;
  renderer: any;
};

export type Pocket = { x: number; y: number; radius: number };

export type WorldEntities = {
  physics: { engine: Matter.Engine; world: Matter.World };
  table: { width: number; height: number; pockets: Pocket[]; renderer: any };
  cueBall: BallEntity;
  [id: string]: any;
};

const rackTriangle = (cx: number, cy: number) => {
  const r = BALL.radius;
  const dx = r * 2 * Math.cos(Math.PI / 6);
  const dy = r * 2 * Math.sin(Math.PI / 6);
  const positions: { x: number; y: number }[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      const x = cx + row * dx;
      const y = cy - row * dy + col * r * 2;
      positions.push({ x, y });
    }
  }
  return positions;
};

export const buildWorld = (
  BallRenderer: any,
  TableRenderer: any,
): WorldEntities => {
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
  const world = engine.world;

  const left = (require('react-native').Dimensions.get('window').width - TABLE.width) / 2;
  const top = 60;

  const wallOpts = { isStatic: true, restitution: 0.85, friction: 0.0 };
  const cushion = TABLE.cushion;
  const walls = [
    Matter.Bodies.rectangle(left + TABLE.width / 2, top - cushion / 2, TABLE.width, cushion, wallOpts),
    Matter.Bodies.rectangle(left + TABLE.width / 2, top + TABLE.height + cushion / 2, TABLE.width, cushion, wallOpts),
    Matter.Bodies.rectangle(left - cushion / 2, top + TABLE.height / 2, cushion, TABLE.height, wallOpts),
    Matter.Bodies.rectangle(left + TABLE.width + cushion / 2, top + TABLE.height / 2, cushion, TABLE.height, wallOpts),
  ];
  Matter.World.add(world, walls);

  const pockets: Pocket[] = [
    { x: left, y: top, radius: POCKET.radius },
    { x: left + TABLE.width / 2, y: top, radius: POCKET.radius },
    { x: left + TABLE.width, y: top, radius: POCKET.radius },
    { x: left, y: top + TABLE.height, radius: POCKET.radius },
    { x: left + TABLE.width / 2, y: top + TABLE.height, radius: POCKET.radius },
    { x: left + TABLE.width, y: top + TABLE.height, radius: POCKET.radius },
  ];

  const ballOpts = {
    restitution: BALL.restitution,
    friction: BALL.friction,
    frictionAir: BALL.frictionAir,
    density: BALL.density,
  };

  const cueX = left + TABLE.width * 0.25;
  const cueY = top + TABLE.height / 2;
  const cueBody = Matter.Bodies.circle(cueX, cueY, BALL.radius, { ...ballOpts, label: 'cue' });
  Matter.World.add(world, cueBody);

  const cueBall: BallEntity = {
    body: cueBody,
    radius: BALL.radius,
    color: COLORS.cue,
    isCue: true,
    renderer: BallRenderer,
  };

  const rackCenter = { x: left + TABLE.width * 0.72, y: top + TABLE.height / 2 };
  const positions = rackTriangle(rackCenter.x, rackCenter.y);
  const entities: WorldEntities = {
    physics: { engine, world },
    table: { width: TABLE.width, height: TABLE.height, pockets, renderer: TableRenderer },
    cueBall,
  };

  positions.forEach((pos, i) => {
    const isEight = i === 4;
    const color = isEight ? COLORS.eight : COLORS.solids[i % COLORS.solids.length];
    const body = Matter.Bodies.circle(pos.x, pos.y, BALL.radius, { ...ballOpts, label: `ball-${i}` });
    Matter.World.add(world, body);
    entities[`ball-${i}`] = {
      body,
      radius: BALL.radius,
      color,
      isEight,
      renderer: BallRenderer,
    } satisfies BallEntity;
  });

  return entities;
};
