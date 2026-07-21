'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { trackGa4Event } from '@/lib/ga4';
import { isSaved, toggleSavedItem } from '@/lib/saved';
import { buildGoogleMapsSearchUrl } from '@/lib/tracking';
import type { ArticleExperienceData, ArticleExternalVisual, ArticlePoint, ArticleRelated, EventRoundupData, EventRoundupItem, FeatureArticleData, FeaturePick, FeatureTip, FeatureVenue, NewsArticleData, NewsSpot, ShopInfoItem } from '@/lib/article-experience';
import type { ContentRelationshipResolution } from '@/lib/content-relationships';

const GLOBAL_CSS = `
  .article-page {
    color: #0F172A;
    background: linear-gradient(180deg, #FFFFFF 0%, #FFFDF7 40%, #FFFFFF 100%);
    min-height: 100dvh;
    padding-bottom: 112px;
    overflow-x: hidden;
  }
  .article-page.standard-editorial {
    color: #1B2437;
    background: #F7F1E7;
    padding-bottom: 40px;
  }
  .article-shell {
    width: min(100%, 760px);
    margin: 0 auto;
  }
  .article-body {
    color: #334155;
    font-size: 15px;
    line-height: 1.9;
    word-break: normal;
    overflow-wrap: anywhere;
  }
  .article-body .nagotosha-app-cta,
  .article-body .nagotosha-wp-only {
    display: none !important;
  }
  .article-body p { margin: 0 0 1.15em; }
  .article-body h2 {
    color: #071A4D;
    font-size: 19px;
    line-height: 1.45;
    font-weight: 900;
    margin: 1.8em 0 0.7em;
    padding-left: 13px;
    border-left: 4px solid #E8483F;
  }
  .article-body h3 {
    color: #071A4D;
    font-size: 15px;
    font-weight: 900;
    margin: 1.6em 0 0.6em;
    padding: 9px 13px;
    background: #FFFBF0;
    border-left: 3px solid #F8C861;
    border-radius: 0 10px 10px 0;
    line-height: 1.5;
  }
  .article-body a { color: #E8483F; font-weight: 800; }
  .article-body a[href*="google.com/maps"],
  .article-body a[href*="maps.google.com"] {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
    min-height: 44px;
    box-sizing: border-box;
    padding: 10px 14px;
    border-radius: 14px;
    border: 1px solid #FFD6D2;
    background: #fff;
    color: #C6252D !important;
    font-size: 13px;
    font-weight: 900;
    text-decoration: none !important;
    margin: 6px 0;
    line-height: 1.35;
    vertical-align: middle;
    box-shadow: 0 4px 14px rgba(198,37,45,0.08);
  }
  .article-body a[href*="google.com/maps"]::before,
  .article-body a[href*="maps.google.com"]::before {
    content: "";
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
    background: #E8483F;
    -webkit-mask: url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2024%2024%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M12%2021s7-5.2%207-11a7%207%200%200%200-14%200c0%205.8%207%2011%207%2011z%27%20fill%3D%27none%27%20stroke%3D%27black%27%20stroke-width%3D%272.2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Ccircle%20cx%3D%2712%27%20cy%3D%2710%27%20r%3D%272.5%27%20fill%3D%27none%27%20stroke%3D%27black%27%20stroke-width%3D%272.2%27/%3E%3C/svg%3E") center / contain no-repeat;
    mask: url("data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%2024%2024%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M12%2021s7-5.2%207-11a7%207%200%200%200-14%200c0%205.8%207%2011%207%2011z%27%20fill%3D%27none%27%20stroke%3D%27black%27%20stroke-width%3D%272.2%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3Ccircle%20cx%3D%2712%27%20cy%3D%2710%27%20r%3D%272.5%27%20fill%3D%27none%27%20stroke%3D%27black%27%20stroke-width%3D%272.2%27/%3E%3C/svg%3E") center / contain no-repeat;
  }
  .article-body a[href^="https://"]:not([href*="google.com/maps"]):not([href*="maps.google.com"]):not([href*="nagotosha.com"]):not([href*="nagotosha.vercel.app"]) {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1.5px solid #E8483F;
    background: #fff;
    color: #E8483F !important;
    font-size: 12px;
    font-weight: 900;
    text-decoration: none !important;
    margin: 4px 0;
    line-height: 1.2;
  }
  .article-body img {
    max-width: 100%;
    height: auto;
    border-radius: 18px;
    display: block;
    margin: 1em 0;
  }
  .article-body table {
    width: 100%;
    max-width: 100%;
    display: block;
    overflow-x: auto;
    border-collapse: collapse;
    border: 1px solid #E6ECF5;
    margin: 1em 0;
  }
  .article-body th {
    background: #F8FAFC;
    color: #071A4D;
    font-weight: 900;
    font-size: 12px;
    border-bottom: 1px solid #E6ECF5;
    padding: 10px 12px;
    text-align: left;
  }
  .article-body td {
    border-bottom: 1px solid #E6ECF5;
    padding: 10px 12px;
    text-align: left;
    font-size: 13px;
    color: #334155;
  }
  .article-body tr:last-child td,
  .article-body tr:last-child th {
    border-bottom: none;
  }
  .standard-editorial .article-body {
    color: #1B2437;
    font-size: 15.5px;
    line-height: 1.88;
    overflow-wrap: anywhere;
  }
  .standard-editorial .article-body h2 {
    margin: 2em 0 0.75em;
    padding: 0;
    border-left: none;
    color: #071A4D;
    font-size: 20px;
    line-height: 1.45;
    font-weight: 900;
  }
  .standard-editorial .article-body h3 {
    margin: 1.6em 0 0.65em;
    padding: 0;
    border-left: none;
    border-radius: 0;
    background: transparent;
    color: #071A4D;
    font-size: 16px;
  }
  .standard-editorial .article-body figure {
    margin: 1.5em 0;
  }
  .standard-editorial .article-body figcaption {
    margin-top: 7px;
    color: #5B6577;
    font-size: 11px;
    line-height: 1.6;
    font-weight: 750;
  }
  .standard-editorial .article-body.standard-source-body a[href^="https://"]:not([href*="google.com/maps"]):not([href*="maps.google.com"]):not([href*="nagotosha.com"]):not([href*="nagotosha.vercel.app"]) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    border-radius: 14px;
    border: 1px solid rgba(7,26,77,0.2);
    background: #fff;
    color: #071A4D !important;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
    line-height: 1.2;
    text-decoration: none !important;
    box-shadow: none;
  }
  .standard-editorial .article-body.standard-source-body a[href^="https://"]:not([href*="google.com/maps"]):not([href*="maps.google.com"]):not([href*="nagotosha.com"]):not([href*="nagotosha.vercel.app"])::after {
    content: "↗";
    margin-left: 6px;
    font-size: 11px;
    line-height: 1;
  }
  .structured-store-content {
    padding: 0 14px 22px;
    margin-top: 14px;
  }
  .structured-store-content .article-body {
    background: #fff;
    border: 1px solid #E6ECF5;
    border-radius: 22px;
    padding: 18px 16px;
    box-shadow: 0 8px 22px rgba(7,26,77,0.06);
  }
  .structured-store-content .article-body h2:first-child {
    margin-top: 0;
  }
  .structured-store-content .article-body figure {
    margin: 1em 0 1.25em;
  }
  .structured-store-content .article-body figure img,
  .structured-store-content .article-body img {
    width: 100%;
    max-height: 520px;
    object-fit: contain;
    object-position: center;
    background: #F8FAFC;
  }
  .structured-store-content .article-body figcaption {
    margin-top: 7px;
    color: #667085;
    font-size: 11px;
    line-height: 1.6;
    font-weight: 750;
  }
  .structured-summary-card,
  .structured-recommend-card {
    margin: 1.25em 0;
    border-radius: 20px;
    padding: 16px 15px;
    box-shadow: 0 8px 22px rgba(7,26,77,0.07);
  }
  .structured-summary-card {
    border: 1px solid #F2D98C;
    background: linear-gradient(135deg, #FFFFFF 0%, #FFFDF7 52%, #FFF7D8 100%);
  }
  .structured-recommend-card {
    border: 1px solid #E6ECF5;
    background: #fff;
  }
  .structured-summary-card h2,
  .structured-recommend-card h2 {
    margin: 0 0 12px;
    padding: 0;
    border: none;
    color: #071A4D;
    font-size: 18px;
    line-height: 1.4;
  }
  .structured-summary-card ul,
  .structured-recommend-card ul {
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .structured-summary-card li,
  .structured-recommend-card li {
    position: relative;
    margin: 0;
    padding-left: 27px;
    color: #0F172A;
    font-size: 13px;
    line-height: 1.7;
    font-weight: 850;
  }
  .structured-summary-card li::before {
    content: "✓";
    position: absolute;
    left: 0;
    top: 0.1em;
    width: 19px;
    height: 19px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: #E8483F;
    color: #fff;
    font-size: 12px;
    font-weight: 900;
  }
  .structured-recommend-card li::before {
    content: "◎";
    position: absolute;
    left: 0;
    top: 0.05em;
    color: #E8483F;
    font-size: 15px;
    font-weight: 900;
  }
  @media (max-width: 430px) {
    .structured-store-content {
      padding-inline: 12px;
    }
    .structured-store-content .article-body {
      padding: 16px 14px;
    }
    .structured-summary-card,
    .structured-recommend-card {
      padding: 14px 13px;
    }
    .structured-summary-card li,
    .structured-recommend-card li {
      font-size: 13px;
      line-height: 1.65;
    }
  }
  .feature-article {
    padding: 0 14px 22px;
  }
  .feature-card {
    background: #fff;
    border: 1px solid #E6ECF5;
    border-radius: 22px;
    box-shadow: 0 10px 28px rgba(7,26,77,0.07);
  }
  .feature-section {
    margin-top: 16px;
  }
  .feature-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }
  .feature-hero-media {
    min-height: 230px;
  }
  .feature-point-box {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .feature-horizontal {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 1px 2px 6px;
    scrollbar-width: none;
  }
  .feature-horizontal::-webkit-scrollbar {
    display: none;
  }
  .event-roundup {
    padding: 0 0 2px;
    margin-top: 14px;
  }
  .event-roundup-head {
    padding: 0 16px 10px;
  }
  .event-roundup-title {
    margin: 0;
    color: #071A4D;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 900;
    letter-spacing: 0;
  }
  .event-roundup-copy {
    margin: 6px 0 0;
    color: #667085;
    font-size: 12px;
    line-height: 1.65;
    font-weight: 800;
  }
  .event-roundup-swipe {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 9px;
    border-radius: 999px;
    background: #FFF7D8;
    color: #8A6400;
    padding: 6px 10px;
    font-size: 11px;
    line-height: 1;
    font-weight: 900;
  }
  .event-card-rail {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 1px 36px 12px 16px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
  }
  .event-card-rail::-webkit-scrollbar {
    display: none;
  }
  .event-roundup-card {
    width: min(382px, calc(100vw - 44px));
    flex: 0 0 auto;
    scroll-snap-align: start;
    overflow: hidden;
    border-radius: 18px;
    border: 1px solid #E6ECF5;
    background: #fff;
    box-shadow: 0 8px 24px rgba(7, 26, 77, 0.08);
    color: #0F172A;
  }
  .event-roundup-card.is-ended {
    background: #F8FAFC;
    opacity: 0.86;
  }
  .event-visual {
    position: relative;
    height: 126px;
    overflow: hidden;
    background: linear-gradient(135deg, #071A4D 0%, #102B68 54%, #174487 100%);
  }
  .event-visual img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .event-visual::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(7,26,77,0.04) 0%, rgba(7,26,77,0.32) 100%);
    pointer-events: none;
  }
  .event-photo-label {
    position: absolute;
    left: 10px;
    bottom: 10px;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    max-width: calc(100% - 20px);
    border-radius: 7px;
    background: rgba(7,26,77,0.78);
    color: #fff;
    padding: 4px 7px;
    font-size: 11px;
    line-height: 1;
    font-weight: 800;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(7,26,77,0.18);
  }
  .event-generated-visual {
    height: 100%;
    position: relative;
    display: grid;
    align-content: end;
    padding: 14px;
    color: #fff;
  }
  .event-generated-visual::before,
  .event-generated-visual::after {
    content: '';
    position: absolute;
    width: 82px;
    height: 82px;
    border-radius: 50%;
    border: 1px dotted rgba(248,200,97,0.62);
    pointer-events: none;
  }
  .event-generated-visual::before {
    top: 14px;
    right: 22px;
  }
  .event-generated-visual::after {
    width: 46px;
    height: 46px;
    top: 34px;
    left: 20px;
    border-color: rgba(255,255,255,0.46);
  }
  .event-generated-area {
    position: relative;
    z-index: 1;
    font-size: 11px;
    font-weight: 900;
    color: rgba(255,255,255,0.82);
  }
  .event-generated-date {
    position: relative;
    z-index: 1;
    margin-top: 2px;
    font-size: 28px;
    line-height: 1;
    font-weight: 900;
    color: #F8C861;
  }
  .event-card-body {
    padding: 13px 14px 14px;
  }
  .event-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .event-date-badge {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    border-radius: 10px;
    background: #F8C861;
    color: #071A4D;
    padding: 0 10px;
    font-size: 15px;
    line-height: 1;
    font-weight: 900;
    white-space: nowrap;
  }
  .event-status-badge {
    display: inline-flex;
    align-items: center;
    min-height: 25px;
    border-radius: 999px;
    padding: 0 9px;
    background: rgba(7,26,77,0.07);
    color: #071A4D;
    font-size: 10px;
    line-height: 1;
    font-weight: 900;
    white-space: nowrap;
  }
  .event-status-badge.is-today,
  .event-status-badge.is-active {
    background: #E8483F;
    color: #fff;
  }
  .event-status-badge.is-ended {
    background: #E4E7EC;
    color: #667085;
  }
  .event-card-title {
    margin: 10px 0 0;
    min-height: 44px;
    color: #071A4D;
    font-size: 17px;
    line-height: 1.32;
    font-weight: 900;
    letter-spacing: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .event-card-meta {
    display: grid;
    gap: 5px;
    margin-top: 9px;
  }
  .event-card-meta p,
  .event-card-copy {
    margin: 0;
    color: #475467;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 800;
  }
  .event-card-copy {
    margin-top: 9px;
    color: #0F172A;
  }
  .event-card-actions {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: 9px;
    margin-top: 12px;
  }
  .event-card-action {
    min-height: 46px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 10px;
    text-decoration: none !important;
    font-size: 12.5px;
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
    transition: transform 120ms ease, box-shadow 120ms ease;
  }
  .event-card-action:active {
    transform: translateY(1px) scale(0.99);
  }
  .event-card-action:focus-visible {
    outline: 3px solid rgba(248,200,97,0.86);
    outline-offset: 2px;
  }
  .event-card-action.primary {
    background: #071A4D;
    color: #fff !important;
    border: 1px solid #071A4D;
    box-shadow: 0 7px 16px rgba(7,26,77,0.22);
  }
  .event-card-action.secondary {
    background: #fff;
    color: #071A4D !important;
    border: 1px solid rgba(7,26,77,0.24);
  }
  .event-roundup-list-section {
    padding: 0 14px 6px;
  }
  .event-roundup-list-section .event-roundup-head {
    padding: 0 2px 10px;
  }
  .event-filter-panel {
    margin: 0 0 12px;
    border: 1px solid #E6ECF5;
    border-radius: 18px;
    background: #fff;
    padding: 13px 12px;
    box-shadow: 0 6px 18px rgba(7,26,77,0.05);
  }
  .event-filter-title,
  .event-filter-count {
    margin: 0;
    color: #071A4D;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 900;
  }
  .event-filter-count {
    margin-top: 9px;
    color: #667085;
    font-size: 11px;
  }
  .event-filter-chips {
    display: flex;
    gap: 8px;
    margin-top: 9px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }
  .event-filter-chips::-webkit-scrollbar {
    display: none;
  }
  .event-filter-chip {
    flex: 0 0 auto;
    min-height: 44px;
    border-radius: 999px;
    border: 1px solid #D7DEE9;
    background: #fff;
    color: #071A4D;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 900;
  }
  .event-filter-chip.is-active {
    background: #071A4D;
    border-color: #071A4D;
    color: #fff;
  }
  .event-filter-chip:focus-visible,
  .event-list-official:focus-visible {
    outline: 3px solid rgba(248,200,97,0.88);
    outline-offset: 2px;
  }
  .event-list-cards {
    display: grid;
    gap: 12px;
  }
  .event-list-card {
    border-radius: 18px;
    border: 1px solid #E6ECF5;
    background: #fff;
    padding: 15px 14px;
    box-shadow: 0 8px 22px rgba(7,26,77,0.06);
  }
  .event-list-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .event-list-number {
    color: #98A2B3;
    font-size: 12px;
    line-height: 1;
    font-weight: 900;
  }
  .event-list-title {
    margin: 11px 0 0;
    color: #071A4D;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 900;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }
  .event-list-copy {
    margin: 7px 0 0;
    color: #334155;
    font-size: 13px;
    line-height: 1.65;
    font-weight: 800;
  }
  .event-list-visual {
    margin: 12px 0 0;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid #E6ECF5;
    background: #F8FAFC;
  }
  .event-list-visual img {
    display: block;
    width: 100%;
    height: auto;
  }
  .event-list-visual figcaption {
    display: grid;
    gap: 3px;
    padding: 8px 10px 9px;
    color: #667085;
    font-size: 11px;
    line-height: 1.55;
    font-weight: 750;
  }
  .event-list-facts {
    display: grid;
    gap: 7px;
    margin: 12px 0 0;
  }
  .event-list-fact {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 8px;
    align-items: start;
    padding: 8px 9px;
    border-radius: 12px;
    background: #F8FAFC;
  }
  .event-list-fact dt {
    color: #667085;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 900;
  }
  .event-list-fact dd {
    margin: 0;
    color: #0F172A;
    font-size: 12px;
    line-height: 1.55;
    font-weight: 850;
    overflow-wrap: anywhere;
  }
  .event-list-verified {
    margin: 10px 0 0;
    color: #667085;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 800;
  }
  .event-list-official {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: 100%;
    min-height: 46px;
    margin-top: 12px;
    border-radius: 14px;
    background: #071A4D;
    color: #fff !important;
    border: 1px solid #071A4D;
    text-decoration: none !important;
    font-size: 13px;
    font-weight: 900;
    box-shadow: 0 7px 16px rgba(7,26,77,0.18);
    transition: transform 120ms ease, box-shadow 120ms ease;
  }
  .event-list-official:active {
    transform: translateY(1px) scale(0.99);
  }
  .event-roundup-sources {
    margin-top: 18px;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid #E4E7EC;
    background: #fff;
  }
  .event-roundup-sources h2 {
    margin: 0;
    color: #071A4D;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 900;
    letter-spacing: 0;
  }
  .event-roundup-sources p {
    margin: 8px 0 0;
    color: #475467;
    font-size: 13px;
    line-height: 1.7;
    font-weight: 750;
  }
  .event-roundup-sources ul {
    display: grid;
    gap: 8px;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }
  .event-roundup-sources li {
    display: grid;
    gap: 6px;
    padding: 10px 0;
    border-top: 1px solid #EEF2F6;
  }
  .event-roundup-sources span {
    color: #101828;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 850;
  }
  .event-roundup-sources a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: #071A4D !important;
    font-size: 13px;
    font-weight: 900;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .event-roundup-confirmed {
    margin-top: 14px !important;
    color: #667085 !important;
    font-size: 12px !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .event-card-action {
      transition: none;
    }
    .event-card-action:active {
      transform: none;
    }
    .event-list-official {
      transition: none;
    }
    .event-list-official:active {
      transform: none;
    }
  }
  .feature-pick-grid,
  .feature-tip-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .feature-table-scroll {
    overflow-x: auto;
    max-width: 100%;
    border: 1px solid #E6ECF5;
    border-radius: 16px;
  }
  .feature-table {
    width: 100%;
    min-width: 760px;
    border-collapse: collapse;
  }
  .feature-table th,
  .feature-table td {
    border-bottom: 1px solid #E6ECF5;
    padding: 11px 12px;
    text-align: left;
    vertical-align: top;
    font-size: 12px;
    line-height: 1.55;
  }
  .feature-table th {
    background: #F8FAFC;
    color: #071A4D;
    font-weight: 900;
    white-space: nowrap;
  }
  .feature-table td {
    color: #334155;
    font-weight: 750;
  }
  .feature-venue-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media (min-width: 720px) {
    .article-shell {
      width: min(100%, 980px);
    }
    .feature-hero {
      grid-template-columns: minmax(0, 0.9fr) minmax(300px, 1.1fr);
      align-items: stretch;
    }
    .feature-hero-media {
      min-height: 310px;
    }
    .feature-point-box {
      grid-template-columns: 170px minmax(0, 1fr);
      align-items: center;
    }
    .feature-pick-grid,
    .feature-tip-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
`;

