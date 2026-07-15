import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactsApi } from "../api/contacts";
import { apiClient } from "../api/apiClient";

export function useContactsQueries(searchQuery: string = "") {
  const queryClient = useQueryClient();

  const contactsQuery = useInfiniteQuery({
    queryKey: ['contacts', searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      // The old inline query manually added page & limit & search to the URL.
      // Assuming backend supports page and limit, we must adjust contactsApi to accept them,
      // or we can just fetch the raw URL through apiClient here.
      // Wait, contactsApi.getContacts only takes `paginate: boolean`. 
      // Let's import apiClient directly for this to keep it simple, or we can use contactsApi if we update it.
      // Since we should use apiClient, let's just do that here or update contacts.ts later.
      // For now, let's use the explicit endpoint as it was.
      return apiClient(`/api/contacts?page=${pageParam}&limit=15&search=${searchQuery}`);
    },
    getNextPageParam: (lastPage: any) => {
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
