import { expect, test } from "@playwright/test";

function buildTitle(key, name, emoji, flavor, minLevel = 1) {
  return {
    key,
    name,
    emoji,
    flavor,
    minLevel,
    requiredAchievements: [],
  };
}

function buildProfile() {
  return {
    totalXp: 420,
    level: 7,
    totalMinutesLogged: 180,
    achievementsUnlocked: {},
    currentTitle: buildTitle("adventurer", "Adventurer", "⚔️", "Momentum unlocked.", 3),
    nextTitle: buildTitle("vanguard", "Vanguard", "🛡️", "Lead every check-in.", 10),
    nextTitleProgressPct: 55,
    nextTitleMissingLevels: 3,
    nextTitleMissingAchievements: [],
    isMaxTitle: false,
    streakFreezeCharges: 1,
    recoveryQuest: {
      active: false,
      startDate: null,
      progressDays: 0,
      targetDays: 2,
      complete: false,
      claimed: false,
      rewardXp: 60,
      claimable: false,
    },
    unlockedTitles: [
      buildTitle("rookie", "Rookie", "🧭", "Starting strong."),
      buildTitle("adventurer", "Adventurer", "⚔️", "Momentum unlocked.", 3),
    ],
  };
}

test("boss badges, buff tooltip, and raid tools navigation work", async ({ page }) => {
  const profile = buildProfile();
  const jsonHeaders = {
    "content-type": "application/json",
    "access-control-allow-origin": "http://127.0.0.1:4173",
    "access-control-allow-credentials": "true",
  };

  await page.route("**/graphql/", async (route) => {
    const body = route.request().postDataJSON() || {};
    const query = body.query || "";

    if (query.includes("query Me")) {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          data: {
            me: {
              id: "user-1",
              username: "boss_tester",
              email: "boss@example.com",
              playerProfile: profile,
            },
          },
        }),
      });
      return;
    }

    if (query.includes("query GetHabits")) {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          data: {
            habits: [
              {
                __typename: "HabitType",
                id: "1",
                name: "Morning Mobility",
                isActive: true,
                totalCheckins: 12,
                checkedInToday: false,
                usedFreezeToday: false,
                last7DaysCount: 5,
                currentStreak: 4,
                bestStreak: 9,
              },
            ],
          },
        }),
      });
      return;
    }

    if (query.includes("query DailyQuestChain")) {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          data: {
            dailyQuestChain: {
              dateKey: "2026-03-02",
              boss: {
                key: "ember_commander",
                name: "Ember Commander",
                subtitle: "Break objectives to shatter inferno shields.",
                icon: "flame",
                tint: "from-rose-700 to-amber-600",
                rarity: "epic",
                difficulty: "veteran",
                isWeekly: false,
                mechanics: ["Consecutive check-ins reduce shield stacks."],
                buffs: [
                  {
                    key: "ember_armor",
                    name: "Temporal Armor",
                    description: "Blocks burst damage until one objective is cleared.",
                  },
                ],
              },
              completedCount: 1,
              totalCount: 3,
              completionPct: 34,
              isComplete: false,
              rewardXp: 80,
              rewardClaimed: false,
              rewardClaimable: false,
              rewardClaimedAt: null,
              rewardAwardedXp: 0,
              quests: [],
            },
          },
        }),
      });
      return;
    }

    if (query.includes("query WeeklyBossEncounter")) {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          data: {
            weeklyBossEncounter: {
              weekKey: "2026-W10",
              weekStart: "2026-03-02",
              weekEnd: "2026-03-08",
              boss: {
                key: "void_tyrant",
                name: "Void Tyrant",
                subtitle: "Maintain pressure all week to break the core.",
                icon: "crown",
                tint: "from-indigo-900 to-cyan-800",
                rarity: "legendary",
                difficulty: "challenging",
                isWeekly: true,
                mechanics: ["Missed check-ins empower attrition pressure."],
                buffs: [
                  {
                    key: "attrition_pressure",
                    name: "Attrition Pressure",
                    description: "Unfinished quests increase weekly resistance.",
                  },
                ],
              },
              completedCount: 2,
              totalCount: 4,
              completionPct: 50,
              isComplete: false,
              rewardXp: 250,
              rewardClaimed: false,
              rewardClaimable: false,
              rewardClaimedAt: null,
              rewardAwardedXp: 0,
              quests: [
                {
                  key: "weekly_focus",
                  title: "Weekly Focus",
                  description: "Check in at least 5 times this week.",
                  icon: "target",
                  current: 2,
                  target: 5,
                  complete: false,
                },
              ],
            },
          },
        }),
      });
      return;
    }

    if (query.includes("query RecentActivity")) {
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ data: { recentActivity: [] } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ data: {} }),
    });
  });

  await page.goto("/");

  await expect(page.getByText("Daily Boss", { exact: true })).toBeVisible();
  await expect(page.getByText("Epic", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Veteran", { exact: true }).first()).toBeVisible();

  const dailyBuff = page.getByRole("button", { name: /Temporal Armor/ }).first();
  await dailyBuff.focus();
  await expect(page.getByText("Temporal Armor", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("Blocks burst damage until one objective is cleared.")).toBeVisible();

  await page.getByRole("button", { name: /Weekly/ }).click();
  await expect(page.getByText("Weekly Raid", { exact: true })).toBeVisible();
  await expect(page.getByText("Legendary", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Challenging", { exact: true }).first()).toBeVisible();

  const weeklyBuff = page.getByRole("button", { name: /Attrition Pressure/ }).first();
  await weeklyBuff.focus();
  await expect(page.getByText("Attrition Pressure", { exact: true }).last()).toBeVisible();

  await page.getByRole("button", { name: "Safety Ops" }).click();
  await expect(page.getByText("Streak Safety", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Weekly/ }).click();
  await page.getByRole("button", { name: "Quest Forge" }).click();
  await expect(page.getByText("Create New Quest", { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder("Habit name (unique)")).toBeVisible();
});
