# Production Deployment

Follow these steps to deploy Maily to a production environment.

## Prerequisites

- Docker and Docker Compose installed on the target production server.
- Environment variables set for production (use secret management tools as needed).

## Steps

1. **Build and Tag the Docker Image:**

   ```bash
   docker build -t myapp:prod .
   ```

2. **Run Database Backups and Migrations**

   Use the automated deployment script:

   ```bash
   ./infrastructure/scripts/deploy.sh deploy
   ```

   This script will:
   - Backup the database using `pg_dump`
   - Run migration commands (`npm run migrate`)
   - Deploy the updated Docker container using Docker Compose

3. **Verify Deployment**

   Check application logs and ensure connectivity by examining:

   ```bash
   docker-compose logs web
   docker-compose logs db
   ```

4. **Post-Deployment Monitoring**

   Confirm that monitoring tools (New Relic, Datadog, etc.) are reporting expected metrics.

## Rollback

In case of critical issues with the deployment, rollback to the previous stable version with:

```bash
./infrastructure/scripts/deploy.sh rollback
``` 