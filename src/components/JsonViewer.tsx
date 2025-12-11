import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonViewerProps {
    data: any;
    level?: number;
    parentKey?: string;
    isLast?: boolean;
}

export function JsonViewer({ data, level = 0, parentKey, isLast = true }: JsonViewerProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const type = data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data;
    const isObject = type === 'object' && data !== null;
    const isArray = type === 'array';
    const isEmpty = isObject && Object.keys(data).length === 0 || isArray && data.length === 0;
    const isCollapsible = (isObject || isArray) && !isEmpty;

    const indent = level * 1.5;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const renderValue = (val: any) => {
        if (val === null) return <span className="text-gray-500">null</span>;
        switch (typeof val) {
            case 'string': return <span className="text-green-600 dark:text-green-400">"{val}"</span>;
            case 'number': return <span className="text-blue-600 dark:text-blue-400">{val}</span>;
            case 'boolean': return <span className="text-purple-600 dark:text-purple-400">{val ? 'true' : 'false'}</span>;
            default: return <span>{String(val)}</span>;
        }
    };

    if (!isCollapsible) {
        return (
            <div style={{ paddingLeft: `${indent}rem` }} className="font-mono text-sm py-0.5">
                {parentKey && <span className="text-gray-800 dark:text-gray-200">"{parentKey}": </span>}
                {isObject ? <span>{"{}"}</span> : isArray ? <span>[]</span> : renderValue(data)}
                {!isLast && <span className="text-gray-500">,</span>}
            </div>
        );
    }

    return (
        <div className="font-mono text-sm">
            <div
                className={cn(
                    "flex items-start py-0.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -ml-1 select-none",
                )}
                onClick={handleToggle}
                style={{ paddingLeft: `${indent}rem` }}
            >
                <span className="mr-1 mt-0.5 text-gray-400">
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </span>

                {parentKey && <span className="text-gray-800 dark:text-gray-200 mr-1">"{parentKey}": </span>}

                <span className="text-gray-500">
                    {isArray ? '[' : '{'}
                </span>

                {!isExpanded && (
                    <span className="text-gray-400 mx-1">
                        {isArray ? `Array(${data.length})` : `Object(${Object.keys(data).length})`}
                    </span>
                )}

                {!isExpanded && (
                    <span className="text-gray-500">
                        {isArray ? ']' : '}'}
                        {!isLast && ','}
                    </span>
                )}
            </div>

            {isExpanded && (
                <div>
                    {isArray ? (
                        data.map((item: any, index: number) => (
                            <JsonViewer
                                key={index}
                                data={item}
                                level={level + 1}
                                isLast={index === data.length - 1}
                            />
                        ))
                    ) : (
                        Object.entries(data).map(([key, value], index, arr) => (
                            <JsonViewer
                                key={key}
                                parentKey={key}
                                data={value}
                                level={level + 1}
                                isLast={index === arr.length - 1}
                            />
                        ))
                    )}
                    <div style={{ paddingLeft: `${indent + 1}rem` }} className="py-0.5 text-gray-500">
                        {isArray ? ']' : '}'}
                        {!isLast && ','}
                    </div>
                </div>
            )}
        </div>
    );
}
