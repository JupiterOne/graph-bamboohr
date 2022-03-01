import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { APIClient, normalizeClientNamespace } from './client';
import { IntegrationConfig } from './types';

export default async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;
  const logger = context.logger;

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

  const apiClient = new APIClient(config, logger);
  await apiClient.verifyAuthentication();
}
