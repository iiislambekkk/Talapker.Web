import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProspectStore {
    selectedInstitutionId: string | null;
    setSelectedInstitutionId: (id: string | null) => void;
}

export const useProspectStore = create<ProspectStore>()(
    persist(
        (set) => ({
            selectedInstitutionId: null,
            setSelectedInstitutionId: (id) => set({ selectedInstitutionId: id }),
        }),
        { name: "prospect-store" }
    )
);