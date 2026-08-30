import { useState, useMemo } from 'react';
import {
  StaffMember,
  StaffStatus,
  AccessFiltersState,
  InviteStaffFormValues,
  EditStaffFormValues,
  AccessStatsData,
  AccessAuditLog
} from '../types/access.types';
import {
  INITIAL_STAFF_MOCK,
  INITIAL_AUDIT_LOGS_MOCK,
  SUPER_ADMIN_EMAIL
} from '../data/access.mock';


export const useAccess = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF_MOCK);
  const [auditLogs, setAuditLogs] = useState<AccessAuditLog[]>(INITIAL_AUDIT_LOGS_MOCK);

  // Filters State
  const [filters, setFilters] = useState<AccessFiltersState>({
    searchQuery: '',
    role: 'All Roles',
    status: 'All Status',
    department: 'All Departments'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      // Search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchName = s.fullName.toLowerCase().includes(query);
        const matchEmail = s.email.toLowerCase().includes(query);
        const matchRole = s.role.toLowerCase().includes(query);
        const matchDept = s.department.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchRole && !matchDept) return false;
      }

      // Role Filter
      if (filters.role !== 'All Roles' && s.role !== filters.role) {
        return false;
      }

      // Status Filter
      if (filters.status !== 'All Status' && s.status !== filters.status) {
        return false;
      }

      // Department Filter
      if (
        filters.department !== 'All Departments' &&
        s.department !== filters.department
      ) {
        return false;
      }

      return true;
    });
  }, [staffList, filters]);

  // Paginated Staff
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStaff.length / pageSize) || 1;

  // Stats
  const stats: AccessStatsData = useMemo(() => {
    const totalStaff = staffList.length;
    const activeStaff = staffList.filter((s) => s.status === 'Active').length;
    const admins = staffList.filter((s) => s.role === 'Admin' || s.role === 'Super Admin').length;
    const managers = staffList.filter((s) => s.role === 'Manager').length;
    const supportStaff = staffList.filter((s) => s.role === 'Support').length;
    const pendingInvites = staffList.filter((s) => s.status === 'Pending Invitation').length;

    return {
      totalStaff,
      activeStaff,
      admins,
      managers,
      supportStaff,
      pendingInvites
    };
  }, [staffList]);

  // Actions
  const handleInviteStaff = (values: InviteStaffFormValues) => {
    const newStaff: StaffMember = {
      id: `staff-${Date.now().toString().slice(-4)}`,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      avatarBg: 'bg-indigo-600',
      avatarText: values.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      role: values.role,
      department: values.department,
      status: values.sendEmailInvite ? 'Pending Invitation' : 'Active',
      lastLogin: 'Never',
      createdAt: 'Today',
      createdBy: 'Subham Das',
      permissions: values.permissions
    };

    setStaffList((prev) => [newStaff, ...prev]);

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        actorName: 'Subham Das',
        actorEmail: SUPER_ADMIN_EMAIL,
        action: 'User Created',
        targetEmail: values.email,
        details: `Invited new ${values.role} to ${values.department}.`,
        ipAddress: '103.142.152.12',
        status: 'Success'
      },
      ...prev
    ]);

    setIsInviteModalOpen(false);
    showToast(`Invitation sent to ${values.email} successfully!`);
  };

  const handleEditStaff = (values: EditStaffFormValues) => {
    // Permanent Super Admin protection
    if (values.id === 'staff-super-01' || selectedStaff?.email === SUPER_ADMIN_EMAIL) {
      alert('Super Admin settings and permissions are permanent and cannot be modified.');
      return;
    }

    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === values.id) {
          return {
            ...s,
            fullName: values.fullName,
            phone: values.phone,
            role: values.role,
            department: values.department,
            status: values.status,
            permissions: values.permissions
          };
        }
        return s;
      })
    );

    // Audit log
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        actorName: 'Subham Das',
        actorEmail: SUPER_ADMIN_EMAIL,
        action: 'Permission Changed',
        targetEmail: selectedStaff?.email || values.fullName,
        details: `Updated permissions & profile for ${values.fullName} (${values.role}).`,
        ipAddress: '103.142.152.12',
        status: 'Success'
      },
      ...prev
    ]);

    setIsEditModalOpen(false);
    showToast(`Staff member updated successfully!`);
  };

  const handleToggleStatus = (staff: StaffMember) => {
    if (staff.email === SUPER_ADMIN_EMAIL) {
      alert('Super Admin account can never be suspended or modified.');
      return;
    }

    const nextStatus: StaffStatus =
      staff.status === 'Active' ? 'Suspended' : 'Active';

    setStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, status: nextStatus } : s))
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        actorName: 'Subham Das',
        actorEmail: SUPER_ADMIN_EMAIL,
        action: nextStatus === 'Active' ? 'User Activated' : 'User Suspended',
        targetEmail: staff.email,
        details: `Changed account status from ${staff.status} to ${nextStatus}.`,
        ipAddress: '103.142.152.12',
        status: nextStatus === 'Active' ? 'Success' : 'Warning'
      },
      ...prev
    ]);

    showToast(`Status updated to ${nextStatus}.`);
  };

  const handleDeleteStaff = (staff: StaffMember) => {
    if (staff.email === SUPER_ADMIN_EMAIL) {
      alert('Super Admin account can never be deleted.');
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete staff account ${staff.fullName} (${staff.email})?`
      )
    ) {
      setStaffList((prev) => prev.filter((s) => s.id !== staff.id));

      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: 'Just now',
          actorName: 'Subham Das',
          actorEmail: SUPER_ADMIN_EMAIL,
          action: 'User Deleted',
          targetEmail: staff.email,
          details: `Deleted ${staff.role} account ${staff.fullName}.`,
          ipAddress: '103.142.152.12',
          status: 'Warning'
        },
        ...prev
      ]);

      showToast(`Account for ${staff.fullName} deleted.`);
    }
  };

  const handleDuplicatePermissions = (staff: StaffMember) => {
    setSelectedStaff({
      ...staff,
      id: '',
      fullName: `${staff.fullName} (Copy)`,
      email: ''
    });
    setIsInviteModalOpen(true);
    showToast(`Loaded permission template from ${staff.fullName}.`);
  };

  const handleResetPassword = (staff: StaffMember) => {
    if (staff.email === SUPER_ADMIN_EMAIL) {
      alert('Super Admin credentials cannot be reset from this action menu.');
      return;
    }

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        actorName: 'Subham Das',
        actorEmail: SUPER_ADMIN_EMAIL,
        action: 'Password Reset',
        targetEmail: staff.email,
        details: `Triggered temporary password reset link email.`,
        ipAddress: '103.142.152.12',
        status: 'Success'
      },
      ...prev
    ]);

    showToast(`Password reset link sent to ${staff.email}.`);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      role: 'All Roles',
      status: 'All Status',
      department: 'All Departments'
    });
    setCurrentPage(1);
  };

  return {
    staffList,
    filteredStaff,
    paginatedStaff,
    stats,
    auditLogs,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    isInviteModalOpen,
    setIsInviteModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isViewModalOpen,
    setIsViewModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    selectedStaff,
    setSelectedStaff,
    toastMessage,
    handleInviteStaff,
    handleEditStaff,
    handleToggleStatus,
    handleDeleteStaff,
    handleDuplicatePermissions,
    handleResetPassword,
    handleResetFilters
  };
};
