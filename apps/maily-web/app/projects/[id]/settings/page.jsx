"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProjectSettings;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const supabase_1 = require("@/lib/providers/supabase");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const textarea_1 = require("@/components/ui/textarea");
const label_1 = require("@/components/ui/label");
const tabs_1 = require("@/components/ui/tabs");
const dialog_1 = require("@/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
function ProjectSettings({ params }) {
    const router = (0, navigation_1.useRouter)();
    const { supabase, user } = (0, supabase_1.useSupabase)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(false);
    const [showDeleteDialog, setShowDeleteDialog] = (0, react_1.useState)(false);
    const [project, setProject] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadProject();
    }, [params.id]);
    const loadProject = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', params.id)
                .single();
            if (error)
                throw error;
            if (data.owner_id !== (user === null || user === void 0 ? void 0 : user.id)) {
                router.push('/dashboard');
                return;
            }
            setProject(data);
        }
        catch (error) {
            setError('Failed to load project settings');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleInputChange = (e, section, field) => {
        if (!project)
            return;
        if (section && field) {
            setProject((prev) => (Object.assign(Object.assign({}, prev), { [section]: Object.assign(Object.assign({}, prev[section]), { [field]: e.target.value }) })));
        }
        else {
            setProject((prev) => (Object.assign(Object.assign({}, prev), { [e.target.name]: e.target.value })));
        }
    };
    const handleToggleSetting = (setting) => {
        if (!project)
            return;
        setProject((prev) => (Object.assign(Object.assign({}, prev), { settings: Object.assign(Object.assign({}, prev.settings), { [setting]: !prev.settings[setting] }) })));
    };
    const handleSave = async () => {
        if (!project)
            return;
        setIsSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                name: project.name,
                description: project.description,
                settings: project.settings,
                integrations: project.integrations,
                updated_at: new Date().toISOString(),
            })
                .eq('id', project.id);
            if (error)
                throw error;
            setSuccess(true);
        }
        catch (error) {
            setError('Failed to save project settings');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!project)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', project.id);
            if (error)
                throw error;
            router.push('/dashboard');
        }
        catch (error) {
            setError('Failed to delete project');
            setIsLoading(false);
        }
    };
    if (isLoading) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading project settings...</p>
        </div>
      </div>);
    }
    if (!project) {
        return (<div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Project not found</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>);
    }
    return (<div className="container mx-auto max-w-3xl py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Settings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your project settings, integrations, and analytics
            </p>
          </div>
          <button_1.Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="flex items-center">
            <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
            Delete Project
          </button_1.Button>
        </div>

        {error && (<div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <div className="flex items-center">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-red-400"/>
              <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>)}

        {success && (<div className="rounded-md bg-green-50 p-4 dark:bg-green-900/50">
            <p className="text-sm text-green-800 dark:text-green-200">
              Project settings saved successfully
            </p>
          </div>)}

        <div className="space-y-8">
          <div className="space-y-4">
            <div>
              <label_1.Label htmlFor="name">Project Name</label_1.Label>
              <input_1.Input id="name" name="name" value={project.name} onChange={handleInputChange} required className="mt-1" disabled={isSaving}/>
            </div>

            <div>
              <label_1.Label htmlFor="description">Description</label_1.Label>
              <textarea_1.Textarea id="description" name="description" value={project.description} onChange={handleInputChange} className="mt-1" disabled={isSaving}/>
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
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <h3 className="text-lg font-medium">Project Settings</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="enableAI">Enable AI Features</label_1.Label>
                    <input type="checkbox" id="enableAI" checked={project.settings.enableAI} onChange={() => handleToggleSetting('enableAI')} className="h-4 w-4 rounded border-gray-300" disabled={isSaving}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="enableAnalytics">Enable Analytics</label_1.Label>
                    <input type="checkbox" id="enableAnalytics" checked={project.settings.enableAnalytics} onChange={() => handleToggleSetting('enableAnalytics')} className="h-4 w-4 rounded border-gray-300" disabled={isSaving}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <label_1.Label htmlFor="enableCollaboration">Enable Collaboration</label_1.Label>
                    <input type="checkbox" id="enableCollaboration" checked={project.settings.enableCollaboration} onChange={() => handleToggleSetting('enableCollaboration')} className="h-4 w-4 rounded border-gray-300" disabled={isSaving}/>
                  </div>

                  <div>
                    <label_1.Label htmlFor="defaultLanguage">Default Language</label_1.Label>
                    <select id="defaultLanguage" value={project.settings.defaultLanguage} onChange={(e) => handleInputChange(e, 'settings', 'defaultLanguage')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" disabled={isSaving}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="timezone">Timezone</label_1.Label>
                    <select id="timezone" value={project.settings.timezone} onChange={(e) => handleInputChange(e, 'settings', 'timezone')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" disabled={isSaving}>
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
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <h3 className="text-lg font-medium">Integrations</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label_1.Label htmlFor="matrixRoom">Matrix Room ID</label_1.Label>
                    <input_1.Input id="matrixRoom" value={project.integrations.matrixRoom} onChange={(e) => handleInputChange(e, 'integrations', 'matrixRoom')} className="mt-1" placeholder="!roomid:matrix.org" disabled={isSaving || !project.settings.enableCollaboration}/>
                  </div>

                  <div>
                    <label_1.Label htmlFor="aiModel">AI Model</label_1.Label>
                    <select id="aiModel" value={project.integrations.aiModel} onChange={(e) => handleInputChange(e, 'integrations', 'aiModel')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" disabled={isSaving || !project.settings.enableAI}>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                    </select>
                  </div>
                </div>
              </div>
            </tabs_1.TabsContent>

            <tabs_1.TabsContent value="analytics" className="space-y-4">
              <div className="rounded-lg border p-4 dark:border-gray-800">
                <h3 className="text-lg font-medium">Analytics Configuration</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label_1.Label htmlFor="analyticsProvider">Analytics Provider</label_1.Label>
                    <select id="analyticsProvider" value={project.integrations.analyticsProvider} onChange={(e) => handleInputChange(e, 'integrations', 'analyticsProvider')} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" disabled={isSaving || !project.settings.enableAnalytics}>
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
            <button_1.Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
              Cancel
            </button_1.Button>
            <button_1.Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button_1.Button>
          </div>
        </div>
      </div>

      <dialog_1.Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Delete Project</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button_1.Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isLoading}>
                Cancel
              </button_1.Button>
              <button_1.Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete Project'}
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
