import { http, HttpResponse } from 'msw'

const baseUrl = process.env.NEXT_PUBLIC_API_URL

export const handlers = [
  // Auth endpoints
  http.post(`${baseUrl}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json()
    
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
        token: 'mock-jwt-token',
      })
    }
    
    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    })
  }),

  // User endpoints
  http.get(`${baseUrl}/user/me`, () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    })
  }),

  // Campaign endpoints
  http.get(`${baseUrl}/campaigns`, () => {
    return HttpResponse.json({
      campaigns: [
        {
          id: '1',
          name: 'Test Campaign',
          status: 'draft',
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
    })
  }),

  http.post(`${baseUrl}/campaigns`, async ({ request }) => {
    const data = await request.json()
    return HttpResponse.json({
      id: '2',
      ...data,
      status: 'draft',
      createdAt: new Date().toISOString(),
    })
  }),

  // Team endpoints
  http.get(`${baseUrl}/team`, () => {
    return HttpResponse.json({
      members: [
        {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
        },
      ],
    })
  }),

  // Fallback 404 handler
  http.all('*', ({ request }) => {
    console.warn(`No handler for ${request.method} ${request.url}`)
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    })
  }),
] 