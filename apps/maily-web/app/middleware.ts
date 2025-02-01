import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/webhooks(.*)',
    '/blog(.*)',
    '/about',
    '/pricing',
    '/contact',
  ],
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // If the user is logged in and trying to access a protected route
    if (auth.userId && !auth.isPublicRoute) {
      const response = NextResponse.next()
      
      // Add custom headers for authenticated requests
      response.headers.set('x-user-id', auth.userId)
      response.headers.set(
        'x-user-roles',
        auth.sessionClaims?.roles?.join(',') ?? ''
      )
      
      return response
    }

    // Allow users visiting public routes
    return NextResponse.next()
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
} 