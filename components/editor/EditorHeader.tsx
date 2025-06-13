'use client';

import {
  FiSave,
  FiEye,
  FiShare2,
  FiRotateCcw,
  FiRotateCw,
  FiCheckCircle,
  FiLoader,
} from 'react-icons/fi';

import { Portfolio } from '@/types/portfolio';


interface EditorHeaderProps {
  portfolio: Portfolio;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function EditorHeader({
  portfolio,
  isDirty,
  isSaving,
  lastSaved,
  onSave,
  onPublish,
  onPreview,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorHeaderProps) {
  const formatLastSaved = (date?: Date) => {
    if (!date) return 'Never saved';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Saved just now';
    if (minutes === 1) return 'Saved 1 minute ago';
    if (minutes < 60) return `Saved ${minutes} minutes ago`;

    return `Saved at ${date.toLocaleTimeString()}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title and status */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {portfolio.name || 'Untitled Portfolio'}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {isSaving ? (
                <div className="flex items-center space-x-1">
                  <FiLoader className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : isDirty ? (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span>Unsaved changes</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <FiCheckCircle className="w-3 h-3 text-green-500" />
                  <span>{formatLastSaved(lastSaved)}</span>
                </div>
              )}
              <span>•</span>
              <span className="capitalize">{portfolio.template} template</span>
              <span>•</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  portfolio.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {portfolio.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Undo/Redo */}
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
              title="Undo"
            >
              <FiRotateCcw className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
              title="Redo"
            >
              <FiRotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Preview */}
          <button
            onClick={onPreview}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200"
          >
            <FiEye className="w-4 h-4" />
            <span>Preview</span>
          </button>

          {/* Save */}
          <button
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Publish */}
          <button
            onClick={onPublish}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
              portfolio.status === 'published'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <FiShare2 className="w-4 h-4" />
            <span>
              {portfolio.status === 'published' ? 'Unpublish' : 'Publish'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
