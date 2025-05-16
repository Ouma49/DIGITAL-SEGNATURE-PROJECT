FROM postgres:15-alpine

ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=root
ENV POSTGRES_DB=auth_db

COPY init_auth.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
