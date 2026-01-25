import { gql } from "@apollo/client";
import { HABIT_FIELDS } from "./fragments";

export const ME = gql`
  query Me {
    me {
      id
      username
      email
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
  mutation CheckInToday($habitId: ID!) {
    checkInToday(habitId: $habitId) {
      created
      checkin {
        id
        date
        __typename
      }
      habit {
        ...HabitFields
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
