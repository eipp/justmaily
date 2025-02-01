"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewProject;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const textarea_1 = require("@/components/ui/textarea");
const label_1 = require("@/components/ui/label");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
function NewProject() {
    const router = (0, navigation_1.useRouter)();
    const { supabase, user } = useSupabase();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        description: '',
        settings: {
            enableAI: true,
            enableAnalytics: true,
            enableCollaboration: true,
            defaultLanguage: 'en',
            timezone: 'UTC',
        },
        integrations: {
            matrixRoom: '',
            aiModel: 'gpt-4',
            analyticsProvider: 'vespa',
        },
    });
    const handleInputChange = (e, section, field) => {
        if (section && field) {
            setFormData((prev) => (Object.assign(Object.assign({}, prev), { [section]: Object.assign(Object.assign({}, prev[section]), { [field]: e.target.value }) })));
        }
        else {
            setFormData((prev) => (Object.assign(Object.assign({}, prev), { [e.target.name]: e.target.value })));
        }
    };
    const handleToggleSetting = (setting) => {
        setFormData((prev) => (Object.assign(Object.assign({}, prev), { settings: Object.assign(Object.assign({}, prev.settings), { [setting]: !prev.settings[setting] }) })));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const { data: project, error } = await supabase
                .from('projects')
                .insert([
                {
                    name: formData.name,
                    description: formData.description,
                    settings: formData.settings,
                    integrations: formData.integrations,
                    owner_id: user === null || user === void 0 ? void 0 : user.id,
                },
            ])
                .select()
                .single();
            if (error)
                throw error;
            // Create Matrix room for the project
            if (formData.settings.enableCollaboration && formData.integrations.matrixRoom) {
                // Matrix room creation logic here
            }
            // Initialize AI model for the project
            if (formData.settings.enableAI) {
                // AI model initialization logic here
            }
            // Set up analytics
            if (formData.settings.enableAnalytics) {
                // Analytics setup logic here
            }
            router.push(`/projects/${project.id}`);
        }
        catch (error) {
            setError(error.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="container mx-auto max-w-3xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Set up a new project with AI-powered features and collaboration tools
          </p>
        </div>

        {error && (<div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <div className="flex items-center">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-400"/>
              <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div>
              <label_1.Label htmlFor="name">Project Name</label_1.Label>
              <input_1.Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1" placeholder="My Awesome Project" disabled={isLoading}/>
            </div>

            <div>
              <label_1.Label htmlFor="description">Description</label_1.Label>
              <textarea_1.Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="mt-1" placeholder="Describe your project..." disabled={isLoading}/>
            </div>
          </div>

          <tabs_1.Tabs defaultValue="settings" className="space-y-4">
            <tabs_1.TabsList>
              <tabs_1.TabsTrigger value="settings" className="flex items-center">
                <lucide_react_1.Settings className="mr-2 h-4 w-4"/>
                Settings
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="integrations" className="flex items-center">
                <lucide_react_1.Users className="mr-2 h-4 w-4"/>
                Integrations
              </tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="analytics" className="flex items-center">
                <lucide_react_1.BarChart3 className="mr-2 h-4 w-4"/>
                Analytics
              </tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <tabs_1.TabsContent value="settings" className="space-y-4">
              {/* Project Settings */}
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <h3 className="text-lg font-medium">Project Settings</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="enableAI">Enable AI Features</label_1.Label>
                    <input type="checkbox" id="enableAI" checked={formData.settings.enableAI} onChange={() => handleToggleSetting('enableAI')} className="h-4 w-4 rounded border-gray-300" disabled={isLoading}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="enableAnalytics">Enable Analytics</label_1.Label>
                    <input type="checkbox" id="enableAnalytics" checked={formData.settings.enableAnalytics} onChange={() => handleToggleSetting('enableAnalytics')} className="h-4 w-4 rounded border-gray-300" disabled={isLoading}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="enableCollaboration">Enable Collaboration</label_1.Label>
                    <input type="checkbox" id="enableCollaboration" checked={formData.settings.enableCollaboration} onChange={() => handleToggleSetting('enableCollaboration')} className="h-4 w-4 rounded border-gray-300" disabled={isLoading}/>
                  </div>

                  <div>
                    <label_1.Label htmlFor="defaultLanguage">Default Language</label_1.Label>
                    <select id="defaultLanguage" value={formData.settings.defaultLanguage} onChange={(e) => handleInputChange(e, 'settings', 'defaultLanguage')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" disabled={isLoading}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="timezone">Timezone</label_1.Label>
                    <select id="timezone" value={formData.settings.timezone} onChange={(e) => handleInputChange(e, 'settings', 'timezone')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" disabled={isLoading}>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                    </select>
                  </div>
                </div>
              </div>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="integrations" className="space-y-4">
              {/* Integrations */}
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <h3 className="text-lg font-medium">Integrations</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label_1.Label htmlFor="matrixRoom">Matrix Room ID</label_1.Label>
                    <input_1.Input id="matrixRoom" value={formData.integrations.matrixRoom} onChange={(e) => handleInputChange(e, 'integrations', 'matrixRoom')} className="mt-1" placeholder="!roomid:matrix.org" disabled={isLoading || !formData.settings.enableCollaboration}/>
                  </div>

                  <div>
                    <label_1.Label htmlFor="aiModel">AI Model</label_1.Label>
                    <select id="aiModel" value={formData.integrations.aiModel} onChange={(e) => handleInputChange(e, 'integrations', 'aiModel')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" disabled={isLoading || !formData.settings.enableAI}>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                    </select>
                  </div>
                </div>
              </div>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="analytics" className="space-y-4">
              {/* Analytics Settings */}
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <h3 className="text-lg font-medium">Analytics Configuration</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label_1.Label htmlFor="analyticsProvider">Analytics Provider</label_1.Label>
                    <select id="analyticsProvider" value={formData.integrations.analyticsProvider} onChange={(e) => handleInputChange(e, 'integrations', 'analyticsProvider')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" disabled={isLoading || !formData.settings.enableAnalytics}>
                      <option value="vespa">Vespa</option>
                      <option value="elasticsearch">Elasticsearch</option>
                      <option value="clickhouse">ClickHouse</option>
                    </select>
                  </div>
                </div>
              </div>
            </tabs_1.TabsContent>
          </tabs_1.Tabs>

          <div className="flex justify-end space-x-4">
            <button_1.Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </button_1.Button>
            <button_1.Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Project...' : 'Create Project'}
            </button_1.Button>
          </div>
        </form>
      </div>
    </div>);
}
