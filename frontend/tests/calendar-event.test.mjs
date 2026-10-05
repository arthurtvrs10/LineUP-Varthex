import assert from 'node:assert/strict';
import test from 'node:test';
import { googleCalendarUrl, calendarPromptSeen, markCalendarPrompt } from '../lib/calendar-event.ts';

test('calendar link preserves Brazil wall time, cross-day duration and encoded text', () => {
  const url = new URL(googleCalendarUrl({
    title: 'Corte & barba + hidratação',
    startAt: '2026-10-04T23:45:00', endAt: '2026-10-05T00:30:00',
    description: 'Barbearia\nCliente: José',
  }));
  assert.equal(url.origin, 'https://calendar.google.com');
  assert.equal(url.searchParams.get('dates'), '20261004T234500/20261005T003000');
  assert.equal(url.searchParams.get('ctz'), 'America/Sao_Paulo');
  assert.equal(url.searchParams.get('text'), 'Corte & barba + hidratação');
  assert.equal(url.searchParams.get('details'), 'Barbearia\nCliente: José');
});

test('local timestamps support omitted seconds; ambiguous offset timestamps are rejected', () => {
  const event = { title: 'Corte', startAt: '2026-10-04T10:00', endAt: '2026-10-04T10:30:00.000' };
  assert.equal(new URL(googleCalendarUrl(event)).searchParams.get('dates'), '20261004T100000/20261004T103000');
  assert.throws(() => googleCalendarUrl({ ...event, startAt: '2026-10-04T10:00:00Z' }));
});

test('reminders distinguish customer accounts and offer rescheduled appointments again without storage', () => {
  const appointment = { id: 'booking-a', startAt: '2026-10-04T10:00:00' };
  assert.equal(calendarPromptSeen('client-a', appointment), false);
  markCalendarPrompt('client-a', appointment);
  assert.equal(calendarPromptSeen('client-a', appointment), true);
  assert.equal(calendarPromptSeen('client-b', appointment), false);
  assert.equal(calendarPromptSeen('client-a', { ...appointment, startAt: '2026-10-05T10:00:00' }), false);
});
