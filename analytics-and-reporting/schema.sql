-- ====================================================================
-- 1. CORE CLIENT CRM ACCOUNT STRUCTURE (TRANSACTIONAL LAYOUT)
-- ====================================================================

CREATE TABLE clients (
    clientid integer PRIMARY KEY,
    client_name varchar(255) NOT NULL
);

CREATE TABLE projects (
    project_id integer PRIMARY KEY,
    clientid integer NOT NULL,
    project_name varchar(255) NOT NULL,
    app_key varchar(255) NOT NULL,
    FOREIGN KEY (clientid) REFERENCES clients(clientid)
);

CREATE TABLE campaigns (
    campaign_id integer PRIMARY KEY,
    project_id integer NOT NULL,
    campaign_name varchar(255) NOT NULL,
    app_key varchar(255) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE messages (
    message_id integer PRIMARY KEY,
    user_id varchar(50) NOT NULL,
    campaign_id integer NOT NULL,
    split_id integer NOT NULL,
    message_name varchar(255) NOT NULL,
    message_copy varchar(65535) NOT NULL,
    platform varchar(100),
    message_type varchar(100),
    send_date timestamp NOT NULL,
    app_key varchar(255) NOT NULL,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
);

CREATE TABLE client_users (
    user_id varchar(50) PRIMARY KEY,
    clientid integer NOT NULL,
    app_key varchar(255) NOT NULL,
    activity_date date NOT NULL,
    control_group integer,
    user_type varchar(10),
    FOREIGN KEY (clientid) REFERENCES clients(clientid)
);

CREATE TABLE events (
    event_id integer PRIMARY KEY,
    message_id integer NOT NULL,
    user_id varchar(50) NOT NULL,
    controlgroup integer,
    app_key varchar(255) NOT NULL,
    event_date timestamp NOT NULL,
    event_type varchar(100) NOT NULL,
    payload varchar(65535) NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(message_id)
);


-- ====================================================================
-- 2. CRM SYSTEM MESSAGING LOG (SCHEMA: core_crm_system)
-- ====================================================================

CREATE TABLE core_crm_system.delivery_sent_logs (
    dispatch_id varchar(255),
    account_id varchar(50),
    campaign_id varchar(255),
    time_of_sent timestamp
);

CREATE TABLE core_crm_system.delivery_open_logs (
    dispatch_id varchar(255),
    account_id varchar(50),
    campaign_id varchar(255),
    time_of_interaction timestamp
);


-- ====================================================================
-- 3. CORE TRANSACTIONAL ACCOUNT LEDGER (SCHEMA: core_transactional_ledger)
-- ====================================================================

CREATE TABLE core_transactional_ledger.gameplay_batch_file (
    bet_id numeric(15,3),
    account_id bigint,
    cohort_group varchar(20),
    bet_placed_date timestamp,
    bet_type varchar(20),
    file_date date,
    competition_name varchar(255),
    bet_selection_id integer,
    bet_selection_name varchar(255),
    bet_wager numeric(38,6)
);


-- ====================================================================
-- 4. MATERIALIZED BI SCHEDULING LOOKUPS (SCHEMA: analytical_reporting)
-- ====================================================================


CREATE TABLE analytical_reporting.client_bet_data_summary (
    bet_id numeric(15,3),
    account_id bigint,
    cohort_group varchar(20),
    bet_placed_date timestamp,
    competition_names varchar(65535),
    selection_count integer,
    bet_type varchar(20),
    selections varchar(65535),
    markets varchar(65535),
    total_net_stake numeric(38,6),
    file_date date
);

