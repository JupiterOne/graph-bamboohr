import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient, normalizeClientNamespace } from './client';
import { IntegrationConfig } from './types';

export default async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  if (!config.clientNamespace || !config.clientAccessToken) {
    throw new IntegrationValidationError(
      'Config requires all of {clientNamespace, clientAccessToken}',
    );
  }

  if (!normalizeClientNamespace(config.clientNamespace)) {
    throw new IntegrationValidationError(
      `Namespace is invalid. Please ensure the value is the subdomain such as 'jupiterone' in 'https://jupiterone.bamboohr.com'.`,
    );
  }

  const apiClient = createAPIClient(config);
  await apiClient.verifyAuthentication();
}
