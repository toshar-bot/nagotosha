import type {
  CommercialDisclosure,
  ContentRelationship,
  FeaturedArticle,
  WordPressPost,
} from '@/types/portal';

export type ContentRelationshipSource = 'article-data' | 'wordpress-meta' | 'registry' | 'none';

export interface ContentRelationshipRecord {
  postId: number;
  relationship: ContentRelationship;
  relationshipExplanation?: string;
  commercialDisclosure?: CommercialDisclosure;
}

export interface ContentRelationshipResolution {
  postId?: number;
  relationship: ContentRelationship;
  relationshipExplanation?: string;
  commercialDisclosure?: CommercialDisclosure;
  source: ContentRelationshipSource;
  displayLabel?: 'PR・提供情報' | '運営関係';
  displayableOnRedesignedSurfaces: boolean;
  validationErrors: string[];
}

export type ContentRelationshipInput =
  | number
  | string
  | FeaturedArticle
  | WordPressPost
  | ContentRelationshipRecord
  | { id?: number | string; postId?: number | string; articleUrl?: string };

export const CONTENT_RELATIONSHIP_REGISTRY: Readonly<Record<number, ContentRelationshipRecord>> = {
  214: {
    postId: 214,
    relationship: 'editorial',
  },
  205: {
    postId: 205,
    relationship: 'owned',
    relationshipExplanation: 'なごとしゃ運営者と関係のある店舗を紹介する記事です。',
  },
  182: {
    postId: 182,
    relationship: 'editorial',
  },
  178: {
    postId: 178,
    relationship: 'editorial',
  },
  173: {
    postId: 173,
    relationship: 'editorial',
  },
  159: {
    postId: 159,
    relationship: 'editorial',
  },
  137: {
    postId: 137,
    relationship: 'editorial',
  },
};

const RELATIONSHIP_VALUES: ContentRelationship[] = ['editorial', 'pr', 'owned', 'unknown'];
const RELATIONSHIPS: ReadonlySet<ContentRelationship> = new Set<ContentRelationship>(RELATIONSHIP_VALUES);

export function listContentRelationshipRegistryRecords(): ContentRelationshipRecord[] {
  return Object.values(CONTENT_RELATIONSHIP_REGISTRY).map((record) => ({ ...record }));
}

export function extractContentRelationshipPostId(input: ContentRelationshipInput): number | undefined {
  if (typeof input === 'number') return Number.isInteger(input) && input > 0 ? input : undefined;
  if (typeof input === 'string') return parsePostId(input);

  const direct = parsePostId(('postId' in input ? input.postId : undefined) ?? ('id' in input ? input.id : undefined));
  if (direct) return direct;

  if ('articleUrl' in input && typeof input.articleUrl === 'string') {
    return parsePostId(input.articleUrl);
  }

  if ('link' in input && typeof input.link === 'string') {
    return parsePostId(input.link);
  }

  return undefined;
}

export function resolveContentRelationship(input: ContentRelationshipInput): ContentRelationshipResolution {
  const explicitRecord = readExplicitRelationship(input);
  if (explicitRecord) return toResolution(explicitRecord, explicitRecord.source);

  const postId = extractContentRelationshipPostId(input);
  const registryRecord = postId ? CONTENT_RELATIONSHIP_REGISTRY[postId] : undefined;
  if (registryRecord) return toResolution(registryRecord, 'registry');

  return {
    postId,
    relationship: 'unknown',
    source: 'none',
    displayableOnRedesignedSurfaces: false,
    validationErrors: ['relationship is not explicitly confirmed'],
  };
}

export function validateContentRelationshipRecord(record: ContentRelationshipRecord): string[] {
  const errors: string[] = [];

  if (!Number.isInteger(record.postId) || record.postId <= 0) {
    errors.push('postId must be a positive integer');
  }

  if (!RELATIONSHIPS.has(record.relationship)) {
    errors.push('relationship must be editorial, pr, owned, or unknown');
    return errors;
  }

  if (record.relationship === 'unknown') {
    errors.push('unknown relationship is not displayable on redesigned surfaces');
  }

  if (record.relationship === 'editorial' && record.commercialDisclosure) {
    errors.push('editorial content must not include commercialDisclosure');
  }

  if (record.relationship === 'pr') {
    if (!record.commercialDisclosure) {
      errors.push('pr content requires commercialDisclosure');
    } else {
      errors.push(...validateCommercialDisclosure(record.commercialDisclosure));
      if (hasCommercialInvolvement(record.commercialDisclosure) && !record.commercialDisclosure.sponsorName?.trim()) {
        errors.push('pr content with commercial involvement requires sponsorName');
      }
    }
  }

  if (record.relationship === 'owned') {
    if (!record.relationshipExplanation?.trim()) {
      errors.push('owned content requires relationshipExplanation');
    }
    if (record.commercialDisclosure) {
      errors.push(...validateCommercialDisclosure(record.commercialDisclosure));
    }
  }

  return errors;
}

