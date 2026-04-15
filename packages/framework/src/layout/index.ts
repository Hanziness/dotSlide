import { z } from "astro/zod";

export const AlignmentSchema = z.enum(['start', 'center', 'end', 'space-around', 'space-between', 'space-evenly', 'stretch'])