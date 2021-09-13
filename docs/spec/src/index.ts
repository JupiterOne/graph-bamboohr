import { IntegrationConfig } from '../../../src/types';
import { accountSpec } from './account';
import { accessSpec } from './access';
import { companyFilesSpec } from './company-files';
import { employeeFilesSpec } from './employee-files';
import { IntegrationSpecConfig } from './types';

export const invocationConfig: IntegrationSpecConfig<IntegrationConfig> = {
  integrationSteps: [
    ...accountSpec,
    ...accessSpec,
    ...companyFilesSpec,
    ...employeeFilesSpec,
  ],
};
