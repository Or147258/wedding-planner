// התחלת גרירה של הזמנה (מוזמן) בין הרשימה לשולחנות
export const startGuestDrag = (e, guestId) => {
  e.dataTransfer.setData('text/plain', guestId);
  e.dataTransfer.effectAllowed = 'move';
};
