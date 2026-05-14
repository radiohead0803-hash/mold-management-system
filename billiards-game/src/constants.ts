import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN = { width, height };

export const TABLE = {
  width: width * 0.95,
  height: height * 0.7,
  cushion: 14,
  feltColor: '#0b6a2a',
  railColor: '#3b2412',
};

export const BALL = {
  radius: 14,
  restitution: 0.92,
  friction: 0.005,
  frictionAir: 0.012,
  density: 0.04,
};

export const POCKET = {
  radius: 22,
};

export const PHYSICS = {
  velocityIterations: 8,
  positionIterations: 6,
  maxShotPower: 28,
};

export const COLORS = {
  cue: '#ffffff',
  solids: ['#ffd400', '#1d4ed8', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d'],
  eight: '#0a0a0a',
  stripeRing: '#ffffff',
};
