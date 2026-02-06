import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { collectionsService } from '@/services/collections.service';
import { queryKeys } from './keys';
import { Collection, CollectionFilters, collectionsService, CreateCollectionDto, UpdateCollectionDto } from '@/src/services';
import { handleMutationError } from '@/src/lib/mutationError';

/**
 * Hook for fetching collections list with pagination and filters
 */
export function useCollections(filters?: CollectionFilters) {
  return useQuery({
    queryKey: queryKeys.collections.list(filters),
    queryFn: () => collectionsService.findAll(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single collection
 */
export function useCollection(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.collections.detail(id),
    queryFn: async () => {
      const response = await collectionsService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for creating a collection
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollectionDto) => collectionsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.dashboard() });
    },
    onError: (error) => handleMutationError(error, 'Failed to create collection'),
  });
}

/**
 * Hook for updating a collection
 */
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionDto }) =>
      collectionsService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.collections.detail(id),
      });

      const previousCollection = queryClient.getQueryData<Collection>(
        queryKeys.collections.detail(id)
      );

      if (previousCollection) {
        queryClient.setQueryData<Collection>(queryKeys.collections.detail(id), {
          ...previousCollection,
          ...data,
        });
      }

      return { previousCollection };
    },
    onError: (_err, { id }, context) => {
      handleMutationError(_err, 'Failed to update collection');
      if (context?.previousCollection) {
        queryClient.setQueryData(
          queryKeys.collections.detail(id),
          context.previousCollection
        );
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.collections.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.lists() });
    },
  });
}

/**
 * Hook for deleting a collection
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.dashboard() });
    },
    onError: (error) => handleMutationError(error, 'Failed to delete collection'),
  });
}