const ADDRESS_SECTION_HEADINGS = new Set(['基本情報まとめ', '店舗情報']);
const ADDRESS_STOP_LABELS = new Set([
  '店名',
  'エリア',
  'オープン日',
  'オープン予定日',
  '予約開始日',
  '予約',
  '予約状況',
  'ジャンル',
  '場所',
  '住所',
  '所在地',
  'アクセス',
  '営業時間',
  '定休日',
  '休業日',
  '電話番号',
  '問い合わせ',
  '業態',
  '座席',
  '個室',
  '出店区分',
  '出店形態',
  '主な商品',
  '主な商品と価格',
  '主な提供予定',
  '価格の目安',
  '利用方法',
  'オープン企画',
  '実施期間',
  '情報出典',
]);

function cleanArticleText(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|tr|td|th|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#039;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function articleLines(html: string): string[] {
  return cleanArticleText(html)
    .split(/\r?\n/)
    .map((line) => line.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function isStopLabelLine(line: string): boolean {
  if (ADDRESS_STOP_LABELS.has(line) || line.startsWith('情報出典')) return true;
  for (const label of Array.from(ADDRESS_STOP_LABELS)) {
    if (line.startsWith(`${label} `) || line.startsWith(`${label}:`) || line.startsWith(`${label}：`)) return true;
  }
  return false;
}

function isAddressLike(value: string): boolean {
  const cleaned = value.trim();
  if (!cleaned || /^〒?\d{3}-?\d{4}$/.test(cleaned)) return false;
  return /(?:都|道|府|県|市|区|町|村|郡|丁目|\d)/.test(cleaned);
}

function normalizeAddress(value: string): string | undefined {
  const cleaned = value
    .replace(/^住所\s*[:：]?\s*/, '')
    .replace(/^所在地\s*[:：]?\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  return isAddressLike(cleaned) ? cleaned : undefined;
}

function extractLabeledTextFromContent(html: string, labels: string[]): string | undefined {
  const labelSet = new Set(labels);
  const lines = articleLines(html);
  let inTargetSection = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (ADDRESS_SECTION_HEADINGS.has(line)) {
      inTargetSection = true;
      continue;
    }
    if (!inTargetSection) continue;

    for (const label of labels) {
      if (!line.startsWith(label)) continue;
      const inlineValue = line.slice(label.length).trim();
      if (inlineValue) return inlineValue;
    }

    if (!labelSet.has(line)) continue;
    const values: string[] = [];
    for (let next = index + 1; next < lines.length; next += 1) {
      const nextLine = lines[next];
      if (isStopLabelLine(nextLine)) break;
      values.push(nextLine);
    }
    if (values.length > 0) return values.join(' ').trim();
  }

  return undefined;
}

function extractAddressFromContent(html: string): string | undefined {
  const value = extractLabeledTextFromContent(html, ['住所', '所在地']);
  return value ? normalizeAddress(value) : undefined;
}

function extractStoreNameFromContent(html: string): string | undefined {
  return extractLabeledTextFromContent(html, ['店名'])?.trim() || undefined;
}

function normalizeMapQueryText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function canRenderEventRoundup(experience?: ArticleExperienceData): boolean {
  const eventRoundup = experience?.eventRoundup;
  return Boolean(
    experience?.articleType === 'event_roundup' &&
    experience.relationship === 'editorial' &&
    eventRoundup?.articleType === 'event_roundup' &&
    eventRoundup.relationship === 'editorial' &&
    eventRoundup.items.length >= 2,
  );
}

function removeInlineEventRoundupList(html: string, eventRoundup: EventRoundupData): string {
  if (!eventRoundup.inlineListClassName) return html;
  if (eventRoundup.inlineListClassName === 'fireworks-card-list') {
    const legacyRemoved = removePost214InlineEventCardList(html);
    if (legacyRemoved !== html) return legacyRemoved;
  }
  const listNeedle = `class="${eventRoundup.inlineListClassName}"`;
  const listStart = html.indexOf(listNeedle);
  if (listStart < 0) return html;

  const headingOpen = html.lastIndexOf('<h2', listStart);
  const headingClose = headingOpen >= 0 ? html.indexOf('</h2>', headingOpen) : -1;
  const listOpen = html.lastIndexOf('<ul', listStart);
  const listClose = listOpen >= 0 ? html.indexOf('</ul>', listOpen) : -1;
  if (headingOpen < 0 || headingClose < 0 || listOpen < 0 || listClose < 0 || headingClose > listOpen) return html;

  return `${html.slice(0, headingOpen)}${html.slice(listClose + '</ul>'.length)}`;
}

function removePost214InlineEventCardList(html: string): string {
  const heading = '<h2>開催日順の花火大会カード</h2>';
  const headingStart = html.indexOf(heading);
  if (headingStart < 0) return html;

  const listStart = html.indexOf('<ul class="fireworks-card-list"', headingStart + heading.length);
  if (listStart < 0) return html;

  const listEnd = html.indexOf('</ul>', listStart);
  if (listEnd < 0) return html;

  return `${html.slice(0, headingStart)}${html.slice(listEnd + '</ul>'.length)}`;
}

function isNameOnlyGoogleMapsSearchUrl(mapUrl: string | undefined, names: Array<string | undefined>): boolean {
  if (!mapUrl) return false;
  try {
    const url = new URL(mapUrl);
    if (!url.hostname.includes('google.') || !url.pathname.includes('/maps/search')) return false;
    const query = normalizeMapQueryText(url.searchParams.get('query') ?? '');
    if (!query) return false;
    return names.some((name) => name && query === normalizeMapQueryText(name));
  } catch {
    return false;
  }
}

function hasContentHeading(html: string, headingText: string): boolean {
  const h2Pattern = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let match = h2Pattern.exec(html);
  while (match) {
    if (cleanArticleText(match[1]).trim().includes(headingText)) return true;
    match = h2Pattern.exec(html);
  }
  return false;
}

function isStructuredStoreArticle(contentHtml: string, layout: ArticleExperienceData['layout'] | undefined): boolean {
  if (layout !== 'store') return false;
  return hasContentHeading(contentHtml, '30秒でわかる') && hasContentHeading(contentHtml, '店舗情報');
}

function wrapImmediateHeadingList(html: string, headingText: string, className: string): string {
  const h2Pattern = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let match = h2Pattern.exec(html);

  while (match) {
    if (cleanArticleText(match[1]).trim().includes(headingText)) {
      const afterHeadingIndex = match.index + match[0].length;
      const afterHeading = html.slice(afterHeadingIndex);
      const listMatch = afterHeading.match(/^(\s*)(<ul\b[^>]*>[\s\S]*?<\/ul>)/i);

      if (!listMatch) return html;

      const wrappedEndIndex = afterHeadingIndex + listMatch[0].length;
      return [
        html.slice(0, match.index),
        `<section class="${className}">`,
        match[0],
        listMatch[1],
        listMatch[2],
        '</section>',
        html.slice(wrappedEndIndex),
      ].join('');
    }

    match = h2Pattern.exec(html);
  }

  return html;
}

function enhanceStructuredStoreContent(html: string): string {
  return wrapImmediateHeadingList(
    wrapImmediateHeadingList(html, '30秒でわかる', 'structured-summary-card'),
    'こんな人におすすめ',
    'structured-recommend-card',
  );
}

type Props = {
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  area?: string;
  tag: string;
  mapUrl?: string;
  mapUrlIsVerified?: boolean;
  officialUrl?: string;
  officialUrlIsVerified?: boolean;
  storeName?: string;
  address?: string;
  /** 本文から抽出した店舗情報(営業時間・定休日・価格帯など)。experience未定義のWP記事用 */
  extraShopInfo?: ShopInfoItem[];
  /** WP本文から自動抽出した要点。experience側の定義があればそちらを優先 */
  quickPoints?: string[];
  /** WP記事一覧から自動選定した関連記事。experience側の定義があればそちらを優先 */
  related?: ArticleRelated[];
  dateStr: string;
  articleId: string;
  postId: number;
  postLink: string;
  experience?: ArticleExperienceData;
  relationship?: ContentRelationshipResolution;
  suppressQuickSummary?: boolean;
};

export function ArticleExperience({
  title,
  excerpt,
  content,
  imageUrl,
  imageCredit,
  imageSourceUrl,
  area,
  tag,
  mapUrl,
  mapUrlIsVerified = false,
  officialUrl,
  officialUrlIsVerified = false,
  storeName,
  address,
  extraShopInfo,
  quickPoints: autoQuickPoints,
  related: autoRelated,
  dateStr,
  articleId,
  postId,
  experience,
  relationship,
  suppressQuickSummary = false,
}: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSaved({ id: articleId, type: 'article' }));
  }, [articleId]);

  const displayTitle = experience?.heroTitle ?? title;
  const displayLead = experience?.lead ?? excerpt;
  const effectiveImageUrl = imageUrl ?? experience?.visual?.imageUrl;
  const effectiveImageAlt = experience?.visual?.imageAlt ?? displayTitle;
  const effectiveImageCredit = imageCredit ?? experience?.visual?.imageCredit;
  const effectiveImageSourceUrl = imageSourceUrl ?? experience?.visual?.imageSourceUrl;
  const contentAddress = address ?? extractAddressFromContent(content);
  const contentStoreName = storeName ?? extractStoreNameFromContent(content);
  const generatedMapUrl = contentAddress
    ? buildGoogleMapsSearchUrl([contentStoreName ?? displayTitle, contentAddress].filter(Boolean).join(' '))
    : undefined;
  const propMapUrl = contentAddress || !isNameOnlyGoogleMapsSearchUrl(mapUrl, [contentStoreName, displayTitle])
    ? mapUrl
    : undefined;
  const effectiveMapUrl = propMapUrl ?? experience?.mapUrl ?? generatedMapUrl;
  const effectiveOfficialUrl = officialUrl ?? experience?.officialUrl;
  const verifiedStandardMapUrl = mapUrlIsVerified || Boolean(experience?.mapUrl) ? effectiveMapUrl : undefined;
  const verifiedStandardOfficialUrl = officialUrlIsVerified || Boolean(experience?.officialUrl) ? effectiveOfficialUrl : undefined;
  const badges = experience?.badges ?? [area, tag].filter(Boolean) as string[];
  const resolvedQuickPoints = experience?.quickPoints ?? autoQuickPoints ?? [];
  const quickPoints = suppressQuickSummary ? [] : resolvedQuickPoints;
  const highlightPoints = experience?.highlightPoints ?? [];
  const recommendedPoints = experience?.recommendedPoints ?? [];
  const recommendedFor = experience?.recommendedFor ?? [];
  const shopInfo = mergeShopInfo(experience?.shopInfo ?? [], { storeName: contentStoreName, area, address: contentAddress, tag }, extraShopInfo);
  const related = experience?.related ?? autoRelated ?? [];
  const layout = experience?.layout ?? 'store';
  const isGuideLayout = layout === 'guide';
  const isStructuredStore = isStructuredStoreArticle(content, layout);
  const structuredStoreContent = isStructuredStore ? enhanceStructuredStoreContent(content) : content;
  const shop = experience?.shop;
  const eventRoundup = canRenderEventRoundup(experience) ? experience?.eventRoundup : undefined;
  const eventRoundupAfterHero = eventRoundup && (eventRoundup.placement ?? 'afterHero') === 'afterHero'
    ? eventRoundup
    : undefined;
  const eventRoundupAfterQuickPoints = eventRoundup?.placement === 'afterQuickPoints' ? eventRoundup : undefined;
  const displayContent = eventRoundup
    ? removeInlineEventRoundupList(content, eventRoundup)
    : content;
  const isStandardEditorial =
    relationship?.relationship === 'editorial' &&
    relationship.displayableOnRedesignedSurfaces &&
    layout === 'store' &&
    !eventRoundup &&
    !isStructuredStore;
  const standardDecisionItems = buildStandardEditorialDecisionItems({
    storeName: contentStoreName,
    area,
    tag,
    address: contentAddress,
    mapUrl: effectiveMapUrl,
  });

  const handleMapClick = useCallback(() => {
    if (!effectiveMapUrl) return;
    trackGa4Event('map_click', {
      article_id: articleId,
      article_title: displayTitle,
      map_url: effectiveMapUrl,
    });
  }, [articleId, displayTitle, effectiveMapUrl]);

  const handleSave = useCallback(() => {
    const result = toggleSavedItem({
      id: articleId,
      type: 'article',
      title: displayTitle,
      area: area ?? undefined,
      imageUrl: effectiveImageUrl ?? undefined,
      articleUrl: `/article/${postId}`,
      mapUrl: effectiveMapUrl ?? undefined,
    });
    setSaved(result.saved);
  }, [articleId, displayTitle, area, effectiveImageUrl, postId, effectiveMapUrl]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: displayTitle, url: window.location.href });
      } catch {
        // Share sheet dismissed.
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        // Ignore clipboard failures.
      }
    }
  }, [displayTitle]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isStandardEditorial) {
    return (
      <StandardEditorialArticleExperience
        title={displayTitle}
        lead={displayLead}
        content={displayContent}
        imageUrl={effectiveImageUrl}
        imageAlt={effectiveImageAlt}
        imageCredit={effectiveImageCredit}
        imageSourceUrl={effectiveImageSourceUrl}
        badges={badges}
        quickPoints={resolvedQuickPoints.slice(0, 3)}
        decisionItems={standardDecisionItems}
        dateStr={dateStr}
        mapUrl={verifiedStandardMapUrl}
        officialUrl={verifiedStandardOfficialUrl}
        related={related}
        saved={saved}
        onSave={handleSave}
        onShare={handleShare}
        onMapClick={handleMapClick}
      />
    );
  }

  if (layout === 'feature' && experience?.feature) {
    return (
      <FeatureArticleExperience
        title={displayTitle}
        lead={displayLead}
        dateStr={dateStr}
        imageUrl={effectiveImageUrl}
        imageAlt={effectiveImageAlt}
        mapUrl={effectiveMapUrl}
        onMapClick={handleMapClick}
        related={related}
        feature={experience.feature}
        saved={saved}
        onSave={handleSave}
        onShare={handleShare}
        onTop={scrollToTop}
      />
    );
  }

  if (layout === 'news' && experience?.news) {
    return (
      <NewsArticleExperience
        title={displayTitle}
        lead={displayLead}
        dateStr={dateStr}
        imageUrl={effectiveImageUrl}
        imageAlt={effectiveImageAlt}
        mapUrl={effectiveMapUrl}
        onMapClick={handleMapClick}
        related={related}
        news={experience.news}
        saved={saved}
        onSave={handleSave}
        onShare={handleShare}
        onTop={scrollToTop}
      />
    );
  }

  return (
    <main className="article-page">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="article-shell">
        <ArticleHeader mapUrl={effectiveMapUrl} onMapClick={handleMapClick} />

        <section style={{ padding: isStructuredStore ? '12px 10px 0' : '12px 14px 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 14,
            background: '#fff',
            border: '1px solid #E6ECF5',
            borderRadius: 26,
            padding: 14,
            boxShadow: '0 12px 34px rgba(7,26,77,0.08)',
          }}>
            <div style={{ padding: '4px 2px 0' }}>
              <BadgeRow badges={badges} />
              <h1 style={{
                margin: '14px 0 0',
                color: '#071A4D',
                fontSize: isStructuredStore ? 'clamp(21px, 5.7vw, 40px)' : 'clamp(25px, 7.2vw, 42px)',
                lineHeight: isStructuredStore ? 1.18 : 1.25,
                fontWeight: 900,
                letterSpacing: '0',
                wordBreak: 'normal',
                overflowWrap: 'anywhere',
                textWrap: 'pretty',
              }}>
                <PhraseTitle title={displayTitle} />
              </h1>
              {displayLead && (
                <p style={{
                  margin: '12px 0 0',
                  color: '#334155',
                  fontSize: 14,
                  lineHeight: 1.8,
                  fontWeight: 700,
                  wordBreak: 'normal',
                  overflowWrap: 'anywhere',
                  textWrap: 'pretty',
                }}>
                  {displayLead}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 15 }}>
                <div>
                  <p style={{ margin: 0, color: '#071A4D', fontSize: 12, fontWeight: 900 }}>なごとしゃ編集部</p>
                  <p style={{ margin: '2px 0 0', color: '#667085', fontSize: 11, fontWeight: 700 }}>{dateStr} 更新</p>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 999,
                  border: '1px solid rgba(232,72,63,0.18)',
                  background: '#FFF0EF',
                  color: '#E8483F',
                  padding: '7px 11px',
                  fontSize: 12,
                  fontWeight: 900,
                }}>
                  <BookmarkIcon filled={saved} />
                  <span>保存</span>
                </div>
              </div>
            </div>

            <HeroVisual
              imageUrl={effectiveImageUrl}
              imageAlt={effectiveImageAlt}
              imageCredit={effectiveImageCredit}
              imageSourceUrl={effectiveImageSourceUrl}
              openDate={shop?.openDate}
              fit={isStructuredStore ? 'contain' : 'cover'}
            />
          </div>
        </section>

        <ActionButtons
          saved={saved}
          onSave={handleSave}
          onShare={handleShare}
          mapUrl={effectiveMapUrl}
          onMapClick={handleMapClick}
        />

        {eventRoundupAfterHero && (
          <EventRoundupSection
            data={eventRoundupAfterHero}
            articleId={postId}
          />
        )}

        {isGuideLayout ? (
          <>
            {quickPoints.length > 0 && (
              <SectionCard title="30秒でわかる要点" icon={<ClockIcon />} accent="yellow">
                <div style={{ display: 'grid', gap: 11 }}>
                  {quickPoints.map((point) => (
                    <SimplePoint key={point}>{point}</SimplePoint>
                  ))}
                </div>
              </SectionCard>
            )}

            {eventRoundupAfterQuickPoints && (
              <EventRoundupSection
                data={eventRoundupAfterQuickPoints}
                articleId={postId}
              />
            )}

            {highlightPoints.length > 0 && (
              <SectionCard title={experience?.highlightTitle ?? 'シーン別おすすめ4選'} icon={<SparkIcon />}>
                <div style={{ display: 'grid', gap: 10 }}>
                  {highlightPoints.map((point, index) => (
                    <PointBlock key={point.title} point={point} index={index} tone="red" />
                  ))}
                </div>
              </SectionCard>
            )}

            {recommendedPoints.length > 0 && (
              <SectionCard title={experience?.recommendedTitle ?? '買う前チェックリスト'} icon={<CheckIcon />}>
                <div style={{ display: 'grid', gap: 11 }}>
                  {recommendedPoints.map((point) => (
                    <SimplePoint key={point.title}>
                      <strong>{point.title}</strong>
                      {point.description ? `: ${point.description}` : ''}
                    </SimplePoint>
                  ))}
                </div>
              </SectionCard>
            )}

            {recommendedFor.length > 0 && (
              <SectionCard title={experience?.recommendedForTitle ?? '掲載情報について'} accent="yellow">
                <div style={{ display: 'grid', gap: 11 }}>
                  {recommendedFor.map((item) => (
                    <SimplePoint key={item}>{item}</SimplePoint>
                  ))}
                </div>
              </SectionCard>
            )}

            {displayContent && (
              <GuideBody>
                <div className="article-body" dangerouslySetInnerHTML={{ __html: displayContent }} />
              </GuideBody>
            )}

            {related.length > 0 && (
              <RelatedSection related={related} />
            )}

            <BackToArticlesLink />
          </>
        ) : isStructuredStore ? (
          <>
            {structuredStoreContent && (
              <section className="structured-store-content">
                <div className="article-body" dangerouslySetInnerHTML={{ __html: structuredStoreContent }} />
              </section>
            )}

            {related.length > 0 && (
              <RelatedSection related={related} />
            )}

            <BackToArticlesLink />
          </>
        ) : (
          <>

        {!suppressQuickSummary && shop?.quickCards && shop.quickCards.length > 0 ? (
          <SectionCard title="30秒でわかる要点" icon={<ClockIcon />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {shop.quickCards.map((card) => (
                <div key={card.title} style={{ borderRadius: 14, border: '1px solid #E6ECF5', background: '#FBFCFE', padding: '12px 12px' }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#FFF0EF', color: '#C6252D', display: 'grid', placeItems: 'center' }}>
                    <QuickCardIcon kind={card.icon} />
                  </span>
                  <p style={{ margin: '8px 0 0', color: '#071A4D', fontSize: 13, lineHeight: 1.45, fontWeight: 900 }}>{card.title}</p>
                  <p style={{ margin: '4px 0 0', color: '#667085', fontSize: 11, lineHeight: 1.6, fontWeight: 750 }}>{card.body}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : quickPoints.length > 0 && (
          <SectionCard title="30秒でわかるポイント" icon={<ClockIcon />}>
            <div style={{ display: 'grid', gap: 11 }}>
              {quickPoints.map((point) => (
                <SimplePoint key={point}>{point}</SimplePoint>
              ))}
            </div>
          </SectionCard>
        )}

        {highlightPoints.length > 0 && (
          <SectionCard title="注目ポイント" accent="yellow">
            <div style={{ display: 'grid', gap: 10 }}>
              {highlightPoints.map((point, index) => (
                <PointBlock key={point.title} point={point} index={index} tone="red" />
              ))}
            </div>
          </SectionCard>
        )}

        {(experience?.introTitle || experience?.introBody) && (
          <SectionCard title={experience.introTitle ?? ''}>
            <p style={{ margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.9, fontWeight: 650, textWrap: 'pretty' }}>
              {experience.introBody}
            </p>
          </SectionCard>
        )}

        {recommendedPoints.length > 0 && (
          <SectionCard title="おすすめポイント" icon={<SparkIcon />}>
            <div style={{ display: 'grid', gap: 10 }}>
              {recommendedPoints.map((point, index) => (
                <PointBlock key={point.title} point={point} index={index} tone="navy" />
              ))}
            </div>
          </SectionCard>
        )}

        <SectionCard title="写真で見る" icon={<CameraIcon />}>
          <PhotoStrip imageUrl={effectiveImageUrl} title={displayTitle} />
        </SectionCard>

        <ExternalVisualSection visuals={experience?.externalVisuals} />

        {recommendedFor.length > 0 && (
          <SectionCard title="こんな人におすすめ" accent="yellow">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {recommendedFor.map((item) => (
                <SimplePoint key={item}>{item}</SimplePoint>
              ))}
            </div>
          </SectionCard>
        )}

        {shopInfo.length > 0 && (
          <SectionCard title="店舗情報" icon={<ShopIcon />}>
            <InfoGrid items={shopInfo} />
            {shop?.source && (
              <p style={{ margin: '12px 0 0', color: '#667085', fontSize: 11, lineHeight: 1.7, fontWeight: 750 }}>情報出典: {shop.source}</p>
            )}
            {shop?.imageCredit && (
              <p style={{ margin: '4px 0 0', color: '#667085', fontSize: 11, lineHeight: 1.7, fontWeight: 750 }}>画像出典: {shop.imageCredit}</p>
            )}
          </SectionCard>
        )}

        {shop?.galleryImages && shop.galleryImages.length > 0 && (
          <SectionCard title="お店の雰囲気" icon={<CameraIcon />}>
            <div className="feature-horizontal">
              {shop.galleryImages.map((image) => (
                <figure key={image.url} style={{ margin: 0, width: 216, flexShrink: 0, borderRadius: 14, overflow: 'hidden', border: '1px solid #E6ECF5', background: '#fff' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={shop.name} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                  <figcaption style={{ padding: '7px 9px 8px', color: '#667085', fontSize: 10, lineHeight: 1.5, fontWeight: 750 }}>
                    画像出典: {image.credit}
                  </figcaption>
                </figure>
              ))}
            </div>
          </SectionCard>
        )}

        {effectiveMapUrl && (
          <section style={{ padding: '0 14px', marginTop: 14 }}>
            <a href={effectiveMapUrl} target="_blank" rel="noopener noreferrer" onClick={handleMapClick} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              minHeight: 56,
              borderRadius: 16,
              border: '1px solid #FFD6D2',
              background: '#fff',
              color: '#C6252D',
              padding: '12px 14px',
              textDecoration: 'none',
              boxShadow: '0 6px 18px rgba(198,37,45,0.08)',
            }}>
              <GoogleMapButtonContent />
              <span style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#FFF0EF',
                color: '#C6252D',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}>
                <ChevronRightIcon color="#C6252D" />
              </span>
            </a>
          </section>
        )}

        {related.length > 0 && (
          <RelatedSection related={related} />
        )}

        {effectiveOfficialUrl && (
          <section style={{ padding: '0 14px', marginTop: 14 }}>
            <a href={effectiveOfficialUrl} target="_blank" rel="noopener noreferrer" style={secondaryLinkStyle}>
              公式情報を見る
              <ExternalIcon />
            </a>
          </section>
        )}

        {displayContent && (
          <SectionCard title="本文">
            <div className="article-body" dangerouslySetInnerHTML={{ __html: displayContent }} />
          </SectionCard>
        )}

        <BackToArticlesLink />
          </>
        )}
      </div>

      <BottomCTA
        saved={saved}
        onSave={handleSave}
        mapUrl={effectiveMapUrl}
        onMapClick={handleMapClick}
        onTop={scrollToTop}
      />
    </main>
  );
}

function buildStandardEditorialDecisionItems({
  storeName,
  area,
  tag,
  address,
  mapUrl,
}: {
  storeName?: string;
  area?: string;
  tag?: string;
  address?: string;
  mapUrl?: string;
}): ShopInfoItem[] {
  return [
    storeName ? { label: '名前', value: storeName } : undefined,
    area ? { label: 'エリア', value: area } : undefined,
    tag ? { label: 'ジャンル', value: tag } : undefined,
    address ? { label: '場所', value: address } : undefined,
    !address && mapUrl ? { label: '地図', value: 'Googleマップで確認できます' } : undefined,
  ].filter(Boolean).slice(0, 4) as ShopInfoItem[];
}

function removeInlineQuickSummarySection(html: string): string {
  return html.replace(
    /<h[23][^>]*>\s*まず3行でわかる\s*<\/h[23]>\s*(?:<ul[^>]*>[\s\S]*?<\/ul>|<p[^>]*>[\s\S]*?<\/p>)/,
    '',
  );
}

function removeUnverifiedArticleImages(html: string): string {
  return html
    .replace(/<figure\b[^>]*>[\s\S]*?<img\b[\s\S]*?<\/figure>/gi, '')
    .replace(/<p\b[^>]*>\s*<img\b[\s\S]*?<\/p>/gi, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<figure\b[^>]*>\s*(?:<figcaption\b[^>]*>\s*<\/figcaption>\s*)?<\/figure>/gi, '');
}

function splitStandardEditorialSources(html: string): { bodyContent: string; sourceContent?: string } {
  const sourceHeadingRe = /<h[23][^>]*>\s*(?:画像・情報出典|情報出典|出典)\s*<\/h[23]>/;
  const match = sourceHeadingRe.exec(html);
  if (!match || match.index < 0) return { bodyContent: html };

  return {
    bodyContent: html.slice(0, match.index).trim(),
    sourceContent: html
      .slice(match.index + match[0].length)
      .replace(/<p\b[^>]*>\s*公開日：[^<]*<\/p>/g, '')
      .trim(),
  };
}

function formatStandardSourceLinks(html: string): string {
  return html.replace(/<a\b([^>]*\bhref=(["'])(.*?)\2[^>]*)>[\s\S]*?<\/a>/gi, (anchor, attrs, _quote, href) => {
    let label: string | undefined;
    if (href.includes('hilton.com/ja/hotels/ngocici-conrad-nagoya')) {
      label = '公式ページを開く';
    } else if (href.includes('prtimes.jp/main/html/rd/p/000000005.000179859.html')) {
      label = 'PR TIMESを開く';
    }
    return label ? `<a${attrs}>${label}</a>` : anchor;
  });
}

function getPlainTextLength(html: string): number {
  return cleanArticleText(html).replace(/\s+/g, '').length;
}

function StandardEditorialArticleExperience({
  title,
  lead,
  content,
  imageUrl,
  imageAlt,
  imageCredit,
  imageSourceUrl,
  badges,
  quickPoints,
  decisionItems,
  dateStr,
  mapUrl,
  officialUrl,
  related,
  saved,
  onSave,
  onShare,
  onMapClick,
}: {
  title: string;
  lead: string;
  content: string;
  imageUrl?: string;
  imageAlt: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  badges: string[];
  quickPoints: string[];
  decisionItems: ShopInfoItem[];
  dateStr: string;
  mapUrl?: string;
  officialUrl?: string;
  related: ArticleRelated[];
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onMapClick?: () => void;
}) {
  const summaryPoints = quickPoints.filter((point) => point.trim().length > 0).slice(0, 3);
  const cleanedContent = removeUnverifiedArticleImages(removeInlineQuickSummarySection(content));
  const { bodyContent, sourceContent } = splitStandardEditorialSources(cleanedContent);
  const displaySourceContent = sourceContent ? formatStandardSourceLinks(sourceContent) : undefined;
  const bodyTextLength = getPlainTextLength(bodyContent);
  const showSummary = summaryPoints.length >= 2 && (decisionItems.length >= 3 || bodyTextLength >= 1200);
  const hasSources = Boolean(displaySourceContent || imageCredit);
  const canShowHeroImage = Boolean(imageUrl && imageAlt && imageCredit && imageSourceUrl);

  return (
    <main className="article-page standard-editorial">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="article-shell">
        <ArticleHeader />

        <article style={{ padding: '16px 20px 0' }}>
          <section style={{ display: 'grid', gap: 14 }}>
            <nav aria-label="パンくず" style={{ color: '#5B6577', fontSize: 12, lineHeight: 1.4, fontWeight: 850 }}>
              <Link href="/" style={{ color: '#5B6577', textDecoration: 'none' }}>ホーム</Link>
              <span aria-hidden="true"> / </span>
              <Link href="/new" style={{ color: '#5B6577', textDecoration: 'none' }}>新着記事</Link>
            </nav>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <span style={standardIdentityBadgeStyle}>編集部企画</span>
                {badges.slice(0, 2).map((badge) => (
                  <span key={badge} style={standardMetaBadgeStyle}>{badge}</span>
                ))}
              </div>
              <p style={{ margin: 0, color: '#5B6577', fontSize: 12, lineHeight: 1.65, fontWeight: 750 }}>
                なごとしゃ編集部が企画・編集した記事です。PR・運営関係の記事ではありません。
              </p>
              {dateStr && (
                <p style={{ margin: 0, color: '#5B6577', fontSize: 12, lineHeight: 1.4, fontWeight: 800 }}>
                  公開日：{dateStr}
                </p>
              )}
            </div>

            <div>
              <h1 style={{
                margin: 0,
                color: '#071A4D',
                fontSize: 'clamp(26px, 7vw, 40px)',
                lineHeight: 1.22,
                fontWeight: 950,
                letterSpacing: 0,
                wordBreak: 'normal',
                overflowWrap: 'anywhere',
                textWrap: 'pretty',
              }}>
                <PhraseTitle title={title} />
              </h1>
              {lead && (
                <p style={{
                  margin: '12px 0 0',
                  color: '#334155',
                  fontSize: 15,
                  lineHeight: 1.8,
                  fontWeight: 700,
                  textWrap: 'pretty',
                }}>
                  {lead}
                </p>
              )}
            </div>
          </section>
        </article>

        <StandardSaveShareActions saved={saved} onSave={onSave} onShare={onShare} />

        {canShowHeroImage && (
          <section style={{ padding: '14px 20px 0' }}>
            <figure style={{ margin: 0, overflow: 'hidden', borderRadius: 16, background: '#fff', border: '1px solid #E6ECF5', boxShadow: '0 10px 24px rgba(7,26,77,0.07)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={imageAlt} style={{ width: '100%', aspectRatio: '3 / 2', objectFit: 'cover', display: 'block' }} />
              <figcaption style={{ padding: '8px 12px 10px', color: '#5B6577', fontSize: 11, lineHeight: 1.55, fontWeight: 750 }}>
                <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#5B6577', textDecoration: 'underline' }}>画像出典：{imageCredit}</a>
              </figcaption>
            </figure>
          </section>
        )}

        {showSummary && (
          <section style={{ padding: '0 20px', marginTop: 28 }}>
            <div style={standardCardStyle}>
              <h2 style={standardSectionTitleStyle}>30秒でわかる</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {summaryPoints.map((point) => (
                  <SimplePoint key={point}>{point}</SimplePoint>
                ))}
              </div>
            </div>
          </section>
        )}

        {decisionItems.length > 0 && (
          <section style={{ padding: '0 20px', marginTop: 28 }}>
            <div style={standardCardStyle}>
              <h2 style={standardSectionTitleStyle}>行く前の判断情報</h2>
              <InfoGrid items={decisionItems} />
            </div>
          </section>
        )}

        {mapUrl && (
          <section style={{ padding: '0 20px', marginTop: 18 }}>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={onMapClick} style={standardPrimaryActionStyle}>
              <MapPinIcon color="#fff" />
              Googleマップで場所を見る
            </a>
          </section>
        )}

        {officialUrl && (
          <section style={{ padding: '0 20px', marginTop: 10 }}>
            <a href={officialUrl} target="_blank" rel="noopener noreferrer" style={standardSecondaryActionStyle}>
              公式情報を見る
              <ExternalIcon />
            </a>
          </section>
        )}

        {bodyContent && (
          <section style={{ padding: '0 20px', marginTop: 28 }}>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: bodyContent }} />
          </section>
        )}

        {hasSources && (
          <section style={{ padding: '0 20px', marginTop: 28 }}>
            <div style={{ ...standardCardStyle, boxShadow: 'none' }}>
              <h2 style={standardSectionTitleStyle}>出典</h2>
              {displaySourceContent && (
                <div className="article-body standard-source-body" style={{ fontSize: 13, lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: displaySourceContent }} />
              )}
              <div style={{ display: 'grid', gap: 6, color: '#5B6577', fontSize: 12, lineHeight: 1.7, fontWeight: 750 }}>
                {imageCredit && <p style={{ margin: 0 }}>画像出典：{imageCredit}</p>}
              </div>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <RelatedSection related={related.slice(0, 3)} />
        )}

        <BackToArticlesLink />
      </div>

    </main>
  );
}

function StandardSaveShareActions({ saved, onSave, onShare }: { saved: boolean; onSave: () => void; onShare: () => void }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 20px 0' }}>
      <button type="button" onClick={onSave} aria-pressed={saved} style={standardSecondaryButtonStyle}>
        <BookmarkIcon filled={saved} />
        {saved ? '保存済み' : '保存する'}
      </button>
      <button type="button" onClick={onShare} style={standardSecondaryButtonStyle}>
        <ShareIcon />
        シェア
      </button>
    </section>
  );
}

const standardCardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid #E6ECF5',
  background: '#fff',
  padding: 16,
  boxShadow: '0 8px 22px rgba(7,26,77,0.06)',
};

const standardSectionTitleStyle: React.CSSProperties = {
  margin: '0 0 12px',
  color: '#071A4D',
  fontSize: 18,
  lineHeight: 1.4,
  fontWeight: 950,
  letterSpacing: 0,
};

const standardIdentityBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 28,
  borderRadius: 999,
  padding: '0 12px',
  background: '#071A4D',
  color: '#fff',
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 900,
};

const standardMetaBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 28,
  borderRadius: 999,
  padding: '0 11px',
  border: '1px solid #E6ECF5',
  background: '#fff',
  color: '#5B6577',
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 850,
};

const standardSecondaryButtonStyle: React.CSSProperties = {
  minWidth: 0,
  height: 48,
  borderRadius: 14,
  border: '1px solid #D8E0EC',
  background: '#fff',
  color: '#071A4D',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  fontSize: 13,
  fontWeight: 900,
  boxShadow: '0 5px 14px rgba(7,26,77,0.05)',
  cursor: 'pointer',
};

const standardPrimaryActionStyle: React.CSSProperties = {
  minHeight: 52,
  borderRadius: 14,
  background: '#071A4D',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '0 16px',
  fontSize: 14,
  lineHeight: 1,
  fontWeight: 950,
  textDecoration: 'none',
  boxShadow: '0 10px 24px rgba(7,26,77,0.18)',
};

const standardSecondaryActionStyle: React.CSSProperties = {
  minHeight: 44,
  borderRadius: 14,
  border: '1px solid #D8E0EC',
  background: '#fff',
  color: '#071A4D',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '0 14px',
  fontSize: 13,
  fontWeight: 900,
  textDecoration: 'none',
};

function FeatureArticleExperience({
  title,
  lead,
  dateStr,
  imageUrl,
  imageAlt,
  mapUrl,
  related,
  feature,
  saved,
  onSave,
  onShare,
  onTop,
  onMapClick,
}: {
  title: string;
  lead: string;
  dateStr: string;
  imageUrl?: string;
  imageAlt: string;
  mapUrl?: string;
  onMapClick?: () => void;
  related: ArticleRelated[];
  feature: FeatureArticleData;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onTop: () => void;
}) {
  return (
    <main className="article-page">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="article-shell">
        <ArticleHeader mapUrl={mapUrl} onMapClick={onMapClick} />
        <article className="feature-article">
          <FeatureBreadcrumb items={feature.breadcrumb} />

          <section className="feature-card feature-section" style={{ padding: 16 }}>
            <div className="feature-hero">
              <div style={{ minWidth: 0, padding: '4px 0' }}>
                <BadgeRow badges={feature.eyebrow.split('/').map((item) => item.trim())} />
                <h1 style={{
                  margin: '16px 0 0',
                  color: '#071A4D',
                  fontSize: 'clamp(24px, 6.3vw, 42px)',
                  lineHeight: 1.24,
                  fontWeight: 900,
                  letterSpacing: 0,
                  textWrap: 'pretty',
                  maxWidth: '100%',
                }}>
                  <PhraseTitle title={title} />
                </h1>
                <p style={{ margin: '14px 0 0', color: '#334155', fontSize: 15, lineHeight: 1.85, fontWeight: 750, textWrap: 'pretty' }}>
                  {lead}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                  <EditorMark />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: '#071A4D', fontSize: 13, fontWeight: 900 }}>なごとしゃ編集部</p>
                    <p style={{ margin: '3px 0 0', color: '#667085', fontSize: 12, fontWeight: 800 }}>{feature.updatedLabel || dateStr} 更新</p>
                  </div>
                </div>
              </div>
              <FeatureHeroMedia imageUrl={imageUrl} imageAlt={imageAlt} caption={feature.imageCaption} />
            </div>
          </section>

          <ActionButtons saved={saved} onSave={onSave} onShare={onShare} mapUrl={mapUrl} onMapClick={onMapClick} />

          <FeatureQuickJump count={feature.venues.length} />

          <section className="feature-card feature-section" style={{ padding: 18, background: 'linear-gradient(135deg, #FFFDF8 0%, #FFF7D8 100%)', borderColor: '#F6E1A2' }}>
            <div className="feature-point-box">
              <div style={{ borderRight: '1px solid rgba(7,26,77,0.12)', paddingRight: 14 }}>
                <p style={{ margin: 0, color: '#C6252D', fontSize: 34, lineHeight: 1, fontWeight: 900 }}>30</p>
                <p style={{ margin: '6px 0 0', color: '#071A4D', fontSize: 14, lineHeight: 1.55, fontWeight: 900 }}>秒でわかる<br />ポイント</p>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {feature.points.map((point) => (
                  <FeatureCheckLine key={point}>{point}</FeatureCheckLine>
                ))}
              </div>
            </div>
          </section>

          <FeatureSectionTitle title="この記事はこんな人向け" icon={<UsersIcon />} />
          <div className="feature-horizontal" aria-label="この記事はこんな人向け">
            {feature.audience.map((item) => (
              <span key={item} style={featureChipStyle}>{item}</span>
            ))}
          </div>

          <FeatureSectionTitle title="まずこれを見ればOK：おすすめ3選" icon={<CrownIcon />} />
          <div className="feature-pick-grid">
            {feature.picks.map((pick, index) => (
              <FeaturePickCard key={pick.name} pick={pick} index={index} />
            ))}
          </div>

          <FeatureSectionTitle title="比較しやすい一覧表" icon={<TableIcon />} />
          <FeatureComparisonTable venues={feature.venues} />

          <FeatureSectionTitle title="地図で見る" icon={<MapPinIcon />} />
          <FeatureMapPanel venues={feature.venues} mapUrl={mapUrl} />

          <FeatureSectionTitle title="編集部の見方 / 選び方のコツ" icon={<PenIcon />} />
          <div className="feature-tip-grid">
            {feature.tips.map((tip, index) => (
              <FeatureTipCard key={tip.title} tip={tip} index={index} />
            ))}
          </div>

          <FeatureSectionTitle title="各会場詳細" icon={<ShopIcon />} />
          <div className="feature-venue-grid">
            {feature.venues.map((venue) => (
              <FeatureVenueCard key={venue.name} venue={venue} />
            ))}
          </div>

          <FeatureSourceBox notes={feature.sourceNotes} />

          {related.length > 0 && <RelatedSection related={related} />}

          <section className="feature-card feature-section" style={{ padding: 18, background: 'linear-gradient(135deg, #FFFDF8 0%, #FFF7D8 100%)', borderColor: '#F6E1A2' }}>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <h2 style={{ margin: 0, color: '#071A4D', fontSize: 18, lineHeight: 1.45, fontWeight: 900 }}>{feature.ctaTitle}</h2>
                <p style={{ margin: '8px 0 0', color: '#475467', fontSize: 13, lineHeight: 1.75, fontWeight: 750 }}>{feature.ctaBody}</p>
              </div>
              <Link href={feature.ctaHref} style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 46,
                borderRadius: 999,
                background: '#C6252D',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 900,
                padding: '0 18px',
              }}>
                {feature.ctaLabel}
                <ChevronRightIcon color="#fff" />
              </Link>
            </div>
          </section>
        </article>
      </div>

      <BottomCTA saved={saved} onSave={onSave} mapUrl={mapUrl} onMapClick={onMapClick} onTop={onTop} />
    </main>
  );
}

