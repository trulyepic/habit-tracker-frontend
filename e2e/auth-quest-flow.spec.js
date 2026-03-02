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
    totalXp: 0,
    level: 1,
    totalMinutesLogged: 0,
    achievementsUnlocked: {},
    currentTitle: buildTitle("rookie", "Rookie", "🧭", "Starting strong."),
    nextTitle: buildTitle("adventurer", "Adventurer", "⚔️", "Momentum unlocked.", 3),
    nextTitleProgressPct: 0,
    nextTitleMissingLevels: 2,
    nextTitleMissingAchievements: [],
    isMaxTitle: false,
    streakFreezeCharges: 0,
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
    unlockedTitles: [buildTitle("rookie", "Rookie", "🧭", "Starting strong.")],
  };
}

function habitResponse(habit) {
  return {
    __typename: "HabitType",
    id: habit.id,
    name: habit.name,
    isActive: habit.isActive,
    totalCheckins: habit.totalCheckins,
    checkedInToday: habit.checkedInToday,
    usedFreezeToday: false,
    last7DaysCount: habit.last7DaysCount,
    currentStreak: habit.currentStreak,
    bestStreak: habit.bestStreak,
  };
}

test("login -> create quest -> check-in -> deactivate keeps quest visible", async ({ page }) => {
  let authed = false;
  let habitSeq = 1;
  let checkinSeq = 1;
  const habits = [];
  const profile = buildProfile();

  const jsonHeaders = {
    "content-type": "application/json",
    "access-control-allow-origin": "http://127.0.0.1:4173",
    "access-control-allow-credentials": "true",
  };

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());

    if (url.port === "8000" && url.pathname === "/login/") {
      authed = true;
      const next = url.searchParams.get("next") || "http://127.0.0.1:4173/";
      await route.fulfill({
        status: 302,
        headers: { location: next },
        body: "",
      });
      return;
    }

    if (url.port === "8000" && url.pathname === "/api/logout/") {
      authed = false;
      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    if (url.port === "8000" && url.pathname === "/graphql/") {
      const body = route.request().postDataJSON() || {};
      const query = body.query || "";
      const variables = body.variables || {};

      if (query.includes("query Me")) {
        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            data: {
              me: authed
                ? {
                    id: "user-1",
                    username: "e2e_user",
                    email: "e2e@example.com",
                    playerProfile: profile,
                  }
                : null,
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
              habits: authed ? habits.map(habitResponse) : [],
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
                dateKey: "2026-03-01",
                completedCount: 0,
                totalCount: 3,
                completionPct: 0,
                isComplete: false,
                rewardXp: 50,
                rewardClaimed: false,
                rewardClaimable: false,
                quests: [],
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

      if (query.includes("mutation CreateHabit")) {
        const name = String(variables.name || "").trim();
        const newHabit = {
          id: String(habitSeq++),
          name,
          isActive: true,
          totalCheckins: 0,
          checkedInToday: false,
          last7DaysCount: 0,
          currentStreak: 0,
          bestStreak: 0,
        };
        habits.unshift(newHabit);
        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            data: {
              createHabit: {
                habit: habitResponse(newHabit),
              },
            },
          }),
        });
        return;
      }

      if (query.includes("mutation CheckInToday")) {
        const habit = habits.find((h) => h.id === String(variables.habitId));
        if (!habit) {
          await route.fulfill({
            status: 200,
            headers: jsonHeaders,
            body: JSON.stringify({
              errors: [{ message: "Habit not found" }],
              data: { checkInToday: null },
            }),
          });
          return;
        }

        const alreadyChecked = habit.checkedInToday;
        if (!alreadyChecked) {
          habit.checkedInToday = true;
          habit.totalCheckins += 1;
          habit.last7DaysCount += 1;
          habit.currentStreak += 1;
          habit.bestStreak = Math.max(habit.bestStreak, habit.currentStreak);
        }

        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            data: {
              checkInToday: {
                created: !alreadyChecked,
                checkin: {
                  id: String(checkinSeq++),
                  date: "2026-03-01",
                  minutesSpent: variables.minutesSpent ?? null,
                  xpAwarded: alreadyChecked ? 0 : 10,
                  __typename: "CheckInType",
                },
                habit: habitResponse(habit),
                profile,
                __typename: "CheckInToday",
              },
            },
          }),
        });
        return;
      }

      if (query.includes("mutation ToggleHabit")) {
        const habit = habits.find((h) => h.id === String(variables.id));
        if (habit) habit.isActive = Boolean(variables.isActive);
        await route.fulfill({
          status: 200,
          headers: jsonHeaders,
          body: JSON.stringify({
            data: {
              toggleHabitActive: {
                habit: habit
                  ? { __typename: "HabitType", id: habit.id, isActive: habit.isActive }
                  : null,
              },
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ data: {} }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/");
  await expect(page.getByText("Guest mode (saved locally).")).toBeVisible();

  await page.getByRole("link", { name: "Login" }).click();
  await expect(page.getByText("Logged in as")).toBeVisible();
  await expect(page.getByText("e2e_user")).toBeVisible();

  await page.getByRole("button", { name: "Create" }).click();
  await page.getByPlaceholder("Habit name (unique)").fill("E2E Quest");
  await page.getByRole("button", { name: "Create" }).last().click();

  await page.getByRole("button", { name: "My Quests" }).click();
  await expect(page.getByText("E2E Quest")).toBeVisible();

  await page.getByRole("button", { name: "Check-in" }).click();
  await expect(page.getByText("Checked in today")).toBeVisible();

  await page.getByRole("button", { name: "Deactivate" }).click();
  await expect(page.getByText("Quest deactivated. Switched to All so it stays visible.")).toBeVisible();
  await expect(page.locator("select").first()).toHaveValue("all");
  await expect(page.getByText("E2E Quest")).toBeVisible();
});
