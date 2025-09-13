import React from 'react';
import { AnchorContact } from '../../lib/types';
import { Badge } from '@/components/ui/badge';
import { TargetIcon, CalendarIcon, UsersIcon, UserIcon, AlertTriangleIcon, PinIcon } from 'lucide-react';

interface Props {
  name: string;
  type: string;
  dateOfCreation: string;
  status: string;
  anchorContacts?: AnchorContact[];
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-700 text-green-200 border-green-400',
  Inactive: 'bg-gray-700 text-gray-200 border-gray-400',
  Pending: 'bg-yellow-700 text-yellow-200 border-yellow-400',
};

export const BasicIdentificationCard: React.FC<Props> = ({
  name,
  type,
  dateOfCreation,
  status,
  anchorContacts,
}) => (
  <div className="w-full space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-secondary">
          <PinIcon className="w-5 h-5 text-gray-300" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">{name}</h3>
          <p className="text-xs sm:text-sm text-gray-400">Workgroup Information</p>
        </div>
      </div>
      <Badge 
        variant="outline" 
        className={`${
          status === 'Active' ? 'bg-green-500/10 text-green-300 border-secondary' :
          status === 'Inactive' ? 'bg-gray-500/10 text-gray-300 border-gray-500/30' :
          'bg-yellow-500/10 text-yellow-300 border-secondary'
        }`}
      >
        {status}
      </Badge>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <TargetIcon className="w-4 h-4 text-gray-400" />
        <div>
          <p className="text-xs text-gray-500 font-medium">Type</p>
          <p className="text-sm font-bold text-white">{type}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-gray-400" />
        <div>
          <p className="text-xs text-gray-500 font-medium">Created</p>
          <p className="text-sm font-bold text-white">{dateOfCreation}</p>
        </div>
      </div>
    </div>
    
    <div className="border-t border-secondary pt-4">
      <div className="flex items-center gap-2 mb-2">
        <UsersIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Anchor Contacts</span>
      </div>
      {Array.isArray(anchorContacts) && anchorContacts.length > 0 ? (
        <div className="space-y-2">
          {anchorContacts.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{c.name}</p>
                <p className="text-xs text-gray-400">{c.role} • {c.handle}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg">
          <AlertTriangleIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">No anchor contacts registered.</span>
        </div>
      )}
    </div>
  </div>
);

export default BasicIdentificationCard; 