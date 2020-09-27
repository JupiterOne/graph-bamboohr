import {
  createDirectRelationship,
  createIntegrationEntity,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { ACCOUNT_ENTITY_DATA_KEY, entities, relationships } from '../constants';
import { IntegrationConfig } from '../types';

export function getCompanyFileKey(id: number): string {
  return `bamboohr_company_file:${id}`;
}

export async function fetchCompanyFiles({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  const accountEntity = (await jobState.getData(
    ACCOUNT_ENTITY_DATA_KEY,
  )) as Entity;

  await apiClient.iterateCompanyFiles(async (file) => {
    const fileEntity = createIntegrationEntity({
      entityData: {
        source: file,
        assign: {
          _key: getCompanyFileKey(file.id),
          _type: entities.FILE._type,
          _class: entities.FILE._class,
          id: `${file.id}`,
          webLink: `https://${instance.config.clientNamespace}.bamboohr.com/files/index.php?id=${file.id}`,
          name: file.name,
          classification: 'internal',
        },
      },
    });

    await Promise.all([
      jobState.addEntity(fileEntity),
      jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: accountEntity,
          to: fileEntity,
        }),
      ),
    ]);
  });
}

export const companyFilesSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-company-files',
    name: 'Fetch Company Files',
    entities: [entities.FILE],
    relationships: [relationships.ACCOUNT_HAS_FILE],
    dependsOn: ['fetch-account'],
    executionHandler: fetchCompanyFiles,
  },
];
