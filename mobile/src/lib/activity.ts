import type { GroupActivityItem } from '../types/group-activity';

type ActivityEntry = { activity: GroupActivityItem; groupId: string };

// Repeated ratings or status changes of the same restaurant by the same person
// collapse into the latest one; other event types are always unique.
function dedupeKey({ activity, groupId }: ActivityEntry): string {
  if (activity.type === 'RESTAURANT_RATED' || activity.type === 'RESTAURANT_STATUS_CHANGED') {
    return [activity.type, activity.actorUserId ?? '', activity.restaurantName ?? '', groupId].join('|');
  }
  return `${groupId}|${activity.id}`;
}

/** Returns entries newest first, keeping only the latest of each repeated event. */
export function dedupeActivity<T extends ActivityEntry>(entries: T[]): T[] {
  const sorted = [...entries].sort((left, right) =>
    new Date(right.activity.createdAt).getTime() - new Date(left.activity.createdAt).getTime());
  const seen = new Set<string>();
  return sorted.filter(entry => {
    const key = dedupeKey(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
