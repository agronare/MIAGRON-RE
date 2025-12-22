
import React, { useState, useEffect } from 'react';
import { getImage } from '../services/dbService';
import { Package } from 'lucide-react';

interface ProductImageProps {
  imageKey?: string;
  productName: string;
  sku?: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ imageKey, productName, sku, className }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let objectUrl: string | null = null;
        setImageUrl(null);
        setAttempt(0);

        const loadImage = async () => {
            if (imageKey) {
                try {
                    const blob = await getImage(imageKey);
                    if (blob) {
                        objectUrl = URL.createObjectURL(blob);
                        setImageUrl(objectUrl);
                    }
                } catch (error) {
                    console.error("Failed to load image from IndexedDB", error);
                }
            }
        };

        loadImage();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [imageKey]);

    const fallbackSrc = React.useMemo(() => {
        // Generar un set limitado y predecible de candidatos para reducir errores de red
        const nameSlug = (productName || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const skuSlug = (sku || '')
            .toLowerCase()
            .trim();

        const candidates: string[] = [];
        if (skuSlug) {
            candidates.push(`/products/${skuSlug}.jpg`, `/products/${skuSlug}.png`);
        }
        if (nameSlug) {
            candidates.push(`/products/${nameSlug}.jpg`, `/products/${nameSlug}.png`);
        }

        // Intentar solo los primeros 4 candidatos para evitar spam de errores
        const limited = candidates.slice(0, 4);
        return limited[attempt] || null;
    }, [productName, sku, attempt]);

    if (imageUrl) {
        return <img src={imageUrl} alt={productName} className={className} loading="lazy" decoding="async" />;
    }

    if (fallbackSrc) {
        return (
            <img 
                src={fallbackSrc} 
                alt={productName} 
                className={className}
                loading="lazy"
                decoding="async"
                onError={() => setAttempt(prev => prev + 1)}
            />
        );
    }

    // Fallback placeholder
    return (
        <div className={`${className || ''} flex items-center justify-center bg-slate-100 dark:bg-slate-800`}>
            <Package className="w-1/2 h-1/2 text-slate-300 dark:text-slate-600" />
        </div>
    );
};
