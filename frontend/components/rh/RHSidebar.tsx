
import React from 'react';
import { RH_NAV_ITEMS } from '../../constants';
import { Sidebar } from '../ui/Sidebar';

interface RHSidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  navItems?: typeof RH_NAV_ITEMS;
}

export const RHSidebar: React.FC<RHSidebarProps> = ({ activeTab, setActiveTab, navItems = RH_NAV_ITEMS }) => {
  return (
    <Sidebar
      items={navItems.map(i => ({ id: i.id, label: i.label, icon: i.icon }))}
      activeId={activeTab}
      onSelect={(id) => setActiveTab(id)}
      titleImageSrc="/logo-rh.png"
      titleImageAlt="Logo Recursos Humanos"
      colorScheme="emerald"
      expandedWidth={288}
      collapsedWidth={80}
    />
  );
};
