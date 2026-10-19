import { SIDES } from './constants';
import { sumBy } from './helpers';

// מחשב את נתוני הדשבורד של דף המוזמנים (משמש גם את הדשבורד וגם את גיליון הסיכום בייצוא)
export function computeGuestStats(guests, categories) {
  const slice = (list) => ({
    total: sumBy(list, (g) => g.count),
    confirmed: sumBy(
      list.filter((g) => g.rsvp === 'confirmed'),
      (g) => g.count
    ),
  });

  const bySide = Object.entries(SIDES).map(([key, side]) => ({
    key,
    label: side.label,
    ...slice(guests.filter((g) => g.side === key)),
  }));

  const categoryNames = [
    ...new Set([...categories, ...guests.map((g) => g.category).filter(Boolean)]),
  ];
  const byCategory = categoryNames.map((name) => ({
    name,
    ...slice(guests.filter((g) => g.category === name)),
  }));

  return {
    invitations: guests.length,
    total: sumBy(guests, (g) => g.count),
    confirmed: sumBy(
      guests.filter((g) => g.rsvp === 'confirmed'),
      (g) => g.count
    ),
    undecided: sumBy(
      guests.filter((g) => g.rsvp === 'pending' || g.rsvp === 'maybe'),
      (g) => g.count
    ),
    declined: sumBy(
      guests.filter((g) => g.rsvp === 'declined'),
      (g) => g.count
    ),
    bySide,
    byCategory,
  };
}
