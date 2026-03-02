import { gql } from "@apollo/client";

export const HABIT_FIELDS = gql`
  fragment HabitFields on HabitType {
    __typename
    id
    name
    isActive
    totalCheckins
    checkedInToday
    usedFreezeToday
    last7DaysCount
    currentStreak
    bestStreak
  }
`;
