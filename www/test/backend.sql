CREATE DATABASE IF NOT EXISTS sleep_tracker;
USE sleep_tracker;

CREATE TABLE IF NOT EXISTS sleep_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    days_passed INT NOT NULL,
    sleep_score INT,
    night_sleep_time VARCHAR(10),
    day_nap VARCHAR(10),
    deep_sleep VARCHAR(10),
    light_sleep VARCHAR(10),
    rem_sleep VARCHAR(10),
    cut_sleep BOOLEAN DEFAULT FALSE,
    shaking BOOLEAN DEFAULT FALSE,
    seizure BOOLEAN DEFAULT FALSE,
    slept_with_partner BOOLEAN DEFAULT FALSE,
    comments TEXT,
    tags TEXT,
    calories_burned INT,
    steps_taken INT,
    weight DECIMAL(5,2),
    hours_stood INT,
    pill1 BOOLEAN DEFAULT FALSE,
    pill2 BOOLEAN DEFAULT FALSE,
    pill3 BOOLEAN DEFAULT FALSE
);
