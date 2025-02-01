'use client'

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback
} from 'react'
import { createClient } from '@supabase/supabase-js'
import { useMatrixClient } from './matrix'
import { Panel } from '@/components/dynamic-right-panels'

interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

interface ChatMessage {
  id: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'action'
  isPinned: boolean
  isBookmarked: boolean
  metadata?: Record<string, any>
}

interface ProjectMemoryState {
  projects: Project[]
  currentProject: Project | null
  chatHistory: ChatMessage[]
  activePanels: Panel[]
  isLoading: boolean
  error: string | null
}

type ProjectMemoryAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_CHAT_HISTORY'; payload: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; payload: ChatMessage }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'SET_ACTIVE_PANELS'; payload: Panel[] }
  | { type: 'ADD_PANEL'; payload: Panel }
  | { type: 'REMOVE_PANEL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: ProjectMemoryState = {
  projects: [],
  currentProject: null,
  chatHistory: [],
  activePanels: [],
  isLoading: false,
  error: null
}

const ProjectMemoryContext = createContext<{
  state: ProjectMemoryState
  createProject: (name: string, description?: string) => Promise<void>
  switchProject: (projectId: string) => Promise<void>
  sendMessage: (message: Omit<ChatMessage, 'id'>) => Promise<void>
  updateMessage: (message: ChatMessage) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  addPanel: (panel: Omit<Panel, 'id'>) => void
  removePanel: (panelId: string) => void
} | null>(null)

function projectMemoryReducer(
  state: ProjectMemoryState,
  action: ProjectMemoryAction
): ProjectMemoryState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload }
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload }
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload]
      }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
        currentProject:
          state.currentProject?.id === action.payload.id
            ? action.payload
            : state.currentProject
      }
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProject:
          state.currentProject?.id === action.payload
            ? null
            : state.currentProject
      }
    case 'SET_CHAT_HISTORY':
      return { ...state, chatHistory: action.payload }
    case 'ADD_MESSAGE':
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload]
      }
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        chatHistory: state.chatHistory.map(m =>
          m.id === action.payload.id ? action.payload : m
        )
      }
    case 'DELETE_MESSAGE':
      return {
        ...state,
        chatHistory: state.chatHistory.filter(m => m.id !== action.payload)
      }
    case 'SET_ACTIVE_PANELS':
      return { ...state, activePanels: action.payload }
    case 'ADD_PANEL':
      return {
        ...state,
        activePanels: [...state.activePanels, action.payload]
      }
    case 'REMOVE_PANEL':
      return {
        ...state,
        activePanels: state.activePanels.filter(p => p.id !== action.payload)
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

export function ProjectMemoryProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [state, dispatch] = useReducer(projectMemoryReducer, initialState)
  const matrixClient = useMatrixClient()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load initial data
  useEffect(() => {
    loadProjects()
  }, [])

  // Load projects when switching rooms
  useEffect(() => {
    if (state.currentProject) {
      loadChatHistory(state.currentProject.id)
    }
  }, [state.currentProject?.id])

  const loadProjects = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      dispatch({ type: 'SET_PROJECTS', payload: projects })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadChatHistory = async (projectId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true })

      if (error) throw error

      dispatch({ type: 'SET_CHAT_HISTORY', payload: messages })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const createProject = async (name: string, description?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { data: project, error } = await supabase
        .from('projects')
        .insert([{ name, description }])
        .single()

      if (error) throw error

      dispatch({ type: 'ADD_PROJECT', payload: project })
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: project })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const switchProject = async (projectId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const project = state.projects.find(p => p.id === projectId)
      if (!project) throw new Error('Project not found')

      dispatch({ type: 'SET_CURRENT_PROJECT', payload: project })
      await loadChatHistory(projectId)
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const sendMessage = async (message: Omit<ChatMessage, 'id'>) => {
    try {
      if (!state.currentProject) throw new Error('No project selected')

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([
          {
            ...message,
            project_id: state.currentProject.id
          }
        ])
        .single()

      if (error) throw error

      dispatch({ type: 'ADD_MESSAGE', payload: newMessage })

      // Sync with Matrix
      if (matrixClient) {
        await matrixClient.sendMessage(state.currentProject.id, {
          msgtype: 'm.text',
          body: message.content
        })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const updateMessage = async (message: ChatMessage) => {
    try {
      const { data: updatedMessage, error } = await supabase
        .from('messages')
        .update(message)
        .eq('id', message.id)
        .single()

      if (error) throw error

      dispatch({ type: 'UPDATE_MESSAGE', payload: updatedMessage })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      dispatch({ type: 'DELETE_MESSAGE', payload: messageId })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const addPanel = useCallback((panel: Omit<Panel, 'id'>) => {
    const newPanel = {
      ...panel,
      id: Math.random().toString(36).substr(2, 9)
    }
    dispatch({ type: 'ADD_PANEL', payload: newPanel })
  }, [])

  const removePanel = useCallback((panelId: string) => {
    dispatch({ type: 'REMOVE_PANEL', payload: panelId })
  }, [])

  return (
    <ProjectMemoryContext.Provider
      value={{
        state,
        createProject,
        switchProject,
        sendMessage,
        updateMessage,
        deleteMessage,
        addPanel,
        removePanel
      }}
    >
      {children}
    </ProjectMemoryContext.Provider>
  )
}

export function useProjectMemory() {
  const context = useContext(ProjectMemoryContext)
  if (!context) {
    throw new Error('useProjectMemory must be used within a ProjectMemoryProvider')
  }
  return context
} 