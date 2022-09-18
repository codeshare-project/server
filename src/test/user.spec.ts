import { test, expect } from 'vitest';
import { build } from '../Util/Build';

test('Create a new user', async () => {
  const app = build();

  const res = await app.inject({
    method: 'POST',
    url: '/register'
  });

  expect(res.statusCode).toBe(201);
});
