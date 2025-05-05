-- Set the timezone to Ethiopian time zone (UTC +3)
SET time_zone = '+03:00';

-- Distance calculation function (optional, usable from SQL or backend)
DELIMITER //
CREATE FUNCTION calculate_distance(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT, units VARCHAR(5))
RETURNS FLOAT
DETERMINISTIC
BEGIN
    DECLARE dist FLOAT DEFAULT 0;
    DECLARE radlat1 FLOAT;
    DECLARE radlat2 FLOAT;
    DECLARE theta FLOAT;
    DECLARE radtheta FLOAT;

    IF lat1 = lat2 AND lon1 = lon2 THEN
        RETURN dist;
    ELSE
        SET radlat1 = PI() * lat1 / 180;
        SET radlat2 = PI() * lat2 / 180;
        SET theta = lon1 - lon2;
        SET radtheta = PI() * theta / 180;
        SET dist = SIN(radlat1) * SIN(radlat2) + COS(radlat1) * COS(radlat2) * COS(radtheta);

        IF dist > 1 THEN SET dist = 1; END IF;

        SET dist = ACOS(dist);
        SET dist = dist * 180 / PI();
        SET dist = dist * 60 * 1.1515;

        IF units = 'K' THEN
            SET dist = dist * 1.609344;
        ELSEIF units = 'N' THEN
            SET dist = dist * 0.8684;
        END IF;

        RETURN dist;
    END IF;
END;
//
DELIMITER ;

-- Table definitions
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    verified ENUM('YES', 'NO') DEFAULT 'NO',
    last_connection TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_verify (
    running_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    verify_code INT NOT NULL,
    expire_time TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 MINUTE),  -- Fixed line
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset (
    running_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reset_code VARCHAR(255) NOT NULL,
    expire_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Fixed line
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
    running_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    gender VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    sexual_pref VARCHAR(255) NOT NULL,
    biography TEXT NOT NULL,
    fame_rating INT NOT NULL DEFAULT 0,
    user_location VARCHAR(255) NOT NULL,
    IP_location POINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_pictures (
    picture_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    picture_data TEXT NOT NULL,
    profile_pic ENUM('YES', 'NO') DEFAULT 'NO',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
    running_id INT AUTO_INCREMENT PRIMARY KEY,
    liker_id INT NOT NULL,
    target_id INT NOT NULL,
    liketime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (liker_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connections (
    connection_id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blocks (
    block_id INT AUTO_INCREMENT PRIMARY KEY,
    blocker_id INT NOT NULL,
    target_id INT NOT NULL,
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    tag_content VARCHAR(255) NOT NULL
    -- No array[] type in MySQL; consider a join table instead for tagged users
);

-- Join table for tags <-> users (many-to-many)
CREATE TABLE IF NOT EXISTS tagged_users (
    tag_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (tag_id, user_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    connection_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    `read` ENUM('YES', 'NO') DEFAULT 'NO',  -- Fixed backtick around `read`
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (connection_id) REFERENCES connections(connection_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS watches (
    watch_id INT AUTO_INCREMENT PRIMARY KEY,
    watcher_id INT NOT NULL,
    target_id INT NOT NULL,
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (watcher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    target_id INT NOT NULL,
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender_id INT NOT NULL,
    notification_text VARCHAR(255) NOT NULL,
    redirect_path VARCHAR(255),
    `read` ENUM('YES', 'NO') DEFAULT 'NO',  -- Fixed backtick around `read`
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fame_rates (
    famerate_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    setup_pts INT NOT NULL DEFAULT 0,
    picture_pts INT NOT NULL DEFAULT 0,
    tag_pts INT NOT NULL DEFAULT 0,
    like_pts INT NOT NULL DEFAULT 0,
    connection_pts INT NOT NULL DEFAULT 0,
    total_pts INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
