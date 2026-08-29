import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  auditEntries as seedAudit,
  honoraria as seedHonoraria,
  matches as seedMatches,
  notifications as seedNotifications,
  permits as seedPermits,
  refereeById,
  refereeName,
  referees as seedReferees,
} from "@/data/mock";
import type { Referee } from "@/data/domain";
import { roleLabels, useAppState } from "@/context/app-state";
import type {
  AuditEntry,
  Honorarium,
  Lifecycle,
  Match,
  MatchEvent,
  MatchOfficialAssignment,
  PermitApplication,
  RequirementItem,
} from "@/data/domain";

/**
 * In-session mock store. Replaces direct array imports so UI actions are
 * reactive. Not a security boundary and not persisted — Lovable Cloud will
 * take over this role later.
 */

export type NotificationItem = (typeof seedNotifications)[number];

type PermitDecision = "APPROVE" | "REJECT" | "REQUEST_INFO";

export interface NewPermitDraft {
  eventName: string;
  permitType: string;
  venueId: string;
  startDate: string;
  endDate: string;
  requirements: RequirementItem[];
}

interface MockStore {
  permits: PermitApplication[];
  matches: Match[];
  honoraria: Honorarium[];
  audit: AuditEntry[];
  allReferees: Referee[];
  notifications: NotificationItem[];
  unreadCount: number;
  permitById: (id: string) => PermitApplication | undefined;
  matchById: (id: string) => Match | undefined;
  createPermit: (draft: NewPermitDraft) => string;
  decidePermit: (id: string, decision: PermitDecision, reason: string) => void;
  assignOfficial: (matchId: string, role: MatchOfficialAssignment["role"], refereeId: string) => void;
  advanceOfficial: (matchId: string, role: MatchOfficialAssignment["role"]) => void;
  clearOfficial: (matchId: string, role: MatchOfficialAssignment["role"]) => void;
  addMatchEvent: (matchId: string, event: Omit<MatchEvent, "id">) => void;
  removeMatchEvent: (matchId: string, eventId: string) => void;
  validateMatchReport: (matchId: string) => void;
  publishMatch: (matchId: string) => void;
  advanceHonorarium: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const MockStoreContext = createContext<MockStore | null>(null);

let seq = 1000;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

const nowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const scoreFromEvents = (events: MatchEvent[]) => ({
  home:
    events.filter((e) => e.type === "GOAL" && e.team === "HOME").length +
    events.filter((e) => e.type === "OWN_GOAL" && e.team === "AWAY").length,
  away:
    events.filter((e) => e.type === "GOAL" && e.team === "AWAY").length +
    events.filter((e) => e.type === "OWN_GOAL" && e.team === "HOME").length,
});

const countBy = (events: MatchEvent[], type: MatchEvent["type"]) => ({
  home: events.filter((e) => e.type === type && e.team === "HOME").length,
  away: events.filter((e) => e.type === type && e.team === "AWAY").length,
});

const recomputeMatch = (match: Match, events: MatchEvent[]): Match => {
  const sorted = [...events].sort((a, b) => a.half - b.half || a.minute - b.minute);
  const score = scoreFromEvents(sorted);
  return {
    ...match,
    events: sorted,
    homeScore: sorted.length ? score.home : match.homeScore,
    awayScore: sorted.length ? score.away : match.awayScore,
    teamFouls: countBy(sorted, "ACCUMULATED_FOUL"),
    timeouts: countBy(sorted, "TIMEOUT"),
  };
};

const officialFlow: Record<string, MatchOfficialAssignment["status"]> = {
  ASSIGNED: "CONFIRMED",
  CONFIRMED: "ATTENDED",
};

const honorariumFlow: Partial<Record<Lifecycle, Lifecycle>> = {
  DRAFT: "SUBMITTED",
  SUBMITTED: "UNDER_REVIEW",
  UNDER_REVIEW: "APPROVED",
  APPROVED: "COMPLETED",
};

export const honorariumNextLabel: Partial<Record<Lifecycle, string>> = {
  DRAFT: "Terbitkan invoice",
  SUBMITTED: "Mulai review",
  UNDER_REVIEW: "Setujui",
  APPROVED: "Tandai dibayar",
};

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const { role, organizationId, actorName } = useAppState();

