# Cross-Platform Telemetry Ingestion, GTM Integration & Campaign Attribution Pipeline

An architectural blueprint and sanitized code ecosystem demonstrating technical integration engineering pipelines. This repository contains complete, framework-agnostic implementations of client-side tracking, Google Tag Manager (GTM) handlers, dynamic Liquid user-tag personalization layers, and analytical data warehouse auditing schemas.

## Professional Disclaimer & NDA Note

The code contained in this repository is completely open-source, written from scratch, and generic. It does not contain any proprietary company SDK methods, live API credentials, or copyrighted framework materials from my former employer. It serves as an architectural mockup illustrating how I solve enterprise-grade integration data flow, cross-platform telemetry mismatches, and multi-system conversion attribution under real-world conditions.

---

## Repository Architecture & Ecosystem Map

This repository mimics a complete technical data loop: Ingesting client tracking metrics -> Handling transport layer anomalies -> Auditing data integrity via SQL -> Informing BI layouts (Amazon QuickSight) -> Executing frontend re-engagement.

* **[`/gtm-integrations`](./gtm-integrations):** Contains a custom-engineered GTM JavaScript tag architecture. It synchronizes user identities across platforms, routes real-time data from external REST sports betting feeds (handling single/parlay variations), flashes UI components on line movements, and prevents client race conditions through asynchronous lifecycle polling.
* **[`/frontend-components`](./frontend-components):** Showcases pure CSS responsive slider components alongside a complex server-side Liquid templating layout. The template processes Unix epoch math and builds extensive deduplication conditional waterfalls (`if/elsif` networks) to render unique, targeted content streams across multiple sports leagues (NBA, NFL, MLB, NCAAB).
* **[`/analytics-and-reporting`](./analytics-and-reporting):** Features complete relational database schemas and an advanced multi-CTE master query optimized for Amazon Redshift warehouses. It isolates customer behavior logs to evaluate marketing campaign conversion velocity across tight micro-time intervals (15, 30, 45, and 60-minute windows).

---

## Business Intelligence & Reporting Architecture (Amazon QuickSight)

Because live Amazon QuickSight dashboard instances require enterprise IAM infrastructure, the visuals are backed by the production-grade data warehouse scripts located in `/analytics-and-reporting`.

### SPICE Engine & ETL Configuration

1. **Performance Aggregations:** The master query is structured using highly optimized, isolated Common Table Expressions (CTEs) to process heavy batch files before executing joins. This allows the dataset to materialize smoothly into the QuickSight **SPICE memory cache engine** on an automated rolling schedule, completely avoiding high run-time computational overhead.
2. **Data Transformation & Extraction:** The query resolves tracking gaps between siloed third-party messaging systems by transforming server clocks (`CONVERT_TIMEZONE`) into local operational time zones (EST) and parsing complex logging properties directly out of raw, dynamic JSON strings (`JSON_EXTRACT_PATH_TEXT`).
3. **Advanced Attribution Modeling:** Relational warehouse rules translate user interaction flags into micro-conversion metrics, tracking how fast a marketing touchpoint directly stimulates a conversion inside 15 to 60 minutes.

### Visualized Key Performance Indicators (KPIs)

The underlying warehouse query inside this repo is engineered to supply dashboards tracking:

* **Touchpoint Conversion Velocity:** Time-series line graphs pinpointing the exact decay or expiration of push notification effectiveness.
* **Transactional Engagement Value:** High-density KPI blocks tracking cumulative user stakes, selection counts, and wager distributions (singles vs. parlays) across specific sports competitions.
* **A/B Variant Verification:** Comparative layout matrices filtering control group holds against targeted broadcast and dynamic campaign delivery flags to verify clean business lift.

---

## Common Technical Triage & Troubleshooting Scenarios Addressed

Throughout my 4.5 years of industry experience, these are examples of critical client-side bottlenecks I specialized in diagnosing and fixing:

#### Scenario A: The Mobile Web-View Ingestion Gap

* *The Issue:* A high-priority operator noticed a major drop-off in user conversion events specifically coming from native mobile applications compared to desktop web traffic.
* *The Triage:* By running detailed diagnostic audits matching client data layers to transactional backend logs, I isolated the drop-off to native app container configurations.
* *The Resolution:* Discovered the app shell fired events before the underlying browser WebView finished compiling. Remedied by creating a script validation and polling loop similar to the component shown in `gtm-initialization-tag.js`.

#### Scenario B: Tracking Lost Packets During Page Transitions

* *The Issue:* Client web applications firing registration or banner-click conversion events failed to log occurrences if the user navigated away from the page too rapidly.
* *The Triage:* Analyzed network transmission histories confirming standard browser HTTP POST requests were being systematically aborted mid-flight by page lifecycle shutdowns.
* *The Resolution:* Re-architected client-side distribution methods utilizing standard browser `fetch` scripts configured with explicit `keepalive: true` flags, ensuring complete event delivery without delaying UI rendering.

#### Scenario C: Route Transition Bottlenecks & Flash API Delays

* *The Issue:* Heavy page loads and sequential REST calls to fetch live sportsbook offering lines caused significant DOM layout shift and visual lag when players changed routes.
* *The Resolution:* Implemented a front-end caching framework using browser `sessionStorage`. Once raw HTML layout elements are compiled and validated against active odds feeds, they are cached as strings. Subsequent page loads restore layouts instantly from memory, bypassing cold API calls entirely while background scripts poll for changes asynchronously.
