import { IntegrationInstanceConfig } from '@jupiterone/integration-sdk-core';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * The provider API client ID used to authenticate requests.
   */
  clientNamespace: string;

  /**
   * The provider API client secret used to authenticate requests.
   */
  clientAccessToken: string;
}

export class StatusError extends Error {
  constructor(
    readonly options: {
      statusCode: number;
      statusText: string;
      message?: string;
    },
  ) {
    super(options.message);
    this.name = 'StatusError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const BAMBOOHR_EMPLOYEE_FIELDS = [
  'displayName',
  'firstName',
  'lastName',
  'preferredName',
  'gender',
  'jobTitle',
  'workPhone',
  'mobilePhone',
  'workEmail',
  'department',
  'location',
  'division',
  'linkedIn',
  'instagram',
  'pronouns',
  'workPhoneExtension',
  'supervisor',
  'photoUploaded',
  'photoUrl',
  'status',
  'employmentHistoryStatus',
  'terminationDate',
  'hireDate',
] as const;

type BambooHREmployeeFetchedFields = {
  [K in Exclude<
    typeof BAMBOOHR_EMPLOYEE_FIELDS[number],
    'photoUploaded' | 'status'
  >]: string | undefined;
};

export type BambooHREmployee = BambooHREmployeeFetchedFields & {
  id: string;
  photoUploaded: boolean;
  status: 'Active' | 'Inactive' | string;
};

export type BambooHREmployeeReport = {
  title: string;
  fields: { id: string; type: string; name: string }[];
  employees: BambooHREmployee[];
};

export type BambooHRUser = {
  /**
   * The user
   */
  id: number;

  /**
   * The "employeeId" attribute will only be set if the user record is linked to
   * an employee record.
   */
  employeeId?: number;

  firstName: string;
  lastName: string;
  email: string;
  status: 'enabled' | string;

  /**
   * The last login date/time is formatted according to ISO 8601.
   */
  lastLogin: string;

  uri: string;
};

export type BambooHRFile = {
  id: number;
  name: string;
  originalFilename: string;
  size: number;
  dateCreated: string;
  createdBy: string;
};

export type BambooHRFileCategory = {
  id: number;
  name: string;
  files: BambooHRFile[];
};

export type BambooHRFilesResponse = {
  employee?: {
    id: number;
  };
  categories: BambooHRFileCategory[];
};
