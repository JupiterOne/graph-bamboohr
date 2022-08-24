import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../../test/config';
import { setupBambooHRRecording } from '../../test/recording';

import { IntegrationConfig } from '../types';
import { fetchEmployees, fetchUsers } from './access';
import { fetchAccountDetails } from './account';
import { fetchCompanyFiles } from './company-files';
import { fetchEmployeeFiles } from './employee-files';

jest.setTimeout(1000 * 100);

describe('BambooHR', () => {
  let recording: Recording;

  beforeEach(() => {
    recording = setupBambooHRRecording({
      directory: __dirname,
      name: 'recordings',
      options: {
        recordFailedRequests: true,
      },
    });
  });

  afterEach(async () => {
    await recording.stop();
  });

  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    // Simulates dependency graph execution.
    // See https://github.com/JupiterOne/sdk/issues/262.
    await fetchAccountDetails(context);
    await fetchEmployees(context);
    await fetchUsers(context);
    await fetchCompanyFiles(context);
    await fetchEmployeeFiles(context);

    const accounts = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('Account'),
    );
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts).toMatchGraphObjectSchema({
      _class: ['Account'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_account' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          displayName: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
        },
        required: [],
      },
    });

    const employees = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('Record'),
    );
    expect(employees.length).toBeGreaterThan(0);
    expect(employees).toMatchGraphObjectSchema({
      _class: ['Record'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_employee' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          displayName: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          location: {
            type: 'string',
          },
          department: {
            type: 'string',
          },
          supervisor: {
            type: 'string',
          },
          employeeNumber: {
            type: 'string',
          },
          hireDate: {
            type: 'number',
          },
          terminationDate: {
            type: 'number',
          },
        },
        required: [],
      },
    });

    const users = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('User'),
    );
    expect(users.length).toBeGreaterThan(0);
    expect(users).toMatchGraphObjectSchema({
      _class: ['User'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_user' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          employeeId: {
            type: 'string',
          },
          username: {
            type: 'string',
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          displayName: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          lastLogin: {
            type: 'number',
          },
        },
        required: [],
      },
    });

    const companyFiles = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('DataObject'),
    );
    expect(companyFiles.length).toBeGreaterThan(0);
    expect(companyFiles).toMatchGraphObjectSchema({
      _class: ['DataObject'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_file' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          classification: {
            type: 'string',
          },
        },
        required: [],
      },
    });

    const employeeFiles = context.jobState.collectedEntities.filter((e) =>
      e._class.includes('DataObject'),
    );
    expect(employeeFiles.length).toBeGreaterThan(0);
    expect(employeeFiles).toMatchGraphObjectSchema({
      _class: ['DataObject'],
      schema: {
        additionalProperties: true,
        properties: {
          _type: { const: 'bamboohr_file' },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
          id: {
            type: 'string',
          },
          webLink: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          classification: {
            type: 'string',
          },
        },
        required: [],
      },
    });
  });
});
