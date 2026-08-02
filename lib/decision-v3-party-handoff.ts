import type { PartyChoice } from '@/types/decision-v3';

const PARTY_CHOICES: readonly PartyChoice[] = ['solo', 'pair', 'family', 'group'];

export const DECISION_V3_PARTY_LABELS = {
  solo: '1人でも',
  pair: '2人',
  family: '家族・子供',
  group: '友人・グループ',
} satisfies Record<PartyChoice, string>;

const LEGACY_PARTY_COPY_REPLACEMENTS = [
  ['一人でも', '1人でも'],
  ['デート・ふたり', '2人'],
  ['家族・子どもと', '家族・子供'],
] as const;

export function formatDecisionV3PartyDisplayText(text: string) {
  return LEGACY_PARTY_COPY_REPLACEMENTS.reduce(
    (formatted, [legacy, approved]) => formatted.split(legacy).join(approved),
    text,
  );
}

export function readDecisionV3PartyHandoff(search: string): PartyChoice | null {
  const params = new URLSearchParams(search);
  const partyValues = params.getAll('party');
  const fromValues = params.getAll('from');

  if (partyValues.length !== 1 || fromValues.length !== 1 || fromValues[0] !== 'home') {
    return null;
  }

  const party = partyValues[0];
  return PARTY_CHOICES.includes(party as PartyChoice) ? party as PartyChoice : null;
}

export function hasDecisionV3PartyHandoffParameters(search: string) {
  const params = new URLSearchParams(search);
  return params.has('party') || params.has('from');
}

export function removeDecisionV3PartyHandoffParameters(href: string) {
  const url = new URL(href);
  url.searchParams.delete('party');
  url.searchParams.delete('from');
  return `${url.pathname}${url.search}${url.hash}`;
}