function NewsArticleExperience({
  title,
  lead,
  dateStr,
  imageUrl,
  imageAlt,
  mapUrl,
  related,
  news,
  saved,
  onSave,
  onShare,
  onTop,
  onMapClick,
}: {
  title: string;
  lead: string;
  dateStr: string;
  imageUrl?: string;
  imageAlt: string;
  mapUrl?: string;
  onMapClick?: () => void;
  related: ArticleRelated[];
  news: NewsArticleData;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onTop: () => void;
}) {
  return (
    <main className="article-page">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="article-shell">
        <ArticleHeader mapUrl={mapUrl} onMapClick={onMapClick} />
        <article className="feature-article">
          <FeatureBreadcrumb items={news.breadcrumb} />

          <section className="feature-card feature-section" style={{ padding: 16 }}>
            <div className="feature-hero">
              <div style={{ minWidth: 0, padding: '4px 0' }}>
                <BadgeRow badges={news.eyebrow.split('/').map((item) => item.trim())} />
                <h1 style={{
                  margin: '16px 0 0',
                  color: '#071A4D',
                  fontSize: 'clamp(24px, 6.2vw, 40px)',
                  lineHeight: 1.25,
                  fontWeight: 900,
                  letterSpacing: 0,
                  textWrap: 'pretty',
                }}>
                  <PhraseTitle title={title} />
                </h1>
                <p style={{ margin: '14px 0 0', color: '#334155', fontSize: 15, lineHeight: 1.85, fontWeight: 750, textWrap: 'pretty' }}>
                  {lead}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                  <EditorMark />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: '#071A4D', fontSize: 13, fontWeight: 900 }}>なごとしゃ編集部</p>
                    <p style={{ margin: '3px 0 0', color: '#667085', fontSize: 12, fontWeight: 800 }}>{news.updatedLabel || dateStr} 更新</p>
                  </div>
                </div>
              </div>
              <FeatureHeroMedia imageUrl={imageUrl} imageAlt={imageAlt} caption={news.imageCaption} />
            </div>
          </section>

          <ActionButtons saved={saved} onSave={onSave} onShare={onShare} mapUrl={mapUrl} onMapClick={onMapClick} />

          <a
            href={mapUrl || '#news-map'}
            target={mapUrl ? '_blank' : undefined}
            rel={mapUrl ? 'noopener noreferrer' : undefined}
            className="feature-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 14,
              padding: '13px 16px',
              textDecoration: 'none',
              background: '#071A4D',
              border: '1px solid #071A4D',
            }}
          >
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', color: '#F8C861', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <ClockIcon />
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: 'block', color: '#F8C861', fontSize: 11, fontWeight: 900, letterSpacing: '0.04em' }}>{news.quickJumpLabel}</span>
              <span style={{ display: 'block', color: '#fff', fontSize: 14, lineHeight: 1.5, fontWeight: 900, marginTop: 3 }}>{news.quickJumpText}</span>
            </span>
            <ChevronRightIcon color="#fff" />
          </a>

          <section className="feature-card feature-section" style={{ padding: 18, background: 'linear-gradient(135deg, #FFFDF8 0%, #FFF7D8 100%)', borderColor: '#F6E1A2' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <p style={{ margin: 0, color: '#C6252D', fontSize: 30, lineHeight: 1, fontWeight: 900 }}>30</p>
              <p style={{ margin: 0, color: '#071A4D', fontSize: 14, fontWeight: 900 }}>秒でわかる要点</p>
            </div>
            <div className="feature-horizontal" style={{ marginTop: 12 }}>
              {news.points.map((point, index) => (
                <article key={point} style={{ width: 212, flexShrink: 0, background: '#fff', border: '1px solid #F6E1A2', borderRadius: 14, padding: '12px 14px', boxShadow: '0 4px 12px rgba(7,26,77,0.05)' }}>
                  <p style={{ margin: 0, color: '#C6252D', fontSize: 12, fontWeight: 900, letterSpacing: '0.08em' }}>{String(index + 1).padStart(2, '0')}</p>
                  <p style={{ margin: '7px 0 0', color: '#071A4D', fontSize: 13, lineHeight: 1.65, fontWeight: 900, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{point}</p>
                </article>
              ))}
            </div>
          </section>

          <FeatureSectionTitle title={news.spotsTitle ?? `今日見るべき新店${news.spots.length}選`} icon={<ShopIcon />} />
          {news.purposeChips && news.purposeChips.length > 0 && (
            <section className="feature-card" style={{ padding: 14, marginBottom: 12, background: '#FFFDF8', borderColor: '#F6E1A2' }}>
              <p style={{ margin: '0 0 10px', color: '#071A4D', fontSize: 13, lineHeight: 1.5, fontWeight: 900 }}>目的別に見る</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {news.purposeChips.map((chip) => (
                  <span key={chip} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: 30,
                    borderRadius: 999,
                    border: '1px solid #E6ECF5',
                    background: '#fff',
                    color: '#071A4D',
                    padding: '0 11px',
                    fontSize: 12,
                    fontWeight: 900,
                  }}>
                    {chip}
                  </span>
                ))}
              </div>
            </section>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {news.spots.map((spot, index) => (
              <NewsSpotCard key={spot.name} spot={spot} index={index} />
            ))}
          </div>

          <FeatureSectionTitle title={news.comparisonTitle ?? '比較しやすい一覧表'} icon={<TableIcon />} />
          <NewsComparisonTable spots={news.spots} />

          <FeatureSectionTitle title={news.mapTitle ?? '地図でまとめて見る'} icon={<MapPinIcon />} />
          <NewsMapPanel spots={news.spots} mapUrl={mapUrl} />

          <FeatureSectionTitle title="編集部の見方" icon={<PenIcon />} />
          <div className="feature-tip-grid">
            {news.editorTips.map((tip, index) => (
              <FeatureTipCard key={tip.title} tip={{ title: tip.title, body: tip.description ?? '' }} index={index} />
            ))}
          </div>

          <FeatureSourceBox notes={news.sourceNotes} />

          {related.length > 0 && <RelatedSection related={related} />}

          <section className="feature-card feature-section" style={{ padding: 18, background: 'linear-gradient(135deg, #FFFDF8 0%, #FFF7D8 100%)', borderColor: '#F6E1A2' }}>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <h2 style={{ margin: 0, color: '#071A4D', fontSize: 18, lineHeight: 1.45, fontWeight: 900 }}>{news.ctaTitle}</h2>
                <p style={{ margin: '8px 0 0', color: '#475467', fontSize: 13, lineHeight: 1.75, fontWeight: 750 }}>{news.ctaBody}</p>
              </div>
              <Link href={news.ctaHref} style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 46,
                borderRadius: 999,
                background: '#C6252D',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 900,
                padding: '0 18px',
              }}>
                {news.ctaLabel}
                <ChevronRightIcon color="#fff" />
              </Link>
            </div>
          </section>
        </article>
      </div>

      <BottomCTA saved={saved} onSave={onSave} mapUrl={mapUrl} onMapClick={onMapClick} onTop={onTop} />
    </main>
  );
}

