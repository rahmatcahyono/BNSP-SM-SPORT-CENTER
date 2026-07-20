/**
 * Converts Prisma query results into plain JavaScript objects
 * that can safely be passed from Server Components to Client Components.
 *
 * This handles:
 * - Decimal → number
 * - Date → ISO string
 * - BigInt → number
 * - Any other non-serializable objects
 */
export function serializeForClient<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      // Handle BigInt
      if (typeof value === "bigint") {
        return Number(value);
      }
      // Handle Decimal-like objects (Prisma Decimal / decimal.js)
      if (
        value !== null &&
        typeof value === "object" &&
        typeof value.toNumber === "function" &&
        "d" in value &&
        "e" in value &&
        "s" in value
      ) {
        return value.toNumber();
      }
      return value;
    })
  );
}
