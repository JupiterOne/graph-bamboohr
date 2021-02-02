import { normalizeClientNamespace } from './client';

describe('normalizeClientNamespace', () => {
  test.each;
  test.each([
    ['jupiteronetest', 'jupiteronetest'],
    ['https://jupiteronetest.bamboohr.com', 'jupiteronetest'],
    ['jupiteronetest.bamboohr.com', 'jupiteronetest'],
  ])('%s', (userIntput, expectedNamespace) => {
    expect(normalizeClientNamespace(userIntput)).toEqual(expectedNamespace);
  });
});
