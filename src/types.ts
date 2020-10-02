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

export type BambooHREmployeeDetails = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  gender: string;
  jobTitle: string;
  workPhone: string;
  mobilePhone: string;
  workEmail: string;
  department: string;
  location: string;
  division: string;
  linkedIn: string;
  workPhoneExtension: string;
  photoUploaded: boolean;
  photoUrl: string;
  canUploadPhoto: number;
};

export type BambooHREmployeesMap = {
  [id: string]: BambooHREmployeeDetails;
};

export type BambooHRUser = {
  id: number;
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  status: 'enabled' | string;
  lastLogin: string;
  uri: string;
  employeeDetails: Partial<BambooHREmployeeDetails>;
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
