import { useEffect, useState } from 'react';
import { useNotification } from '@/context/NotificationContext';
import { Folder } from 'lucide-react';

export function FlyingElement() {
    const { flyingElement } = useNotification();
    const [style, setStyle] = useState<React.CSSProperties | null>(null);

    useEffect(() => {
        if (!flyingElement) {
            setStyle(null);
            return;
        }

        const { startRect } = flyingElement;

        // Start position
        setStyle({
            position: 'fixed',
            left: `${startRect.left}px`,
            top: `${startRect.top}px`,
            width: `${startRect.width}px`,
            height: `${startRect.height}px`,
            transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
            zIndex: 9999,
            opacity: 1,
            pointerEvents: 'none',
        });

        // Trigger animation to end position (bell icon)
        // We find the bell icon by ID which we will add later
        requestAnimationFrame(() => {
            const bell = document.getElementById('notification-bell');
            if (bell) {
                const endRect = bell.getBoundingClientRect();
                setStyle({
                    position: 'fixed',
                    left: `${endRect.left + endRect.width / 4}px`, // Center-ish
                    top: `${endRect.top + endRect.height / 4}px`,
                    width: '20px', // Shrink
                    height: '20px',
                    transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    zIndex: 9999,
                    opacity: 0.5,
                    transform: 'scale(0.5)',
                    pointerEvents: 'none',
                });
            }
        });

    }, [flyingElement]);

    if (!flyingElement || !style) return null;

    return (
        <div style={style} className="flex items-center justify-center bg-blue-100 border border-blue-500 rounded-lg shadow-xl text-blue-600">
            <Folder className="w-full h-full p-1" />
        </div>
    );
}
