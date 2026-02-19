import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { dealService } from '../services/deal.service';
import { activityService } from '../services/activity.service';
import { documentService, checklistService } from '../services/diligence.service';
import type { Deal } from '../types/deal';
import type { Activity } from '../types/activity';
import type { Document, Checklist, ChecklistFormData, ChecklistItemFormData } from '../types/diligence';

type TabType = 'overview' | 'documents' | 'checklists';

const DealDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showNewChecklistForm, setShowNewChecklistForm] = useState(false);
  const [showNewItemForm, setShowNewItemForm] = useState<string | null>(null);
  const [newChecklist, setNewChecklist] = useState<ChecklistFormData>({ name: '', category: '' });
  const [newItem, setNewItem] = useState<ChecklistItemFormData>({ title: '', description: '', checklistId: '' });

  const loadDealData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dealData = await dealService.getById(id!);
      setDeal(dealData);
    } catch (err) {
      setError('Failed to load deal details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadActivities = useCallback(async () => {
    try {
      const activitiesData = await activityService.getDealActivities(id!);
      setActivities(activitiesData);
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  }, [id]);

  const loadDocuments = useCallback(async () => {
    try {
      const documentsData = await documentService.getDealDocuments(id!);
      setDocuments(documentsData);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }, [id]);

  const loadChecklists = useCallback(async () => {
    try {
      const checklistsData = await checklistService.getDealChecklists(id!);
      setChecklists(checklistsData);
    } catch (err) {
      console.error('Failed to load checklists:', err);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadDealData();
    }
  }, [id, loadDealData]);

  useEffect(() => {
    if (id) {
      if (activeTab === 'overview') {
        loadActivities();
      } else if (activeTab === 'documents') {
        loadDocuments();
      } else if (activeTab === 'checklists') {
        loadChecklists();
      }
    }
  }, [activeTab, id, loadActivities, loadDocuments, loadChecklists]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    try {
      setUploading(true);
      await documentService.upload(id, file);
      await loadDocuments();
      event.target.value = '';
    } catch (err) {
      console.error('Failed to upload document:', err);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const blob = await documentService.download(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('Failed to download document');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.delete(docId);
      await loadDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document');
    }
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await checklistService.create(id, newChecklist);
      setNewChecklist({ name: '', category: '' });
      setShowNewChecklistForm(false);
      await loadChecklists();
    } catch (err) {
      console.error('Failed to create checklist:', err);
      alert('Failed to create checklist');
    }
  };

  const handleCreateItem = async (e: React.FormEvent, checklistId: string) => {
    e.preventDefault();

    try {
      await checklistService.createItem({ ...newItem, checklistId });
      setNewItem({ title: '', description: '', checklistId: '' });
      setShowNewItemForm(null);
      await loadChecklists();
    } catch (err) {
      console.error('Failed to create item:', err);
      alert('Failed to create item');
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      await checklistService.updateItem(itemId, { completed: !completed });
      await loadChecklists();
    } catch (err) {
      console.error('Failed to update item:', err);
      alert('Failed to update item');
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    if (!window.confirm('Are you sure you want to delete this checklist?')) return;

    try {
      await checklistService.delete(checklistId);
      await loadChecklists();
    } catch (err) {
      console.error('Failed to delete checklist:', err);
      alert('Failed to delete checklist');
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      SOURCING: 'bg-gray-100 text-gray-800',
      SCREENING: 'bg-blue-100 text-blue-800',
      DUE_DILIGENCE: 'bg-yellow-100 text-yellow-800',
      NEGOTIATION: 'bg-purple-100 text-purple-800',
      CLOSING: 'bg-orange-100 text-orange-800',
      CLOSED: 'bg-green-100 text-green-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      WON: 'bg-blue-100 text-blue-800',
      LOST: 'bg-red-100 text-red-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      CALL: '📞',
      MEETING: '🤝',
      EMAIL: '✉️',
      NOTE: '📝',
      TASK: '✅',
      DOCUMENT_UPLOAD: '📄',
      STAGE_CHANGE: '🔄',
    };
    return icons[type] || '📌';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deal details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !deal) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error || 'Deal not found'}</p>
          <button
            onClick={() => navigate('/deals')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Deals
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/deals')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Deals
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{deal.name}</h1>
          <p className="text-gray-600 mt-2">{deal.description}</p>
        </div>

        {/* Deal Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="text-lg font-semibold text-gray-900">
                {typeof deal.company === 'object' ? deal.company.name : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stage</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStageColor(deal.stage)}`}>
                {deal.stage.replace('_', ' ')}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deal.status)}`}>
                {deal.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deal Type</p>
              <p className="text-lg font-semibold text-gray-900">{deal.dealType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Deal Amount</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(deal.dealAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valuation</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(deal.valuation)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Close Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(deal.closeDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Probability</p>
              <p className="text-lg font-semibold text-gray-900">
                {deal.probability ? `${deal.probability}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'documents'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documents ({documents.length})
              </button>
              <button
                onClick={() => setActiveTab('checklists')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'checklists'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Checklists ({checklists.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Timeline</h2>
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No activities yet</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{activity.type.replace('_', ' ')}</h3>
                            <span className="text-sm text-gray-500">{formatDateTime(activity.createdAt)}</span>
                          </div>
                          <p className="text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            by {activity.user.firstName} {activity.user.lastName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                    {uploading ? 'Uploading...' : '+ Upload Document'}
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {documents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{doc.originalName}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500">{formatFileSize(doc.fileSize)}</span>
                            <span className="text-sm text-gray-500">{formatDateTime(doc.createdAt)}</span>
                            {doc.folder && (
                              <span className="text-sm text-gray-500">Folder: {doc.folder}</span>
                            )}
                          </div>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {doc.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Checklists Tab */}
            {activeTab === 'checklists' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Checklists</h2>
                  <button
                    onClick={() => setShowNewChecklistForm(!showNewChecklistForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + New Checklist
                  </button>
                </div>

                {showNewChecklistForm && (
                  <form onSubmit={handleCreateChecklist} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Checklist Name
                        </label>
                        <input
                          type="text"
                          value={newChecklist.name}
                          onChange={(e) => setNewChecklist({ ...newChecklist, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={newChecklist.category}
                          onChange={(e) => setNewChecklist({ ...newChecklist, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewChecklistForm(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {checklists.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No checklists created yet</p>
                ) : (
                  <div className="space-y-6">
                    {checklists.map((checklist) => (
                      <div key={checklist.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{checklist.name}</h3>
                            <span className="text-sm text-gray-500">Category: {checklist.category}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteChecklist(checklist.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="space-y-2">
                          {checklist.items.map((item) => (
                            <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => handleToggleItem(item.id, item.completed)}
                                className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <p className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {item.title}
                                </p>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {showNewItemForm === checklist.id ? (
                          <form onSubmit={(e) => handleCreateItem(e, checklist.id)} className="mt-4 p-3 bg-blue-50 rounded">
                            <div className="space-y-3">
                              <input
                                type="text"
                                placeholder="Item title"
                                value={newItem.title}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Description (optional)"
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex space-x-2">
                                <button
                                  type="submit"
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                  Add Item
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowNewItemForm(null);
                                    setNewItem({ title: '', description: '', checklistId: '' });
                                  }}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setShowNewItemForm(checklist.id)}
                            className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            + Add Item
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DealDetailPage;
