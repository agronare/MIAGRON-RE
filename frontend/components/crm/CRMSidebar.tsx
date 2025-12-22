import React from 'react';
import { CRM_NAV_ITEMS } from '../../constants';
import { Sidebar } from '../ui/Sidebar';

interface CRMSidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export const CRMSidebar: React.FC<CRMSidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Sidebar
      items={CRM_NAV_ITEMS.map(i => ({ id: i.id, label: i.label, icon: i.icon }))}
      activeId={activeTab}
      onSelect={(id) => setActiveTab(id)}
      titleImageSrc="/logo-crm.png"
      titleImageAlt="Logo CRM"
      colorScheme="indigo"
      expandedWidth={288}
      collapsedWidth={80}
    />
  );
};