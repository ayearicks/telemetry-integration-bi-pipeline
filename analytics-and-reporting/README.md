# Analytics & Reporting

This directory contains sanitized, production-grade relational data warehouse schemas and analytical business intelligence queries. In enterprise environments, these combined scripts serve as the optimized data foundation for high-performance **Amazon QuickSight** dashboards.

### QuickSight Optimization & Warehouse Architecture

1. **Multi-CTE Materialization:** The attribution query is heavily engineered using multi-layered Common Table Expressions (CTEs) and multi-table `JOIN` paths. This minimizes run-time processing overhead when scanning massive event ledgers, making it ideal for direct integration into the Amazon QuickSight **SPICE engine**.
2. **Time-Zone & JSON Transformation:** The pipelines cleanly process cross-system data gaps by executing server clock conversions (`CONVERT_TIMEZONE`) into local operational time zones (EST) and parsing complex text logs using relational JSON extractions (`JSON_EXTRACT_PATH_TEXT`).
3. **Incremental Micro-Window Attribution:** Relational tables are structured to support highly complex conditional tracking blocks (`CASE WHEN`). This architecture calculates transactional actions across hyper-specific post-send time intervals (15, 30, 45, and 60-minute windows).

### Operational & Dashboard Impact
The structural models and scripts in this directory feed dynamic dashboard visualizations used by technical solutions engineers, account managers, and executives to track:

* **Touchpoint Conversion Velocity:** Time-series charts visualizing user conversion rates across distinct marketing push channels.
* **Transactional Engagement Value:** High-density KPI cards tracking cumulative net stakes, selection behaviors (singles vs. parlays), and market classifications.
* **A/B Test Verification:** Comparative matrices filtering control group holds against targeted dynamic delivery segments to assess real business lift.
