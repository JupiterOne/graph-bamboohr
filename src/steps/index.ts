import { accountSteps } from './account';
import { accessSteps } from './access';
import { employeeFilesSteps } from './employee-files';
import { companyFilesSteps } from './company-files';

const integrationSteps = [
  ...accountSteps,
  ...accessSteps,
  ...employeeFilesSteps,
  ...companyFilesSteps,
];

export { integrationSteps };
