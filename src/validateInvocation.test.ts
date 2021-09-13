import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { setupBambooHRRecording } from '../test/recording';

import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';

it('requires valid config', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {} as IntegrationConfig,
  });

  await expect(validateInvocation(executionContext)).rejects.toThrow(
    /Config requires/,
  );
});

it('requires a valid namespace', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {
      clientNamespace: 'https://whoknows.where.com',
    } as IntegrationConfig,
  });

  await expect(validateInvocation(executionContext)).rejects.toThrow(
    /Namespace/,
  );
});

it('auth error', async () => {
  const recording = setupBambooHRRecording({
    directory: '__recordings__',
    name: 'client-auth-error',
  });

  recording.server.any().intercept((req, res) => {
    res.status(401);
  });

  const executionContext = createMockExecutionContext({
    instanceConfig: {
      clientNamespace: 'INVALID',
      clientAccessToken: 'INVALID',
    },
  });

  try {
    await validateInvocation(executionContext);
  } catch (e) {
    expect(e instanceof IntegrationProviderAuthenticationError).toBe(true);
  }
});
