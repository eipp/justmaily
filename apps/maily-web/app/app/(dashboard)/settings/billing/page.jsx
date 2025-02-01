"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BillingSettingsPage;
const react_query_1 = require("@tanstack/react-query");
const button_1 = require("@/components/ui/atoms/button");
const separator_1 = require("@/components/ui/atoms/separator");
const client_1 = require("@/lib/api/client");
const card_1 = require("@/components/ui/atoms/card");
const badge_1 = require("@/components/ui/atoms/badge");
const progress_1 = require("@/components/ui/atoms/progress");
const date_fns_1 = require("date-fns");
function BillingSettingsPage() {
    const { data: subscription, isLoading: isLoadingSubscription } = (0, react_query_1.useQuery)({
        queryKey: ['subscription'],
        queryFn: () => client_1.api.billing.getSubscription(),
    });
    const { data: usage, isLoading: isLoadingUsage } = (0, react_query_1.useQuery)({
        queryKey: ['usage'],
        queryFn: () => client_1.api.billing.getUsage(),
    });
    const { data: plans, isLoading: isLoadingPlans } = (0, react_query_1.useQuery)({
        queryKey: ['plans'],
        queryFn: () => client_1.api.billing.listPlans(),
    });
    return (<div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>
      <separator_1.Separator />
      <div className="space-y-8">
        {/* Current Plan */}
        <div>
          <h4 className="text-sm font-medium mb-4">Current Plan</h4>
          {subscription && (<card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <card_1.CardTitle>{subscription.plan.name}</card_1.CardTitle>
                    <card_1.CardDescription>
                      ${subscription.plan.price}/month
                    </card_1.CardDescription>
                  </div>
                  <badge_1.Badge variant={subscription.status === 'active'
                ? 'default'
                : 'destructive'}>
                    {subscription.status}
                  </badge_1.Badge>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-sm text-muted-foreground">
                  {subscription.cancelAtPeriodEnd
                ? 'Your subscription will end on '
                : 'Your next billing date is '}
                  {(0, date_fns_1.formatDistanceToNow)(new Date(subscription.currentPeriodEnd), { addSuffix: true })}
                </div>
              </card_1.CardContent>
              <card_1.CardFooter>
                <button_1.Button variant="outline">
                  {subscription.cancelAtPeriodEnd
                ? 'Resume Subscription'
                : 'Cancel Subscription'}
                </button_1.Button>
              </card_1.CardFooter>
            </card_1.Card>)}
        </div>

        {/* Usage */}
        {usage && (<div>
            <h4 className="text-sm font-medium mb-4">Usage</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm font-medium">
                    Subscribers
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>{usage.subscribers.count}</div>
                      <div className="text-muted-foreground">
                        of {usage.subscribers.limit}
                      </div>
                    </div>
                    <progress_1.Progress value={(usage.subscribers.count / usage.subscribers.limit) *
                100}/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm font-medium">
                    Campaigns
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>{usage.campaigns.count}</div>
                      <div className="text-muted-foreground">
                        of {usage.campaigns.limit}
                      </div>
                    </div>
                    <progress_1.Progress value={(usage.campaigns.count / usage.campaigns.limit) * 100}/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-sm font-medium">
                    Team Members
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>{usage.teamMembers.count}</div>
                      <div className="text-muted-foreground">
                        of {usage.teamMembers.limit}
                      </div>
                    </div>
                    <progress_1.Progress value={(usage.teamMembers.count / usage.teamMembers.limit) *
                100}/>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </div>)}

        {/* Available Plans */}
        <div>
          <h4 className="text-sm font-medium mb-4">Available Plans</h4>
          <div className="grid gap-4 md:grid-cols-3">
            {plans === null || plans === void 0 ? void 0 : plans.map((plan) => (<card_1.Card key={plan.id}>
                <card_1.CardHeader>
                  <card_1.CardTitle>{plan.name}</card_1.CardTitle>
                  <card_1.CardDescription>${plan.price}/month</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    {plan.features.map((feature, index) => (<li key={index}>{feature}</li>))}
                  </ul>
                </card_1.CardContent>
                <card_1.CardFooter>
                  <button_1.Button variant={(subscription === null || subscription === void 0 ? void 0 : subscription.plan.id) === plan.id
                ? 'secondary'
                : 'default'} className="w-full" disabled={(subscription === null || subscription === void 0 ? void 0 : subscription.plan.id) === plan.id}>
                    {(subscription === null || subscription === void 0 ? void 0 : subscription.plan.id) === plan.id
                ? 'Current Plan'
                : 'Upgrade'}
                  </button_1.Button>
                </card_1.CardFooter>
              </card_1.Card>))}
          </div>
        </div>
      </div>
    </div>);
}
