# Habit Tracker Frontend Context

## Purpose
- React frontend for the habit/quest gamification app.
- Runs locally against backend API (local Django or Railway backend).

## Stack
- React + Vite
- Apollo Client (GraphQL)
- Tailwind CSS utilities
- Lucide icons

## API Integration
- `API_BASE` from `src/lib/config.js`.
- GraphQL endpoint: `${API_BASE}/graphql/`.
- Auth uses backend session/cookies (`credentials: include`).

## Current Product Structure
- Top-level views:
  - `quests`
  - `profile`
  - claim panel via mini-map nav
- Quests view includes:
  - Daily Boss banner (daily chain UX, boss data from backend)
  - Weekly Boss raid panel (harder mechanics/reward than daily)
  - Streak Combo Meter
  - Safety/recovery panel
  - Quest creation + templates
  - Quest list with check-in/toggle/delete
- Profile view includes:
  - Player bar/stats/title
  - Recent activity feed
  - Skin inventory
  - Achievements

## Gamification UX Implemented
- Reward toast for XP gains.
- Achievement unlock toast.
- Level-up scene overlay.
- Reward chest reveal overlay for daily/recovery claims.
- XP orb in hero header with pulse/burst.
- Daily claim state messaging wired from backend fields:
  - `claimReason`
  - `rewardClaimedAt`
  - `rewardAwardedXp`
- Daily + weekly boss metadata from backend:
  - `boss.name`, `boss.subtitle`, `boss.rarity`, `boss.difficulty`
  - `boss.mechanics[]`
  - `boss.buffs[]`
- Optional sound cues toggle (check-in, claim, level-up).

## Skin System
- Cosmetic skins unlocked by achievements.
- Skin inventory in Profile shows:
  - unlocked/locked state
  - unlock progress for locked skins
- Equipped skin applies to:
  - habit cards
  - daily/weekly boss panels
- Local persistence key:
  - `habit-tracker:skin:<userId|guest>`

## Important UX Contracts
- Deactivate should not feel like delete:
  - app auto-switches filter to `All` if deactivating in `Active` mode.
- Delete is destructive and should stay explicit.
- Keep effects readable and non-cluttered; gameplay feel without noise.

## Main Files
- App orchestration:
  - `src/App.jsx`
- GraphQL ops:
  - `src/graphql/operations.js`
- Key UI components:
  - `src/components/bosses/DailyQuestChain.jsx`
  - `src/components/bosses/WeeklyBossEncounter.jsx`
  - `src/components/HabitCard.jsx`
  - `src/components/ClaimCenter.jsx`
  - `src/components/ProfileScreen.jsx`
  - `src/components/SkinInventory.jsx`
  - `src/components/StreakComboMeter.jsx`
  - `src/components/XpOrb.jsx`
  - `src/components/RewardChestReveal.jsx`
  - `src/components/LevelUpScene.jsx`
- Sound cues:
  - `src/lib/soundCues.js`

## Testing and CI
- Build check:
  - `npm run build`
- E2E smoke:
  - `npm run test:e2e`
  - Playwright config: `playwright.config.js`
- Workflow:
  - `.github/workflows/frontend-tests.yml`

## Practical Development Notes
- Backend may be local SQLite or Railway/Postgres; frontend should remain backend-agnostic.
- Keep GraphQL operation fields aligned with backend schema updates.
- Boss behavior/design changes should come from backend catalog data first, then UI polish.
- Favor reusable components for game-like UX additions rather than app-wide one-off effects.
