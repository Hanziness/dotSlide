import * as v from "valibot";

export const PresentationRoles = ["viewer", "presenter", "controller"] as const;
export type PresentationRole = (typeof PresentationRoles)[number];

export const MembershipRoles = ["presenter", "controller"] as const;
export type MembershipRole = (typeof MembershipRoles)[number];

export const PresentationRoleSchema = v.picklist(PresentationRoles);
export const MembershipRoleSchema = v.picklist(MembershipRoles);

export function isMembershipRole(
  role: PresentationRole,
): role is MembershipRole {
  return role !== "viewer";
}

export function toPresentationRole(
  role: MembershipRole | null,
): PresentationRole {
  return role ?? "viewer";
}

export function canPresent(role: PresentationRole): boolean {
  return role === "presenter";
}

export function canControl(role: PresentationRole): boolean {
  return role === "controller";
}
