import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { ACCOUNT_ENTITY_DATA_KEY, entities } from '../constants';

export function getAccountKey(name: string): string {
  return `bamboohr_account:${name}`;
}

export async function fetchAccountDetails({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const company = {
    name: instance.config.clientNamespace,
  };

  const accountEntity = createIntegrationEntity({
    entityData: {
      source: company,
      assign: {
        _key: getAccountKey(company.name),
        _type: entities.ACCOUNT._type,
        _class: entities.ACCOUNT._class,
        webLink: `https://${company.name}.bamboohr.com`,
        name: company.name,
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
