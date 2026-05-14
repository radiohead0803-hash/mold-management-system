import React from 'react';
import { Dimensions, View } from 'react-native';
import { POCKET, TABLE } from '../constants';
import type { Pocket } from '../entities/setupWorld';

type Props = { width: number; height: number; pockets: Pocket[] };

export const Table = ({ width, height, pockets }: Props) => {
  const screenW = Dimensions.get('window').width;
  const left = (screenW - width) / 2;
  const top = 60;
  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: left - TABLE.cushion,
          top: top - TABLE.cushion,
          width: width + TABLE.cushion * 2,
          height: height + TABLE.cushion * 2,
          backgroundColor: TABLE.railColor,
          borderRadius: 18,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left,
          top,
          width,
          height,
          backgroundColor: TABLE.feltColor,
        }}
      />
      {pockets.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: p.x - POCKET.radius,
            top: p.y - POCKET.radius,
            width: POCKET.radius * 2,
            height: POCKET.radius * 2,
            borderRadius: POCKET.radius,
            backgroundColor: '#000',
          }}
        />
      ))}
    </>
  );
};
