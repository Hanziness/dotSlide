import { z } from "zod";

export const PresentationRoles = ["viewer", "presenter", "controller"] as const;
export type PresentationRole = (typeof PresentationRoles)[number];

export const MembershipRoles = ["presenter", "controller"] as const;
export type MembershipRole = (typeof MembershipRoles)[number];

export const PresentationRoleSchema = z.enum(PresentationRoles);
export const MembershipRoleSchema = z.enum(MembershipRoles);

export function isMembershipRole(role: PresentationRole): role is MembershipRole {
  return role !== "viewer";
}

export function toPresentationRole(role: MembershipRole | null): PresentationRole {
  return role ?? "viewer";
}

export function canPresent(role: PresentationRole): boolean {
  return role === "presenter";
}

export function canControl(role: PresentationRole): boolean {
  return role === "controller";
}
