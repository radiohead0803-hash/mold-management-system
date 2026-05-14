import React from 'react';
import { View } from 'react-native';

type Props = {
  body: { position: { x: number; y: number } };
  radius: number;
  color: string;
  isCue?: boolean;
  isEight?: boolean;
  pocketed?: boolean;
};

export const Ball = ({ body, radius, color, pocketed }: Props) => {
  if (pocketed) return null;
  const { x, y } = body.position;
  return (
    <View
      style={{
        position: 'absolute',
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        backgroundColor: color,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.4)',
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 2,
        shadowOffset: { width: 1, height: 1 },
      }}
    />
  );
};
