import React from 'react';
import { View } from 'react-native';

type Props = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  power: number;
};

export const AimLine = ({ from, to, power }: Props) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 4) return null;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: from.x,
        top: from.y - 1,
        width: length,
        height: 2,
        backgroundColor: `rgba(255,255,255,${0.3 + Math.min(power, 1) * 0.6})`,
        transform: [{ translateY: -1 }, { rotateZ: `${angle}deg` }],
        transformOrigin: '0% 50%' as any,
      }}
    />
  );
};
