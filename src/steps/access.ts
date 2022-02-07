import {
  convertProperties,
  createDirectRelationship,
  createIntegrationEntity,
  Entity,
  getRawData,
  IntegrationError,
  IntegrationStep,
  IntegrationStepExecutionContext,
  parseTimePropertyValue,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { APIClient } from '../client';
import { ACCOUNT_ENTITY_DATA_KEY, entities, relationships } from '../constants';
import { BambooHREmployee, BambooHRUser, IntegrationConfig } from '../types';

async function getEmployeeEntity(
  jobState,
  user: BambooHRUser,
): Promise<Entity | undefined> {
  if (user.employeeId) {
    return await jobState.findEntity(getEmployeeKey(user.employeeId));
  }
}

export function getUserKey(id: number): string {
  return `bamboohr_user:${id}`;
}

export function getEmployeeKey(id: string | number): string {
  return `bamboohr_employee:${id}`;
}

export async function fetchUsers({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = new APIClient(instance.config);

  const accountEntity = (await jobState.getData(
    ACCOUNT_ENTITY_DATA_KEY,
  )) as Entity;

  await apiClient.iterateUsers(async (user) => {
    const employeeEntity = await getEmployeeEntity(jobState, user);
    const employee = employeeEntity
      ? <BambooHREmployee>getRawData(employeeEntity)
      : undefined;

    if (employeeEntity && !employee) {
      throw new IntegrationError({
        code: 'MISSING_ENTITY_RAW_DATA',
        message: 'Expected employee entity to have raw data!',
      });
    }

    const displayName =
      employee?.displayName || `${user.firstName} ${user.lastName}`;

    const userEntity = createIntegrationEntity({
      entityData: {
        source: user,
        assign: {
          _key: getUserKey(user.id),
          _type: entities.USER._type,
          _class: entities.USER._class,
          id: String(user.id),
          active: user.status === 'enabled',
          webLink: `https://${instance.config.clientNamespace}.bamboohr.com/employees/employee.php?id=${user.employeeId}`,
          displayName: displayName,
          name: displayName,
          employeeId: String(user.employeeId),
          username: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          location: employee?.location,
          jobTitle: employee?.jobTitle,
          workEmail: employee?.workEmail,
          department: employee?.department,
          division: employee?.division,
          mobilePhone: employee?.mobilePhone,
          workPhone: employee?.workPhone,
          supervisor: employee?.supervisor,
        },
      },
    });

    await jobState.addEntity(userEntity);
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: userEntity,
      }),
    );

    if (employeeEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.IS,
          from: userEntity,
          to: employeeEntity,
        }),
      );
    }
  });
}

export async function fetchEmployees({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = new APIClient(instance.config);

  const accountEntity = (await jobState.getData(
    ACCOUNT_ENTITY_DATA_KEY,
  )) as Entity;

  await apiClient.iterateEmployees(async (employee) => {
    const employeeEntity = createIntegrationEntity({
      entityData: {
        source: employee,
        assign: {
          _key: getEmployeeKey(employee.id),
          _type: entities.EMPLOYEE._type,
          _class: entities.EMPLOYEE._class,
          ...convertProperties(employee),
          webLink: `https://${instance.config.clientNamespace}.bamboohr.com/employees/employee.php?id=${employee.id}`,
          name: employee.displayName,
          username: employee.workEmail,
          email: employee.workEmail,
          active: employee.status === 'Active',
          hireDate: parseTimePropertyValue(employee.hireDate),
          terminationDate: parseTimePropertyValue(employee.terminationDate),
          category: 'hr',
        },
      },
    });

    await jobState.addEntity(employeeEntity);
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: employeeEntity,
      }),
    );
  });
}

export const accessSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-employees',
    name: 'Fetch Employees',
    entities: [entities.EMPLOYEE],
    relationships: [relationships.ACCOUNT_HAS_EMPLOYEE],
    dependsOn: ['fetch-account'],
    executionHandler: fetchEmployees,
  },
  {
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [entities.USER],
    relationships: [
      relationships.ACCOUNT_HAS_USER,
      relationships.USER_IS_EMPLOYEE,
    ],
    dependsOn: ['fetch-account', 'fetch-employees'],
    executionHandler: fetchUsers,
  },
];
