import { MEALS, SIDES } from './constants';
import { sumBy } from './helpers';

const MEAL_KEYS = Object.keys(MEALS);

// כמה מנות מכל סוג יש בהזמנה אחת. מנה רגילה = כמות מוזמנים פחות המנות המיוחדות.
export function mealsOf(guest) {
  const result = {};
  MEAL_KEYS.forEach((key) => {
    result[key] = Number(guest.meals?.[key]) || 0;
  });
  const special = sumBy(MEAL_KEYS, (key) => result[key]);
  return { regular: Math.max(0, (Number(guest.count) || 0) - special), ...result };
}

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

  const confirmedGuests = guests.filter((g) => g.rsvp === 'confirmed');
  const meals = [
    { key: 'regular', label: 'מנה רגילה' },
    ...MEAL_KEYS.map((key) => ({ key, label: MEALS[key].label })),
  ].map((m) => ({
    ...m,
    total: sumBy(guests, (g) => mealsOf(g)[m.key]),
    confirmed: sumBy(confirmedGuests, (g) => mealsOf(g)[m.key]),
  }));

  return {
    invitations: guests.length,
    total: sumBy(guests, (g) => g.count),
    confirmed: sumBy(confirmedGuests, (g) => g.count),
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
    meals,
  };
}
