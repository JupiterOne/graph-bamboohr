import { IntegrationConfig } from '../../../../src/types';
import { StepSpec } from '../types';

export const accountSpec: StepSpec<IntegrationConfig>[] = [
  {
    id: 'fetch-account',
    name: 'Fetch Account Details',
    entities: [
      {
        resourceName: 'Account',
        _class: 'Account',
        _type: 'bamboohr_account',
      },
    ],
    relationships: [],
    dependsOn: [],
    implemented: true,
  },
];
