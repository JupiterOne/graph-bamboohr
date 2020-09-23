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

export function getUserKey(email: string): string {
  return `bamboohr_user:${email}`;
}

export async function fetchUsers({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  const accountEntity = (await jobState.getData(
    ACCOUNT_ENTITY_DATA_KEY,
  )) as Entity;

  await apiClient.iterateUsers(async (user) => {
    const userEntity = createIntegrationEntity({
      entityData: {
        source: user,
        assign: {
          _key: getUserKey(user.email),
          _type: entities.USER._type,
          _class: entities.USER._class,
          id: `${user.id}`,
          webLink: `https://${instance.config.clientNamespace}.bamboohr.com/employees/employee.php?id=${user.employeeId}`,
          employeeId: `${user.employeeId}`,
          name: `${user.firstName} ${user.lastName}`,
          username: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
    });

    await Promise.all([
      jobState.addEntity(userEntity),
      jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          from: accountEntity,
          to: userEntity,
        }),
      ),
    ]);
  });
}

export const accessSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [entities.USER],
    relationships: [relationships.ACCOUNT_HAS_USER],
    dependsOn: ['fetch-account'],
    executionHandler: fetchUsers,
  },
];
