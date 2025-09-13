import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarIcon, CheckCircleIcon, TargetIcon, VoteIcon } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  status: 'completed' | 'upcoming';
}

interface ModernTimelineProps {
  events: TimelineEvent[];
}

const ModernTimeline: React.FC<ModernTimelineProps> = ({ events }) => {
  return (
    <div className="bg-linear-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg border border-secondary p-8 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-6">Proposal Progress</h3>
      <div className="relative">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex items-start gap-6 mb-10 last:mb-0">
            <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-md">
              {event.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-lg text-white font-semibold mb-1">{event.title}</h4>
              <p className="text-gray-400 text-sm mb-2">{event.description}</p>
              <p className="text-gray-500 text-xs">
                {format(new Date(event.date), 'MMM dd, yyyy · h:mm a', { locale: enUS })} • {formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: enUS })}
              </p>
            </div>
            {index < events.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 bg-linear-to-b from-gray-600 to-gray-500" style={{ height: 'calc(100% - 3rem)' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernTimeline;
