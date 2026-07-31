import type { PartyChoice } from '@/types/decision-v3';

const PARTY_CHOICES: readonly PartyChoice[] = ['solo', 'pair', 'family', 'group'];

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
