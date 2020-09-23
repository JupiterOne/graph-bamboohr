import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
  Entity,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import {
  COMPANY_ENTITY_DATA_KEY,
  ACCOUNT_ENTITY_DATA_KEY,
  entities,
  relationships,
} from '../constants';

export function getCompanyKey(name: string): string {
  return `bamboohr_company:${name}`;
}

export async function fetchCompanyDetails({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const accountEntity = (await jobState.getData(
    ACCOUNT_ENTITY_DATA_KEY,
  )) as Entity;

  const company = {
    name: instance.config.clientNamespace,
  };

  const companyEntity = createIntegrationEntity({
    entityData: {
      source: company,
      assign: {
        _key: getCompanyKey(company.name),
        _type: entities.COMPANY._type,
        _class: entities.COMPANY._class,
        name: company.name,
        webLink: `https://${instance.config.clientNamespace}.bamboohr.com`,
      },
    },
  });

  await Promise.all([
    jobState.addEntity(companyEntity),
    jobState.setData(COMPANY_ENTITY_DATA_KEY, companyEntity),
    jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: companyEntity,
      }),
    ),
  ]);
}

export const companySteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-company',
    name: 'Fetch Company Details',
    entities: [entities.COMPANY],
    relationships: [relationships.ACCOUNT_HAS_COMPANY],
    dependsOn: ['fetch-account'],
    executionHandler: fetchCompanyDetails,
  },
];
