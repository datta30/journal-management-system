# MySQL Database Dockerfile
FROM mysql:8.0

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=research_journal
ENV MYSQL_USER=journal_user
ENV MYSQL_PASSWORD=journal_pass

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 3306

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=5 \
    CMD mysqladmin ping -h localhost -u root -proot || exit 1
