import React, { useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, StyleSheet, Text, View } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { StatusBar } from 'expo-status-bar';
import { AimLine } from './src/components/AimLine';
import { Ball } from './src/components/Ball';
import { Table } from './src/components/Table';
import { buildWorld, WorldEntities } from './src/entities/setupWorld';
import {
  applyCueShot,
  isWorldAtRest,
  PhysicsSystem,
  PocketSystem,
  RestSystem,
} from './src/systems/physics';

export default function App() {
  const entities = useMemo<WorldEntities>(() => buildWorld(Ball, Table), []);
  const [aimEnd, setAimEnd] = useState<{ x: number; y: number } | null>(null);
  const [pocketedCount, setPocketedCount] = useState(0);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const cuePos = () => entities.cueBall.body.position;

  const onStart = (e: GestureResponderEvent) => {
    if (!isWorldAtRest(entities)) return;
    dragStart.current = {
      x: e.nativeEvent.locationX,
      y: e.nativeEvent.locationY,
    };
    setAimEnd(dragStart.current);
  };

  const onMove = (e: GestureResponderEvent) => {
    if (!dragStart.current) return;
    setAimEnd({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY });
  };

  const onRelease = () => {
    if (!dragStart.current || !aimEnd) {
      dragStart.current = null;
      setAimEnd(null);
      return;
    }
    const cue = cuePos();
    const dx = cue.x - aimEnd.x;
    const dy = cue.y - aimEnd.y;
    const drag = Math.hypot(dx, dy);
    const power = Math.min(1, drag / 220);
    applyCueShot(entities.cueBall, { x: dx, y: dy }, power);
    dragStart.current = null;
    setAimEnd(null);
  };

  const onEvent = (ev: any) => {
    if (ev?.type === 'pocketed') setPocketedCount((c) => c + 1);
  };

  const cue = cuePos();
  const power = aimEnd
    ? Math.min(1, Math.hypot(cue.x - aimEnd.x, cue.y - aimEnd.y) / 220)
    : 0;

  return (
    <View
      style={styles.root}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={onStart}
      onResponderMove={onMove}
      onResponderRelease={onRelease}
    >
      <StatusBar style="light" />
      <GameEngine
        style={styles.engine}
        systems={[PhysicsSystem, PocketSystem, RestSystem]}
        entities={entities}
        onEvent={onEvent}
      />
      {aimEnd && (
        <AimLine
          from={{ x: cue.x, y: cue.y }}
          to={{ x: 2 * cue.x - aimEnd.x, y: 2 * cue.y - aimEnd.y }}
          power={power}
        />
      )}
      <View style={styles.hud}>
        <Text style={styles.hudText}>Pocketed: {pocketedCount}</Text>
        <Text style={styles.hudText}>Power: {(power * 100).toFixed(0)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1a1a1a' },
  engine: { flex: 1 },
  hud: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 16,
  },
  hudText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 2,
  },
});