function NewsSpotCard({ spot, index }: { spot: NewsSpot; index: number }) {
  const visual = getNewsSpotVisual(spot, index);
  return (
    <article className="feature-card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
        <div style={{ margin: 0, position: 'relative', height: 176, background: visual.background, overflow: 'hidden' }}>
          {spot.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={spot.imageUrl} alt={spot.imageAlt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </>
          ) : (
            <>
              <span aria-hidden style={{ position: 'absolute', right: -22, bottom: -22, width: 112, height: 112, borderRadius: '50%', border: `1px solid ${visual.ring}`, background: visual.glow }} />
              <span aria-hidden style={{ position: 'absolute', left: 34, top: 28, width: 1, height: 118, background: visual.line, transform: 'rotate(18deg)' }} />
              <span aria-hidden style={{ position: 'absolute', left: 76, top: 16, width: 1, height: 138, background: visual.line, transform: 'rotate(18deg)' }} />
              <span aria-hidden style={{ position: 'absolute', left: 118, top: 34, width: 1, height: 102, background: visual.line, transform: 'rotate(18deg)' }} />
              <div style={{ position: 'absolute', left: 16, right: 16, bottom: 15 }}>
                <p style={{ margin: 0, color: visual.text, fontSize: 22, lineHeight: 1.25, fontWeight: 900 }}>{visual.title}</p>
                <p style={{ margin: '6px 0 0', display: 'inline-flex', borderRadius: 999, background: visual.badgeBg, color: visual.badgeText, padding: '5px 10px', fontSize: 11, fontWeight: 900 }}>
                  Image / {spot.area}
                </p>
              </div>
            </>
          )}
          <span style={{ position: 'absolute', left: 12, top: 12, width: 34, height: 34, borderRadius: '0 0 12px 0', background: '#C6252D', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 900 }}>
            {index + 1}
          </span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <FeatureBadge>{spot.area}</FeatureBadge>
            <FeatureBadge>{spot.genre}</FeatureBadge>
          </div>
          {spot.imageCredit && (
            <p style={{ margin: '7px 0 0', color: '#667085', fontSize: 10, lineHeight: 1.5, fontWeight: 750 }}>
              {spot.imageCredit}
            </p>
          )}
          <h3 style={{ margin: '11px 0 0', color: '#071A4D', fontSize: 18, lineHeight: 1.45, fontWeight: 900 }}>{spot.name}</h3>
          <p style={{ margin: '9px 0 0' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              borderRadius: 10,
              background: '#FFF0EF',
              border: '1px solid #FFD6D2',
              color: '#C6252D',
              padding: '6px 12px',
              fontSize: 15,
              lineHeight: 1.3,
              fontWeight: 900,
              maxWidth: '100%',
            }}>
              {spot.openDate} OPEN
            </span>
          </p>
          <p style={{ margin: '9px 0 0', color: '#475467', fontSize: 13, lineHeight: 1.75, fontWeight: 750 }}>{spot.summary}</p>
          <p style={{ margin: '10px 0 0', borderRadius: 12, background: '#F8FAFC', color: '#071A4D', padding: '9px 11px', fontSize: 12, lineHeight: 1.65, fontWeight: 850 }}>
            こんな人に: {spot.forWhom}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {spot.officialUrl && (
              <a href={spot.officialUrl} target="_blank" rel="noopener noreferrer" style={featureLinkButtonStyle}>
                {spot.officialLabel}
                <ExternalIcon />
              </a>
            )}
            {spot.mapUrl && (
              <a href={spot.mapUrl} target="_blank" rel="noopener noreferrer" style={{ ...featureLinkButtonStyle, ...googleMapButtonStyle }}>
                <GoogleMapButtonContent compact />
              </a>
            )}
            {spot.articleUrl && (
              <Link href={spot.articleUrl} style={{ ...featureLinkButtonStyle, background: '#FFF7D8', borderColor: '#F6E1A2', color: '#071A4D' }}>
                記事で詳しく見る
                <ChevronRightIcon color="#071A4D" />
              </Link>
            )}
          </div>
          <p style={{ margin: '12px 0 0', color: '#667085', fontSize: 11, lineHeight: 1.7, fontWeight: 750 }}>出典: {spot.source}</p>
        </div>
      </div>
    </article>
  );
}

