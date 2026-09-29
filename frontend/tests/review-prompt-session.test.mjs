import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewPromptSession } from '../lib/review-prompt-session.ts';

test('dismissed prompts stay suppressed on reload, but return in a new session or login', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value) };
  const session = reviewPromptSession(storage);
  assert.equal(session.has('login-a'), false);
  session.mark('login-a');
  assert.equal(reviewPromptSession(storage).has('login-a'), true);
  assert.equal(session.has('login-b'), false);
  values.clear();
  assert.equal(reviewPromptSession(storage).has('login-a'), false);
});

test('blocked browser storage still suppresses repeated prompts during navigation', () => {
  const session = reviewPromptSession({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});
  assert.equal(session.has('a'), false);
  session.mark('a');
  assert.equal(session.has('a'), true);
});
