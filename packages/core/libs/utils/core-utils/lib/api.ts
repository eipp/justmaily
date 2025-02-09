// Third-party imports
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Local imports
import { MetricsService } from './monitoring';
import { SecurityService } from './security';
import { APIKeyService } from './auth/api-keys';

// ... existing code ... 