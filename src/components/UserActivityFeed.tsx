import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Activity, User, Building2, BookOpen, Shield, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  user_name: string;
  action: string;
  resource: string;
  timestamp: string;
  type: 'farm' | 'training' | 'assessment' | 'profile';
}

const UserActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Simulated recent activities - in a real app you'd have activity logs
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          user_name: 'John Doe',
          action: 'Created farm',
          resource: 'Green Valley Pork Farm',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'farm'
        },
        {
          id: '2',
          user_name: 'Sarah Smith',
          action: 'Completed training',
          resource: 'Biosecurity Fundamentals',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          type: 'training'
        },
        {
          id: '3',
          user_name: 'Mike Johnson',
          action: 'Submitted assessment',
          resource: 'Q4 Risk Assessment',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          type: 'assessment'
        },
        {
          id: '4',
          user_name: 'Lisa Brown',
          action: 'Updated profile',
          resource: 'Farm contact information',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          type: 'profile'
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'farm': return Building2;
      case 'training': return BookOpen;
      case 'assessment': return Shield;
      default: return User;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'farm': return 'text-success';
      case 'training': return 'text-primary';
      case 'assessment': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent User Activity
        </CardTitle>
        <CardDescription>Latest actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="rounded-full bg-muted h-10 w-10"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {activity.user_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                      <p className="text-sm">
                        <span className="font-medium">{activity.user_name}</span> {activity.action.toLowerCase()}{' '}
                        <span className="font-medium">{activity.resource}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatTimeAgo(activity.timestamp)}
                      <Badge variant="outline" className="ml-auto">
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityFeed;