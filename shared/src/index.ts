import { z } from 'zod';

// Basic building blocks
const NodeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

// The main DiagramSpec schema
export const DiagramSpecSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

// TypeScript types inferred from schemas
export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type DiagramSpec = z.infer<typeof DiagramSpecSchema>;
