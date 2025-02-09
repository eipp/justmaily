#!/bin/bash
set -euo pipefail
LOGFILE="./chaos_experiment.log"

echo "Starting chaos experiment at $(date)" | tee -a "$LOGFILE"

# Example: simulate a chaos attack using Gremlin API (replace with actual endpoint and secure token management)
RESPONSE=$(curl -s -w "%{http_code}" -X POST https://api.gremlin.com/v1/attacks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GREMLIN_API_TOKEN}" \
  -d '{ "attack": { "name": "cpu_stress", "duration": 60, "target": "server_group_1" }}')

HTTP_CODE=${RESPONSE: -3}

if [ "$HTTP_CODE" -ne 200 ]; then
  echo "Chaos experiment failed with HTTP code ${HTTP_CODE}" | tee -a "$LOGFILE"
  exit 1
fi

echo "Chaos experiment executed successfully." | tee -a "$LOGFILE" 