  const [permits, setPermits] = useState<PermitApplication[]>(() => seedPermits.map((p) => ({ ...p })));
  const [matches, setMatches] = useState<Match[]>(() => seedMatches.map((m) => ({ ...m })));
  const [honoraria, setHonoraria] = useState<Honorarium[]>(() => seedHonoraria.map((h) => ({ ...h })));
  const [audit, setAudit] = useState<AuditEntry[]>(() => seedAudit.map((a) => ({ ...a })));
  const [allReferees, setAllReferees] = useState<Referee[]>(() => seedReferees.map((r) => ({ ...r })));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    seedNotifications.map((n) => ({ ...n })),
  );

  const appendAudit = useCallback(
    (entry: {
      action: string;
      resource: string;
      resourceId: string;
      before?: string | null;
      after?: string | null;
      reason: string;
    }) => {
      setAudit((prev) => [
        {
          id: nextId("AUD"),
          organizationId,
          actor: actorName,
          actorRole: roleLabels[role],
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          before: entry.before ?? null,
          after: entry.after ?? null,
          at: nowStamp(),
          ip: "103.12.44.8",
          reason: entry.reason,
          correlationId: nextId("COR"),
        },
        ...prev,
      ]);
    },
    [actorName, organizationId, role],
  );

  const pushNotification = useCallback((event: string, title: string, body: string) => {
    setNotifications((prev) => [
      { id: nextId("NTF"), event, title, body, at: "Baru saja", unread: true },
      ...prev,
    ]);
  }, []);

  const createPermit = useCallback<MockStore["createPermit"]>(
    (draft) => {
      const id = nextId("PRM");
      const permit: PermitApplication = {
        id,
        organizationId,
        permitNo: null,
        eventName: draft.eventName,
        permitType: draft.permitType,
        venueId: draft.venueId,
        startDate: draft.startDate,
        endDate: draft.endDate,
        status: "SUBMITTED",
        submittedBy: actorName,
        submittedAt: nowStamp(),
        reviewer: null,
        decisionReason: null,
        requirements: draft.requirements,
        timeline: [
          { at: nowStamp(), actor: actorName, action: "PermitCreated", note: "Draft dibuat melalui wizard." },
          { at: nowStamp(), actor: actorName, action: "PermitSubmitted", note: "Diajukan untuk review." },
        ],
      };
      setPermits((prev) => [permit, ...prev]);
      appendAudit({
        action: "PermitSubmitted",
        resource: "PermitApplication",
        resourceId: id,
        before: null,
        after: "SUBMITTED",
        reason: "Pengajuan izin baru oleh pemohon.",
      });
      pushNotification("PermitSubmitted", "Pengajuan izin baru", `${draft.eventName} menunggu review.`);
      toast.success("Pengajuan izin terkirim", { description: draft.eventName });
      return id;
    },
    [actorName, appendAudit, organizationId, pushNotification],
  );

  const decidePermit = useCallback<MockStore["decidePermit"]>(
    (id, decision, reason) => {
      setPermits((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const status: Lifecycle =
            decision === "APPROVE" ? "APPROVED" : decision === "REJECT" ? "REJECTED" : "UNDER_REVIEW";
          const action =
            decision === "APPROVE"
              ? "PermitApproved"
              : decision === "REJECT"
                ? "PermitRejected"
                : "PermitInfoRequested";
          appendAudit({
            action,
            resource: "PermitApplication",
            resourceId: id,
            before: p.status,
            after: status,
            reason,
          });
          pushNotification(action, "Keputusan perizinan", `${p.eventName}: ${status.toLowerCase()}.`);
          return {
            ...p,
            status,
            reviewer: actorName,
            decisionReason: reason,
            permitNo:
              decision === "APPROVE"
                ? (p.permitNo ?? `IZN/${new Date().getFullYear()}/${String(seq + 1).slice(-4)}`)
                : p.permitNo,
            timeline: [
              ...p.timeline,
              { at: nowStamp(), actor: actorName, action, note: reason },
            ],
          };
        }),
      );
      toast.success(
        decision === "APPROVE"
          ? "Izin disetujui & diterbitkan"
          : decision === "REJECT"
            ? "Pengajuan ditolak"
            : "Permintaan informasi tambahan dikirim",
      );
    },
    [actorName, appendAudit, pushNotification],
  );

  const updateMatch = useCallback((matchId: string, fn: (m: Match) => Match) => {
    setMatches((prev) => prev.map((m) => (m.id === matchId ? fn(m) : m)));
  }, []);

  const assignOfficial = useCallback<MockStore["assignOfficial"]>(
    (matchId, role_, refereeId) => {
      updateMatch(matchId, (m) => ({
        ...m,
        officials: m.officials.map((o) =>
          o.role === role_ ? { ...o, refereeId, status: "ASSIGNED" } : o,
        ),
      }));
      setAllReferees((prev) =>
        prev.map((r) =>
          r.id === refereeId
            ? { ...r, assignmentsThisMonth: Math.min(8, r.assignmentsThisMonth + 1) }
            : r,
        ),
      );
      appendAudit({
        action: "RefereeAssigned",
        resource: "Match",
        resourceId: matchId,
        before: "UNASSIGNED",
        after: `${role_}=${refereeId}`,
        reason: "Penugasan dikonfirmasi manual oleh assignor.",
      });
      pushNotification(
        "RefereeAssigned",
        "Wasit ditugaskan",
        `${refereeName(refereeId)} sebagai ${role_.replace(/_/g, " ").toLowerCase()}.`,
      );
      toast.success(`${refereeName(refereeId)} ditugaskan`, {
        description: role_.replace(/_/g, " ").toLowerCase(),
      });
    },
    [appendAudit, pushNotification, updateMatch],
  );

  const advanceOfficial = useCallback<MockStore["advanceOfficial"]>(
    (matchId, role_) => {
      updateMatch(matchId, (m) => ({
        ...m,
        officials: m.officials.map((o) => {
          if (o.role !== role_) return o;
          const next = officialFlow[o.status];
          if (!next) return o;
          appendAudit({
            action: next === "CONFIRMED" ? "AssignmentConfirmed" : "AttendanceRecorded",
            resource: "Match",
            resourceId: matchId,
            before: o.status,
            after: next,
            reason: "Perubahan status penugasan official.",
          });
          return { ...o, status: next };
        }),
      }));
      toast.success("Status penugasan diperbarui");
    },
    [appendAudit, updateMatch],
  );

  const clearOfficial = useCallback<MockStore["clearOfficial"]>(
    (matchId, role_) => {
      const match = matches.find((m) => m.id === matchId);
      const current = match?.officials.find((o) => o.role === role_);
      if (current?.refereeId) {
        setAllReferees((prev) =>
          prev.map((r) =>
            r.id === current.refereeId
              ? { ...r, assignmentsThisMonth: Math.max(0, r.assignmentsThisMonth - 1) }
              : r,
          ),
        );
      }
      updateMatch(matchId, (m) => ({
        ...m,
        officials: m.officials.map((o) =>
          o.role === role_ ? { ...o, refereeId: null, status: "UNASSIGNED" } : o,
        ),
      }));
      appendAudit({
        action: "RefereeUnassigned",
        resource: "Match",
        resourceId: matchId,
        before: role_,
        after: "UNASSIGNED",
        reason: "Penugasan dibatalkan.",
      });
      toast.success("Penugasan dibatalkan");
    },
    [appendAudit, matches, updateMatch],
  );

  const addMatchEvent = useCallback<MockStore["addMatchEvent"]>(
    (matchId, event) => {
      updateMatch(matchId, (m) =>
        recomputeMatch(
          { ...m, status: m.status === "COMPLETED" ? m.status : "ACTIVE" },
          [...m.events, { ...event, id: nextId("EVT") }],
        ),
      );
      appendAudit({
        action: "MatchEventRecorded",
        resource: "Match",
        resourceId: matchId,
        before: null,
        after: `${event.type} ${event.minute}' ${event.team}`,
        reason: "Pencatatan event pertandingan.",
      });
      toast.success(`${event.type.replace(/_/g, " ").toLowerCase()} dicatat`);
    },
    [appendAudit, updateMatch],
  );

  const removeMatchEvent = useCallback<MockStore["removeMatchEvent"]>(
    (matchId, eventId) => {
      updateMatch(matchId, (m) => recomputeMatch(m, m.events.filter((e) => e.id !== eventId)));
      appendAudit({
        action: "MatchEventDeleted",
        resource: "Match",
        resourceId: matchId,
        before: eventId,
        after: null,
        reason: "Koreksi pencatatan event.",
      });
      toast.success("Event dihapus");
    },
    [appendAudit, updateMatch],
  );

  const validateMatchReport = useCallback<MockStore["validateMatchReport"]>(
    (matchId) => {
      updateMatch(matchId, (m) => ({ ...m, reportValidated: true, status: "COMPLETED" }));
      appendAudit({
        action: "MatchReportValidated",
        resource: "Match",
        resourceId: matchId,
        before: "ACTIVE",
        after: "COMPLETED",
        reason: "Laporan pertandingan diverifikasi dan dikunci.",
      });
      pushNotification("MatchReportValidated", "Laporan tervalidasi", `Match ${matchId} dikunci.`);
      toast.success("Laporan tervalidasi dan dikunci");
    },
    [appendAudit, pushNotification, updateMatch],
  );

  const publishMatch = useCallback<MockStore["publishMatch"]>(
    (matchId) => {
      updateMatch(matchId, (m) => ({ ...m, published: true }));
      appendAudit({
        action: "MatchPublished",
        resource: "Match",
        resourceId: matchId,
        before: "internal",
        after: "public read model",
        reason: "Publikasi hasil ke portal publik.",
      });
      toast.success("Hasil dipublikasikan ke portal publik");
    },
    [appendAudit, updateMatch],
  );

  const advanceHonorarium = useCallback<MockStore["advanceHonorarium"]>(
    (id) => {
      setHonoraria((prev) =>
        prev.map((h) => {
          if (h.id !== id) return h;
          const next = honorariumFlow[h.status];
          if (!next) return h;
          appendAudit({
            action: `Honorarium${next === "COMPLETED" ? "Paid" : next === "APPROVED" ? "Approved" : "Updated"}`,
            resource: "Honorarium",
            resourceId: h.invoiceNo,
            before: h.status,
            after: next,
            reason: "Alur invoice honorarium wasit.",
          });
          return {
            ...h,
            status: next,
            approvedBy: next === "APPROVED" || next === "COMPLETED" ? (h.approvedBy ?? actorName) : h.approvedBy,
            paidAt: next === "COMPLETED" ? nowStamp().slice(0, 10) : h.paidAt,
          };
        }),
      );
      toast.success("Status honorarium diperbarui");
    },
    [actorName, appendAudit],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const value = useMemo<MockStore>(
    () => ({
      permits,
      matches,
      honoraria,
      audit,
      allReferees,
      notifications,
      unreadCount: notifications.filter((n) => n.unread).length,
      permitById: (id) => permits.find((p) => p.id === id),
      matchById: (id) => matches.find((m) => m.id === id),
      createPermit,
      decidePermit,
      assignOfficial,
      advanceOfficial,
      clearOfficial,
      addMatchEvent,
      removeMatchEvent,
      validateMatchReport,
      publishMatch,
      advanceHonorarium,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      addMatchEvent,
      advanceHonorarium,
      advanceOfficial,
      allReferees,
      assignOfficial,
      audit,
      clearOfficial,
      createPermit,
      decidePermit,
      honoraria,
      markAllNotificationsRead,
      markNotificationRead,
      matches,
      notifications,
      permits,
      publishMatch,
      removeMatchEvent,
      validateMatchReport,
    ],
  );

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore(): MockStore {
  const ctx = useContext(MockStoreContext);
  if (!ctx) throw new Error("useMockStore must be used inside MockStoreProvider");
  return ctx;
}

/** Eligibility evaluation for referee assignment — mirrors blueprint rules. */
export function evaluateEligibility(refereeId: string, match: Match) {
  const referee = refereeById(refereeId);
  const reasons: string[] = [];
  if (!referee) return { eligible: false, reasons: ["Wasit tidak ditemukan"], score: 0 };
  if (referee.licenseStatus !== "ACTIVE") reasons.push("Lisensi tidak aktif");
  if (referee.conflictOrganizationIds.includes(match.organizationId))
    reasons.push("Conflict of interest dengan penyelenggara");
  if (referee.assignmentsThisMonth >= 8) reasons.push("Beban kerja melebihi 8 penugasan/bulan");
  const day = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(match.kickoff).getDay()] as
    | "MON"
    | "TUE"
    | "WED"
    | "THU"
    | "FRI"
    | "SAT"
    | "SUN";
  if (!referee.availability.includes(day)) reasons.push(`Tidak tersedia pada hari ${day}`);
  if (match.officials.some((o) => o.refereeId === referee.id))
    reasons.push("Sudah ditugaskan di pertandingan ini");

  const gradeScore = { NATIONAL: 30, PROVINCIAL: 24, DISTRICT: 16, CANDIDATE: 8 }[referee.grade];
  const score = Math.max(
    0,
    Math.round(
      gradeScore +
        referee.performanceScore * 0.4 +
        Math.max(0, 20 - referee.distanceKm) -
        referee.assignmentsThisMonth * 2,
    ),
  );

  return { eligible: reasons.length === 0, reasons, score };
}
