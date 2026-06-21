import type { BlockDefinition } from "../types";

export function defineBlock<TProps extends Record<string, unknown>>(
  definition: BlockDefinition<TProps>,
): BlockDefinition<TProps> {
  return definition;
}
