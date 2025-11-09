import { useState, useEffect, useCallback } from 'react';
import type { Document } from '../components/DocumentManager';

const STORAGE_KEY = 'mdtopdf_documents';
const CURRENT_DOC_KEY = 'mdtopdf_current_document';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document>(() => {
    // Always start with a fresh, unsaved document
    return {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });

  // Load all documents from localStorage
  const loadDocuments = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const docs = JSON.parse(stored) as Document[];
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }, []);

  // Save documents to localStorage
  const saveDocuments = useCallback((docs: Document[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to save documents:', error);
    }
  }, []);

  // Save current document to localStorage
  const saveCurrentDocument = useCallback((doc: Document) => {
    try {
      setCurrentDocument(doc);
      
      // Only save to localStorage if the document has a title
      if (!doc.title.trim()) {
        return;
      }
      
      localStorage.setItem(CURRENT_DOC_KEY, JSON.stringify(doc));
      
      // Update the document in the documents list
      const stored = localStorage.getItem(STORAGE_KEY);
      let docs: Document[] = [];
      if (stored) {
        docs = JSON.parse(stored);
      }
      
      const index = docs.findIndex(d => d.id === doc.id);
      if (index >= 0) {
        docs[index] = doc;
      } else {
        docs.push(doc);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to save current document:', error);
    }
  }, []);

  // Update current document content
  const updateCurrentDocument = useCallback((content: string) => {
    const updated: Document = {
      ...currentDocument,
      content,
      updatedAt: Date.now(),
    };
    saveCurrentDocument(updated);
  }, [currentDocument, saveCurrentDocument]);

  // Update current document title
  const updateDocumentTitle = useCallback((title: string) => {
    const updated: Document = {
      ...currentDocument,
      title,
      updatedAt: Date.now(),
    };
    saveCurrentDocument(updated);
  }, [currentDocument, saveCurrentDocument]);

  // Create a new document
  const createDocument = useCallback(() => {
    const newDoc: Document = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCurrentDocument(newDoc);
    return newDoc;
  }, []);

  // Switch to a different document
  const switchDocument = useCallback((doc: Document) => {
    saveCurrentDocument(doc);
  }, [saveCurrentDocument]);

  // Delete a document
  const deleteDocument = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let docs = JSON.parse(stored) as Document[];
        docs = docs.filter(d => d.id !== id);
        saveDocuments(docs);
        
        // If we deleted the current document, create a new one
        if (currentDocument.id === id) {
          const newDoc: Document = {
            id: crypto.randomUUID(),
            title: '',
            content: '',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setCurrentDocument(newDoc);
        }
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  }, [currentDocument.id, saveDocuments]);

  // Rename a document
  const renameDocument = useCallback((id: string, newTitle: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const docs = JSON.parse(stored) as Document[];
        const doc = docs.find(d => d.id === id);
        if (doc) {
          doc.title = newTitle;
          doc.updatedAt = Date.now();
          saveDocuments(docs);
          
          // Update current document if it's the one being renamed
          if (currentDocument.id === id) {
            setCurrentDocument(doc);
            localStorage.setItem(CURRENT_DOC_KEY, JSON.stringify(doc));
          }
        }
      }
    } catch (error) {
      console.error('Failed to rename document:', error);
    }
  }, [currentDocument.id, saveDocuments]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documents,
    currentDocument,
    updateCurrentDocument,
    updateDocumentTitle,
    createDocument,
    switchDocument,
    deleteDocument,
    renameDocument,
  };
};
