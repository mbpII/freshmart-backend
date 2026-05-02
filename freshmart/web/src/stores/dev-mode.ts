import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storeApi } from '@/api/stores';
import { INITIAL_STORE_ID } from '@/lib/constants';
import type { Store } from '@/types/product';

type DevModeState = {
  isManager: boolean;
  selectedStoreId: number;
  stores: Store[];
  storesLoading: boolean;
  storesError: string | null;
  setIsManager: (value: boolean) => void;
  setSelectedStoreId: (storeId: number) => void;
  loadStores: () => Promise<void>;
};

export const useDevModeStore = create<DevModeState>()(
  persist(
    (set, get) => ({
      isManager: false,
      selectedStoreId: INITIAL_STORE_ID,
      stores: [],
      storesLoading: false,
      storesError: null,
      setIsManager: (value) => set({ isManager: value }),
      setSelectedStoreId: (selectedStoreId) => set({ selectedStoreId }),
      loadStores: async () => {
        if (get().storesLoading) return;
        set({ storesLoading: true, storesError: null });

        try {
          const stores = await storeApi.getAll();
          const selectedStoreId = stores.some((store) => store.storeId === get().selectedStoreId)
            ? get().selectedStoreId
            : stores[0]?.storeId ?? INITIAL_STORE_ID;

          set({ stores, selectedStoreId, storesLoading: false });
        } catch (error) {
          set({
            storesLoading: false,
            storesError: error instanceof Error ? error.message : 'Unable to load stores',
          });
        }
      },
    }),
    {
      name: 'freshmart.dev.session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        isManager: state.isManager,
        selectedStoreId: state.selectedStoreId,
      }),
    },
  ),
);
