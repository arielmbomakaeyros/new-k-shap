"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CompanyLayout } from "@/src/components/company/CompanyLayout";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ConfirmModal,
} from "@/src/components/ui/modal";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/src/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageUp, Pencil, Trash2, UserX, Loader2 } from "lucide-react";
import { useTranslation } from "@/node_modules/react-i18next";
import {
  useUsers,
  useDeleteUser,
  useRoles,
  useDepartments,
  useCreateUser,
  useUpdateUser,
  // useUpdateUserAvatar,
} from "@/src/hooks/queries";
import { useUpdateUserAvatar } from "@/src/hooks/queries/useUsers";
import type { User } from "@/src/services";
import { usersService } from "@/src/services";

function CompanyUsersContent() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    title: string;
    message: string;
    details: string[];
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null);
  const [confirmReactivate, setConfirmReactivate] = useState<User | null>(null);
  const [uploadingUserIds, setUploadingUserIds] = useState<
    Record<string, boolean>
  >({});
  const [uploadToasts, setUploadToasts] = useState<
    {
      id: string;
      title: string;
      description?: string;
      variant?: "success" | "error";
    }[]
  >([]);
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    departmentId: "",
  });

  const handleDownloadTemplate = async (format: "csv" | "xlsx") => {
    const blob = await usersService.downloadTemplate(format);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-template-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleImportUsers = async (file: File) => {
    setIsImporting(true);
    try {
      const response = await usersService.bulkImport(file);
      const data = response.data;
      setUploadToasts((prev) => [
        {
          id: `${Date.now()}`,
          title: t("users.importSuccess", {
            defaultValue: "Import completed",
          }),
          description: t("users.importSummary", {
            defaultValue: "{{created}} created, {{failed}} failed",
            created: data.createdCount,
            failed: data.failedCount,
          }),
          variant: data.failedCount > 0 ? "error" : "success",
        },
        ...prev,
      ]);
      if (data.failedCount > 0 && data.errors?.length) {
        setErrorModal({
          title: t("users.importErrors", {
            defaultValue: "Import errors",
          }),
          message: t("users.importErrorsMessage", {
            defaultValue: "Some rows could not be imported.",
          }),
          details: data.errors.map(
            (err) => `Row ${err.row}${err.email ? ` (${err.email})` : ""}: ${err.message}`,
          ),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    } catch (error) {
      const { message, details } = getErrorDetails(
        error,
        t("users.importFailed", { defaultValue: "Failed to import users." }),
      );
      setErrorModal({
        title: t("users.importFailed", { defaultValue: "Import failed" }),
        message,
        details,
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Fetch data from API
  const { data: usersData, isLoading, error } = useUsers();
  const { data: rolesData } = useRoles();
  const { data: departmentsData } = useDepartments();
  const roles = rolesData?.data ?? [];
  const departments = departmentsData?.data ?? [];

  // Mutations
  const deleteMutation = useDeleteUser();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const updateAvatarMutation = useUpdateUserAvatar();

  const getErrorDetails = (error: unknown, fallback: string) => {
    if (error && typeof error === "object") {
      const maybeError = error as {
        message?: string;
        errors?: Record<string, string[]>;
      };
      const details = maybeError.errors
        ? Object.entries(maybeError.errors).map(
            ([field, messages]) => `${field}: ${messages.join(" ")}`,
          )
        : [];
      return {
        message: maybeError.message || fallback,
        details,
      };
    }
    return { message: fallback, details: [] };
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete user:", error);
      const { message, details } = getErrorDetails(
        error,
        t("users.deleteFailed", { defaultValue: "Failed to delete user." }),
      );
      setErrorModal({
        title: t("common.error", { defaultValue: "Error" }),
        message,
        details,
      });
    }
  };

  const handleDeactivateUser = async (user: User) => {
    try {
      await updateMutation.mutateAsync({
        id: user.id || (user as any)._id,
        data: { isActive: false },
      });
    } catch (error) {
      console.error("Failed to deactivate user:", error);
      const { message, details } = getErrorDetails(
        error,
        t("users.deactivateFailed", {
          defaultValue: "Failed to deactivate user.",
        }),
      );
      setErrorModal({
        title: t("common.error", { defaultValue: "Error" }),
        message,
        details,
      });
    }
  };

  const handleReactivateUser = async (user: User) => {
    try {
      await updateMutation.mutateAsync({
        id: user.id || (user as any)._id,
        data: { isActive: true },
      });
    } catch (error) {
      console.error("Failed to reactivate user:", error);
      const { message, details } = getErrorDetails(
        error,
        t("users.reactivateFailed", {
          defaultValue: "Failed to reactivate user.",
        }),
      );
      setErrorModal({
        title: t("common.error", { defaultValue: "Error" }),
        message,
        details,
      });
    }
  };

  const handleAvatarChange = async (
    userId: string | undefined,
    file?: File,
  ) => {
    if (!file || !userId) return;
    setUploadingUserIds((prev) => ({ ...prev, [userId]: true }));
    try {
      await updateAvatarMutation.mutateAsync({ id: userId, file });
      const toastId = Math.random().toString(36).substring(2, 9);
      setUploadToasts((prev) => [
        ...prev,
        {
          id: toastId,
          title: t("users.avatarUpdated", {
            defaultValue: "User photo updated.",
          }),
          variant: "success",
        },
      ]);
      setTimeout(() => {
        setUploadToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      }, 3500);
    } catch (error) {
      console.error("Failed to update avatar:", error);
      const { message, details } = getErrorDetails(
        error,
        t("users.avatarUpdateFailed", {
          defaultValue: "Failed to update user photo.",
        }),
      );
      setErrorModal({
        title: t("common.error", { defaultValue: "Error" }),
        message,
        details,
      });
      const toastId = Math.random().toString(36).substring(2, 9);
      setUploadToasts((prev) => [
        ...prev,
        {
          id: toastId,
          title: t("users.avatarUpdateFailed", {
            defaultValue: "Failed to update user photo.",
          }),
          description: message,
          variant: "error",
        },
      ]);
      setTimeout(() => {
        setUploadToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      }, 5000);
    } finally {
      setUploadingUserIds((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      roleId: "",
      departmentId: "",
    });
    setCreateErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEdit = (user: User) => {
    const systemRole = user.systemRoles?.[0] || "";
    let roleId =
      user.roles?.[0]?.id ||
      user.roles?.[0]?._id ||
      user.roles?.[0]?.name ||
      "";
    if (!roleId && systemRole) {
      const fallbackRole = roles.find(
        (role) => role.systemRoleType === systemRole,
      );
      roleId = fallbackRole?.id || (fallbackRole as any)?._id || "";
    }
    const departmentId =
      user.departments?.[0]?.id ||
      user.departments?.[0]?._id ||
      user.departments?.[0]?.name ||
      "";

    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      roleId: roleId || "",
      departmentId: departmentId || "",
    });
    setShowEditModal(true);
  };

  const openProfileSheet = (user: User) => {
    setProfileUser(user);
  };

  const resolveId = (value: string, list: any[]) => {
    if (!value) return "";
    if (/^[0-9a-fA-F]{24}$/.test(value)) return value;
    const match = list.find(
      (item) =>
        item?.id === value || item?._id === value || item?.name === value,
    );
    return match?.id || match?._id || "";
  };

  const handleCreateUser = async () => {
    try {
      const nextErrors: Record<string, string> = {};
      if (!formData.firstName.trim())
        nextErrors.firstName = "First name is required.";
      if (!formData.lastName.trim())
        nextErrors.lastName = "Last name is required.";
      if (!formData.email.trim()) {
        nextErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        nextErrors.email = "Email must be valid.";
      }
      if (!formData.roleId) nextErrors.roleId = "Role is required.";

      if (Object.keys(nextErrors).length > 0) {
        setCreateErrors(nextErrors);
        return;
      }

      const resolvedRoleId = resolveId(formData.roleId, roles);
      const resolvedDepartmentId = resolveId(
        formData.departmentId,
        departments,
      );
      const selectedRole = roles.find(
        (role) => (role.id || (role as any)._id) === resolvedRoleId,
      );
      const systemRoles =
        selectedRole?.systemRoleType === "company_super_admin"
          ? ["company_super_admin"]
          : [];
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        systemRoles,
        roles: resolvedRoleId ? [resolvedRoleId] : [],
        departments: resolvedDepartmentId ? [resolvedDepartmentId] : [],
      };
      await createMutation.mutateAsync(payload);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error("Failed to create user:", err);
      const { message, details } = getErrorDetails(
        err,
        t("users.createFailed", { defaultValue: "Failed to create user." }),
      );
      setErrorModal({
        title: t("common.error", { defaultValue: "Error" }),
        message,
        details,
      });
    }
  };

  const renderRequiredLabel = (label: string, tooltip: string) => (
    <label
      className="block text-sm font-medium text-foreground"
      title={tooltip}
    >
      {label} <span className="text-destructive">*</span>
    </label>
  );

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const resolvedRoleId = resolveId(formData.roleId, roles);
      const resolvedDepartmentId = resolveId(
        formData.departmentId,
        departments,
      );
      const selectedRole = roles.find(
        (role) => (role.id || (role as any)._id) === resolvedRoleId,
      );
      const systemRoles =
        selectedRole?.systemRoleType === "company_super_admin"
          ? ["company_super_admin"]
          : [];
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        // email: formData.email,
        phone: formData.phone || undefined,
        systemRoles,
        roles: resolvedRoleId ? [resolvedRoleId] : [],
        departments: resolvedDepartmentId ? [resolvedDepartmentId] : [],
      };
      await updateMutation.mutateAsync({
        id: selectedUser._id!,
        data: payload,
      });
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update user:", err);
      const { message, details } = getErrorDetails(
        err,
        t("users.updateFailed", { defaultValue: "Failed to update user." }),
      );
      setErrorModal({
        title: t("common.error", { defaultValue: "Error" }),
        message,
        details,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <CompanyLayout companyName="Company">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">
            {t("users.loading", { defaultValue: "Loading users..." })}
          </span>
        </div>
      </CompanyLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <CompanyLayout companyName="Company">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">
            {t("users.loadFailed", {
              defaultValue: "Failed to load users. Please try again.",
            })}
          </p>
        </div>
      </CompanyLayout>
    );
  }

  const users = usersData?.data ?? [];

  const getUserRole = (user: (typeof users)[0]) => {
    if (user.roles?.length > 0) {
      return user.roles[0];
    }
    const systemRole = user.systemRoles?.[0];
    if (systemRole) {
      return roles.find((role) => role.systemRoleType === systemRole);
    }
    return null;
  };

  const getUserRoleId = (user: (typeof users)[0]) => {
    const role = getUserRole(user);
    return (role as any)?.id || (role as any)?._id || "";
  };

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === "all" ||
      getUserRoleId(user) === filterRole ||
      user.systemRoles?.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  // Get role display name
  const getRoleDisplay = (user: (typeof users)[0]) => {
    const role = getUserRole(user);
    if (role) {
      return (role as any).name || "No role";
    }
    if (user.systemRoles?.length > 0) {
      return user.systemRoles[0].replace(/_/g, " ");
    }
    return "No role";
  };

  // Get department display
  const getDepartmentDisplay = (user: (typeof users)[0]) => {
    if (user.departments && user.departments.length > 0) {
      return user.departments[0].name;
    }
    return "Not assigned";
  };

  return (
    <CompanyLayout
      companyName={t("users.companyTitle", { defaultValue: "Company" })}
    >
      <div className="space-y-8">
        {uploadToasts.length > 0 && (
          <div className="fixed right-6 top-6 z-50 flex w-80 flex-col gap-3">
            {uploadToasts.map((toast) => (
              <div
                key={toast.id}
                className={`rounded-lg border px-4 py-3 shadow-lg ${
                  toast.variant === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-green-200 bg-green-50 text-green-800"
                }`}
              >
                <div className="text-sm font-semibold">{toast.title}</div>
                {toast.description && (
                  <div className="mt-1 text-xs">{toast.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("users.title", { defaultValue: "Users" })}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("users.companySubtitle", {
                defaultValue: "Manage your company users and assign roles",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleDownloadTemplate("csv")}>
              {t("users.downloadTemplateCsv", {
                defaultValue: "Template CSV",
              })}
            </Button>
            <Button variant="outline" onClick={() => handleDownloadTemplate("xlsx")}>
              {t("users.downloadTemplateXlsx", {
                defaultValue: "Template XLSX",
              })}
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImportUsers(file);
                }
                event.currentTarget.value = "";
              }}
            />
            <Button
              variant="outline"
              disabled={isImporting}
              onClick={() => importInputRef.current?.click()}
            >
              {isImporting
                ? t("users.importing", { defaultValue: "Importing..." })
                : t("users.importUsers", { defaultValue: "Import Users" })}
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="btn-3d gradient-bg-primary text-white"
            >
              {t("users.invite", { defaultValue: "+ Invite User" })}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder={t("users.searchPlaceholder", {
              defaultValue: "Search users...",
            })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          >
            <option value="all">
              {t("users.allRoles", { defaultValue: "All Roles" })}
            </option>
            {roles.map((role) => {
              const roleId = role.id || (role as any)._id;
              return (
                <option key={roleId} value={roleId}>
                  {role.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {t("users.showing", {
            defaultValue: "Showing {{count}} of {{total}} users",
            count: filteredUsers.length,
            total: users.length,
          })}
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-12 text-center">
            <p className="text-muted-foreground">
              {t("users.empty", {
                defaultValue: "No users found. Invite your first user.",
              })}
            </p>
          </div>
        )}

        {/* Users Table */}
        {users.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full">
              <thead className="bg-muted/70 sticky top-0 z-10 backdrop-blur">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("users.name", { defaultValue: "Name" })}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("users.email", { defaultValue: "Email" })}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("users.role", { defaultValue: "Role" })}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("users.department", { defaultValue: "Department" })}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("users.statusLabel", { defaultValue: "Status" })}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("users.joined", { defaultValue: "Joined" })}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("common.actions", { defaultValue: "Actions" })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const userId = user.id || (user as any)._id;
                  const uploadInputId = `user-avatar-${userId}`;
                  const isUploadingAvatar = Boolean(uploadingUserIds[userId]);

                  return (
                    <tr
                      key={userId}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="px-5 py-4 text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 overflow-hidden rounded-full border border-border bg-muted shadow-sm">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.firstName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                                {user.firstName?.[0]}
                                {user.lastName?.[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => openProfileSheet(user)}
                              className="text-sm font-semibold text-foreground hover:underline"
                            >
                              {user.firstName} {user.lastName}
                            </button>
                            <div className="text-xs text-muted-foreground">
                              {user.systemRoles?.[0]?.replace(/_/g, " ") || " "}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground/80">
                        {user.email}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary capitalize">
                          {getRoleDisplay(user)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground/80">
                        {getDepartmentDisplay(user)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                          }`}
                        >
                          {user.isActive
                            ? t("users.status.active", {
                                defaultValue: "Active",
                              })
                            : t("users.status.inactive", {
                                defaultValue: "Inactive",
                              })}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label="Upload photo"
                                  asChild
                                >
                                  <label
                                    htmlFor={uploadInputId}
                                    className={`cursor-pointer ${isUploadingAvatar ? "pointer-events-none opacity-60" : ""}`}
                                  >
                                    {isUploadingAvatar ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <ImageUp className="h-4 w-4" />
                                    )}
                                  </label>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("users.uploadPhoto", {
                                  defaultValue: "Upload Photo",
                                })}
                              </TooltipContent>
                            </Tooltip>
                            <input
                              id={uploadInputId}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleAvatarChange(userId, e.target.files?.[0])
                              }
                            />

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => handleOpenEdit(user)}
                                  aria-label="Edit user"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("common.edit", { defaultValue: "Edit" })}
                              </TooltipContent>
                            </Tooltip>

                            {user.isActive ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => setConfirmDeactivate(user)}
                                    disabled={
                                      updateMutation.isPending ||
                                      user.systemRoles?.includes(
                                        "company_super_admin",
                                      )
                                    }
                                    aria-label="Deactivate user"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("users.deactivate", {
                                    defaultValue: "Deactivate",
                                  })}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon-sm"
                                    variant="ghost"
                                    onClick={() => setConfirmReactivate(user)}
                                    disabled={updateMutation.isPending}
                                    aria-label="Reactivate user"
                                  >
                                    <UserX className="h-4 w-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("users.reactivate", {
                                    defaultValue: "Reactivate",
                                  })}
                                </TooltipContent>
                              </Tooltip>
                            )}

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => setConfirmDelete(user)}
                                  disabled={deleteMutation.isPending}
                                  aria-label="Remove user"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t("common.remove", { defaultValue: "Remove" })}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* No results after filter */}
        {users.length > 0 && filteredUsers.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 py-8 text-center">
            <p className="text-muted-foreground">
              {t("users.noMatch", {
                defaultValue: "No users match your search criteria.",
              })}
            </p>
          </div>
        )}

        {showCreateModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="w-full max-w-lg rounded-xl bg-background p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-foreground">
                {t("users.create", { defaultValue: "Create User" })}
              </h2>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {renderRequiredLabel(
                      t("users.firstName", { defaultValue: "First Name" }),
                      "User given name",
                    )}
                    <input
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                      placeholder={t("users.firstName", {
                        defaultValue: "First Name",
                      })}
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                    {createErrors.firstName && (
                      <p className="mt-1 text-xs text-destructive">
                        {createErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    {renderRequiredLabel(
                      t("users.lastName", { defaultValue: "Last Name" }),
                      "User family name",
                    )}
                    <input
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                      placeholder={t("users.lastName", {
                        defaultValue: "Last Name",
                      })}
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                    {createErrors.lastName && (
                      <p className="mt-1 text-xs text-destructive">
                        {createErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  {renderRequiredLabel(
                    t("users.email", { defaultValue: "Email" }),
                    "Unique email address for login and notifications",
                  )}
                  <input
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder={t("users.email", { defaultValue: "Email" })}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {createErrors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {createErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-foreground"
                    title="Optional phone number"
                  >
                    {t("users.phone", { defaultValue: "Phone" })}
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder={t("users.phone", { defaultValue: "Phone" })}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  {renderRequiredLabel(
                    t("users.assignRole", { defaultValue: "Assign Role" }),
                    "Role determines permissions for this user",
                  )}
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.roleId}
                    onChange={(e) =>
                      setFormData({ ...formData, roleId: e.target.value })
                    }
                  >
                    <option value="">
                      {t("users.assignRole", { defaultValue: "Assign Role" })}
                    </option>
                    {roles.map((role) => {
                      const roleId = role.id || (role as any)._id;
                      return (
                        <option key={roleId} value={roleId}>
                          {role.name}
                        </option>
                      );
                    })}
                  </select>
                  {createErrors.roleId && (
                    <p className="mt-1 text-xs text-destructive">
                      {createErrors.roleId}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-foreground"
                    title="Optional department assignment"
                  >
                    {t("users.department", { defaultValue: "Department" })}
                  </label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                  >
                    <option value="">
                      {t("users.department", { defaultValue: "Department" })}
                    </option>
                    {departments.map((dept) => {
                      const deptId = dept.id || dept._id;
                      return (
                        <option key={deptId} value={deptId}>
                          {dept.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  {t("common.cancel", { defaultValue: "Cancel" })}
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending
                    ? t("common.loading", { defaultValue: "Loading..." })
                    : t("users.create", { defaultValue: "Create User" })}
                </Button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowEditModal(false)}
          >
            <div
              className="w-full max-w-lg rounded-xl bg-background p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-foreground">
                {t("users.edit", { defaultValue: "Edit User" })}
              </h2>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder={t("users.firstName", {
                      defaultValue: "First Name",
                    })}
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder={t("users.lastName", {
                      defaultValue: "Last Name",
                    })}
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t("users.email", { defaultValue: "Email" })}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder={t("users.phone", { defaultValue: "Phone" })}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.roleId}
                  onChange={(e) =>
                    setFormData({ ...formData, roleId: e.target.value })
                  }
                >
                  <option value="">
                    {t("users.assignRole", { defaultValue: "Assign Role" })}
                  </option>
                  {roles.map((role) => {
                    const roleId = role.id || (role as any)._id;
                    return (
                      <option key={roleId} value={roleId}>
                        {role.name}
                      </option>
                    );
                  })}
                </select>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                >
                  <option value="">
                    {t("users.department", { defaultValue: "Department" })}
                  </option>
                  {departments.map((dept) => {
                    const deptId = dept.id || dept._id;
                    return (
                      <option key={deptId} value={deptId}>
                        {dept.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  {t("common.cancel", { defaultValue: "Cancel" })}
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? t("common.loading", { defaultValue: "Loading..." })
                    : t("common.saveChanges", { defaultValue: "Save Changes" })}
                </Button>
              </div>
            </div>
          </div>
        )}

        {errorModal && (
          <Modal
            isOpen={!!errorModal}
            onClose={() => setErrorModal(null)}
            size="md"
          >
            <ModalHeader>
              <ModalTitle>{errorModal.title}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-foreground">{errorModal.message}</p>
              {errorModal.details.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {errorModal.details.map((detail, index) => (
                    <li key={`${detail}-${index}`}>{detail}</li>
                  ))}
                </ul>
              )}
            </ModalBody>
            <ModalFooter className="flex justify-end">
              <Button onClick={() => setErrorModal(null)}>
                {t("common.close", { defaultValue: "Close" })}
              </Button>
            </ModalFooter>
          </Modal>
        )}

        <ConfirmModal
          isOpen={!!confirmDeactivate}
          onClose={() => setConfirmDeactivate(null)}
          onConfirm={() =>
            confirmDeactivate && handleDeactivateUser(confirmDeactivate)
          }
          title={t("users.deactivateTitle", {
            defaultValue: "Deactivate User",
          })}
          message={t("users.deactivateConfirm", {
            defaultValue:
              "Are you sure you want to deactivate {{name}}? They will not be able to sign in.",
            name: confirmDeactivate
              ? `${confirmDeactivate.firstName} ${confirmDeactivate.lastName}`
              : "",
          })}
          confirmLabel={t("users.deactivate", { defaultValue: "Deactivate" })}
          cancelLabel={t("common.cancel", { defaultValue: "Cancel" })}
          variant="warning"
          isLoading={updateMutation.isPending}
        />

        <ConfirmModal
          isOpen={!!confirmReactivate}
          onClose={() => setConfirmReactivate(null)}
          onConfirm={() =>
            confirmReactivate && handleReactivateUser(confirmReactivate)
          }
          title={t("users.reactivateTitle", {
            defaultValue: "Reactivate User",
          })}
          message={t("users.reactivateConfirm", {
            defaultValue:
              "Are you sure you want to reactivate {{name}}? They will be able to sign in again.",
            name: confirmReactivate
              ? `${confirmReactivate.firstName} ${confirmReactivate.lastName}`
              : "",
          })}
          confirmLabel={t("users.reactivate", { defaultValue: "Reactivate" })}
          cancelLabel={t("common.cancel", { defaultValue: "Cancel" })}
          variant="success"
          isLoading={updateMutation.isPending}
        />

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() =>
            confirmDelete &&
            handleDeleteUser(confirmDelete.id || (confirmDelete as any)._id)
          }
          title={t("users.deleteTitle", { defaultValue: "Remove User" })}
          message={t("users.confirmRemove", {
            defaultValue:
              "Are you sure you want to remove {{name}}? This action cannot be undone.",
            name: confirmDelete
              ? `${confirmDelete.firstName} ${confirmDelete.lastName}`
              : "",
          })}
          confirmLabel={t("common.remove", { defaultValue: "Remove" })}
          cancelLabel={t("common.cancel", { defaultValue: "Cancel" })}
          variant="danger"
          isLoading={deleteMutation.isPending}
        />

        <Sheet
          isOpen={!!profileUser}
          onClose={() => setProfileUser(null)}
          position="right"
          size="lg"
        >
          <SheetHeader>
            <SheetTitle>
              {t("users.profile", { defaultValue: "User Profile" })}
            </SheetTitle>
            <SheetDescription>
              {profileUser
                ? `${profileUser.firstName} ${profileUser.lastName}`
                : ""}
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            {profileUser && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-muted/40 p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                      {profileUser.avatar ? (
                        <img
                          src={profileUser.avatar}
                          alt={profileUser.firstName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                          {profileUser.firstName?.[0]}
                          {profileUser.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-foreground">
                        {profileUser.firstName} {profileUser.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {profileUser.email}
                      </div>
                      <div className="mt-2 inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium">
                        {getRoleDisplay(profileUser)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("users.statusLabel", { defaultValue: "Status" })}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {profileUser.isActive
                        ? t("users.status.active", { defaultValue: "Active" })
                        : t("users.status.inactive", {
                            defaultValue: "Inactive",
                          })}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("users.department", { defaultValue: "Department" })}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {getDepartmentDisplay(profileUser)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("users.phone", { defaultValue: "Phone" })}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {profileUser.phone || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t("users.joined", { defaultValue: "Joined" })}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {new Date(profileUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </SheetBody>
          <SheetFooter className="flex justify-end gap-2 border-t border-border">
            <Button variant="outline" onClick={() => setProfileUser(null)}>
              {t("common.close", { defaultValue: "Close" })}
            </Button>
          </SheetFooter>
        </Sheet>
      </div>
    </CompanyLayout>
  );
}

export default function CompanyUsersPage() {
  return (
    <ProtectedRoute
      requiredRoles={[
        "kaeyros_super_admin",
        "kaeyros_admin",
        "company_super_admin",
      ]}
    >
      <CompanyUsersContent />
    </ProtectedRoute>
  );
}
