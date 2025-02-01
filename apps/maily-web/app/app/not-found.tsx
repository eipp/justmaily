import Link from 'next/link'
import { Button } from '@/components/ui/atoms/button'

export default function NotFound() {
  return (
    <div className="flex h-[100vh] flex-col items-center justify-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="mb-4 text-7xl font-bold">404</div>
        <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
        <p className="mb-4 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. The page you are
          looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  )
} 