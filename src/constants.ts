import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const ACCOUNT_ENTITY_DATA_KEY = 'entity:account';
export const COMPANY_ENTITY_DATA_KEY = 'entity:company';

type EntityConstantKeys = 'ACCOUNT' | 'COMPANY' | 'USER' | 'FILE';

export const entities: Record<EntityConstantKeys, StepEntityMetadata> = {
  ACCOUNT: {
    resourceName: 'Account',
    _type: 'bamboohr_account',
    _class: 'Account',
  },
  COMPANY: {
    resourceName: 'Company',
    _type: 'bamboohr_company',
    _class: 'Organization',
  },
  USER: {
    resourceName: 'User',
    _type: 'bamboohr_user',
    _class: 'User',
  },
  FILE: {
    resourceName: 'File',
    _type: 'bamboohr_file',
    _class: 'DataObject',
  },
};

type RelationshipConstantKeys =
  | 'ACCOUNT_HAS_USER'
  | 'ACCOUNT_HAS_FILE'
  | 'ACCOUNT_HAS_COMPANY'
  | 'COMPANY_HAS_FILE'
  | 'USER_HAS_FILE';

export const relationships: Record<
  RelationshipConstantKeys,
  StepRelationshipMetadata
> = {
  ACCOUNT_HAS_USER: {
    _type: 'bamboohr_account_has_user',
    _class: RelationshipClass.HAS,
    sourceType: entities.ACCOUNT._type,
    targetType: entities.USER._type,
  },
  ACCOUNT_HAS_FILE: {
    _type: 'bamboohr_account_has_file',
    _class: RelationshipClass.HAS,
    sourceType: entities.ACCOUNT._type,
    targetType: entities.FILE._type,
  },
  ACCOUNT_HAS_COMPANY: {
    _type: 'bamboohr_account_has_company',
    _class: RelationshipClass.HAS,
    sourceType: entities.ACCOUNT._type,
    targetType: entities.COMPANY._type,
  },
  COMPANY_HAS_FILE: {
    _type: 'bamboohr_company_has_file',
    _class: RelationshipClass.HAS,
    sourceType: entities.COMPANY._type,
    targetType: entities.FILE._type,
  },
  USER_HAS_FILE: {
    _type: 'bamboohr_user_has_file',
    _class: RelationshipClass.HAS,
    sourceType: entities.USER._type,
    targetType: entities.FILE._type,
  },
};
