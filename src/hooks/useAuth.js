import { useQuery } from "@apollo/client/react";
import { ME } from "../graphql/operations";

export function useAuth() {
  const { data, refetch } = useQuery(ME, {
    fetchPolicy: "network-only",
  });

  const me = data?.me ?? null;

  return {
    me,
    isAuthed: !!me,
    refetchMe: refetch,
  };
}
