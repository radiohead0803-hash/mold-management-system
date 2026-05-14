# CLAUDE.md

이 문서는 본 저장소에서 작업하는 Claude Code(claude.ai/code) 인스턴스를 위한 가이드입니다.

## 명령어

- `npm run start` — Expo 개발 서버 (실행 후 `a`/`i`/`w`로 Android/iOS/Web 선택)
- `npm run android` / `npm run ios` / `npm run web` — 특정 타깃 바로 실행
- `npm run typecheck` — `tsc --noEmit`, 파일 출력 없음
- `npm run lint` — `.ts`/`.tsx`에 대한 ESLint
- `npm run test` — Jest (현재는 테스트가 없어도 통과)

단일 테스트 러너 스크립트는 별도로 없습니다. 경로를 jest에 직접 넘기세요. 예: `npx jest src/systems/physics.test.ts`.

## 아키텍처

이 앱은 `react-native-game-engine`이 구동하는 단일 화면 게임입니다. 매 프레임마다 `App.tsx`는 `entities` 맵을 정해진 시스템 리스트에 순서대로 흘려보낸 뒤, 각 엔티티에 저장된 렌더러를 사용해 다시 그립니다.

### 프레임당 데이터 흐름
1. `App.tsx`가 `entities: WorldEntities`를 소유하며(최초에 `buildWorld`로 1회 생성), 이를 `<GameEngine systems={[PhysicsSystem, PocketSystem, RestSystem]} />`에 전달합니다.
2. 각 시스템은 `entities`를 in-place로 변경한 뒤 그대로 반환합니다. **순서가 중요합니다**: 물리 스텝 → 포켓 판정(바디 제거 / 큐볼 리스폰 가능) → 저속 클램프.
3. 엔진은 `renderer` 필드가 있는 모든 엔티티를 렌더러에 props(`body`, `radius`, `color`, `pocketed`, …)와 함께 넘겨 그립니다.

### 월드 구성 (`src/entities/setupWorld.ts`)
- `Matter.Engine`을 중력 0(탑다운 뷰)으로 생성합니다.
- 네 개의 정적 사각형 쿠션, 6개의 포켓(코너 + 변 중앙), 큐볼 1개, 랙(rack) 15개 공을 추가합니다. 랙 인덱스 4가 8볼(`isEight: true`)입니다.
- 테이블의 화면 원점은 `left = (screenWidth - TABLE.width) / 2`, `top = 60`으로 계산합니다. `Table.tsx`도 동일한 값을 다시 계산해 렌더링합니다. **한쪽을 바꾸면 다른 쪽도 같이 바꾸거나**, 공유 모듈로 추출하세요.
- 렌더러 참조(`Ball`, `Table`)는 인자로 주입되어 엔티티 모듈이 타입 레벨에서 React에 의존하지 않게 했습니다.

### 시스템 (`src/systems/physics.ts`)
- `PhysicsSystem` — `Matter.Engine.update(engine, time.delta)`.
- `PocketSystem` — 각 포켓과의 거리 판정. 비큐볼은 `pocketed = true`로 표시되고 월드에서 제거됩니다(렌더러는 `pocketed`이면 `null` 반환). 큐볼은 제거 대신 위치를 옮기고 다시 추가(스크래치 동작).
- `RestSystem` — `STOP_THRESHOLD`(0.05) 미만의 속도를 0으로 만들어 테이블이 실제로 정지하게 합니다.
- `isWorldAtRest(entities)` — 입력 핸들러가 모든 공이 멈춘 뒤에만 다음 샷을 허용하도록 사용.
- `applyCueShot(cueBall, direction, power)` — `direction`을 정규화하고 `power`를 `[0,1]`로 클램프, 속도를 `power * PHYSICS.maxShotPower`로 설정합니다. **power는 임펄스가 아닙니다.** `applyForce`로 바꾸면 `BALL.frictionAir`와 `PHYSICS.maxShotPower`를 함께 재튜닝해야 합니다.

### 입력 모델 (`App.tsx`)
루트 `View`가 레거시 responder API(`onStartShouldSetResponder` + `onResponderMove/Release`)를 사용합니다. 큐볼에서의 드래그 거리가 선형으로 파워에 매핑됩니다(`drag / 220`). 조준선은 드래그 반대 방향으로 그려집니다(새총 메타포): `to = 2 * cue - aimEnd`.

### 튜닝 (`src/constants.ts`)
모든 물리 노브가 여기 모여 있습니다: `BALL.restitution/friction/frictionAir/density`, `PHYSICS.maxShotPower`, 포켓 반경, 테이블 크기. "감(感)" 문제는 코드 차원의 우회보다 먼저 이 값을 조정하세요.

## 컨벤션

- `tsconfig.json`에 경로 별칭 `@/*` → `src/*`가 설정되어 있습니다. 새 모듈을 추가할 때는 깊은 상대경로보다 별칭을 선호하세요.
- TypeScript strict 모드 사용. 렌더러에 넘기는 엔티티 타입은 `setupWorld.ts`의 `BallEntity` / `WorldEntities`로 정의합니다. 새 엔티티 종류를 추가할 때 `any` 대신 이 타입을 확장하세요.
- Matter `Body.label`이 충돌 이벤트의 정식 식별자(`'cue'`, `'ball-<i>'`)입니다. 규칙 로직(파울, 브레이크 시 8볼 처리 등)을 구현할 때 엔티티 키 대신 label을 사용하세요.
