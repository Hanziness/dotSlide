import { createAccessControl } from "better-auth/plugins/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = { 
    presentation: ["control", "ask"], 
} as const; 

export const ac = createAccessControl(statement);

export const viewer = ac.newRole({ presentation: ["ask"] })
export const presenter = ac.newRole({ presentation: ["control"] })