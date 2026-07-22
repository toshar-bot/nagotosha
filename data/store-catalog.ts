import type {
  MerchantCorrection,
  StoreCatalogRecords,
  StoreDiscoveryRecord,
  StoreEntity,
  StoreFact,
  StoreSourceReference,
} from '../types/store-catalog';

export const STORE_DISCOVERY_RECORDS: readonly StoreDiscoveryRecord[] = [];
export const STORE_SOURCE_REFERENCES: readonly StoreSourceReference[] = [];
export const STORE_FACTS: readonly StoreFact[] = [];
export const STORE_ENTITIES: readonly StoreEntity[] = [];
export const STORE_MERCHANT_CORRECTIONS: readonly MerchantCorrection[] = [];

export const STORE_CATALOG: StoreCatalogRecords = {
  discoveryRecords: STORE_DISCOVERY_RECORDS,
  sourceReferences: STORE_SOURCE_REFERENCES,
  facts: STORE_FACTS,
  entities: STORE_ENTITIES,
  merchantCorrections: STORE_MERCHANT_CORRECTIONS,
};
