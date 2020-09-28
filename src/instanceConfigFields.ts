import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  clientNamespace: {
    type: 'string',
  },
  clientAccessToken: {
    type: 'string',
    mask: true,
  },
};

export default instanceConfigFields;
