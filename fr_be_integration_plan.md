Frontend-Backend Integration Plan                                                                                                                                    
                                                                                                                                                                      
 Overview                                                                                                                                                             
                                                                                                                                                                      
 Replace hardcoded mock data in frontend pages with real API calls using existing React Query hooks and services.                                                     
                                                                                                                                                                      
 Current State                                                                                                                                                        
                                                                                                                                                                      
 - Backend: Fully implemented NestJS API with MongoDB                                                                                                                 
 - Services: Complete service layer with all CRUD operations                                                                                                          
 - React Query Hooks: Fully implemented with caching and mutations                                                                                                    
 - Frontend Pages: Using useState with hardcoded mock data                                                                                                            
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Files to Create                                                                                                                                                      
                                                                                                                                                                      
 1. frontend/src/hooks/queries/usePermissions.ts (NEW)                                                                                                                
                                                                                                                                                                      
 Create permissions hook following existing patterns:                                                                                                                 
 export function usePermissions(filters?: PermissionFilters) { ... }                                                                                                  
                                                                                                                                                                      
 2. Update frontend/src/hooks/queries/index.ts                                                                                                                        
                                                                                                                                                                      
 Export new permissions hooks                                                                                                                                         
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Files to Modify                                                                                                                                                      
                                                                                                                                                                      
 1. /company/departments/page.tsx                                                                                                                                     
                                                                                                                                                                      
 Current: Hardcoded 3 departments in useState                                                                                                                         
 Changes:                                                                                                                                                             
 - Import: useDepartments, useCreateDepartment, useDeleteDepartment, useUsers                                                                                         
 - Replace useState with useDepartments() query                                                                                                                       
 - Add loading/error states                                                                                                                                           
 - Wire form to useCreateDepartment mutation                                                                                                                          
 - Wire delete button to useDeleteDepartment mutation                                                                                                                 
 - Fetch users for department head dropdown                                                                                                                           
                                                                                                                                                                      
 2. /company/offices/page.tsx                                                                                                                                         
                                                                                                                                                                      
 Current: Hardcoded 2 offices in useState                                                                                                                             
 Changes:                                                                                                                                                             
 - Import: useOffices, useCreateOffice, useDeleteOffice                                                                                                               
 - Replace useState with useOffices() query                                                                                                                           
 - Add loading/error states                                                                                                                                           
 - Wire form to useCreateOffice mutation                                                                                                                              
 - Wire delete button to useDeleteOffice mutation                                                                                                                     
                                                                                                                                                                      
 3. /company/roles/page.tsx                                                                                                                                           
                                                                                                                                                                      
 Current: Hardcoded 3 roles + hardcoded permissions list                                                                                                              
 Changes:                                                                                                                                                             
 - Import: useRoles, useCreateRole, useDeleteRole, usePermissions                                                                                                     
 - Replace useState with useRoles() query                                                                                                                             
 - Replace hardcoded availablePermissions with usePermissions() query                                                                                                 
 - Add loading/error states                                                                                                                                           
 - Wire form to useCreateRole mutation                                                                                                                                
 - Wire delete button to useDeleteRole mutation                                                                                                                       
                                                                                                                                                                      
 4. /company/users/page.tsx                                                                                                                                           
                                                                                                                                                                      
 Current: Hardcoded 3 users in useState                                                                                                                               
 Changes:                                                                                                                                                             
 - Import: useUsers, useCreateUser, useDeleteUser, useRoles, useDepartments                                                                                           
 - Replace useState with useUsers() query                                                                                                                             
 - Fetch roles and departments for dropdowns                                                                                                                          
 - Add loading/error states                                                                                                                                           
 - Wire mutations                                                                                                                                                     
                                                                                                                                                                      
 5. /disbursements/page.tsx                                                                                                                                           
                                                                                                                                                                      
 Current: Hardcoded 2 disbursements array                                                                                                                             
 Changes:                                                                                                                                                             
 - Import: useDisbursements                                                                                                                                           
 - Replace hardcoded array with useDisbursements() query                                                                                                              
 - Connect filter state to query params                                                                                                                               
 - Add loading/error states                                                                                                                                           
 - Add pagination                                                                                                                                                     
                                                                                                                                                                      
 6. /collections/page.tsx                                                                                                                                             
                                                                                                                                                                      
 Current: Hardcoded 3 collections array + hardcoded stats                                                                                                             
 Changes:                                                                                                                                                             
 - Import: useCollections                                                                                                                                             
 - Replace hardcoded array with useCollections() query                                                                                                                
 - Connect filter state to query params                                                                                                                               
 - Calculate stats from real data                                                                                                                                     
 - Add loading/error states                                                                                                                                           
 - Add pagination                                                                                                                                                     
                                                                                                                                                                      
 7. /admin/companies/page.tsx                                                                                                                                         
                                                                                                                                                                      
 Current: Hardcoded 3 companies in useState                                                                                                                           
 Changes:                                                                                                                                                             
 - Import: useCompanies, useCreateCompany, useDeleteCompany, useUpdateCompany                                                                                         
 - Replace useState with useCompanies() query                                                                                                                         
 - Add loading/error states                                                                                                                                           
 - Wire mutations                                                                                                                                                     
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Implementation Pattern                                                                                                                                               
                                                                                                                                                                      
 // Imports                                                                                                                                                           
 import { useXxx, useCreateXxx, useDeleteXxx } from '@/src/hooks/queries';                                                                                            
                                                                                                                                                                      
 function PageContent() {                                                                                                                                             
   // Queries                                                                                                                                                         
   const { data, isLoading, error } = useItems();                                                                                                                     
                                                                                                                                                                      
   // Mutations                                                                                                                                                       
   const createMutation = useCreateItem();                                                                                                                            
   const deleteMutation = useDeleteItem();                                                                                                                            
                                                                                                                                                                      
   // Form state (keep for form inputs, not for data)                                                                                                                 
   const [formData, setFormData] = useState({ name: '' });                                                                                                            
   const [showForm, setShowForm] = useState(false);                                                                                                                   
                                                                                                                                                                      
   // Handlers                                                                                                                                                        
   const handleCreate = async () => {                                                                                                                                 
     try {                                                                                                                                                            
       await createMutation.mutateAsync(formData);                                                                                                                    
       setFormData({ name: '' });                                                                                                                                     
       setShowForm(false);                                                                                                                                            
     } catch (error) {                                                                                                                                                
       console.error('Failed to create:', error);                                                                                                                     
     }                                                                                                                                                                
   };                                                                                                                                                                 
                                                                                                                                                                      
   const handleDelete = async (id: string) => {                                                                                                                       
     try {                                                                                                                                                            
       await deleteMutation.mutateAsync(id);                                                                                                                          
     } catch (error) {                                                                                                                                                
       console.error('Failed to delete:', error);                                                                                                                     
     }                                                                                                                                                                
   };                                                                                                                                                                 
                                                                                                                                                                      
   // Loading state                                                                                                                                                   
   if (isLoading) {                                                                                                                                                   
     return <div className="flex justify-center p-8">Loading...</div>;                                                                                                
   }                                                                                                                                                                  
                                                                                                                                                                      
   // Error state                                                                                                                                                     
   if (error) {                                                                                                                                                       
     return <div className="text-red-500 p-8">Error loading data</div>;                                                                                               
   }                                                                                                                                                                  
                                                                                                                                                                      
   const items = data?.data ?? [];                                                                                                                                    
                                                                                                                                                                      
   return (/* JSX */);                                                                                                                                                
 }                                                                                                                                                                    
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Order of Implementation                                                                                                                                              
                                                                                                                                                                      
 1. Create usePermissions hook - Required for roles page                                                                                                              
 2. Departments page - Simple, good starting point                                                                                                                    
 3. Offices page - Similar pattern                                                                                                                                    
 4. Roles page - Requires permissions hook                                                                                                                            
 5. Company Users page - Requires roles/departments                                                                                                                   
 6. Disbursements page - Core business                                                                                                                                
 7. Collections page - Core business                                                                                                                                  
 8. Admin Companies page - Admin feature                                                                                                                              
                                                                                                                                                                      
 ---                                                                                                                                                                  
 Verification Plan                                                                                                                                                    
                                                                                                                                                                      
 1. Start servers:                                                                                                                                                    
 cd backend && npm run start:dev                                                                                                                                      
 cd frontend && npm run dev                                                                                                                                           
 2. Test each page:                                                                                                                                                   
   - Navigate to page                                                                                                                                                 
   - Verify data loads (check Network tab)                                                                                                                            
   - Test create operation                                                                                                                                            
   - Test delete operation                                                                                                                                            
   - Verify loading states                                                                                                                                            
   - Verify error handling                                                                                                                                            
 3. Check console for any errors or warnings