export function getContentRelationshipDisplayLabel(
  relationship: ContentRelationship,
): ContentRelationshipResolution['displayLabel'] {
  if (relationship === 'pr') return 'PR・提供情報';
  if (relationship === 'owned') return '運営関係';
  return undefined;
}

export function isDisplayableOnRedesignedSurfaces(input: ContentRelationshipInput): boolean {
  return resolveContentRelationship(input).displayableOnRedesignedSurfaces;
}

function toResolution(
  record: ContentRelationshipRecord,
  source: ContentRelationshipSource,
): ContentRelationshipResolution {
  const validationErrors = validateContentRelationshipRecord(record);
  const displayLabel = getContentRelationshipDisplayLabel(record.relationship);

  return {
    postId: record.postId,
    relationship: record.relationship,
    relationshipExplanation: record.relationshipExplanation,
    commercialDisclosure: record.commercialDisclosure,
    source,
    displayLabel,
    displayableOnRedesignedSurfaces: record.relationship !== 'unknown' && validationErrors.length === 0,
    validationErrors,
  };
}

function readExplicitRelationship(input: ContentRelationshipInput): (ContentRelationshipRecord & { source: ContentRelationshipSource }) | undefined {
  if (typeof input !== 'object' || input === null) return undefined;

  const fromArticle = readRelationshipFromObject(input as Record<string, unknown>, 'article-data');
  if (fromArticle) return fromArticle;

  if ('meta' in input && input.meta && typeof input.meta === 'object') {
    return readRelationshipFromObject(input.meta as Record<string, unknown>, 'wordpress-meta', extractContentRelationshipPostId(input));
  }

  return undefined;
}

function readRelationshipFromObject(
  input: Record<string, unknown>,
  source: ContentRelationshipSource,
  fallbackPostId?: number,
): (ContentRelationshipRecord & { source: ContentRelationshipSource }) | undefined {
  const relationship = parseRelationship(input.relationship);
  if (!relationship) return undefined;

  const postId = parsePostId(input.postId ?? input.id) ?? fallbackPostId;
  if (!postId) return undefined;

  return {
    postId,
    relationship,
    relationshipExplanation: typeof input.relationshipExplanation === 'string' ? input.relationshipExplanation : undefined,
    commercialDisclosure: parseCommercialDisclosure(input.commercialDisclosure),
    source,
  };
}

function parseRelationship(value: unknown): ContentRelationship | undefined {
  return typeof value === 'string' && RELATIONSHIPS.has(value as ContentRelationship)
    ? (value as ContentRelationship)
    : undefined;
}

function parseCommercialDisclosure(value: unknown): CommercialDisclosure | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const source = value as Record<string, unknown>;

  return {
    sponsorName: typeof source.sponsorName === 'string' ? source.sponsorName : undefined,
    paid: source.paid === true,
    productProvided: source.productProvided === true,
    invited: source.invited === true,
    productionRequested: source.productionRequested === true,
    advertiserReviewedBeforePublication:
      typeof source.advertiserReviewedBeforePublication === 'boolean'
        ? source.advertiserReviewedBeforePublication
        : undefined,
    verifiedAt: typeof source.verifiedAt === 'string' ? source.verifiedAt : '',
  };
}

function validateCommercialDisclosure(disclosure: CommercialDisclosure): string[] {
  const errors: string[] = [];

  for (const key of ['paid', 'productProvided', 'invited', 'productionRequested'] as const) {
    if (typeof disclosure[key] !== 'boolean') errors.push(`commercialDisclosure.${key} must be boolean`);
  }

  if (
    disclosure.advertiserReviewedBeforePublication !== undefined &&
    typeof disclosure.advertiserReviewedBeforePublication !== 'boolean'
  ) {
    errors.push('commercialDisclosure.advertiserReviewedBeforePublication must be boolean when provided');
  }

  if (!disclosure.verifiedAt.trim()) {
    errors.push('commercialDisclosure.verifiedAt is required');
  }

  return errors;
}

function hasCommercialInvolvement(disclosure: CommercialDisclosure): boolean {
  return disclosure.paid || disclosure.productProvided || disclosure.invited || disclosure.productionRequested;
}

function parsePostId(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0 ? value : undefined;
  if (typeof value !== 'string') return undefined;

  const direct = Number(value);
  if (Number.isInteger(direct) && direct > 0) return direct;

  const wpPrefix = value.match(/^wp(?:-ranking)?-(\d+)$/);
  if (wpPrefix) return Number(wpPrefix[1]);

  const articlePath = value.match(/\/article\/(\d+)(?:[/?#]|$)/);
  if (articlePath) return Number(articlePath[1]);

  return undefined;
}





