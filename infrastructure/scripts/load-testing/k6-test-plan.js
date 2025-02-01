import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('error_rate');
const cacheHitRate = new Rate('cache_hit_rate');
const tokenUsageTrend = new Trend('token_usage');

// Test configuration
export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
    },
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 0 },
      ],
    },
    stress_test: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 10 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should complete within 1s
    error_rate: ['rate<0.1'],          // Error rate should be below 10%
    cache_hit_rate: ['rate>0.3'],      // Cache hit rate should be above 30%
  },
};

// Test data
const testData = {
  emailBriefs: [
    'Write a professional email about project updates',
    'Create a marketing email for new product launch',
    'Draft a customer support response about service issues',
    'Compose a team announcement about company changes',
  ],
  tones: ['professional', 'friendly', 'formal', 'casual'],
  lengths: ['short', 'medium', 'long'],
};

// Helper functions
function getRandomTestData() {
  return {
    brief: randomItem(testData.emailBriefs),
    tone: randomItem(testData.tones),
    length: randomItem(testData.lengths),
  };
}

function checkResponse(response) {
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => r.json('data') !== undefined,
  });
  errorRate.add(!success);
  
  if (response.headers['X-Cache-Hit']) {
    cacheHitRate.add(1);
  } else {
    cacheHitRate.add(0);
  }

  if (response.headers['X-Token-Usage']) {
    tokenUsageTrend.add(parseInt(response.headers['X-Token-Usage']));
  }
}

// Main test functions
export function generateEmail() {
  const testData = getRandomTestData();
  const payload = JSON.stringify({
    brief: testData.brief,
    options: {
      tone: testData.tone,
      length: testData.length,
    },
  });

  const response = http.post('http://api.example.com/v1/generate/email', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  checkResponse(response);
  sleep(1);
}

export function generateSubjectLines() {
  const payload = JSON.stringify({
    emailContent: getRandomTestData().brief,
    options: {
      maxLength: 50,
      abTestVariants: 3,
    },
  });

  const response = http.post('http://api.example.com/v1/generate/subjects', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  checkResponse(response);
  sleep(0.5);
}

// Main function - mix of different operations
export default function () {
  const rand = Math.random();
  if (rand < 0.7) {
    generateEmail();      // 70% of requests
  } else {
    generateSubjectLines(); // 30% of requests
  }
} 