function getNewsSpotVisual(spot: NewsSpot, index: number) {
  const tone = spot.tone ?? (index === 1 ? 'cream' : index === 2 ? 'blue' : index === 3 ? 'navy' : 'warm');
  const palettes = {
    warm: {
      background: 'radial-gradient(circle at 72% 24%, rgba(255,255,255,0.34), transparent 26%), linear-gradient(135deg, #8F2D1C 0%, #D86A32 52%, #F8C861 100%)',
      text: '#fff',
      badgeBg: 'rgba(255,255,255,0.18)',
      badgeText: '#fff',
      ring: 'rgba(255,255,255,0.26)',
      line: 'rgba(255,255,255,0.24)',
      glow: 'rgba(255,255,255,0.08)',
    },
    cream: {
      background: 'radial-gradient(circle at 74% 26%, rgba(255,255,255,0.72), transparent 28%), linear-gradient(135deg, #FFFDF8 0%, #F8E6B8 58%, #D9B86C 100%)',
      text: '#071A4D',
      badgeBg: 'rgba(7,26,77,0.10)',
      badgeText: '#071A4D',
      ring: 'rgba(7,26,77,0.16)',
      line: 'rgba(7,26,77,0.16)',
      glow: 'rgba(255,255,255,0.28)',
    },
    blue: {
      background: 'radial-gradient(circle at 78% 24%, rgba(255,255,255,0.44), transparent 27%), linear-gradient(135deg, #0E7490 0%, #38BDF8 54%, #E0F7FF 100%)',
      text: '#fff',
      badgeBg: 'rgba(255,255,255,0.22)',
      badgeText: '#fff',
      ring: 'rgba(255,255,255,0.34)',
      line: 'rgba(255,255,255,0.28)',
      glow: 'rgba(255,255,255,0.14)',
    },
    navy: {
      background: 'radial-gradient(circle at 76% 22%, rgba(248,200,97,0.28), transparent 26%), linear-gradient(135deg, #071A4D 0%, #123B74 58%, #4B6FA8 100%)',
      text: '#fff',
      badgeBg: 'rgba(255,255,255,0.18)',
      badgeText: '#fff',
      ring: 'rgba(255,255,255,0.28)',
      line: 'rgba(255,255,255,0.24)',
      glow: 'rgba(248,200,97,0.08)',
    },
  }[tone];
  return { ...palettes, title: spot.visualLabel ?? 'イメージビジュアル' };
}

function NewsComparisonTable({ spots }: { spots: NewsSpot[] }) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', color: '#667085', fontSize: 12, lineHeight: 1.6, fontWeight: 800 }}>
        スマホでは表を横にスクロールできます。
      </p>
      <div style={{ position: 'relative' }}>
        <div className="feature-table-scroll">
          <table className="feature-table">
            <thead>
              <tr>
                <th>店名</th>
                <th>エリア</th>
                <th>オープン日</th>
                <th>ジャンル</th>
                <th>こんな人に</th>
                <th>地図</th>
              </tr>
            </thead>
            <tbody>
              {spots.map((spot) => (
                <tr key={spot.name}>
                  <td>{spot.name}</td>
                  <td>{spot.area}</td>
                  <td>{spot.openDate}</td>
                  <td>{spot.genre}</td>
                  <td>{spot.forWhom}</td>
                  <td>
                    {spot.mapUrl ? (
                      <a href={spot.mapUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#C6252D', fontWeight: 900 }}>Googleマップ</a>
                    ) : (
                      <span style={{ color: '#667085', fontWeight: 800 }}>個別地図リンク未設定</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span aria-hidden style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 28,
          height: '100%',
          pointerEvents: 'none',
          borderRadius: '0 16px 16px 0',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), #FFFFFF)',
        }} />
      </div>
    </div>
  );
}

function NewsMapPanel({ spots, mapUrl }: { spots: NewsSpot[]; mapUrl?: string }) {
  const areaNames = Array.from(new Set(spots.map((spot) => spot.area.split('/')[0].trim()).filter(Boolean)));
  const zones = areaNames.map((area) => ({
    area,
    items: spots.map((spot, index) => ({ spot, number: index + 1 })).filter(({ spot }) => spot.area.startsWith(area)),
  }));

  return (
    <section id="news-map" className="feature-card" style={{ padding: 16, scrollMarginTop: 76 }}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ borderRadius: 18, border: '1px solid #E6ECF5', background: 'linear-gradient(135deg, #F8FAFC 0%, #FFF7D8 100%)', position: 'relative', overflow: 'hidden', padding: 12 }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(7,26,77,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(7,26,77,0.05) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {zones.map((zone) => (
              <div key={zone.area} style={{
                border: '1px dashed rgba(7,26,77,0.35)',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.78)',
                padding: '10px 12px',
                display: 'grid',
                gap: 8,
              }}>
                <p style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 5, color: '#071A4D', fontSize: 13, fontWeight: 900 }}>
                  <MapPinIcon />
                  {zone.area}エリア
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {zone.items.length > 0 ? zone.items.map(({ number }) => (
                    <span key={number} style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#C6252D',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12,
                      fontWeight: 900,
                      boxShadow: '0 6px 14px rgba(198,37,45,0.24)',
                    }}>{number}</span>
                  )) : (
                    <span style={{ color: '#667085', fontSize: 12, fontWeight: 800 }}>今回の掲載なし</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p style={{ position: 'relative', margin: '10px 0 0', color: '#667085', fontSize: 10, lineHeight: 1.6, fontWeight: 800 }}>
            位置関係を簡略化した案内です。実際の経路や距離は各Googleマップリンクでご確認ください。
          </p>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {spots.map((spot, index) => {
            const row = (
              <>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#C6252D', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11 }}>{index + 1}</span>
                <span style={{ minWidth: 0 }}>
                  {spot.name}
                  <span style={{ display: 'block', color: '#667085', fontSize: 11, fontWeight: 800, marginTop: 2 }}>{spot.area} / {spot.genre}</span>
                </span>
              </>
            );
            return spot.mapUrl ? (
              <a key={spot.name} href={spot.mapUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 8, alignItems: 'start', color: '#071A4D', textDecoration: 'none', fontSize: 13, fontWeight: 900 }}>
                {row}
              </a>
            ) : (
              <div key={spot.name} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 8, alignItems: 'start', color: '#071A4D', fontSize: 13, fontWeight: 900 }}>
                {row}
              </div>
            );
          })}
        </div>
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ ...secondaryLinkStyle, borderColor: '#071A4D' }}>
            名古屋の新店をGoogleマップで見る
            <ChevronRightIcon color="#071A4D" />
          </a>
        )}
      </div>
    </section>
  );
}

