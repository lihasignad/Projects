import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthResponse, AuthUser, AuthRole } from '@/shared/types/auth';

export interface SelectedInstitute {
  id: string;
  name: string;
  code: string;
  location: string;
  state: string;
}

interface AuthState {
  user: AuthUser | null;
  roles: AuthRole[];
  permissions: string[];
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  activeTenantId: string | null;
  selectedInstitute: SelectedInstitute | null;
  setAuth: (payload: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setActiveTenant: (tenantId: string | null) => void;
  setSelectedInstitute: (institute: SelectedInstitute | null) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roles: [],
      permissions: [],
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      activeTenantId: null,
      selectedInstitute: {
        id: 'demo-univ',
        name: 'Demo University',
        code: 'DEMO-UNIV',
        location: 'Demo Campus',
        state: 'Demo State',
      },
      setAuth: (payload) =>
        set({
          user: payload.user,
          roles: payload.roles,
          permissions: payload.permissions,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          isAuthenticated: true,
          activeTenantId: payload.user.instituteId,
        }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      setActiveTenant: (tenantId) => set({ activeTenantId: tenantId }),
      setSelectedInstitute: (institute) =>
        set({
          selectedInstitute: institute,
          activeTenantId: institute ? institute.id : null,
        }),
      logout: () =>
        set({
          user: null,
          roles: [],
          permissions: [],
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          activeTenantId: null,
        }),
      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes('*') || permissions.includes(permission);
      },
    }),
    {
      name: 'demo-univ-auth-storage-v2',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.selectedInstitute?.name?.includes('Medhavi')) {
          state.selectedInstitute = {
            id: 'demo-univ',
            name: 'Demo University',
            code: 'DEMO-UNIV',
            location: 'Demo Campus',
            state: 'Demo State',
          };
        }
      },
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        permissions: state.permissions,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        activeTenantId: state.activeTenantId,
        selectedInstitute: state.selectedInstitute,
      }),
    }
  )
);
