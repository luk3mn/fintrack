import type { Connection } from "@/types/domain";

/**
 * Two connections to the same bank are disambiguated by PF/PJ. The worker
 * already derives `personType` from the account tax number.
 */
export function connectionDisplayName(
  connection: Connection,
  duplicated: boolean,
): string | undefined {
  if (!connection.institution) return undefined;

  const suffix =
    duplicated && connection.personType ? ` ${connection.personType}` : "";

  return `${connection.institution}${suffix}`;
}

export function withDisplayNames(connections: Connection[]): Connection[] {
  const counts = new Map<string, number>();

  for (const connection of connections) {
    if (!connection.institution) continue;
    counts.set(
      connection.institution,
      (counts.get(connection.institution) ?? 0) + 1,
    );
  }

  return connections.map((connection) => ({
    ...connection,
    displayName: connectionDisplayName(
      connection,
      Boolean(
        connection.institution &&
          (counts.get(connection.institution) ?? 0) > 1,
      ),
    ),
  }));
}
