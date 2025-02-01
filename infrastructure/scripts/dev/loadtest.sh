#!/bin/bash
set -e

# Default values
DURATION=30
VUS=10
TARGET_URL="http://localhost:3000"

# Parse command line arguments
while getopts "d:v:u:" opt; do
  case $opt in
    d) DURATION="$OPTARG" ;;
    v) VUS="$OPTARG" ;;
    u) TARGET_URL="$OPTARG" ;;
    \?) echo "Invalid option -$OPTARG" >&2; exit 1 ;;
  esac
done

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
  echo "k6 is not installed. Installing..."
  brew install k6
fi

# Create temporary k6 script
cat << EOF > /tmp/loadtest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: ${VUS},
  duration: '${DURATION}s',
};

export default function () {
  const res = http.get('${TARGET_URL}');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

# Run load test
k6 run /tmp/loadtest.js

# Cleanup
rm /tmp/loadtest.js 