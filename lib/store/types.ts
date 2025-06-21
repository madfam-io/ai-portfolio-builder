/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { User } from '@supabase/supabase-js';

import { Portfolio } from '@/types/portfolio';

/**
 * Global Store Types
 * Centralized type definitions for all Zustand stores
 */

// Auth Store Types
export interface AuthState {
  user: User | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: User;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      user: User;
    } | null
  ) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, string>
  ) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (
    provider: 'google' | 'github' | 'linkedin_oidc'
  ) => Promise<void>;
  resetAuth: () => void;
  initializeAuth: () => Promise<void>;
}

// Portfolio Store Types
export interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  currentPortfolioId: string | null;
  isEditing: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  lastSaved: Date | null;
  history: Portfolio[];
  historyIndex: number;
  hasUnsavedChanges: boolean;
}

export interface PortfolioActions {
  setPortfolios: (portfolios: Portfolio[]) => void;
  setCurrentPortfolio: (portfolio: Portfolio | null) => void;
  setEditing: (isEditing: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  loadPortfolios: () => Promise<Portfolio[]>;
  loadPortfolio: (id: string) => Promise<Portfolio>;
  createPortfolio: (data: Partial<Portfolio>) => Promise<Portfolio>;
  updatePortfolio: (id: string, data: Partial<Portfolio>) => Promise<Portfolio>;
  deletePortfolio: (id: string) => Promise<void>;
  savePortfolio: () => Promise<void>;
  updatePortfolioData: (field: string, value: unknown) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetPortfolios: () => void;
}

// UI Store Types
export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface Modal {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  modals: Modal[];
  toasts: Toast[];
  globalLoading: boolean;
  loadingMessage: string | null;
}

export interface UIActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: Modal) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setGlobalLoading: (loading: boolean, message?: string | null) => void;
}

// AI Store Types
export interface AIModel {
  id: string;
  name: string;
  provider: 'huggingface' | 'openai' | 'anthropic';
  capabilities: string[];
  costPerRequest: number;
  qualityRating: number;
  speedRating: number;
}

export interface AIEnhancement {
  id: string;
  type: 'bio' | 'project' | 'template';
  originalText: string;
  enhancedText: string;
  model: string;
  timestamp: Date;
  quality: number;
}

export interface AIState {
  selectedModels: {
    bio: string;
    project: string;
    template: string;
  };
  availableModels: AIModel[];
  enhancementHistory: AIEnhancement[];
  quotaUsed: number;
  quotaLimit: number;
  isProcessing: boolean;
  error: string | null;
}

export interface AIActions {
  setSelectedModel: (
    type: 'bio' | 'project' | 'template',
    modelId: string
  ) => void;
  setAvailableModels: (models: AIModel[]) => void;
  addEnhancement: (enhancement: AIEnhancement) => void;
  clearHistory: () => void;
  setQuota: (used: number, limit: number) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  enhanceBio: (text: string) => Promise<string>;
  enhanceProject: (text: string) => Promise<string>;
  recommendTemplate: (data: Record<string, unknown>) => Promise<{
    recommendedTemplate: string;
    confidence: number;
    alternatives: string[];
  }>;
  loadModels: () => Promise<void>;
}

// Combined Store Type
export interface RootState {
  auth: AuthState & AuthActions;
  portfolio: PortfolioState & PortfolioActions;
  ui: UIState & UIActions;
  ai: AIState & AIActions;
}

// Persist Config Type
export interface PersistConfig {
  name: string;
  version: number;
  partialize?: <T>(state: T) => Partial<T>;
}
