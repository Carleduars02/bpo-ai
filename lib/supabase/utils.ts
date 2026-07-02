/**
 * Supabase returns embedded relations as an object for to-one joins but as
 * an array in some query shapes (e.g. when the FK isn't marked unique).
 * Normalizes both shapes to a single object or null.
 */
export function getOne<T>(relation: T | T[] | null | undefined): T | null {
  return Array.isArray(relation) ? relation[0] ?? null : relation ?? null
}
