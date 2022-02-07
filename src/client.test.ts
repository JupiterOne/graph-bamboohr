import { Recording } from '@jupiterone/integration-sdk-testing';

import { integrationConfig } from '../test/config';
import { setupBambooHRRecording } from '../test/recording';
import { APIClient, normalizeClientNamespace } from './client';
import {
  BAMBOOHR_EMPLOYEE_FIELDS,
  BambooHREmployee,
  BambooHRUser,
} from './types';

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

describe('client APIs', () => {
  let recording: Recording | undefined;

  afterEach(async () => {
    if (recording) await recording.stop();
  });

  test('iterateEmployees', async () => {
    recording = setupBambooHRRecording({
      directory: __dirname,
      name: 'iterateEmployees',
    });

    const client = new APIClient(integrationConfig);

    const employees: BambooHREmployee[] = [];
    await client.iterateEmployees((employee) => {
      employees.push(employee);
    });

    expect(employees.length).toBeGreaterThan(0);
    expect(Array(...Object.keys(employees[0])).sort()).toEqual(
      ['id', ...BAMBOOHR_EMPLOYEE_FIELDS].sort(),
    );
  });

  test('iterateUsers', async () => {
    recording = setupBambooHRRecording({
      directory: __dirname,
      name: 'iterateUsers',
    });

    const client = new APIClient(integrationConfig);

    const users: BambooHRUser[] = [];
    await client.iterateUsers((user) => {
      users.push(user);
    });

    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toEqual(
      expect.objectContaining({
        email: expect.any(String),
        employeeId: expect.any(Number),
        firstName: expect.any(String),
        id: expect.any(Number),
        lastLogin: expect.any(String),
        lastName: expect.any(String),
        status: expect.any(String),
      }),
    );
  });
});
