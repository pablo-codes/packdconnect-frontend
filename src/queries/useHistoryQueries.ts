import { useInfiniteQuery } from "@tanstack/react-query";
import { historyApi } from "../api/history";

export function useHistoryQueries() {
  const historyQuery = useInfiniteQuery({
    queryKey: ['activityHistory'],
    queryFn: async ({ pageParam = 0 }) => {
      // limit = 20, offset = pageParam
      return await historyApi.getActivityHistory(20, pageParam as number);
    },
    getNextPageParam: (lastPage: any[], allPages: any[][]) => {
      // If we got fewer than 20 items, there are no more pages.
      if (lastPage.length < 20) return undefined;
      // Otherwise, the next offset is the total number of items fetched so far.
      return allPages.length * 20;
    },
    initialPageParam: 0,
  });

  return {
    historyQuery,
  };
}