function FeatureBreadcrumb({ items }: { items: string[] }) {
  return (
    <nav aria-label="パンくず" style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', padding: '12px 0 0', color: '#667085', fontSize: 12, fontWeight: 800 }}>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          {index === 0 ? <Link href="/" style={{ color: '#667085', textDecoration: 'none' }}>{item}</Link> : item}
          {index < items.length - 1 && <ChevronRightIcon color="#9BA3B0" />}
        </span>
      ))}
    </nav>
  );
}

function EditorMark() {
  return (
    <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#071A4D', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 21, fontWeight: 900, flexShrink: 0 }}>
      な
    </span>
  );
}

function FeatureHeroMedia({
  imageUrl,
  imageAlt,
  caption,
  fallbackTitle = '名古屋の「今」をお届け',
  fallbackSubtitle = 'なごとしゃ',
}: {
  imageUrl?: string;
  imageAlt: string;
  caption: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}) {
  return (
    <figure className="feature-hero-media" style={{ margin: 0, position: 'relative', overflow: 'hidden', borderRadius: 20, border: '1px solid #E6ECF5', background: 'linear-gradient(135deg, #071A4D 0%, #1A3D78 52%, #F8C861 100%)' }}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={imageAlt} style={{ width: '100%', height: '100%', minHeight: 230, objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ minHeight: 260, display: 'grid', placeItems: 'center', padding: 26, color: '#fff', textAlign: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 900, lineHeight: 1.3 }}>{fallbackTitle}</p>
            <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 800, opacity: 0.86 }}>{fallbackSubtitle}</p>
          </div>
        </div>
      )}
      <figcaption style={{ position: 'absolute', left: 12, bottom: 12, borderRadius: 999, background: 'rgba(7,26,77,0.70)', color: '#fff', padding: '5px 10px', fontSize: 11, fontWeight: 800 }}>
        {caption}
      </figcaption>
    </figure>
  );
}

function FeatureQuickJump({ count }: { count: number }) {
  return (
    <a
      href="#feature-map"
      className="feature-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 14,
        padding: '13px 16px',
        textDecoration: 'none',
        background: '#071A4D',
        border: '1px solid #071A4D',
      }}
    >
      <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', color: '#F8C861', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <ClockIcon />
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: 'block', color: '#F8C861', fontSize: 11, fontWeight: 900, letterSpacing: '0.04em' }}>タイパ重視の人へ</span>
        <span style={{ display: 'block', color: '#fff', fontSize: 14, lineHeight: 1.5, fontWeight: 900, marginTop: 3 }}>{count}会場を地図でまとめて見る</span>
      </span>
      <ChevronRightIcon color="#fff" />
    </a>
  );
}

function FeatureCheckLine({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 9, alignItems: 'start' }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#F8C861', color: '#071A4D', display: 'grid', placeItems: 'center', marginTop: 2 }}>
        <CheckIcon />
      </span>
      <p style={{ margin: 0, color: '#071A4D', fontSize: 14, lineHeight: 1.7, fontWeight: 850 }}>{children}</p>
    </div>
  );
}

function FeatureSectionTitle({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
      <span style={{ color: '#071A4D', display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
      <h2 style={{ margin: 0, color: '#071A4D', fontSize: 18, lineHeight: 1.4, fontWeight: 900 }}>{title}</h2>
    </div>
  );
}

const featureChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 176,
  minHeight: 48,
  padding: '0 16px',
  borderRadius: 14,
  border: '1px solid #E6ECF5',
  background: '#fff',
  color: '#071A4D',
  fontSize: 13,
  fontWeight: 900,
  boxShadow: '0 5px 16px rgba(7,26,77,0.05)',
};

function FeaturePickCard({ pick, index }: { pick: FeaturePick; index: number }) {
  const tone = pick.tone ?? (index === 1 ? 'red' : index === 2 ? 'gold' : 'navy');
  const palette = {
    navy: {
      background: 'radial-gradient(circle at 76% 24%, rgba(248,200,97,0.28), transparent 28%), linear-gradient(135deg, #071A4D 0%, #123B74 58%, #4B6FA8 100%)',
    },
    red: {
      background: 'radial-gradient(circle at 18% 72%, rgba(255,255,255,0.20), transparent 22%), linear-gradient(135deg, #8F1D28 0%, #C6252D 55%, #F8C861 100%)',
    },
    gold: {
      background: 'radial-gradient(circle at 78% 26%, rgba(255,255,255,0.46), transparent 26%), linear-gradient(135deg, #8A5C00 0%, #D99A18 52%, #FFF7D8 100%)',
    },
  }[tone];
  const imageAlt = pick.imageAlt ?? pick.name;
  return (
    <article className="feature-card" style={{ overflow: 'hidden' }}>
      <div style={{ minHeight: 132, padding: 14, background: palette.background, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        {pick.imageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pick.imageUrl} alt={imageAlt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 0 }} />
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,26,77,0.10) 0%, rgba(7,26,77,0.44) 100%)', zIndex: 0 }} />
          </>
        )}
        <span style={{ position: 'absolute', right: -24, bottom: -24, width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.28)' }} />
        <span style={{ position: 'absolute', right: 18, bottom: 20, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
        <span style={{ position: 'absolute', left: 58, top: 20, width: 1, height: 76, background: 'rgba(255,255,255,0.24)', transform: 'rotate(18deg)', transformOrigin: 'top center' }} />
        <span style={{ position: 'absolute', left: 92, top: 12, width: 1, height: 90, background: 'rgba(255,255,255,0.22)', transform: 'rotate(18deg)', transformOrigin: 'top center' }} />
        <span style={{ position: 'absolute', left: 126, top: 18, width: 1, height: 72, background: tone === 'gold' ? 'rgba(7,26,77,0.20)' : 'rgba(255,255,255,0.20)', transform: 'rotate(18deg)', transformOrigin: 'top center' }} />
        <span style={{ width: 34, height: 34, borderRadius: '0 0 12px 0', background: tone === 'gold' ? '#071A4D' : '#C6252D', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 900, position: 'relative', zIndex: 1 }}>
          {index + 1}
        </span>
        <p style={{ position: 'absolute', right: 12, top: 12, margin: 0, borderRadius: 999, background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '5px 10px', fontSize: 11, fontWeight: 900 }}>{pick.area}</p>
      </div>
      <div style={{ padding: 14 }}>
        <h3 style={{ margin: 0, color: '#071A4D', fontSize: 15, lineHeight: 1.45, fontWeight: 900 }}>{pick.name}</h3>
        <p style={{ margin: '7px 0 0', color: '#475467', fontSize: 12, lineHeight: 1.7, fontWeight: 750 }}>{pick.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 11 }}>
          {pick.badges.map((badge) => <FeatureBadge key={badge}>{badge}</FeatureBadge>)}
        </div>
      </div>
    </article>
  );
}

function FeatureBadge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 24, borderRadius: 999, border: '1px solid #FFD6D2', background: '#FFF0EF', color: '#C6252D', padding: '0 9px', fontSize: 11, fontWeight: 900 }}>
      {children}
    </span>
  );
}

function FeatureComparisonTable({ venues }: { venues: FeatureVenue[] }) {
  return (
    <div>
      <p style={{ margin: '0 0 8px', color: '#667085', fontSize: 12, lineHeight: 1.6, fontWeight: 800 }}>
        スマホでは表を横にスクロールできます。
      </p>
      <div style={{ position: 'relative' }}>
        <div className="feature-table-scroll">
          <table className="feature-table">
            <thead>
              <tr>
                <th>スポット名</th>
                <th>エリア</th>
                <th>特徴</th>
                <th>開催期間</th>
                <th>駅近</th>
                <th>予約</th>
                <th>公式リンク</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue) => (
                <tr key={venue.name}>
                  <td>{venue.name}</td>
                  <td>{venue.area}</td>
                  <td>{venue.feature}</td>
                  <td>{venue.period}</td>
                  <td>{venue.station}</td>
                  <td>{venue.reservation}</td>
                  <td>
                    {venue.officialUrl ? (
                      <a href={venue.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#C6252D', fontWeight: 900 }}>公式サイト</a>
                    ) : (
                      <span style={{ color: '#667085', fontWeight: 800 }}>公式サイト情報なし</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span aria-hidden style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 28,
          height: '100%',
          pointerEvents: 'none',
          borderRadius: '0 16px 16px 0',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), #FFFFFF)',
        }} />
      </div>
    </div>
  );
}

function FeatureMapPanel({ venues, mapUrl }: { venues: FeatureVenue[]; mapUrl?: string }) {
  const numbered = venues.map((venue, index) => ({ venue, number: index + 1 }));
  const areas: { area: string; items: { venue: FeatureVenue; number: number }[] }[] = [];
  for (const item of numbered) {
    const existing = areas.find((zone) => zone.area === item.venue.area);
    if (existing) existing.items.push(item);
    else areas.push({ area: item.venue.area, items: [item] });
  }

  return (
    <section id="feature-map" className="feature-card" style={{ padding: 16, scrollMarginTop: 76 }}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ borderRadius: 18, border: '1px solid #E6ECF5', background: 'linear-gradient(135deg, #F8FAFC 0%, #FFF7D8 100%)', position: 'relative', overflow: 'hidden', padding: 12 }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(7,26,77,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(7,26,77,0.05) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {areas.map((zone, zoneIndex) => {
              const isLastOdd = zoneIndex === areas.length - 1 && areas.length % 2 === 1;
              return (
                <div key={zone.area} style={{
                  gridColumn: isLastOdd ? '1 / -1' : undefined,
                  border: '1px dashed rgba(7,26,77,0.35)',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.78)',
                  padding: '10px 12px',
                  display: 'grid',
                  gap: 8,
                  justifyItems: isLastOdd ? 'center' : 'start',
                }}>
                  <p style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 5, color: '#071A4D', fontSize: 13, fontWeight: 900 }}>
                    <MapPinIcon />
                    {zone.area}エリア
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {zone.items.map(({ number }) => (
                      <span key={number} style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#C6252D',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 12,
                        fontWeight: 900,
                        boxShadow: '0 6px 14px rgba(198,37,45,0.24)',
                      }}>{number}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ position: 'relative', margin: '10px 0 0', color: '#667085', fontSize: 10, lineHeight: 1.6, fontWeight: 800 }}>
            エリアの位置関係を簡略化した図です。実際の距離・方角は各会場のGoogleマップでご確認ください。
          </p>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {numbered.map(({ venue, number }) => {
            const row = (
              <>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#C6252D', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11 }}>{number}</span>
                <span style={{ minWidth: 0 }}>
                  {venue.name}
                  <span style={{ display: 'block', color: '#667085', fontSize: 11, fontWeight: 800, marginTop: 2 }}>{venue.station}</span>
                </span>
              </>
            );
            return venue.mapUrl ? (
              <a key={venue.name} href={venue.mapUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 8, alignItems: 'start', color: '#071A4D', textDecoration: 'none', fontSize: 13, fontWeight: 900 }}>
                {row}
              </a>
            ) : (
              <div key={venue.name} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 8, alignItems: 'start', color: '#071A4D', fontSize: 13, fontWeight: 900 }}>
                {row}
              </div>
            );
          })}
        </div>
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ ...secondaryLinkStyle, borderColor: '#071A4D' }}>
            Googleマップでまとめて見る
            <ChevronRightIcon color="#071A4D" />
          </a>
        )}
      </div>
    </section>
  );
}

function FeatureTipCard({ tip, index }: { tip: FeatureTip; index: number }) {
  return (
    <article className="feature-card" style={{ padding: 16 }}>
      <p style={{ margin: 0, color: '#C6252D', fontSize: 12, fontWeight: 900 }}>0{index + 1}</p>
      <h3 style={{ margin: '6px 0 0', color: '#071A4D', fontSize: 15, lineHeight: 1.5, fontWeight: 900 }}>{tip.title}</h3>
      <p style={{ margin: '7px 0 0', color: '#475467', fontSize: 12, lineHeight: 1.75, fontWeight: 750 }}>{tip.body}</p>
    </article>
  );
}

function FeatureVenueCard({ venue }: { venue: FeatureVenue }) {
  return (
    <article className="feature-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <FeatureBadge>{venue.area}</FeatureBadge>
          <h3 style={{ margin: '9px 0 0', color: '#071A4D', fontSize: 18, lineHeight: 1.45, fontWeight: 900 }}>{venue.name}</h3>
          <p style={{ margin: '7px 0 0', color: '#475467', fontSize: 13, lineHeight: 1.75, fontWeight: 750 }}>{venue.feature}</p>
        </div>
      </div>
      <dl style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, margin: '14px 0 0' }}>
        <FeatureInfoRow label="場所" value={venue.place} />
        <FeatureInfoRow label="開催期間" value={venue.period} />
        <FeatureInfoRow label="営業時間" value={venue.hours} />
        <FeatureInfoRow label="料金目安" value={venue.price} />
        <FeatureInfoRow label="予約方法" value={venue.booking} />
      </dl>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, alignItems: 'center' }}>
        {venue.officialUrl ? (
          <a href={venue.officialUrl} target="_blank" rel="noopener noreferrer" style={featureLinkButtonStyle}>公式サイト<ExternalIcon /></a>
        ) : (
          <span style={{ ...featureLinkButtonStyle, borderColor: '#E6ECF5', color: '#667085', background: '#F8FAFC' }}>公式サイト情報なし</span>
        )}
        {venue.mapUrl && (
          <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" style={{ ...featureLinkButtonStyle, ...googleMapButtonStyle }}><GoogleMapButtonContent compact /></a>
        )}
      </div>
      <p style={{ margin: '12px 0 0', color: '#667085', fontSize: 11, lineHeight: 1.7, fontWeight: 750 }}>出典: {venue.source}</p>
      <p style={{ margin: '6px 0 0', color: '#8A5C00', fontSize: 11, lineHeight: 1.7, fontWeight: 800 }}>料金・営業時間・雨天時対応は公式サイトで最新情報をご確認ください。</p>
    </article>
  );
}

function FeatureInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '86px 1fr', gap: 10, borderRadius: 12, background: '#F8FAFC', padding: '10px 11px' }}>
      <dt style={{ color: '#667085', fontSize: 12, fontWeight: 900 }}>{label}</dt>
      <dd style={{ margin: 0, color: '#071A4D', fontSize: 12, lineHeight: 1.65, fontWeight: 850 }}>{value}</dd>
    </div>
  );
}

const featureLinkButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  minHeight: 38,
  borderRadius: 999,
  border: '1px solid #C6252D',
  color: '#C6252D',
  background: '#fff',
  padding: '0 13px',
  textDecoration: 'none',
  fontSize: 12,
  fontWeight: 900,
};

function FeatureSourceBox({ notes }: { notes: string[] }) {
  return (
    <section className="feature-card feature-section" style={{ padding: 16 }}>
      <h2 style={{ margin: 0, color: '#071A4D', fontSize: 17, lineHeight: 1.45, fontWeight: 900 }}>出典・更新情報</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {notes.map((note) => (
          <span key={note} style={{ display: 'inline-flex', borderRadius: 999, border: '1px solid #E6ECF5', background: '#F8FAFC', color: '#334155', padding: '7px 11px', fontSize: 12, fontWeight: 850 }}>
            {note}
          </span>
        ))}
      </div>
    </section>
  );
}

function PhraseTitle({ title }: { title: string }) {
  return (
    <>
      {splitTitlePhrases(title).map((phrase, index) => (
        <span
          key={`${phrase}-${index}`}
          style={{
            display: 'inline-block',
            maxWidth: '100%',
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            wordBreak: 'normal',
          }}
        >
          {phrase}
        </span>
      ))}
    </>
  );
}

function splitTitlePhrases(title: string): string[] {
  if (title === '名古屋ビアガーデン特集2026。夏に行きたい屋上・駅近スポットまとめ') {
    return ['名古屋ビアガーデン特集2026。', '夏に行きたい', '屋上・駅近スポットまとめ'];
  }

  if (title === '雨の日の名古屋どこ行く？屋内で過ごしやすいおでかけスポット7選') {
    return ['雨の日の名古屋', 'どこ行く？', '屋内で過ごしやすい', 'おでかけスポット7選'];
  }

  const phrases = title.match(/[^？。、!?]+[？。、!?]?/g);
  return phrases && phrases.length > 0 ? phrases : [title];
}

function GuideBody({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ padding: '0 14px', marginTop: 14 }}>
      <div style={{
        background: '#fff',
        border: '1px solid #E6ECF5',
        borderRadius: 22,
        padding: '18px 16px',
        boxShadow: '0 8px 22px rgba(7,26,77,0.06)',
      }}>
        {children}
      </div>
    </section>
  );
}

function RelatedSection({ related }: { related: ArticleRelated[] }) {
  return (
    <SectionCard title="関連記事" actionHref="/new" actionLabel="もっと見る">
      <div style={{ display: 'grid', gap: 10 }}>
        {related.map((item) => (
          <RelatedCard key={item.href} item={item} />
        ))}
      </div>
    </SectionCard>
  );
}

function BackToArticlesLink() {
  return (
    <section style={{ padding: '18px 14px 8px' }}>
      <Link href="/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#E8483F', fontSize: 13, fontWeight: 900, textDecoration: 'none' }}>
        <ChevronLeftIcon />
        新着記事一覧へ戻る
      </Link>
    </section>
  );
}

function mergeShopInfo(
  items: ShopInfoItem[],
  fallback: { storeName?: string; area?: string; address?: string; tag?: string },
  extra?: ShopInfoItem[],
) {
  if (items.length > 0) return items;

  const base = [
    fallback.storeName ? { label: '店名', value: fallback.storeName } : undefined,
    fallback.area ? { label: 'エリア', value: fallback.area } : undefined,
    fallback.tag ? { label: 'ジャンル', value: fallback.tag } : undefined,
    fallback.address ? { label: '住所', value: fallback.address } : undefined,
  ].filter(Boolean) as ShopInfoItem[];

  // 本文抽出の追加項目(営業時間・定休日など)。既出ラベルは重複させない
  const seen = new Set(base.map((item) => item.label));
  for (const item of extra ?? []) {
    if (!item.value || seen.has(item.label)) continue;
    seen.add(item.label);
    base.push(item);
  }
  return base;
}

function ArticleHeader({ mapUrl, onMapClick }: { mapUrl?: string; onMapClick?: () => void }) {
  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #EEF1F5' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 12px' }}>
        <Link href="/" aria-label="なごとしゃ ホーム" style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/subjects/nagotosha-header-complete-tight.png"
            alt="なごとしゃ 名古屋情報局 トーシャー"
            style={{ width: 'min(245px, calc(100vw - 150px))', maxHeight: 66, objectFit: 'contain', objectPosition: 'left center', display: 'block' }}
          />
        </Link>
        <nav aria-label="記事ページメニュー" style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <HeaderAction href="/new" label="検索"><SearchIcon /></HeaderAction>
          {mapUrl && <HeaderAction href={mapUrl} label="地図" external onClick={onMapClick}><MapPinIcon /></HeaderAction>}
          <HeaderAction href="/" label="メニュー"><MenuIcon /></HeaderAction>
        </nav>
      </div>
    </header>
  );
}

function HeaderAction({ href, label, external, onClick, children }: { href: string; label: string; external?: boolean; onClick?: () => void; children: React.ReactNode }) {
  const style: React.CSSProperties = {
    width: 45,
    height: 44,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    color: '#071A4D',
    textDecoration: 'none',
    fontSize: 9,
    fontWeight: 900,
    borderRadius: 12,
  };

  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} onClick={onClick} style={style}>{children}<span>{label}</span></a>;
  }

  return <Link href={href} aria-label={label} style={style}>{children}<span>{label}</span></Link>;
}

function BadgeRow({ badges }: { badges: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {badges.map((badge, index) => {
        const isPrimary = index === 0;
        return (
          <span key={badge} style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 28,
            borderRadius: 999,
            padding: '0 12px',
            border: `1px solid ${isPrimary ? '#E8483F' : '#F8C861'}`,
            background: isPrimary ? '#E8483F' : '#FFF7D8',
            color: isPrimary ? '#fff' : '#8A5C00',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.04em',
          }}>
            {badge}
          </span>
        );
      })}
    </div>
  );
}

function QuickCardIcon({ kind }: { kind: 'calendar' | 'food' | 'gift' | 'pin' }) {
  if (kind === 'calendar') {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="17" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" /></svg>;
  }
  if (kind === 'food') {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 11h13v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2z" /><path d="M17 12h2a2 2 0 0 1 0 4h-2" /><path d="M8 7c0-1 .6-1.4.6-2.2M12 7c0-1 .6-1.4.6-2.2" /></svg>;
  }
  if (kind === 'gift') {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="9" width="16" height="12" rx="1.6" /><line x1="12" y1="9" x2="12" y2="21" /><path d="M4 13h16" /><path d="M12 9c-1.8 0-3.6-1-3.6-2.6C8.4 5 9.5 4.4 10.4 4.7c1 .3 1.6 1.6 1.6 4.3 0-2.7.6-4 1.6-4.3.9-.3 2 .3 2 1.7C15.6 8 13.8 9 12 9z" /></svg>;
  }
  return <MapPinIcon />;
}

function formatOpenBadge(openDate: string): { year: string; day: string } | null {
  const m = openDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  return { year: m[1], day: `${Number(m[2])}/${Number(m[3])}` };
}

function HeroVisual({ imageUrl, imageAlt, imageCredit, imageSourceUrl, openDate, fit = 'cover' }: { imageUrl?: string; imageAlt: string; imageCredit?: string; imageSourceUrl?: string; openDate?: string; fit?: 'cover' | 'contain' }) {
  const openBadge = openDate ? formatOpenBadge(openDate) : null;
  const isContain = fit === 'contain';
  return (
    <div style={{
      position: 'relative',
      minHeight: isContain ? 196 : 224,
      overflow: 'hidden',
      borderRadius: 22,
      border: '1px solid #E6ECF5',
      background: isContain ? '#F8FAFC' : '#FFF7D8',
    }}>
      {openBadge && (
        <div aria-label={`${openBadge.year}年${openBadge.day}オープン`} style={{
          position: 'absolute',
          right: 12,
          top: 12,
          zIndex: 1,
          borderRadius: 14,
          background: '#C6252D',
          color: '#fff',
          padding: '8px 12px',
          textAlign: 'center',
          boxShadow: '0 8px 18px rgba(198,37,45,0.32)',
        }}>
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.2, fontWeight: 900, opacity: 0.9 }}>{openBadge.year}</p>
          <p style={{ margin: '1px 0 0', fontSize: 19, lineHeight: 1.15, fontWeight: 900 }}>{openBadge.day}</p>
          <p style={{ margin: '1px 0 0', fontSize: 10, lineHeight: 1.2, fontWeight: 900, letterSpacing: '0.14em' }}>OPEN</p>
        </div>
      )}
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt}
            style={{
              width: '100%',
              height: isContain ? 236 : 260,
              objectFit: fit,
              objectPosition: 'center',
              background: isContain ? '#F8FAFC' : undefined,
              display: 'block',
            }}
          />
          {imageCredit && (
            <p style={{ margin: 0, padding: '8px 12px 10px', background: '#fff', color: '#667085', fontSize: 10, lineHeight: 1.5, fontWeight: 750 }}>
              {imageSourceUrl ? <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#667085', textDecoration: 'underline' }}>画像出典: {imageCredit}</a> : `画像出典: ${imageCredit}`}
            </p>
          )}
        </>
      ) : (
        <div style={{
          minHeight: 224,
          display: 'grid',
          placeItems: 'center',
          padding: 20,
          background:
            'radial-gradient(circle at 18% 18%, rgba(232,72,63,0.10), transparent 34%), radial-gradient(circle at 82% 20%, rgba(248,200,97,0.22), transparent 36%), linear-gradient(135deg, #FFFDF7 0%, #FFF7D8 100%)',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 280 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/subjects/nagotosha-header-complete-tight.png" alt="" aria-hidden style={{ width: 166, opacity: 0.14, margin: '0 auto 14px', display: 'block' }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButtons({ saved, onSave, onShare, mapUrl, onMapClick }: { saved: boolean; onSave: () => void; onShare: () => void; mapUrl?: string; onMapClick?: () => void }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: mapUrl ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8, padding: '12px 14px 0' }}>
      <button type="button" onClick={onSave} aria-pressed={saved} style={{ ...actionButtonStyle, background: '#E8483F', color: '#fff', borderColor: '#E8483F' }}>
        <BookmarkIcon filled={saved} />
        保存
      </button>
      {mapUrl && (
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={onMapClick} style={{ ...actionButtonStyle, ...googleMapButtonStyle }}>
          <GoogleMapButtonContent compact splitLabel />
        </a>
      )}
      <button type="button" onClick={onShare} style={actionButtonStyle}>
        <ShareIcon />
        シェア
      </button>
    </section>
  );
}

function GoogleMapButtonContent({ compact = false, splitLabel = false }: { compact?: boolean; splitLabel?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: compact ? 5 : 8, minWidth: 0 }}>
      <MapPinIcon color="#E8483F" />
      <span style={{
        minWidth: 0,
        overflowWrap: 'anywhere',
        fontSize: compact ? 11 : 14,
        lineHeight: 1.35,
        fontWeight: 900,
      }}>
        {splitLabel ? <>Googleマップ<br />で見る</> : 'Googleマップで見る'}
      </span>
    </span>
  );
}

const actionButtonStyle: React.CSSProperties = {
  minWidth: 0,
  height: 48,
  borderRadius: 16,
  border: '1px solid #E6ECF5',
  background: '#fff',
  color: '#071A4D',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontSize: 12,
  fontWeight: 900,
  boxShadow: '0 4px 14px rgba(7,26,77,0.06)',
  cursor: 'pointer',
};

const googleMapButtonStyle: React.CSSProperties = {
  minHeight: 44,
  border: '1px solid #FFD6D2',
  background: '#fff',
  color: '#C6252D',
  textDecoration: 'none',
  boxShadow: '0 4px 14px rgba(198,37,45,0.08)',
};

function SectionCard({ title, children, icon, accent, actionHref, actionLabel }: { title: string; children: React.ReactNode; icon?: React.ReactNode; accent?: 'yellow'; actionHref?: string; actionLabel?: string }) {
  return (
    <section style={{ padding: '0 14px', marginTop: 14 }}>
      <div style={{
        background: accent === 'yellow' ? 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF7 55%, #FFF7D8 100%)' : '#fff',
        border: `1px solid ${accent === 'yellow' ? '#F6E1A2' : '#E6ECF5'}`,
        borderRadius: 22,
        padding: '18px 16px',
        boxShadow: '0 8px 22px rgba(7,26,77,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {icon && <span style={{ color: '#E8483F', flexShrink: 0 }}>{icon}</span>}
            <h2 style={{ margin: 0, color: '#071A4D', fontSize: 18, lineHeight: 1.35, fontWeight: 900, letterSpacing: '0' }}>{title}</h2>
            <span style={{ width: 52, borderTop: '2px dotted #F8C861', flexShrink: 0 }} />
          </div>
          {actionHref && actionLabel && (
            <Link href={actionHref} style={{ color: '#E8483F', fontSize: 12, fontWeight: 900, textDecoration: 'none', flexShrink: 0 }}>{actionLabel}</Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function SimplePoint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '22px 1fr', alignItems: 'start', gap: 9 }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#FFF7D8', border: '1px solid #F8C861', display: 'grid', placeItems: 'center', marginTop: 1 }}>
        <CheckIcon />
      </span>
      <p style={{ margin: 0, color: '#0F172A', fontSize: 13, lineHeight: 1.7, fontWeight: 800, wordBreak: 'normal', overflowWrap: 'normal', textWrap: 'pretty' }}>{children}</p>
    </div>
  );
}

function PointBlock({ point, index, tone }: { point: ArticlePoint; index: number; tone: 'red' | 'navy' }) {
  const main = tone === 'red' ? '#E8483F' : '#071A4D';
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '34px 1fr',
      gap: 10,
      padding: '12px 12px',
      borderRadius: 17,
      background: tone === 'red' ? '#FFF0EF' : '#F8FAFC',
      border: `1px solid ${tone === 'red' ? '#FFD6D2' : '#E6ECF5'}`,
    }}>
      <span style={{ width: 34, height: 34, borderRadius: '50%', background: main, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>{index + 1}</span>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: 0, color: '#071A4D', fontSize: 14, lineHeight: 1.45, fontWeight: 900, wordBreak: 'normal', overflowWrap: 'normal', textWrap: 'pretty' }}>{point.title}</h3>
        {point.description && (
          <p style={{ margin: '5px 0 0', color: '#475467', fontSize: 12, lineHeight: 1.7, fontWeight: 700, wordBreak: 'normal', overflowWrap: 'normal', textWrap: 'pretty' }}>{point.description}</p>
        )}
      </div>
    </div>
  );
}

function PhotoStrip({ imageUrl, title }: { imageUrl?: string; title: string }) {
  if (!imageUrl) return null;

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={title} style={{ width: '100%', height: 168, objectFit: 'cover', borderRadius: 16, border: '1px solid #E6ECF5', display: 'block' }} />
    </div>
  );
}

