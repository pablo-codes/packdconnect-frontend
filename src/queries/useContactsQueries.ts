import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactsApi, type ContactsResponse } from "../api/contacts";

export function useContactsQueries(searchQuery: string = "") {
  const queryClient = useQueryClient();

  const contactsQuery = useInfiniteQuery<ContactsResponse>({
    queryKey: ['contacts', searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      return contactsApi.getContacts({
        page: pageParam as number,
        limit: 15,
        search: searchQuery,
      });
    },
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const addContactMutation = useMutation({
    mutationFn: (email: string) => contactsApi.addContact(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  return {
    contactsQuery,
    addContactMutation,
  };
}
