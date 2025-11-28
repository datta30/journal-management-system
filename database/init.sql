-- Initialize Research Journal Database
CREATE DATABASE IF NOT EXISTS research_journal;
USE research_journal;

-- Grant privileges to journal_user
GRANT ALL PRIVILEGES ON research_journal.* TO 'journal_user'@'%';
FLUSH PRIVILEGES;

-- The Spring Boot application will create tables via JPA/Hibernate
-- This file is for any additional initialization if needed
