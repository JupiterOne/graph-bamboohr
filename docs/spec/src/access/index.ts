import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../../../src/types';
import { StepSpec } from '../types';

export const accessSpec: StepSpec<IntegrationConfig>[] = [
  {
    id: 'fetch-employees',
    name: 'Fetch Employees',
    entities: [
      {
        resourceName: 'Employee',
        _class: 'Record',
        _type: 'bamboohr_employee',
      },
    ],
    relationships: [
      {
        _type: 'bamboohr_account_has_employee',
        sourceType: 'bamboohr_account',
        _class: RelationshipClass.HAS,
        targetType: 'bamboohr_employee',
      },
    ],
    dependsOn: ['fetch-account'],
    implemented: true,
  },
  {
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [
      {
        resourceName: 'User',
        _class: 'User',
        _type: 'bamboohr_user',
      },
    ],
    relationships: [
      {
        _type: 'bamboohr_account_has_user',
        sourceType: 'bamboohr_account',
        _class: RelationshipClass.HAS,
        targetType: 'bamboohr_user',
      },
      {
        _type: 'bamboohr_user_is_employee',
        sourceType: 'bamboohr_user',
        _class: RelationshipClass.IS,
        targetType: 'bamboohr_employee',
      },
    ],
    dependsOn: ['fetch-account', 'fetch-employees'],
    implemented: true,
  },
];
