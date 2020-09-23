import { accountSteps } from './account';
import { accessSteps } from './access';
import { companySteps } from './company';
import { employeeFilesSteps } from './employee-files';
import { companyFilesSteps } from './company-files';

const integrationSteps = [
  ...accountSteps,
  ...accessSteps,
  ...companySteps,
  ...employeeFilesSteps,
  ...companyFilesSteps,
];

export { integrationSteps };
