import { gql } from "@apollo/client";
import { HABIT_FIELDS } from "./fragments";

export const ME = gql`
  query Me {
    me {
      id
      username
      email
      playerProfile {
        totalXp
        level
        totalMinutesLogged
        achievementsUnlocked
        currentTitle {
          key
          name
          emoji
          flavor
          minLevel
          requiredAchievements
        }
        nextTitle {
          key
          name
          emoji
          flavor
          minLevel
          requiredAchievements
        }
        nextTitleProgressPct
        nextTitleMissingLevels
        nextTitleMissingAchievements
        isMaxTitle
        streakFreezeCharges
        recoveryQuest {
          active
          startDate
          progressDays
          targetDays
          complete
          claimed
          rewardXp
          claimable
        }
        unlockedTitles {
          key
          name
          emoji
          flavor
          minLevel
          requiredAchievements
        }
      }
    }
  }
`;

export const GET_HABITS = gql`
  query GetHabits {
    habits {
      ...HabitFields
    }
  }
  ${HABIT_FIELDS}
`;

export const DAILY_QUEST_CHAIN = gql`
  query DailyQuestChain {
    dailyQuestChain {
      dateKey
      completedCount
      totalCount
      completionPct
      isComplete
      rewardXp
      rewardClaimed
      rewardClaimable
      rewardClaimedAt
      rewardAwardedXp
      quests {
        key
        title
        description
        icon
        current
        target
        complete
      }
    }
  }
`;

export const RECENT_ACTIVITY = gql`
  query RecentActivity($limit: Int) {
    recentActivity(limit: $limit) {
      id
      action
      habitName
      date
      createdAt
      minutesSpent
      xpAwarded
      usedFreeze
    }
  }
`;

export const CREATE_HABIT = gql`
  mutation CreateHabit($name: String!, $description: String) {
    createHabit(name: $name, description: $description) {
      habit {
        ...HabitFields
      }
    }
  }
  ${HABIT_FIELDS}
`;

export const CHECK_IN_TODAY = gql`
  mutation CheckInToday($habitId: ID!, $minutesSpent: Int) {
    checkInToday(habitId: $habitId, minutesSpent: $minutesSpent) {
      created
      checkin {
        id
        date
        minutesSpent
        xpAwarded
        __typename
      }
      habit {
        ...HabitFields
      }
      profile {
        totalXp
        level
        totalMinutesLogged
        achievementsUnlocked
        currentTitle {
          key
          name
          emoji
          flavor
          minLevel
          requiredAchievements
        }
        nextTitle {
          key
          name
          emoji
          flavor
          minLevel
          requiredAchievements
        }
        nextTitleProgressPct
        nextTitleMissingLevels
        nextTitleMissingAchievements
        isMaxTitle
        streakFreezeCharges
        recoveryQuest {
          active
          startDate
          progressDays
          targetDays
          complete
          claimed
          rewardXp
          claimable
        }
        unlockedTitles {
          key
          name
          emoji
          flavor
          minLevel
          requiredAchievements
        }
      }
      __typename
    }
  }
  ${HABIT_FIELDS}
`;


export const TOGGLE_HABIT = gql`
  mutation ToggleHabit($id: ID!, $isActive: Boolean!) {
    toggleHabitActive(id: $id, isActive: $isActive) {
      habit {
        __typename
        id
        isActive
      }
    }
  }
`;

export const DELETE_HABIT = gql`
  mutation DeleteHabit($id: ID!) {
    deleteHabit(id: $id) {
      ok
      deletedId
    }
  }
`;

export const CLAIM_DAILY_QUEST_REWARD = gql`
  mutation ClaimDailyQuestReward {
    claimDailyQuestReward {
      claimed
      claimReason
      awardedXp
      chain {
        dateKey
        completedCount
        totalCount
        completionPct
        isComplete
        rewardXp
        rewardClaimed
        rewardClaimable
        rewardClaimedAt
        rewardAwardedXp
        quests {
          key
          title
          description
          icon
          current
          target
          complete
        }
      }
      profile {
        totalXp
        level
        totalMinutesLogged
        achievementsUnlocked
        streakFreezeCharges
        recoveryQuest {
          active
          startDate
          progressDays
          targetDays
          complete
          claimed
          rewardXp
          claimable
        }
      }
    }
  }
`;

export const CONSUME_STREAK_FREEZE = gql`
  mutation ConsumeStreakFreeze($habitId: ID!) {
    consumeStreakFreeze(habitId: $habitId) {
      consumed
      reason
      habit {
        ...HabitFields
      }
      profile {
        totalXp
        level
        totalMinutesLogged
        achievementsUnlocked
        streakFreezeCharges
        recoveryQuest {
          active
          startDate
          progressDays
          targetDays
          complete
          claimed
          rewardXp
          claimable
        }
      }
    }
  }
  ${HABIT_FIELDS}
`;

export const CLAIM_RECOVERY_QUEST_REWARD = gql`
  mutation ClaimRecoveryQuestReward {
    claimRecoveryQuestReward {
      claimed
      awardedXp
      profile {
        totalXp
        level
        totalMinutesLogged
        achievementsUnlocked
        streakFreezeCharges
        recoveryQuest {
          active
          startDate
          progressDays
          targetDays
          complete
          claimed
          rewardXp
          claimable
        }
      }
      recoveryQuest {
        active
        startDate
        progressDays
        targetDays
        complete
        claimed
        rewardXp
        claimable
      }
    }
  }
`;