function ExternalVisualSection({ visuals }: { visuals?: ArticleExternalVisual[] }) {
  if (!visuals || visuals.length === 0) return null;

  // approvedかembed_onlyでembedHtmlまたはimageUrlがあるものだけ実表示
  const approvedItems = visuals.filter(
    (v) =>
      (v.permissionStatus === 'approved' || v.permissionStatus === 'embed_only') &&
      (v.embedHtml || v.imageUrl),
  );

  if (approvedItems.length === 0) return null;

  return (
    <section style={{ padding: '0 14px', marginTop: 14 }}>
      <div style={{
        background: '#fff',
        border: '1px solid #E6ECF5',
        borderRadius: 22,
        padding: '18px 16px',
        boxShadow: '0 8px 22px rgba(7,26,77,0.06)',
      }}>
        {/* セクション見出し */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ color: '#E8483F', flexShrink: 0 }}><InstagramIcon /></span>
          <h2 style={{ margin: 0, color: '#071A4D', fontSize: 18, lineHeight: 1.35, fontWeight: 900 }}>Instagramで見る</h2>
          <span style={{ width: 52, borderTop: '2px dotted #F8C861', flexShrink: 0 }} />
        </div>

        {/* 承認済みアイテムを表示 */}
        {approvedItems.map((item) => (
          <ApprovedVisualCard key={item.id} item={item} />
        ))}

      </div>
    </section>
  );
}

type EventStatus = 'upcoming' | 'today' | 'active' | 'ended';

function EventRoundupSection({ data, articleId }: { data: EventRoundupData; articleId: number }) {
  if (data.variant === 'list') return <EventRoundupList data={data} articleId={articleId} />;
  return <EventCardRail data={data} articleId={articleId} />;
}

function EventCardRail({ data, articleId }: { data: EventRoundupData; articleId: number }) {
  const [statuses, setStatuses] = useState<Record<string, EventStatus>>({});

  useEffect(() => {
    const todayKey = toDateKey(new Date());
    setStatuses(Object.fromEntries(data.items.map((item) => [item.id, getEventStatus(item, todayKey)])));
  }, [data.items]);

  return (
    <section className="event-roundup" aria-labelledby="event-roundup-title">
      <div className="event-roundup-head">
        <h2 id="event-roundup-title" className="event-roundup-title">{data.title}</h2>
        <p className="event-roundup-copy">{data.description}</p>
        <span className="event-roundup-swipe" aria-hidden="true">{data.swipeLabel}</span>
      </div>
      <div className="event-card-rail" aria-label={data.swipeLabel}>
        {data.items.map((item) => (
          <EventRoundupCard
            key={item.id}
            item={item}
            status={statuses[item.id] ?? 'upcoming'}
            articleId={articleId}
          />
        ))}
      </div>
    </section>
  );
}

function EventRoundupList({ data, articleId }: { data: EventRoundupData; articleId: number }) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const availableFilters = (data.filters ?? []).filter((filter) => (
    data.items.filter((item) => item.filterTags?.includes(filter.id)).length >= 2
  ));
  const visibleItems = activeFilter === 'all'
    ? data.items
    : data.items.filter((item) => item.filterTags?.includes(activeFilter));

  return (
    <section className="event-roundup event-roundup-list-section" aria-labelledby="event-roundup-title">
      <div className="event-roundup-head">
        <h2 id="event-roundup-title" className="event-roundup-title">{data.title}</h2>
        <p className="event-roundup-copy">{data.description}</p>
      </div>

      {availableFilters.length > 0 && (
        <div className="event-filter-panel" aria-label="日付・目的フィルター">
          <p className="event-filter-title">日付・目的フィルター</p>
          <div className="event-filter-chips">
            <button
              type="button"
              className={`event-filter-chip ${activeFilter === 'all' ? 'is-active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              すべて
            </button>
            {availableFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`event-filter-chip ${activeFilter === filter.id ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p className="event-filter-count">{visibleItems.length}件を表示中</p>
        </div>
      )}

      <div className="event-list-cards" aria-label="日付順イベントカード">
        {visibleItems.map((item, index) => (
          <EventRoundupListCard key={item.id} item={item} articleId={articleId} index={index} />
        ))}
      </div>
      <EventRoundupSources data={data} />
    </section>
  );
}

function EventRoundupSources({ data }: { data: EventRoundupData }) {
  const firstVerifiedAt = data.items.find((item) => item.verifiedAt)?.verifiedAt;

  return (
    <section className="event-roundup-sources" aria-labelledby="event-roundup-sources-title">
      <h2 id="event-roundup-sources-title">出典</h2>
      <p>各イベントの公式情報をもとに整理しています。</p>
      <ul>
        {data.items.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <a href={item.officialUrl} target="_blank" rel="noopener noreferrer">
              公式ページを開く
            </a>
          </li>
        ))}
      </ul>
      {firstVerifiedAt && <p className="event-roundup-confirmed">記事確認日: {formatEventVerifiedAt(firstVerifiedAt)}</p>}
    </section>
  );
}

function formatEventVerifiedAt(value: string): string {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}`;
}

function EventRoundupListCard({ item, articleId, index }: { item: EventRoundupItem; articleId: number; index: number }) {
  const facts = [
    { label: 'エリア', value: item.area },
    { label: '会場', value: item.venue },
    { label: '料金', value: item.priceSummary ?? item.ticketStatus },
    { label: '屋内外', value: item.indoorOutdoor },
    { label: '子ども向け', value: item.familySuitability },
    { label: '最寄り', value: item.nearestStation ?? item.station },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  const handleOfficialClick = useCallback(() => {
    trackGa4Event('official_link_click', {
      article_id: articleId,
      event_id: item.id,
      event_name: item.name,
      placement: 'event_roundup_card',
    });
  }, [articleId, item.id, item.name]);

  return (
    <article className="event-list-card" aria-label={`${item.dateLabel} ${item.name}`}>
      <div className="event-list-card-top">
        <time className="event-date-badge" dateTime={item.startDate}>{item.dateLabel}</time>
        <span className="event-list-number">#{index + 1}</span>
      </div>
      <h3 className="event-list-title">{item.name}</h3>
      <p className="event-list-copy">{item.shortDescription ?? item.shortCopy}</p>
      {item.visual.type === 'image' && item.visual.imageUrl && (
        <figure className="event-list-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.visual.imageUrl} alt={item.visual.imageAlt ?? item.name} loading="lazy" />
          {item.visual.creditText && (
            <figcaption>
              <span>{item.visual.imageAlt ?? item.name}</span>
              <span>{item.visual.creditText}</span>
            </figcaption>
          )}
        </figure>
      )}
      <dl className="event-list-facts">
        {facts.map((fact) => (
          <div key={fact.label} className="event-list-fact">
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {item.verifiedAt && (
        <p className="event-list-verified">情報確認: {formatEventVerifiedAt(item.verifiedAt)}</p>
      )}
      <a
        className="event-list-official"
        href={item.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleOfficialClick}
        aria-label={`${item.name}の公式情報を見る（外部リンク）`}
      >
        公式情報を見る
        <ChevronRightIcon color="#fff" />
      </a>
    </article>
  );
}

function EventRoundupCard({ item, status, articleId }: { item: EventRoundupItem; status: EventStatus; articleId: number }) {
  const mapUrl = buildGoogleMapsSearchUrl(item.mapQuery ?? item.name);
  const ended = status === 'ended';
  const historicalPhotoLabel = item.visual.type === 'image' && item.visual.imageAlt?.includes('過去写真')
    ? '過去開催時の写真'
    : undefined;

  const handleDetailClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!item.anchorId) return;
    const target = document.getElementById(item.anchorId);
    if (!target) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${item.anchorId}`);
  }, [item.anchorId]);

  const handleMapClick = useCallback(() => {
    trackGa4Event('map_click', {
      article_id: articleId,
      event_id: item.id,
      event_name: item.name,
      placement: 'event_card',
    });
  }, [articleId, item.id, item.name]);

  return (
    <article className={`event-roundup-card ${ended ? 'is-ended' : ''}`} aria-label={`${item.dateLabel} ${item.name}`}>
      <div className="event-visual">
        {item.visual.type === 'image' && item.visual.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.visual.imageUrl} alt={item.visual.imageAlt ?? item.name} loading="lazy" />
            {historicalPhotoLabel && <span className="event-photo-label">{historicalPhotoLabel}</span>}
          </>
        ) : (
          <div className="event-generated-visual" aria-hidden="true">
            <span className="event-generated-area">{item.area}</span>
            <span className="event-generated-date">{item.dateLabel.replace(/\(.+?\)/, '')}</span>
          </div>
        )}
      </div>
      <div className="event-card-body">
        <div className="event-card-top">
          <time className="event-date-badge" dateTime={item.startDate}>{item.dateLabel}</time>
          <span className={`event-status-badge is-${status}`}>{eventStatusLabel(status)}</span>
        </div>
        <h3 className="event-card-title">{item.name}</h3>
        <div className="event-card-meta">
          <p>エリア: {item.area}</p>
          <p>最寄り駅: {item.station}</p>
          <p>有料席: {item.ticketStatus}</p>
        </div>
        <p className="event-card-copy">{item.shortCopy}</p>
        <div className="event-card-actions">
          <a className="event-card-action secondary" href={`#${item.anchorId}`} onClick={handleDetailClick}>
            詳しく見る
            <ChevronRightIcon color="#071A4D" />
          </a>
          <a
            className="event-card-action primary"
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleMapClick}
            aria-label={`${item.name}の会場をGoogleマップで開く（外部リンク）`}
          >
            <MapPinIcon color="#fff" />
            Googleマップ
          </a>
        </div>
      </div>
    </article>
  );
}

function getEventStatus(item: EventRoundupItem, todayKey: string): EventStatus {
  const start = item.startDate;
  const end = item.endDate ?? item.startDate;
  if (todayKey < start) return 'upcoming';
  if (todayKey > end) return 'ended';
  if (todayKey === start) return item.endDate && item.endDate !== item.startDate ? 'active' : 'today';
  return 'active';
}

function eventStatusLabel(status: EventStatus): string {
  if (status === 'today') return '今日開催';
  if (status === 'active') return '開催中';
  if (status === 'ended') return '開催終了';
  return '開催予定';
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ApprovedVisualCard({ item }: { item: ArticleExternalVisual }) {
  // Instagram埋め込みHTML
  if (item.embedHtml) {
    return (
      <div style={{ marginBottom: 12 }}>
        <div
          dangerouslySetInnerHTML={{ __html: item.embedHtml }}
          style={{ maxWidth: '100%', overflow: 'hidden' }}
        />
        <VisualCredit item={item} />
      </div>
    );
  }

  // 許可済み画像（permissionStatus === 'approved' かつ imageUrl あり）
  if (item.imageUrl && item.permissionStatus === 'approved') {
    return (
      <div style={{ marginBottom: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt={item.imageAlt ?? item.title}
          style={{ width: '100%', borderRadius: 16, display: 'block', border: '1px solid #E6ECF5' }}
        />
        <VisualCredit item={item} />
      </div>
    );
  }

  return null;
}

function VisualCredit({ item }: { item: ArticleExternalVisual }) {
  const hasCredit = item.imageCredit || item.sourceAccount || item.sourceName;
  if (!hasCredit) return null;

  return (
    <p style={{ margin: '6px 0 0', fontSize: 11, color: '#667085', fontWeight: 700, lineHeight: 1.6 }}>
      {'画像出典：'}
      {item.sourceUrl ? (
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#667085', textDecoration: 'underline' }}>
          {item.sourceAccount ? `@${item.sourceAccount}` : (item.sourceName ?? item.imageCredit)}
        </a>
      ) : (
        item.sourceAccount ? `@${item.sourceAccount}` : (item.sourceName ?? item.imageCredit)
      )}
      {' ／ 許可を得て掲載'}
    </p>
  );
}

function InfoGrid({ items }: { items: ShopInfoItem[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid #E6ECF5', borderRadius: 16, overflow: 'hidden' }}>
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} style={{ padding: '12px 11px', borderRight: '1px solid #EEF1F5', borderBottom: '1px solid #EEF1F5', minWidth: 0 }}>
          <p style={{ margin: 0, color: '#667085', fontSize: 10, fontWeight: 900 }}>{item.label}</p>
          <p style={{ margin: '5px 0 0', color: '#071A4D', fontSize: 12, lineHeight: 1.55, fontWeight: 900, overflowWrap: 'anywhere' }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function RelatedCard({ item }: { item: ArticleRelated }) {
  const imageUrl = item.imageUrl;
  const hasImage = Boolean(imageUrl);
  const imageAlt = item.imageAlt ?? item.title;
  return (
    <Link href={item.href} style={{
      display: 'grid',
      gridTemplateColumns: hasImage ? '82px 1fr 18px' : '1fr 18px',
      alignItems: 'center',
      gap: 11,
      borderRadius: 18,
      border: '1px solid #E6ECF5',
      padding: 10,
      background: '#fff',
      textDecoration: 'none',
      minWidth: 0,
    }}>
      {imageUrl && (
        <div style={{ height: 64, borderRadius: 13, background: '#F8FAFC', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        {item.relationshipLabel && <span style={{ display: 'inline-flex', borderRadius: 999, background: '#071A4D', color: '#fff', padding: '3px 8px', fontSize: 10, fontWeight: 900, marginRight: 5 }}>{item.relationshipLabel}</span>}
        {item.label && <span style={{ display: 'inline-flex', borderRadius: 999, background: '#FFF0EF', color: '#E8483F', padding: '3px 8px', fontSize: 10, fontWeight: 900 }}>{item.label}</span>}
        <p style={{ margin: '6px 0 0', color: '#071A4D', fontSize: 13, lineHeight: 1.45, fontWeight: 900, wordBreak: 'normal', overflowWrap: 'normal', textWrap: 'pretty' }}>{item.title}</p>
      </div>
      <ChevronRightIcon color="#9BA3B0" />
    </Link>
  );
}

function BottomCTA({ saved, onSave, mapUrl, onMapClick, onTop }: { saved: boolean; onSave: () => void; mapUrl?: string; onMapClick?: () => void; onTop: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(14px)',
      borderTop: '1px solid #E6ECF5',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{ width: 'min(100%, 760px)', margin: '0 auto', display: 'grid', gridTemplateColumns: mapUrl ? '1fr 1fr 54px' : '1fr 54px', gap: 8, padding: '9px 12px' }}>
        <button type="button" onClick={onSave} aria-pressed={saved} style={{
          minWidth: 0,
          height: 56,
          borderRadius: 17,
          border: 'none',
          background: '#E8483F',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          fontWeight: 900,
          cursor: 'pointer',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}><BookmarkIcon filled={saved} />{saved ? '保存済み' : '保存する'}</span>
        </button>
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={onMapClick} style={{
            minWidth: 0,
            height: 56,
            borderRadius: 17,
            border: '1px solid #FFD6D2',
            background: '#fff',
            color: '#C6252D',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            fontWeight: 900,
          }}>
            <GoogleMapButtonContent compact />
          </a>
        )}
        <button type="button" onClick={onTop} aria-label="上へ戻る" style={{ width: 54, height: 56, borderRadius: 17, border: '1px solid #E6ECF5', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <UpIcon />
        </button>
      </div>
    </div>
  );
}

const secondaryLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minHeight: 48,
  borderRadius: 999,
  border: '1px solid #E6ECF5',
  background: '#fff',
  color: '#071A4D',
  fontSize: 13,
  fontWeight: 900,
  textDecoration: 'none',
};

function SearchIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}

function MenuIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
}

function MapPinIcon({ color = '#071A4D' }: { color?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}

function ShareIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
}

function ClockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

function SparkIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" /></svg>;
}

function CameraIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
}

function ShopIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8483F" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18l-2-6H5l-2 6z" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></svg>;
}

function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9A6A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>;
}

function ChevronRightIcon({ color = '#E8483F' }: { color?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>;
}

function ChevronLeftIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>;
}

function ExternalIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></svg>;
}

function UpIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#071A4D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>;
}

function InstagramIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
}

function UsersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#071A4D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}

function CrownIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6252D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l4.5 4L12 4l4.5 8L21 8l-2 11H5L3 8z" /><path d="M5 19h14" /></svg>;
}

function TableIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#071A4D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M9 4v16" /><path d="M15 4v16" /></svg>;
}

function PenIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#071A4D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>;
}
