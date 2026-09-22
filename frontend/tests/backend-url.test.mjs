import assert from 'node:assert/strict';
import test from 'node:test';
import { backendUrl } from '../lib/backend-url.ts';

test('authentication uses the internal backend configured at runtime', () => {
  const internal = process.env.BACKEND_INTERNAL_URL;
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    delete process.env.BACKEND_INTERNAL_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    assert.equal(backendUrl('/auth/login'), 'http://localhost:8080/auth/login');
    process.env.NEXT_PUBLIC_API_URL = 'http://public.example/';
    assert.equal(backendUrl('/auth/login'), 'http://public.example/auth/login');
    process.env.BACKEND_INTERNAL_URL = 'http://backend:8080/';
    assert.equal(backendUrl('/auth/login'), 'http://backend:8080/auth/login');
    process.env.BACKEND_INTERNAL_URL = 'http://another-backend:8080';
    assert.equal(backendUrl('auth/logout'), 'http://another-backend:8080/auth/logout');
  } finally {
    if (internal === undefined) delete process.env.BACKEND_INTERNAL_URL;
    else process.env.BACKEND_INTERNAL_URL = internal;
    if (publicUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = publicUrl;
  }
});
