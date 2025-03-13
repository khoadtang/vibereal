FROM postgres:14-alpine

# Custom PostgreSQL configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# This is where initialization scripts will be mounted
WORKDIR /docker-entrypoint-initdb.d

# Set ownership for initialization scripts
USER root
RUN chown -R postgres:postgres /docker-entrypoint-initdb.d

# Switch back to postgres user
USER postgres

# Start PostgreSQL with custom configuration
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"] 