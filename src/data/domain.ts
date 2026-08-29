/**
 * Domain types — mirrors the bounded contexts defined in the Master Blueprint.
 * NOTE: this is mock/sample data for the UI shell. No security boundary here.
 */

export type Lifecycle =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RESUBMITTED"
  | "ACTIVE"
  | "COMPLETED"
  | "ARCHIVED";

export type RoleKey =
  | "association_admin"
  | "event_organizer"
  | "referee"
  | "team_manager";

export interface OrganizationRef {
  id: string;
  name: string;
  shortName: string;
  type: "ASSOCIATION" | "CLUB" | "EVENT_ORGANIZER" | "SCHOOL" | "COMMUNITY";
}

export interface Organization extends OrganizationRef {
  parentId: string | null;
  region: string;
  status: Lifecycle;
  memberCount: number;
  teamCount: number;
  createdAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  policies: { code: string; name: string; scope: string; status: string }[];
  memberships: { personId: string; name: string; role: string; since: string }[];
}

export type ProfileKind = "PLAYER" | "COACH" | "REFEREE" | "OFFICIAL";

export interface PersonDocument {
  id: string;
  name: string;
  type: string;
  status: "VERIFIED" | "PENDING" | "REJECTED";
  uploadedAt: string;
  verifiedBy: string | null;
}

export interface Person {
  id: string;
  organizationId: string;
  fullName: string;
  nickname: string;
  birthDate: string;
  gender: "M" | "F";
  city: string;
  phone: string;
  email: string;
  profiles: ProfileKind[];
  identityVerified: boolean;
  status: Lifecycle;
  documents: PersonDocument[];
  qualifications: { name: string; issuer: string; issuedAt: string; expiresAt: string }[];
}

export interface Referee {
  id: string;
  personId: string;
  organizationId: string;
  licenseNo: string;
  grade: "NATIONAL" | "PROVINCIAL" | "DISTRICT" | "CANDIDATE";
  licenseStatus: Lifecycle;
  licenseExpiresAt: string;
  city: string;
  distanceKm: number;
  availability: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[];
  assignmentsThisMonth: number;
  performanceScore: number;
  conflictOrganizationIds: string[];
}

export interface RequirementItem {
  id: string;
  label: string;
  category: "DOCUMENT" | "VENUE" | "OFFICIAL" | "SAFETY";
  fulfilled: boolean;
  note?: string;
}

export interface PermitApplication {
  id: string;
  organizationId: string;
  permitNo: string | null;
  eventName: string;
  permitType: string;
  venueId: string;
  startDate: string;
  endDate: string;
  status: Lifecycle;
  submittedBy: string;
  submittedAt: string;
  reviewer: string | null;
  decisionReason: string | null;
  requirements: RequirementItem[];
  timeline: { at: string; actor: string; action: string; note?: string }[];
}

export interface Venue {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  courts: number;
  surface: string;
  safetyCertified: boolean;
  technicalStandard: string;
}

export interface Competition {
  id: string;
  organizationId: string;
  name: string;
  season: string;
  category: "MEN" | "WOMEN" | "YOUTH" | "COMMUNITY";
  format: "LEAGUE" | "KNOCKOUT" | "GROUP_KNOCKOUT" | "FRIENDLY";
  status: Lifecycle;
  teamCount: number;
  matchCount: number;
  regulationCode: string;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  city: string;
  category: string;
  squadSize: number;
  registrationStatus: Lifecycle;
}

export type MatchEventType =
  | "GOAL"
  | "OWN_GOAL"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION"
  | "TIMEOUT"
  | "ACCUMULATED_FOUL";

export interface MatchEvent {
  id: string;
  minute: number;
  half: 1 | 2;
  type: MatchEventType;
  team: "HOME" | "AWAY";
  personName: string;
  detail?: string;
}

export interface MatchOfficialAssignment {
  role: "REFEREE_1" | "REFEREE_2" | "THIRD_REFEREE" | "TIMEKEEPER" | "COMMISSIONER";
  refereeId: string | null;
  status: "UNASSIGNED" | "ASSIGNED" | "CONFIRMED" | "ATTENDED" | "DECLINED";
}

export interface Match {
  id: string;
  organizationId: string;
  competitionId: string;
  round: string;
  venueId: string;
  kickoff: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: Lifecycle;
  officials: MatchOfficialAssignment[];
  events: MatchEvent[];
  teamFouls: { home: number; away: number };
  timeouts: { home: number; away: number };
  lineup: {
    home: { number: number; name: string; role: string }[];
    away: { number: number; name: string; role: string }[];
  };
  reportValidated: boolean;
  published: boolean;
}

export interface Honorarium {
  id: string;
  organizationId: string;
  refereeId: string;
  matchId: string;
  role: string;
  amount: number;
  status: Lifecycle;
  invoiceNo: string;
  period: string;
  approvedBy: string | null;
  paidAt: string | null;
}

export interface AuditEntry {
  id: string;
  organizationId: string;
  actor: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  before: string | null;
  after: string | null;
  at: string;
  ip: string;
  reason: string;
  correlationId: string;
}

export interface Policy {
  code: string;
  name: string;
  kind: "SYSTEM_RULE" | "ORGANIZATION_POLICY" | "COMPETITION_REGULATION";
  version: string;
  owner: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  summary: string;
}

export interface PermissionRow {
  permission: string;
  resource: string;
  scope: string;
  roles: RoleKey[];
  policy: string;
}
