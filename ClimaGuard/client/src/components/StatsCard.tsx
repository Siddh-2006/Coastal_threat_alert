import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  className = ''
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success border-success/20 bg-success/10';
      case 'down':
        return 'text-destructive border-destructive/20 bg-destructive/10';
      default:
        return 'text-muted-foreground border-border/20 bg-muted/10';
    }
  };

  return (
    <Card className={`card-oceanic hover-lift p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 ocean-gradient rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {trendValue && (
          <Badge variant="outline" className={getTrendColor()}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold text-gradient animate-fade-up">
          {value}
        </div>
        
        {/* Progress indicator */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="h-2 ocean-gradient rounded-full transition-all duration-1000 ease-out animate-fade-up"
            style={{ 
              width: trend === 'up' ? '75%' : trend === 'down' ? '45%' : '60%',
              animationDelay: '0.2s'
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;