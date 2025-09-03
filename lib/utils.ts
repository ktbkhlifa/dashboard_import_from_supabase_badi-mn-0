// lib/utils.ts

export const formatDate = (date: Date): string => {
  // Kan't2akdou blli la date valida qbel ma nkhdemou biha
  if (isNaN(date.getTime())) {
    return ''; 
  }
  return date.toISOString().split('T')[0];
};

export const formatLongDate = (date: Date): string => {
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};