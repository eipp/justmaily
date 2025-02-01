"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ApiSettingsPage;
const react_query_1 = require("@tanstack/react-query");
const button_1 = require("@/components/ui/atoms/button");
const separator_1 = require("@/components/ui/atoms/separator");
const client_1 = require("@/lib/api/client");
const use_toast_1 = require("@/components/ui/atoms/use-toast");
const card_1 = require("@/components/ui/atoms/card");
const badge_1 = require("@/components/ui/atoms/badge");
const input_1 = require("@/components/ui/atoms/input");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
function ApiSettingsPage() {
    const { data: apiKeys, isLoading } = (0, react_query_1.useQuery)({
        queryKey: ['api-keys'],
        queryFn: () => client_1.api.apiKeys.list(),
    });
    const { mutate: createApiKey, isLoading: isCreating } = (0, react_query_1.useMutation)({
        mutationFn: (name) => client_1.api.apiKeys.create({ name }),
        onSuccess: () => {
            (0, use_toast_1.toast)({
                title: 'Success',
                description: 'API key has been created.',
            });
        },
        onError: () => {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Failed to create API key.',
                variant: 'destructive',
            });
        },
    });
    const { mutate: revokeApiKey, isLoading: isRevoking } = (0, react_query_1.useMutation)({
        mutationFn: (id) => client_1.api.apiKeys.revoke(id),
        onSuccess: () => {
            (0, use_toast_1.toast)({
                title: 'Success',
                description: 'API key has been revoked.',
            });
        },
        onError: () => {
            (0, use_toast_1.toast)({
                title: 'Error',
                description: 'Failed to revoke API key.',
                variant: 'destructive',
            });
        },
    });
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        (0, use_toast_1.toast)({
            title: 'Copied',
            description: 'API key has been copied to clipboard.',
        });
    };
    return (<div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">API Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your API keys and access the API documentation.
        </p>
      </div>
      <separator_1.Separator />
      <div className="space-y-8">
        {/* API Documentation */}
        <div>
          <h4 className="text-sm font-medium mb-4">API Documentation</h4>
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Getting Started</card_1.CardTitle>
              <card_1.CardDescription>
                Learn how to integrate Maily with your application.
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">Base URL</h5>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  https://api.maily.app/v1
                </code>
              </div>
              <div>
                <h5 className="font-medium mb-2">Authentication</h5>
                <p className="text-sm text-muted-foreground">
                  All API requests must include your API key in the
                  Authorization header:
                </p>
                <pre className="mt-2 rounded bg-muted p-4 overflow-x-auto">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </pre>
              </div>
            </card_1.CardContent>
            <card_1.CardFooter>
              <button_1.Button variant="outline" className="w-full">
                View Full Documentation
              </button_1.Button>
            </card_1.CardFooter>
          </card_1.Card>
        </div>

        {/* API Keys */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">API Keys</h4>
            <button_1.Button onClick={() => createApiKey('Default')} disabled={isCreating} loading={isCreating}>
              <lucide_react_1.Key className="h-4 w-4 mr-2"/>
              Create API Key
            </button_1.Button>
          </div>
          <div className="space-y-4">
            {apiKeys === null || apiKeys === void 0 ? void 0 : apiKeys.map((apiKey) => (<card_1.Card key={apiKey.id}>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle>{apiKey.name}</card_1.CardTitle>
                      <card_1.CardDescription>
                        Created{' '}
                        {(0, date_fns_1.formatDistanceToNow)(new Date(apiKey.createdAt), {
                addSuffix: true,
            })}
                      </card_1.CardDescription>
                    </div>
                    {apiKey.lastUsed && (<badge_1.Badge variant="secondary">
                        Last used{' '}
                        {(0, date_fns_1.formatDistanceToNow)(new Date(apiKey.lastUsed), {
                    addSuffix: true,
                })}
                      </badge_1.Badge>)}
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="flex items-center gap-x-2">
                    <input_1.Input value={apiKey.key} readOnly className="font-mono"/>
                    <button_1.Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKey.key)}>
                      <lucide_react_1.Copy className="h-4 w-4"/>
                    </button_1.Button>
                  </div>
                </card_1.CardContent>
                <card_1.CardFooter>
                  <button_1.Button variant="destructive" onClick={() => revokeApiKey(apiKey.id)} disabled={isRevoking} loading={isRevoking}>
                    <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
                    Revoke Key
                  </button_1.Button>
                </card_1.CardFooter>
              </card_1.Card>))}
          </div>
        </div>
      </div>
    </div>);
}
