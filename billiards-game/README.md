# Mobile Billiards Game (모바일 당구게임)

Expo(React Native) + Matter.js 물리 엔진으로 만든 터치 기반 2D 당구게임입니다.

> 본 폴더는 `mold-management-system` 리포의 `claude/mobile-billiards-game-UgY5b` 브랜치에 임시로 거주합니다. 추후 독립 리포(`mobile-billiards-game`)로 분리 예정.

## 기술 스택
- Expo / React Native (iOS, Android, Web)
- `react-native-game-engine` — 렌더 루프
- `matter-js` — 2D 강체 물리
- TypeScript

## 프로젝트 구조
```
App.tsx                 # 루트: 입력 → 물리 → 렌더
src/
  constants.ts          # 테이블/공/물리 튜닝값
  entities/setupWorld.ts# 엔진, 테이블, 공, 포켓, 랙 트라이앵글 구성
  systems/physics.ts    # PhysicsSystem, PocketSystem, RestSystem, applyCueShot
  components/
    Ball.tsx            # 공 렌더러
    Table.tsx           # 펠트, 레일, 포켓
    AimLine.tsx         # 큐 조준선
```

## 실행
```bash
cd billiards-game
npm install
npm run start          # Expo 개발 서버
npm run android        # 또는
npm run ios            # 또는
npm run web
```

## 조작법
- 큐볼에서 반대 방향으로 드래그해 각도와 파워 결정
- 손가락을 떼면 발사

## 로드맵
- 큐스틱 스프라이트 + 초크 애니메이션
- 게임 규칙(8볼/9볼, 파울, 턴 전환)
- 사운드(타격, 공끼리 충돌, 포켓 인)
- 온라인 멀티플레이(로비 + 매치)
- AI 기반 트릭샷 가이드/난이도 조절
