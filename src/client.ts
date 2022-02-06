import fetch, { RequestInit, Response } from 'node-fetch';
import url from 'url';

import {
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';

import {
  BAMBOOHR_EMPLOYEE_FIELDS,
  BambooHREmployee,
  BambooHREmployeeReport,
  BambooHRFile,
  BambooHRFilesResponse,
  BambooHRUser,
  IntegrationConfig,
  StatusError,
} from './types';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

export function normalizeClientNamespace(
  userInput: string,
): string | undefined {
  const match = /(?:https?:\/\/)?([^.]+)(?:\.bamboohr\.com)?/.exec(userInput);
  if (match) {
    return match[1];
  }
}

export class APIClient {
  private readonly clientNamespace: string;
  private readonly clientAccessToken: string;

  constructor(readonly config: IntegrationConfig) {
    this.clientNamespace = normalizeClientNamespace(config.clientNamespace)!;
    this.clientAccessToken = config.clientAccessToken;

    if (!this.clientNamespace) {
      throw new Error(
        `Illegal clientNamespace value: ${JSON.stringify(
          config.clientNamespace,
        )}`,
      );
    }
  }

  private withBaseUri(path: string): string {
    return `https://api.bamboohr.com/api/gateway.php/${this.clientNamespace}/${path}`;
  }

  private async request({
    path,
    method = 'GET',
    headers = {},
    search = {},
    body,
  }: {
    path: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    search?: Record<string, string | readonly string[]>;
    body?: RequestInit['body'];
  }): Promise<Response> {
    const requestUrl = new url.URL(this.withBaseUri(path));
    const searchParams = new url.URLSearchParams(search);
    if (requestUrl.search && searchParams.toString()) {
      for (const [key, value] of requestUrl.searchParams.entries()) {
        searchParams.append(key, value);
      }
    }
    requestUrl.search = searchParams.toString();

    const response = await fetch(requestUrl, {
      method,
      headers: {
        ...headers,
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(
          this.clientAccessToken + ':x',
        ).toString('base64')}`,
      },
      body,
    });

    if (!response.ok) {
      throw new IntegrationProviderAPIError({
        endpoint: requestUrl.toString(),
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response;
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      const response = await this.request({
        path: 'v1/employees/0',
      });

      // A 200 is expected when authentication works and the employee exists A
      // 404 is expected when authentication works and the employee does not
      // exist There may be a better endpoint to verify authentication, but this
      // one seems the most lightweight at this time.
      if (response.status !== 200 && response.status !== 404) {
        throw new StatusError({
          message: 'Provider authentication failed',
          statusCode: response.status,
          statusText: response.statusText,
        });
      }
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: `https://api.bamboohr.com/api/gateway.php/${this.clientNamespace}/v1/employees/0`,
        status: err.options ? err.options.statusCode : -1,
        statusText: err.options ? err.options.statusText : '',
      });
    }
  }

  /**
   * Iterates each user resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(
    iteratee: ResourceIteratee<BambooHRUser>,
  ): Promise<void> {
    const usersResponse = await this.request({
      path: 'v1/meta/users',
    });
    const usersObject = await usersResponse.json();
    const users: BambooHRUser[] = Object.values(usersObject);

    for (const user of users) {
      await iteratee(user);
    }
  }

  /**
   * Iterates each employee resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateEmployees(
    iteratee: ResourceIteratee<BambooHREmployee>,
  ): Promise<void> {
    const employeesResponse = await this.request({
      path: 'v1/reports/custom',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      search: {
        format: 'json',
        onlyCurrent: 'false',
      },
      body: JSON.stringify({
        title: 'Employee Report for JupiterOne',
        filters: {},
        fields: BAMBOOHR_EMPLOYEE_FIELDS,
      }),
    });

    const report: BambooHREmployeeReport = await employeesResponse.json();
    for (const employee of report.employees.values()) {
      await iteratee(employee);
    }
  }

  /**
   * Iterates each employee file in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateEmployeeFiles(
    employeeId: string,
    iteratee: ResourceIteratee<BambooHRFile>,
  ): Promise<void> {
    const response = await this.request({
      path: `v1/employees/${employeeId}/files/view`,
    });

    const files: BambooHRFilesResponse = await response.json();
    const categoryFiles = files.categories.reduce(
      (acc, category) => acc.concat(category.files),
      [] as BambooHRFile[],
    );

    for (const file of categoryFiles) {
      await iteratee(file);
    }
  }

  /**
   * Iterates each company file in the provider
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateCompanyFiles(
    iteratee: ResourceIteratee<BambooHRFile>,
  ): Promise<void> {
    const response = await this.request({
      path: `v1/files/view`,
    });

    const files: BambooHRFilesResponse = await response.json();
    const categoryFiles = files.categories.reduce(
      (acc, category) => acc.concat(category.files),
      [] as BambooHRFile[],
    );

    for (const file of categoryFiles) {
      await iteratee(file);
    }
  }
}
