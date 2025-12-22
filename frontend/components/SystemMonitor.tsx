
import React, { useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { InventoryItem, Task, PurchaseOrder, Project } from '../types';

interface SystemMonitorProps {
    inventory: InventoryItem[];
    tasks: Task[];
    purchaseOrders: PurchaseOrder[];
    projects: Project[];
}

/**
 * This component has no UI. It runs in the background (via App.tsx)
 * to check data states and trigger "smart" notifications.
 */
export const SystemMonitor: React.FC<SystemMonitorProps> = ({ inventory, tasks, purchaseOrders, projects }) => {
    const { addNotification } = useNotification();
    const hasCheckedRef = useRef(false);

    useEffect(() => {
        // Prevent spamming notifications on every re-render
        // In a real app, this would be more sophisticated (checking "last alerted" timestamps)
        if (hasCheckedRef.current) return;

        // 1. Check Inventory Low Stock
        const lowStock = inventory.filter(i => i.quantity < 20);
        if (lowStock.length > 0) {
            addNotification(
                'Alerta de Stock',
                `${lowStock.length} productos tienen nivel bajo de inventario.`,
                'warning',
                'ERP',
                'erp'
            );
        }

        // 2. Check Overdue Tasks
        const today = new Date().toISOString().split('T')[0];
        const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate < today);
        if (overdue.length > 0) {
            addNotification(
                'Tareas Vencidas',
                `Tienes ${overdue.length} tareas vencidas en proyectos.`,
                'error',
                'Tasks',
                'proyectos'
            );
        }

        // 3. Check Pending POs
        const pendingPOs = purchaseOrders.filter(po => po.status === 'Pendiente');
        if (pendingPOs.length > 0) {
             addNotification(
                'Compras Pendientes',
                `Hay ${pendingPOs.length} órdenes de compra esperando aprobación o recepción.`,
                'info',
                'ERP',
                'erp'
            );
        }
        
        // 4. Check Project Health
        const riskProjects = projects.filter(p => p.health === 'At Risk' || p.health === 'Delayed');
        if (riskProjects.length > 0) {
             addNotification(
                'Proyectos en Riesgo',
                `${riskProjects.length} proyectos requieren atención inmediata.`,
                'warning',
                'Tasks',
                'proyectos'
            );
        }

        hasCheckedRef.current = true;

        // Reset check after 5 minutes to allow new alerts if data changed significantly
        // (Simple debounce logic)
        const timer = setTimeout(() => { hasCheckedRef.current = false; }, 5 * 60 * 1000);
        return () => clearTimeout(timer);

    }, [inventory, tasks, purchaseOrders, projects, addNotification]);

    return null;
};
