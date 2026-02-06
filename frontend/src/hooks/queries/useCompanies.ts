import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { companiesService, CompanyFilters } from '@/services/companies.service';
import { queryKeys } from './keys';
import { companiesService, CompanyFilters } from '@/src/services/companies.service';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '@/src/services';
import { handleMutationError } from '@/src/lib/mutationError';
// import type { CreateCompanyDto, UpdateCompanyDto, Company } from '@/services/types';

/**
 * Hook for fetching companies list
 */
export function useCompanies(filters?: CompanyFilters) {
  return useQuery({
    queryKey: queryKeys.companies.list(filters),
    queryFn: () => companiesService.findAll(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for fetching a single company
 */
export function useCompany(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.companies.detail(id),
    queryFn: async () => {
      const response = await companiesService.findById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for creating a company
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyDto) => companiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to create company'),
  });
}

/**
 * Hook for updating a company
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyDto }) =>
      companiesService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.companies.detail(id) });
      const previousCompany = queryClient.getQueryData<Company>(
        queryKeys.companies.detail(id)
      );
      if (previousCompany) {
        queryClient.setQueryData<Company>(queryKeys.companies.detail(id), {
          ...previousCompany,
          ...data,
        });
      }
      return { previousCompany };
    },
    onError: (_err, { id }, context) => {
      handleMutationError(_err, 'Failed to update company');
      if (context?.previousCompany) {
        queryClient.setQueryData(queryKeys.companies.detail(id), context.previousCompany);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() });
    },
  });
}

/**
 * Hook for deleting a company
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() });
    },
    onError: (error) => handleMutationError(error, 'Failed to delete company'),
  });
}
