import fetch, { RequestInit, Response } from 'node-fetch';
import url from 'url';

import {
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
  IntegrationLogger,
} from '@jupiterone/integration-sdk-core';

import {
  BAMBOOHR_EMPLOYEE_FIELDS,
  BambooHREmployee,
  BambooHREmployeeReport,
  BambooHRFile,
  BambooHRFilesResponse,
  BambooHRUser,
  IntegrationConfig,
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

const MAX_RATE_LIMIT_WAIT = 3600;
const DEFAULT_RATE_LIMIT_WAIT = 10;

export class APIClient {
  private readonly clientNamespace: string;
  private readonly clientAccessToken: string;

  logger: IntegrationLogger;

  constructor(readonly config: IntegrationConfig, logger: IntegrationLogger) {
    this.clientNamespace = normalizeClientNamespace(config.clientNamespace)!;
    this.clientAccessToken = config.clientAccessToken;
    this.logger = logger;

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

  /**
   * Make a request to the BambooHR API.
   *
   * @throws IntegrationProviderAPIError when status is not OK.
   */
  private async request({
    path,
    method = 'GET',
    headers = {},
    search = {},
    body,
    attemptCounter = 1,
  }: {
    path: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    search?: Record<string, string | readonly string[]>;
    body?: RequestInit['body'];
    attemptCounter?: number;
  }): Promise<Response> {
    if (attemptCounter > 10) {
      throw new Error('Max API request attempts reached.');
    }
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

    if(response.status === 503) {
      await this.handleRateLimitAwait(response.headers.get('Retry-After'), attemptCounter);
      return this.request({path, method, headers, search, body, attemptCounter: attemptCounter + 1});
    }

    if (!response.ok) {
      throw new IntegrationProviderAPIError({
        endpoint: requestUrl.toString(),
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response;
  }

  // Lightweight sleep function for rate limit errors.
  private async sleepBeforeRetry(secondsToSleep: number) {
    const retryAfterMs = secondsToSleep * 1000;
    await new Promise((resolve) => setTimeout(resolve, retryAfterMs));
  }

  /**
   * According to BambooHR documentation, a 429 error is a limit exceeded
   * regarding adding employees.  A 503 is a "currently unavailable" 
   * error that is most commonly due to rate limiting.  It may contain
   * a 'Retry-After' value in the header specifying how long to wait.
   * Unfortunately, we don't have documenation or examples for this, and
   * the HTTP spec states ths can either be a second value or an HTTP-date.
   * For now, we're checking if the value is a number and attempting to 
   * handle either option with a max upper limit for how long we'll wait
   * to avoid worst case scenarios for failed parsing.
   * https://documentation.bamboohr.com/docs/api-details
   */
  async handleRateLimitAwait(retryAfterValue: any, attemptCount: number) {
    let secondsToAwait = DEFAULT_RATE_LIMIT_WAIT * attemptCount;
    if(retryAfterValue) {
      this.logger.info(`Received a 503 response with a Retry-After value of `, retryAfterValue);
      // If we're smaller than the current date, we've gotten a number of seconds to wait
      // instead of a datetime.
      if (retryAfterValue < Date.now()) {
        secondsToAwait = Math.min(MAX_RATE_LIMIT_WAIT, retryAfterValue);
      }
      else {
        const currentDateTime = new Date(Date.now());
        const retryAfterDateTime = new Date(retryAfterValue);
        secondsToAwait = Math.min(MAX_RATE_LIMIT_WAIT, (retryAfterDateTime.getTime() - currentDateTime.getTime()) / 1000);
      }
    }
    else {
      this.logger.info(`Received a 503 response with no specified Retry-After.`);
    }
    this.logger.info(`Pausing for ${secondsToAwait} seconds`);
    await this.sleepBeforeRetry(secondsToAwait);
  }

  /**
   * Verify credentials authenticate with the provider API.
   *
   * Uses `v1/employees/0`, an endpoint that is expected to be cheap to call
   * which also requires authentication.
   *
   * - A `200` response is expected when authentication works and the employee
   *   exists.
   * - A `404` response is expected when authentication works and the employee
   *   does not exist.
   *
   * @throws IntegrationProviderAuthenticationError
   */
  public async verifyAuthentication(employeeId: number = 0): Promise<void> {
    try {
      await this.request({
        path: `v1/employees/${employeeId}`,
      });
    } catch (err) {
      if (err.status !== 404) {
        throw new IntegrationProviderAuthenticationError({
          cause: err,
          endpoint: err.endpoint,
          status: err.status,
          statusText: err.statusText,
        });
      }
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
    try {
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
    } catch (err) {
      // if no files are found for the employee the endpoint will return 404.
      // https://documentation.bamboohr.com/reference/list-employee-files-1
      if (err.status !== 404) {
        throw err;
      }
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
