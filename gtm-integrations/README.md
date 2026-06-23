# Google Tag Manager (GTM) Integrations Layer

This directory demonstrates client-side telemetry ingestion, tag deployment frameworks, and real-time asynchronous API integration workflows executed directly within Google Tag Manager containers.

### Core Script Implementations

1. **[`gtm-initialization-tag.js`](./gtm-initialization-tag.js) (Lifecycle & Ingestion Engine):** Runs on page load (`DOM Ready`) to poll the document workspace, capture user history tracking profiles inside the `dataLayer`, and parse user properties to execute rule-based audience campaign delivery.
2. **[`gtm-interstitial-handler.js`](./gtm-interstitial-handler.js) (Dynamic Callback Mapping):** Implements an optimized event delegation generator loop that mounts massive user event click handler arrays dynamically. This handles traffic auditing (`pushPhash`) across multiple categories (Trending, Recommended, Parlays) and sports classifications (NBA, NFL, MLB, NCAAB) with minimal performance impacts.
3. **[`gtm-odds-api-sync.js`](./gtm-odds-api-sync.js) (Asynchronous Live Feed & DOM Orchestration Engine):** A comprehensive, promisified architecture that queries external REST APIs to parse real-time sports betting metrics. It evaluates live single and parlay odds variations, executes layout flashes on line shifts, handles programmatic DOM assembly, and implements spatial drawing logic for custom component alignment.

### Engineering Methodologies Demonstrated

* **Performance Optimization & Caching:** Mitigates subsequent network API bottlenecks by capturing and caching compiled layout string components directly into `sessionStorage`, optimizing performance across route transitions.
* **Race-Condition Remediation:** Uses non-blocking polling loops to synchronize asynchronous code footprints against variable web page structures.
* **Memory Optimization:** Eliminates static multi-line hardcoding by executing clean programmatic array mappings to register event parameters.
* **Defensive DOM Manipulation:** Integrates explicit catch logic inside native browser JavaScript `Promises` to wipe dead, erroneous, or inactive HTML layouts gracefully, protecting the client application's user experience.
* **Dynamic Coordinate Mathematics:** Utilizes active element DOM offset properties (`offsetTop`, `offsetHeight`) to dynamically compute spatial rendering targets on the page canvas.
