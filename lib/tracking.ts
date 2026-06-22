export interface MapTrackingParams {
  mapUrl?: string;
  query?: string;
  trackingId?: string;
  source?: string;
  placement?: string;
  storeName?: string;
  address?: string;
  articleId?: string | number;
  campaign?: string;
}

export interface MapClickPayload extends MapTrackingParams {
  destinationUrl: string;
  eventName: 'map_click';
  clickedAt?: string;
}

const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/';

export function buildGoogleMapsSearchUrl(query: string): string {
  const searchParams = new URLSearchParams({
    api: '1',
    query,
  });

  return `${GOOGLE_MAPS_SEARCH_URL}?${searchParams.toString()}`;
}

export function buildTrackedMapUrl(params: MapTrackingParams): string {
  const destinationUrl = params.mapUrl ?? buildGoogleMapsSearchUrl(
    params.query ?? [params.storeName, params.address].filter(Boolean).join(' '),
  );

  const trackingParams = new URLSearchParams();
  appendTrackingParam(trackingParams, 'ngt_tracking_id', params.trackingId);
  appendTrackingParam(trackingParams, 'ngt_source', params.source);
  appendTrackingParam(trackingParams, 'ngt_placement', params.placement);
  appendTrackingParam(trackingParams, 'ngt_store_name', params.storeName);
  appendTrackingParam(trackingParams, 'ngt_address', params.address);
  appendTrackingParam(trackingParams, 'ngt_article_id', params.articleId);
  appendTrackingParam(trackingParams, 'ngt_campaign', params.campaign);

  if (!trackingParams.toString()) return destinationUrl;

  try {
    const url = new URL(destinationUrl);
    trackingParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  } catch {
    const separator = destinationUrl.includes('?') ? '&' : '?';
    return `${destinationUrl}${separator}${trackingParams.toString()}`;
  }
}

export function createMapClickPayload(
  params: MapTrackingParams & { clickedAt?: string },
): MapClickPayload {
  return {
    ...params,
    eventName: 'map_click',
    destinationUrl: buildTrackedMapUrl(params),
  };
}

function appendTrackingParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value === undefined || value === '') return;
  searchParams.set(key, String(value));
}
