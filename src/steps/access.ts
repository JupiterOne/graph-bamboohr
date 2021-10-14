import {
  createDirectRelationship,
  createIntegrationEntity,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  parseTimePropertyValue,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { APIClient } from '../client';
import { ACCOUNT_ENTITY_DATA_KEY, entities, relationships } from '../constants';
import { IntegrationConfig } from '../types';

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
    const userEntity = createIntegrationEntity({
      entityData: {
        source: user,
        assign: {
          _key: getUserKey(user.id),
          _type: entities.USER._type,
          _class: entities.USER._class,
          id: `${user.id}`,
          active: user.status === 'enabled',
          webLink: `https://${instance.config.clientNamespace}.bamboohr.com/employees/employee.php?id=${user.employeeId}`,
          employeeId: `${user.employeeId}`,
          displayName: `${user.firstName} ${user.lastName}`,
          name: `${user.firstName} ${user.lastName}`,
          username: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          location: user.employeeDetails?.location,
          jobTitle: user.employeeDetails?.jobTitle,
          workEmail: user.employeeDetails?.workEmail,
          department: user.employeeDetails?.department,
          division: user.employeeDetails?.division,
          mobilePhone: user.employeeDetails?.mobilePhone,
          workPhone: user.employeeDetails?.workPhone,
          supervisor: user.employeeDetails?.supervisor,
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

    const employeeEntity = await jobState.findEntity(
      getEmployeeKey(user.employeeId),
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
    const { hireDate, terminationDate } = await apiClient.getEmployeeDetails(
      employee.id,
    );
    const employeeEntity = createIntegrationEntity({
      entityData: {
        source: {
          ...employee,
          hireDate,
          terminationDate,
        },
        assign: {
          _key: getEmployeeKey(employee.id),
          _type: entities.EMPLOYEE._type,
          _class: entities.EMPLOYEE._class,
          id: employee.id,
          webLink: `https://${instance.config.clientNamespace}.bamboohr.com/employees/employee.php?id=${employee.id}`,
          displayName: `${employee.firstName} ${employee.lastName}`,
          name: `${employee.firstName} ${employee.lastName}`,
          username: employee.workEmail,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.workEmail,
          location: employee.location,
          jobTitle: employee.jobTitle,
          workEmail: employee.workEmail,
          department: employee.department,
          division: employee.division,
          mobilePhone: employee.mobilePhone,
          workPhone: employee.workPhone,
          supervisor: employee.supervisor,
          hireDate: parseTimePropertyValue(hireDate),
          terminationDate: parseTimePropertyValue(terminationDate),
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
