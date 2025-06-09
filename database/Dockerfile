FROM postgres:15-alpine

ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=root
ENV POSTGRES_DB=auth_db

COPY init_auth.sql /docker-entrypoint-initdb.d/01-init_auth.sql
COPY init_documents.sql /docker-entrypoint-initdb.d/02-init_documents.sql

EXPOSE 5432
