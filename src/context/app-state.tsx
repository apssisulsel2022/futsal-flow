import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { organizations } from "@/data/mock";
import type { RoleKey } from "@/data/domain";

export const roleLabels: Record<RoleKey, string> = {
  association_admin: "Association Admin",
  event_organizer: "Event Organizer",
  referee: "Referee",
  team_manager: "Team Manager",
};

/** Mock identity of the signed-in person per role. Not a security boundary. */
export const roleActor: Record<RoleKey, { name: string; personId: string }> = {
  association_admin: { name: "Andi Rahman", personId: "PSN-001" },
  event_organizer: { name: "Hendra Wijaya", personId: "PSN-008" },
  referee: { name: "Muhammad Faisal", personId: "PSN-002" },
  team_manager: { name: "Dewi Anggraini", personId: "PSN-006" },
};

interface AppState {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
  organizationId: string;
  setOrganizationId: (id: string) => void;
  organizationName: string;
  actorName: string;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleKey>("association_admin");
  const [organizationId, setOrganizationId] = useState<string>("ORG-001");

  const value = useMemo<AppState>(
    () => ({
      role,
      setRole,
      organizationId,
      setOrganizationId,
      organizationName:
        organizations.find((o) => o.id === organizationId)?.shortName ?? organizationId,
      actorName: roleActor[role].name,
    }),
    [role, organizationId],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
