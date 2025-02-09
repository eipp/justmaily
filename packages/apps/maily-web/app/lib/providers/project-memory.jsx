"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectMemoryProvider = ProjectMemoryProvider;
exports.useProjectMemory = useProjectMemory;
const react_1 = require("react");
const supabase_js_1 = require("@supabase/supabase-js");
const matrix_1 = require("./matrix");
const initialState = {
    projects: [],
    currentProject: null,
    chatHistory: [],
    activePanels: [],
    isLoading: false,
    error: null
};
const ProjectMemoryContext = (0, react_1.createContext)(null);
function projectMemoryReducer(state, action) {
    var _a, _b;
    switch (action.type) {
        case 'SET_PROJECTS':
            return Object.assign(Object.assign({}, state), { projects: action.payload });
        case 'SET_CURRENT_PROJECT':
            return Object.assign(Object.assign({}, state), { currentProject: action.payload });
        case 'ADD_PROJECT':
            return Object.assign(Object.assign({}, state), { projects: [...state.projects, action.payload] });
        case 'UPDATE_PROJECT':
            return Object.assign(Object.assign({}, state), { projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p), currentProject: ((_a = state.currentProject) === null || _a === void 0 ? void 0 : _a.id) === action.payload.id
                    ? action.payload
                    : state.currentProject });
        case 'DELETE_PROJECT':
            return Object.assign(Object.assign({}, state), { projects: state.projects.filter(p => p.id !== action.payload), currentProject: ((_b = state.currentProject) === null || _b === void 0 ? void 0 : _b.id) === action.payload
                    ? null
                    : state.currentProject });
        case 'SET_CHAT_HISTORY':
            return Object.assign(Object.assign({}, state), { chatHistory: action.payload });
        case 'ADD_MESSAGE':
            return Object.assign(Object.assign({}, state), { chatHistory: [...state.chatHistory, action.payload] });
        case 'UPDATE_MESSAGE':
            return Object.assign(Object.assign({}, state), { chatHistory: state.chatHistory.map(m => m.id === action.payload.id ? action.payload : m) });
        case 'DELETE_MESSAGE':
            return Object.assign(Object.assign({}, state), { chatHistory: state.chatHistory.filter(m => m.id !== action.payload) });
        case 'SET_ACTIVE_PANELS':
            return Object.assign(Object.assign({}, state), { activePanels: action.payload });
        case 'ADD_PANEL':
            return Object.assign(Object.assign({}, state), { activePanels: [...state.activePanels, action.payload] });
        case 'REMOVE_PANEL':
            return Object.assign(Object.assign({}, state), { activePanels: state.activePanels.filter(p => p.id !== action.payload) });
        case 'SET_LOADING':
            return Object.assign(Object.assign({}, state), { isLoading: action.payload });
        case 'SET_ERROR':
            return Object.assign(Object.assign({}, state), { error: action.payload });
        default:
            return state;
    }
}
function ProjectMemoryProvider({ children }) {
    var _a;
    const [state, dispatch] = (0, react_1.useReducer)(projectMemoryReducer, initialState);
    const matrixClient = (0, matrix_1.useMatrixClient)();
    const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    // Load initial data
    (0, react_1.useEffect)(() => {
        loadProjects();
    }, []);
    // Load projects when switching rooms
    (0, react_1.useEffect)(() => {
        if (state.currentProject) {
            loadChatHistory(state.currentProject.id);
        }
    }, [(_a = state.currentProject) === null || _a === void 0 ? void 0 : _a.id]);
    const loadProjects = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const { data: projects, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            dispatch({ type: 'SET_PROJECTS', payload: projects });
        }
        catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
        finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    const loadChatHistory = async (projectId) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const { data: messages, error } = await supabase
                .from('messages')
                .select('*')
                .eq('project_id', projectId)
                .order('timestamp', { ascending: true });
            if (error)
                throw error;
            dispatch({ type: 'SET_CHAT_HISTORY', payload: messages });
        }
        catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
        finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    const createProject = async (name, description) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const { data: project, error } = await supabase
                .from('projects')
                .insert([{ name, description }])
                .single();
            if (error)
                throw error;
            dispatch({ type: 'ADD_PROJECT', payload: project });
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
        }
        catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
        finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    const switchProject = async (projectId) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const project = state.projects.find(p => p.id === projectId);
            if (!project)
                throw new Error('Project not found');
            dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
            await loadChatHistory(projectId);
        }
        catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
        finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    const sendMessage = async (message) => {
        try {
            if (!state.currentProject)
                throw new Error('No project selected');
            const { data: newMessage, error } = await supabase
                .from('messages')
                .insert([
                Object.assign(Object.assign({}, message), { project_id: state.currentProject.id })
            ])
                .single();
            if (error)
                throw error;
            dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
            // Sync with Matrix
            if (matrixClient) {
                await matrixClient.sendMessage(state.currentProject.id, {
                    msgtype: 'm.text',
                    body: message.content
                });
            }
        }
        catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };
    const updateMessage = async (message) => {
        try {
            const { data: updatedMessage, error } = await supabase
                .from('messages')
                .update(message)
                .eq('id', message.id)
                .single();
            if (error)
                throw error;
            dispatch({ type: 'UPDATE_MESSAGE', payload: updatedMessage });
        }
        catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };
    const deleteMessage = async (messageId) => {
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);
            if (error)
                throw error;
            dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
        }
        catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };
    const addPanel = (0, react_1.useCallback)((panel) => {
        const newPanel = Object.assign(Object.assign({}, panel), { id: Math.random().toString(36).substr(2, 9) });
        dispatch({ type: 'ADD_PANEL', payload: newPanel });
    }, []);
    const removePanel = (0, react_1.useCallback)((panelId) => {
        dispatch({ type: 'REMOVE_PANEL', payload: panelId });
    }, []);
    return (<ProjectMemoryContext.Provider value={{
            state,
            createProject,
            switchProject,
            sendMessage,
            updateMessage,
            deleteMessage,
            addPanel,
            removePanel
        }}>
      {children}
    </ProjectMemoryContext.Provider>);
}
function useProjectMemory() {
    const context = (0, react_1.useContext)(ProjectMemoryContext);
    if (!context) {
        throw new Error('useProjectMemory must be used within a ProjectMemoryProvider');
    }
    return context;
}
