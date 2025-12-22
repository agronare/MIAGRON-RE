import React, { useState, useEffect } from 'react';

interface AgronareLogoProps {
    className?: string;
    showText?: boolean;
}

export const AgronareLogo: React.FC<AgronareLogoProps> = ({ className = "h-10", showText = true }) => {
    // Usar el mismo recurso que Login y agregar fallbacks existentes en public/
    const fallbacks = [
        "/logoagronarelocal.png",
        "/logo-erp.png",
        "/logo-crm.png",
        "/logo-rh.png"
    ];
    const [logoSrc, setLogoSrc] = useState<string>(fallbacks[0]);
    const [fallbackIndex, setFallbackIndex] = useState<number>(0);

    useEffect(() => {
        // Check local storage for user uploaded logo on mount
        const storedLogo = localStorage.getItem('customLogo');
        // Only accept PNG logos (either a PNG URL or a data URL of type image/png)
        if (storedLogo && (storedLogo.startsWith('data:image/png') || storedLogo.endsWith('.png'))) {
            setLogoSrc(storedLogo);
        }

           // Listener for real-time updates when user uploads a new logo
           const handleStorageChange = () => {
               const updatedLogo = localStorage.getItem('customLogo');
               if (updatedLogo && (updatedLogo.startsWith('data:image/png') || updatedLogo.endsWith('.png'))) setLogoSrc(updatedLogo);
           };

        window.addEventListener('logoUpdated', handleStorageChange);
        return () => window.removeEventListener('logoUpdated', handleStorageChange);
    }, []);

    return (
        <img 
            src={logoSrc}
            alt="Agronare Logo" 
            className={className}
            style={{ width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
            onError={(e) => {
                // Fallback chain: avanzar al siguiente recurso disponible
                if (fallbackIndex < fallbacks.length - 1) {
                    const next = fallbackIndex + 1;
                    setFallbackIndex(next);
                    setLogoSrc(fallbacks[next]);
                }
            }}
        />
    );
};