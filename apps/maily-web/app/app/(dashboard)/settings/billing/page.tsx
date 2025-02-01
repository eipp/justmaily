'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/atoms/button'
import { Separator } from '@/components/ui/atoms/separator'
import { api } from '@/lib/api/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/atoms/card'
import { Badge } from '@/components/ui/atoms/badge'
import { Progress } from '@/components/ui/atoms/progress'
import { formatDistanceToNow } from 'date-fns'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  limits: {
    subscribers: number
    campaigns: number
    teamMembers: number
  }
}

interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'past_due'
  plan: Plan
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface Usage {
  subscribers: {
    count: number
    limit: number
  }
  campaigns: {
    count: number
    limit: number
  }
  teamMembers: {
    count: number
    limit: number
  }
}

export default function BillingSettingsPage() {
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.billing.getSubscription(),
  })

  const { data: usage, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['usage'],
    queryFn: () => api.billing.getUsage(),
  })

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.billing.listPlans(),
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>
      <Separator />
      <div className="space-y-8">
        {/* Current Plan */}
        <div>
          <h4 className="text-sm font-medium mb-4">Current Plan</h4>
          {subscription && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{subscription.plan.name}</CardTitle>
                    <CardDescription>
                      ${subscription.plan.price}/month
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      subscription.status === 'active'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {subscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {subscription.cancelAtPeriodEnd
                    ? 'Your subscription will end on '
                    : 'Your next billing date is '}
                  {formatDistanceToNow(
                    new Date(subscription.currentPeriodEnd),
                    { addSuffix: true }
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  {subscription.cancelAtPeriodEnd
                    ? 'Resume Subscription'
                    : 'Cancel Subscription'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Usage */}
        {usage && (
          <div>
            <h4 className="text-sm font-medium mb-4">Usage</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Subscribers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>{usage.subscribers.count}</div>
                      <div className="text-muted-foreground">
                        of {usage.subscribers.limit}
                      </div>
                    </div>
                    <Progress
                      value={
                        (usage.subscribers.count / usage.subscribers.limit) *
                        100
                      }
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>{usage.campaigns.count}</div>
                      <div className="text-muted-foreground">
                        of {usage.campaigns.limit}
                      </div>
                    </div>
                    <Progress
                      value={
                        (usage.campaigns.count / usage.campaigns.limit) * 100
                      }
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>{usage.teamMembers.count}</div>
                      <div className="text-muted-foreground">
                        of {usage.teamMembers.limit}
                      </div>
                    </div>
                    <Progress
                      value={
                        (usage.teamMembers.count / usage.teamMembers.limit) *
                        100
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Available Plans */}
        <div>
          <h4 className="text-sm font-medium mb-4">Available Plans</h4>
          <div className="grid gap-4 md:grid-cols-3">
            {plans?.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>${plan.price}/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={
                      subscription?.plan.id === plan.id
                        ? 'secondary'
                        : 'default'
                    }
                    className="w-full"
                    disabled={subscription?.plan.id === plan.id}
                  >
                    {subscription?.plan.id === plan.id
                      ? 'Current Plan'
                      : 'Upgrade'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 