import { useState, useEffect } from 'react';

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface DocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocument: Document;
  onDocumentSelect: (doc: Document) => void;
  onDocumentCreate: () => void;
  onDocumentDelete: (id: string) => void;
  onDocumentRename: (id: string, newTitle: string) => void;
}

const DocumentManager = ({
  isOpen,
  onClose,
  currentDocument,
  onDocumentSelect,
  onDocumentCreate,
  onDocumentDelete,
  onDocumentRename,
}: DocumentManagerProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  // Handle Esc key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirm) {
          setDeleteConfirm(null);
        } else if (editingId) {
          cancelRename();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, deleteConfirm, editingId, onClose]);

  const loadDocuments = () => {
    try {
      const stored = localStorage.getItem('mdtopdf_documents');
      if (stored) {
        const docs = JSON.parse(stored) as Document[];
        setDocuments(docs.sort((a, b) => b.updatedAt - a.updatedAt));
      } else {
        // Clear documents if nothing in localStorage
        setDocuments([]);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
    }
  };

  const handleRename = (doc: Document) => {
    setEditingId(doc.id);
    setEditingTitle(doc.title);
  };

  const saveRename = (id: string) => {
    if (editingTitle.trim()) {
      onDocumentRename(id, editingTitle.trim());
      loadDocuments();
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-zinc-800 px-6 py-4 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Documents
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Document Button */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <button
            onClick={() => {
              onDocumentCreate();
              onClose();
            }}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Document
          </button>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-auto">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-12">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">No documents yet</p>
              <p className="text-sm text-zinc-600">Create your first document to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`px-6 py-4 hover:bg-zinc-800 transition-colors ${
                    doc.id === currentDocument.id ? 'bg-zinc-800 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-zinc-400 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      {editingId === doc.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(doc.id);
                            if (e.key === 'Escape') cancelRename();
                          }}
                          className="w-full px-2 py-1 bg-zinc-700 text-white border border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => {
                            onDocumentSelect(doc);
                            onClose();
                          }}
                          className="text-left w-full group"
                        >
                          <h4 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                            {doc.title.trim() || 'Untitled'}
                          </h4>
                          <p className="text-sm text-zinc-500 mt-1">
                            Updated {formatDate(doc.updatedAt)}
                          </p>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {editingId === doc.id ? (
                        <>
                          <button
                            onClick={() => saveRename(doc.id)}
                            className="p-1.5 text-green-400 hover:bg-zinc-700 rounded transition-colors"
                            title="Save"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelRename}
                            className="p-1.5 text-zinc-400 hover:bg-zinc-700 rounded transition-colors"
                            title="Cancel"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRename(doc)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                            title="Rename"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirm({ id: doc.id, title: doc.title.trim() || 'Untitled' });
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-60"
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-linear-to-r from-red-500 to-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Delete Document
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
              </p>
              <p className="text-gray-500 text-sm">
                This action cannot be undone. The document will be permanently removed from your browser's storage.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDocumentDelete(deleteConfirm.id);
                  setDeleteConfirm(null);
                  loadDocuments();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
