import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Layout from '../components/Layout';
import { dealService } from '../services/deal.service';
import { companyService } from '../services/company.service';
import type { Deal, DealFormData, DealStage } from '../types/deal';
import type { Company } from '../types/company';
import { Plus, X, DollarSign, TrendingUp, User } from 'lucide-react';

const STAGES: DealStage[] = ['SOURCING', 'SCREENING', 'DUE_DILIGENCE', 'NEGOTIATION', 'CLOSING', 'CLOSED'];

const STAGE_COLORS: Record<DealStage, string> = {
  SOURCING: 'bg-slate-100 border-slate-300',
  SCREENING: 'bg-blue-100 border-blue-300',
  DUE_DILIGENCE: 'bg-yellow-100 border-yellow-300',
  NEGOTIATION: 'bg-orange-100 border-orange-300',
  CLOSING: 'bg-purple-100 border-purple-300',
  CLOSED: 'bg-green-100 border-green-300',
};

const STAGE_LABELS: Record<DealStage, string> = {
  SOURCING: 'Sourcing',
  SCREENING: 'Screening',
  DUE_DILIGENCE: 'Due Diligence',
  NEGOTIATION: 'Negotiation',
  CLOSING: 'Closing',
  CLOSED: 'Closed',
};

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
  isDragging?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onClick, isDragging = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: deal.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const companyName = typeof deal.company === 'object' && 'name' in deal.company 
    ? deal.company.name 
    : '';
  
  const ownerName = typeof deal.user === 'object' && 'firstName' in deal.user
    ? `${deal.user.firstName} ${deal.user.lastName}`
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <h4 className="font-semibold text-gray-900 mb-2">{companyName}</h4>
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-1" />
          {deal.dealAmount ? `$${deal.dealAmount.toLocaleString()}` : 'N/A'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          {deal.probability !== undefined ? `${deal.probability}%` : 'N/A'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <User className="w-4 h-4 mr-1" />
          {ownerName || 'Unassigned'}
        </div>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  stage: DealStage;
  deals: Deal[];
  onDealClick: (dealId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, deals, onDealClick }) => {
  const { setNodeRef } = useDroppable({
    id: stage,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div ref={setNodeRef} className={`rounded-lg border-2 ${STAGE_COLORS[stage]} p-4 h-full min-h-[500px]`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">{STAGE_LABELS[stage]}</h3>
          <span className="bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-600">
            {deals.length}
          </span>
        </div>
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onClick={() => onDealClick(deal.id)}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

const DealsPage: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState<DealFormData>({
    name: '',
    description: '',
    stage: 'SOURCING',
    status: 'ACTIVE',
    dealType: 'ACQUISITION',
    companyId: '',
    valuation: undefined,
    dealAmount: undefined,
    closeDate: '',
    probability: undefined,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dealsData, companiesData] = await Promise.all([
        dealService.getAll(),
        companyService.getAll(),
      ]);
      setDeals(dealsData);
      setCompanies(companiesData);
    } catch (err) {
      setError('Failed to load deals. Please try again.');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDealsByStage = (stage: DealStage): Deal[] => {
    return deals.filter((deal) => deal.stage === stage);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;
    const deal = deals.find((d) => d.id === dealId);

    if (!deal || deal.stage === newStage) return;

    try {
      const updatedDeal = await dealService.updateStage(dealId, newStage);
      setDeals((prevDeals) =>
        prevDeals.map((d) => (d.id === dealId ? updatedDeal : d))
      );
    } catch (err) {
      console.error('Failed to update deal stage:', err);
      setError('Failed to update deal stage. Please try again.');
    }
  };

  const handleDealClick = (dealId: string) => {
    navigate(`/deals/${dealId}`);
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      stage: 'SOURCING',
      status: 'ACTIVE',
      dealType: 'ACQUISITION',
      companyId: '',
      valuation: undefined,
      dealAmount: undefined,
      closeDate: '',
      probability: undefined,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.companyId) {
      setError('Name and Company are required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const newDeal = await dealService.create(formData);
      setDeals((prev) => [...prev, newDeal]);
      closeModal();
    } catch (err) {
      setError('Failed to create deal. Please try again.');
      console.error('Failed to create deal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading deals...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Deals Pipeline</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Deal
          </button>
        </div>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={getDealsByStage(stage)}
              onDealClick={handleDealClick}
            />
          ))}
        </div>
        <DragOverlay>
          {activeDeal ? (
            <DealCard deal={activeDeal} onClick={() => {}} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Create New Deal</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter deal name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter deal description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {STAGE_LABELS[stage]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Type
                  </label>
                  <select
                    name="dealType"
                    value={formData.dealType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACQUISITION">Acquisition</option>
                    <option value="MERGER">Merger</option>
                    <option value="DIVESTITURE">Divestiture</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valuation
                  </label>
                  <input
                    type="number"
                    name="valuation"
                    value={formData.valuation || ''}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter valuation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Amount
                  </label>
                  <input
                    type="number"
                    name="dealAmount"
                    value={formData.dealAmount || ''}
                    onChange={handleNumberChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter deal amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Close Date
                  </label>
                  <input
                    type="date"
                    name="closeDate"
                    value={formData.closeDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    name="probability"
                    value={formData.probability || ''}
                    onChange={handleNumberChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter probability"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DealsPage;
