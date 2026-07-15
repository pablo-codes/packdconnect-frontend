import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export function useAuthQueries() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: Record<string, string>) => authApi.login(email, password),
    onSuccess: () => {
      // Allow AuthContext to handle user state
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, email, password }: Record<string, string>) => authApi.register(username, email, password),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear(); // Clear all queries on logout
    },
  });

  return {
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
