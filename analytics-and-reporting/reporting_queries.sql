-- ====================================================================
-- QUERY 1: Multi-Platform Campaign Attribution & Time-Window Conversion Auditor
-- Target: Main custom SQL data source powering QuickSight Analytical Dashboards
-- Scenario: Aggregates nightly batch files to assess marketing touchpoint effectiveness
-- Techniques: Multi-CTE alignment, JSON extraction parsing, Conditional Time Aggregations
-- ====================================================================

WITH crm_push_sends AS (
    SELECT 
        dispatch_id,
        account_id,
        CASE 
            WHEN campaign_id = 'CAMP_ID_PLACEHOLDER_A' THEN 'Broadcast'
            WHEN campaign_id = 'CAMP_ID_PLACEHOLDER_B' THEN 'Dynamic'
            ELSE 'Ad-Hoc' 
        END AS campaign_name,
        DATE_TRUNC('hour', time_of_sent) AS time_of_sent
    FROM core_crm_system.delivery_sent_logs
    WHERE campaign_id IN ('CAMP_ID_PLACEHOLDER_A', 'CAMP_ID_PLACEHOLDER_B')
    GROUP BY 1, 2, 3, 4
),
crm_push_opens AS (
    SELECT 
        dispatch_id,
        account_id,
        CASE 
            WHEN campaign_id = 'CAMP_ID_PLACEHOLDER_A' THEN 'Broadcast'
            WHEN campaign_id = 'CAMP_ID_PLACEHOLDER_B' THEN 'Dynamic'
            ELSE 'Ad-Hoc' 
        END AS campaign_name,
        time_of_interaction AS time_of_open
    FROM core_crm_system.delivery_open_logs
    WHERE campaign_id IN ('CAMP_ID_PLACEHOLDER_A', 'CAMP_ID_PLACEHOLDER_B')
    GROUP BY 1, 2, 3, 4
),
internal_system_sends AS (
    SELECT 
        m.message_id,
        m.user_id AS account_id,
        e.controlgroup AS control_group,
        CASE 
            WHEN c.campaign_name ILIKE '%Broadcast%' THEN 'Broadcast' 
            ELSE 'Dynamic' 
        END AS campaign_name,
        m.message_name,
        m.message_copy,
        m.message_type,
        -- Convert UTC server clocks to regional business operations timezone (EST)
        DATE_TRUNC('hour', CONVERT_TIMEZONE('UTC', 'America/New_York', m.send_date::timestamp)) AS local_datetime,
        -- Parse telemetry details directly out of dynamic payload JSON strings
        CASE WHEN e.payload IS NOT NULL THEN JSON_EXTRACT_PATH_TEXT(e.payload, 'trigger') ELSE 'Broadcast Trigger' END AS message_trigger,
        CASE WHEN e.payload IS NOT NULL THEN JSON_EXTRACT_PATH_TEXT(e.payload, 'audience_segment') ELSE 'Standard' END AS audience_segment
    FROM projects p 
    JOIN campaigns c ON p.project_id = c.project_id
    JOIN messages m ON c.campaign_id = m.campaign_id 
    LEFT JOIN events e ON m.message_id = e.message_id AND e.event_type = 'open'
    WHERE c.campaign_name IN ('CAMPAIGN_MARKET_FILTER_A', 'CAMPAIGN_MARKET_FILTER_B')
    GROUP BY 1,2,3,4,5,6,7,8,9,10
),
transactional_bet_markets AS (
    SELECT DISTINCT 
        bet_id,
        account_id,
        bet_placed_date,
        market_type,
        bet_type,
        file_date,
        LISTAGG(DISTINCT competition_name, ', ') WITHIN GROUP (ORDER BY bet_selection_name) AS competition_names,
        COUNT(bet_selection_id) AS selection_count,
        LISTAGG(bet_selection_name, ', ') WITHIN GROUP (ORDER BY bet_selection_name) AS bet_selections,
        SUM(bet_wager::FLOAT) AS total_bet_wager
    FROM core_transactional_ledger.gameplay_batch_file
    WHERE account_id IS NOT NULL
      AND bet_type IN ('single', 'parlay')
      -- Filtered to capture operations processed precisely in the prior midnight batch cycle
      AND file_date::DATE = GETDATE()::DATE - INTERVAL '1 day'
    GROUP BY 1, 2, 3, 4, 5, 6
),
standardized_client_bets AS (
    SELECT 
        bet_id,
        account_id,
        bet_placed_date,
        LISTAGG(DISTINCT competition_names, ', ') WITHIN GROUP (ORDER BY bet_selections) AS competitions,
        SUM(selection_count) AS total_selections,
        bet_type,
        LISTAGG(DISTINCT bet_selections, ', ') WITHIN GROUP (ORDER BY bet_selections) AS all_bet_selections,
        LISTAGG(DISTINCT market_type, ', ') WITHIN GROUP (ORDER BY bet_selections) AS market_types,
        SUM(total_bet_wager) AS total_bet_wager,
        file_date
    FROM transactional_bet_markets
    GROUP BY 1, 2, 3, 6, 10
)
-- ====================================================================
-- FINAL ASSIGNMENT LAYER: Map User Tracking States Against Micro-Window Actions
-- ====================================================================
SELECT 
    iss.account_id AS core_system_id,
    cps.account_id  AS tracking_crm_id,
    iss.control_group,
    COALESCE(cps.time_of_sent, iss.local_datetime) AS integrated_send_date,
    TO_CHAR(iss.local_datetime, 'Day') AS weekday_calculated,
    iss.campaign_name,
    iss.message_name,
    iss.message_copy,
    sb.competitions,
    sb.bet_type,
    sb.all_bet_selections,
    sb.market_types,
    sb.total_bet_wager,
    iss.message_trigger,
    iss.audience_segment,
    -- Real-Time Marketing Conversion Windows (Attribution Logic)
    COALESCE(SUM(CASE WHEN (sb.bet_placed_date BETWEEN cps.time_of_sent AND cps.time_of_sent + INTERVAL '15 minutes') THEN 1 END), 0) AS conversions_within_15_mins,
    COALESCE(SUM(CASE WHEN (sb.bet_placed_date BETWEEN cps.time_of_sent + INTERVAL '15 minutes' AND cps.time_of_sent + INTERVAL '30 minutes') THEN 1 END), 0) AS conversions_15_to_30_mins,
    COALESCE(SUM(CASE WHEN (sb.bet_placed_date BETWEEN cps.time_of_sent + INTERVAL '30 minutes' AND cps.time_of_sent + INTERVAL '45 minutes') THEN 1 END), 0) AS conversions_30_to_45_mins,
    COALESCE(SUM(CASE WHEN (sb.bet_placed_date BETWEEN cps.time_of_sent + INTERVAL '45 minutes' AND cps.time_of_sent + INTERVAL '1 hour') THEN 1 END), 0) AS conversions_45_to_60_mins,
    COALESCE(SUM(CASE WHEN (sb.bet_placed_date BETWEEN cps.time_of_sent AND cps.time_of_sent + INTERVAL '1 hour') THEN 1 END), 0) AS total_attributed_conversions

FROM internal_system_sends iss
LEFT JOIN crm_push_sends cps
    ON iss.account_id = cps.account_id 
    AND cps.time_of_sent BETWEEN DATEADD('minute', 0, iss.local_datetime) AND DATEADD('minute', 30, iss.local_datetime) 
    AND os.campaign_name = cps.campaign_name
LEFT JOIN crm_push_opens cpo 
    ON cps.account_id = cpo.account_id 
    AND cps.dispatch_id = cpo.dispatch_id
LEFT JOIN standardized_client_bets sb 
    ON cps.account_id = sb.account_id 
    AND sb.bet_placed_date BETWEEN DATEADD('minute', -2, cps.time_of_sent) AND DATEADD('minute', 60, cps.time_of_sent)
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
ORDER BY total_attributed_conversions DESC;
