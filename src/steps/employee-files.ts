import {
  createDirectRelationship,
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { APIClient } from '../client';
import { entities, relationships } from '../constants';
import { IntegrationConfig } from '../types';

export function getEmployeeFileKey(id: number): string {
  return `bamboohr_employee_file:${id}`;
}

export async function fetchEmployeeFiles({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = new APIClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: entities.USER._type },
    async (userEntity) => {
      await apiClient.iterateEmployeeFiles(
        userEntity.employeeId?.toString() as string,
        async (file) => {
          const fileEntity = createIntegrationEntity({
            entityData: {
              source: file,
              assign: {
                _key: getEmployeeFileKey(file.id),
                _type: entities.FILE._type,
                _class: entities.FILE._class,
                id: `${file.id}`,
                webLink: `https://${instance.config.clientNamespace}.bamboohr.com/employees/files/index.php?id=${file.id}`,
                name: file.name,
                classification: 'internal',
              },
            },
          });

          await jobState.addEntity(fileEntity);
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: userEntity,
              to: fileEntity,
            }),
          );
        },
      );
    },
  );
}

export const employeeFilesSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-employee-files',
    name: 'Fetch Employee Files',
    entities: [entities.FILE],
    relationships: [relationships.USER_HAS_FILE],
    dependsOn: ['fetch-users'],
    executionHandler: fetchEmployeeFiles,
  },
];
