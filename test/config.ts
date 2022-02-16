import * as dotenv from 'dotenv';
import * as path from 'path';
import { IntegrationConfig } from '../src/types';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const integrationConfig: IntegrationConfig = {
  clientNamespace: process.env.CLIENT_NAMESPACE || 'collegeeat',
  clientAccessToken: process.env.CLIENT_ACCESS_TOKEN || 'client_access_token',
};
