import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { dealService } from '../services/deal.service';
import { activityService } from '../services/activity.service';
import type { DealStats } from '../types/deal';
import type { Activity } from '../types/activity';
import { TrendingUp, Building2, Users, FileText } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DealStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        dealService.getStats(),
        activityService.getAll(),
      ]);
      setStats(statsData);
      setActivities(activitiesData.slice(0, 10));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your M&A overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Deals</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.dealsByStatus.reduce((sum, s) => sum + s._count, 0) || 0}
              </p>
            </div>
            <TrendingUp className="text-primary" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Deals</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.dealsByStatus.find((s) => s.status === 'ACTIVE')?._count || 0}
              </p>
            </div>
            <FileText className="text-success" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${((stats?.totalDealValue || 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <Building2 className="text-warning" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activities</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
            </div>
            <Users className="text-danger" size={32} />
          </div>
        </div>
      </div>

      {/* Pipeline by Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Deals by Stage</h2>
          <div className="space-y-3">
            {stats?.dealsByStage.map((stage) => (
              <div key={stage.stage}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{stage.stage.replace('_', ' ')}</span>
                  <span className="font-medium">{stage._count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(stage._count / (stats?.dealsByStatus.reduce((sum, s) => sum + s._count, 0) || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-gray-500">No recent activities</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user.firstName} {activity.user.lastName} •{' '}
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {activity.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
