import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../client';
import { ACCOUNT_ENTITY_DATA_KEY, entities } from '../constants';

export function getAccountKey(email: string): string {
  return `bamboohr_account:${email}`;
}

export async function fetchAccountDetails({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  const account = await apiClient.getAccount();
  const accountEntity = createIntegrationEntity({
    entityData: {
      source: account,
      assign: {
        _key: getAccountKey(account.email),
        _type: entities.ACCOUNT._type,
        _class: entities.ACCOUNT._class,
        id: `${account.id}`,
        webLink: `https://${instance.config.clientNamespace}.bamboohr.com/employees/employee.php?id=${account.id}`,
        displayName: `${account.firstName}_${account.lastName}`,
        email: account.email,
        name: `${account.firstName}_${account.lastName}`,
      },
    },
  });

  await Promise.all([
    jobState.addEntity(accountEntity),
    jobState.setData(ACCOUNT_ENTITY_DATA_KEY, accountEntity),
  ]);
}

export const accountSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-account',
    name: 'Fetch Account Details',
    entities: [entities.ACCOUNT],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAccountDetails,
  },
];
