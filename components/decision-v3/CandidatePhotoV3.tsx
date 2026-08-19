'use client';

import { useState } from 'react';
import type { DecisionV3Candidate } from '@/types/decision-v3';
import styles from './decision-v3.module.css';

export function CandidatePhotoV3({
  candidate,
  fallbackMessage: fallbackMessageOverride,
  ratio = 'wide',
}: {
  candidate: DecisionV3Candidate;
  fallbackMessage?: string;
  ratio?: 'wide' | 'detail' | 'thumb';
}) {
  const source = ratio === 'detail' && candidate.photo.detailSrc
    ? candidate.photo.detailSrc
    : candidate.photo.src;
  const photoKey = `${candidate.id}:${ratio}:${source ?? 'unregistered'}`;
  const [failedPhotoKey, setFailedPhotoKey] = useState<string | null>(null);
  const sourceRegistered = candidate.photo.availability === 'available' && Boolean(source);
  const sourceFailed = sourceRegistered && failedPhotoKey === photoKey;
  const intrinsicHeight = ratio === 'detail' && candidate.photo.detailSrc ? 675 : 750;
  const fallbackMessage = fallbackMessageOverride ?? (sourceRegistered
    ? '写真を表示できませんでした'
    : '写真はまだ登録されていません');
  const photoClassName = `${styles.candidatePhoto} ${
    ratio === 'detail' ? styles.candidatePhotoDetail : ratio === 'thumb' ? styles.candidatePhotoThumb : ''
  }`;

  return (
    <div className={photoClassName} data-photo-state={!sourceRegistered ? 'unregistered' : sourceFailed ? 'error' : 'ready'}>
      {!sourceRegistered || sourceFailed ? (
        <div className={styles.candidatePhotoFallback} role="img" aria-label={fallbackMessage}>
          <span aria-hidden="true">写真</span>
          <strong>{fallbackMessage}</strong>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={source}
          alt={candidate.photo.alt}
          width={1200}
          height={intrinsicHeight}
          className={styles.candidatePhotoImage}
          decoding="async"
          onLoad={(event) => {
            const image = event.currentTarget;
            void image.decode().then(
              () => setFailedPhotoKey((current) => (current === photoKey ? null : current)),
              () => setFailedPhotoKey(photoKey),
            );
          }}
          onError={() => setFailedPhotoKey(photoKey)}
        />
      )}
    </div>
  );
}
