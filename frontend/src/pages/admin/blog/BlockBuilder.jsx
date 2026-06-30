import React, { useState } from 'react';
import { 
    PlusIcon, 
    TrashIcon, 
    ChevronUpIcon, 
    ChevronDownIcon,
    DocumentTextIcon,
    PhotoIcon,
    Bars3BottomLeftIcon,
    QueueListIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

/**
 * Enterprise Block Builder
 * Handles JSON block structures for articles.
 */

const BLOCK_TYPES = [
    { type: 'heading', label: 'Heading', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { type: 'paragraph', label: 'Paragraph', icon: <Bars3BottomLeftIcon className="w-5 h-5" /> },
    { type: 'image', label: 'Image', icon: <PhotoIcon className="w-5 h-5" /> },
    { type: 'list', label: 'List', icon: <QueueListIcon className="w-5 h-5" /> },
    { type: 'cta', label: 'CTA Banner', icon: <ChatBubbleBottomCenterTextIcon className="w-5 h-5" /> },
];

export default function BlockBuilder({ blocks, onChange }) {
    const [showBlockMenu, setShowBlockMenu] = useState(null); // index to show menu AFTER

    const addBlock = (index, type) => {
        const newBlock = createEmptyBlock(type);
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        onChange(newBlocks);
        setShowBlockMenu(null);
    };

    const updateBlock = (index, data) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], ...data };
        onChange(newBlocks);
    };

    const removeBlock = (index) => {
        const newBlocks = blocks.filter((_, i) => i !== index);
        onChange(newBlocks);
    };

    const moveBlock = (index, direction) => {
        if (direction === 'up' && index > 0) {
            const newBlocks = [...blocks];
            [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
            onChange(newBlocks);
        } else if (direction === 'down' && index < blocks.length - 1) {
            const newBlocks = [...blocks];
            [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
            onChange(newBlocks);
        }
    };

    return (
        <div className="space-y-4">
            {blocks.length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-blue-300 transition-colors bg-slate-50/50 cursor-pointer" onClick={() => setShowBlockMenu(-1)}>
                    <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <PlusIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-slate-700 font-bold mb-1">Start building your article</h3>
                    <p className="text-sm text-slate-500">Click to add your first content block</p>
                </div>
            )}

            {showBlockMenu === -1 && (
                <BlockMenu onSelect={(type) => addBlock(-1, type)} onCancel={() => setShowBlockMenu(null)} />
            )}

            {blocks.map((block, index) => (
                <div key={block.id} className="relative group">
                    <div className="flex gap-4 p-4 bg-white border border-slate-100 shadow-sm rounded-2xl transition-all hover:border-blue-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
                        
                        {/* Drag Handle / Actions */}
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                            <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"><ChevronUpIcon className="w-4 h-4" /></button>
                            <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"><ChevronDownIcon className="w-4 h-4" /></button>
                            <button onClick={() => removeBlock(index)} className="p-1 text-slate-400 hover:text-red-500 mt-2"><TrashIcon className="w-4 h-4" /></button>
                        </div>

                        {/* Block Content */}
                        <div className="flex-1 min-w-0">
                            {renderBlockEditor(block, (data) => updateBlock(index, data))}
                        </div>
                    </div>

                    {/* Add Block button between blocks */}
                    <div className="relative h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute w-full h-[1px] bg-blue-100"></div>
                        <button 
                            onClick={() => setShowBlockMenu(index)}
                            className="relative z-10 w-6 h-6 bg-white border border-blue-200 text-blue-500 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {showBlockMenu === index && (
                        <div className="relative z-20 mb-6">
                            <BlockMenu onSelect={(type) => addBlock(index, type)} onCancel={() => setShowBlockMenu(null)} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Helpers

function createEmptyBlock(type) {
    const base = { id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type };
    switch (type) {
        case 'heading': return { ...base, level: 'h2', text: '' };
        case 'paragraph': return { ...base, text: '' };
        case 'image': return { ...base, url: '', caption: '', alt: '' };
        case 'list': return { ...base, style: 'bullet', items: [''] };
        case 'cta': return { ...base, title: '', description: '', buttonText: '', buttonLink: '' };
        default: return base;
    }
}

function BlockMenu({ onSelect, onCancel }) {
    return (
        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl p-2 flex gap-1 w-full max-w-2xl mx-auto animate-fade-in relative z-50">
            {BLOCK_TYPES.map(bt => (
                <button
                    key={bt.type}
                    onClick={() => onSelect(bt.type)}
                    className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
                >
                    {bt.icon}
                    <span className="text-[11px] font-bold uppercase tracking-wider">{bt.label}</span>
                </button>
            ))}
            <button onClick={onCancel} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 shadow-sm">
                &times;
            </button>
        </div>
    );
}

function renderBlockEditor(block, update) {
    switch (block.type) {
        case 'heading':
            return (
                <div className="flex gap-3 items-center">
                    <select 
                        value={block.level} 
                        onChange={e => update({ level: e.target.value })}
                        className="bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="h2">H2</option>
                        <option value="h3">H3</option>
                        <option value="h4">H4</option>
                    </select>
                    <input
                        value={block.text}
                        onChange={e => update({ text: e.target.value })}
                        placeholder="Heading text..."
                        className={`flex-1 bg-transparent border-none outline-none font-bold text-slate-900 placeholder-slate-300 ${block.level === 'h2' ? 'text-2xl' : block.level === 'h3' ? 'text-xl' : 'text-lg'}`}
                    />
                </div>
            );
        case 'paragraph':
            return (
                <textarea
                    value={block.text}
                    onChange={e => update({ text: e.target.value })}
                    placeholder="Write your paragraph..."
                    className="w-full bg-transparent border-none outline-none text-slate-700 leading-relaxed resize-y min-h-[100px] placeholder-slate-300"
                />
            );
        case 'image':
            return (
                <div className="space-y-3">
                    <input
                        value={block.url}
                        onChange={e => update({ url: e.target.value })}
                        placeholder="Image URL..."
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    {block.url && (
                        <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img src={block.url} alt={block.alt} className="w-full h-auto max-h-96 object-contain" onError={e => e.target.style.display='none'} />
                        </div>
                    )}
                    <div className="flex gap-3">
                        <input
                            value={block.caption}
                            onChange={e => update({ caption: e.target.value })}
                            placeholder="Caption (optional)"
                            className="flex-1 bg-transparent border-b border-slate-200 px-2 py-2 text-sm text-slate-500 outline-none focus:border-blue-400"
                        />
                        <input
                            value={block.alt}
                            onChange={e => update({ alt: e.target.value })}
                            placeholder="Alt text (SEO)"
                            className="flex-1 bg-transparent border-b border-slate-200 px-2 py-2 text-sm text-slate-500 outline-none focus:border-blue-400"
                        />
                    </div>
                </div>
            );
        case 'list':
            return (
                <div className="space-y-2">
                    <select 
                        value={block.style} 
                        onChange={e => update({ style: e.target.value })}
                        className="bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-100 mb-2"
                    >
                        <option value="bullet">Bullet List</option>
                        <option value="number">Numbered List</option>
                    </select>
                    {block.items.map((item, i) => (
                        <div key={i} className="flex gap-2 items-start">
                            <span className="text-slate-400 mt-2">{block.style === 'number' ? `${i + 1}.` : '•'}</span>
                            <input
                                value={item}
                                onChange={e => {
                                    const newItems = [...block.items];
                                    newItems[i] = e.target.value;
                                    update({ items: newItems });
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const newItems = [...block.items];
                                        newItems.splice(i + 1, 0, '');
                                        update({ items: newItems });
                                    } else if (e.key === 'Backspace' && item === '' && block.items.length > 1) {
                                        e.preventDefault();
                                        const newItems = [...block.items];
                                        newItems.splice(i, 1);
                                        update({ items: newItems });
                                    }
                                }}
                                placeholder="List item..."
                                className="flex-1 bg-transparent border-b border-dashed border-slate-200 focus:border-solid focus:border-blue-400 px-2 py-1 outline-none text-slate-700"
                            />
                        </div>
                    ))}
                    <button 
                        onClick={() => update({ items: [...block.items, ''] })}
                        className="text-xs font-bold text-blue-600 mt-2 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                        + Add Item
                    </button>
                </div>
            );
        case 'cta':
            return (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Call to Action Block</span>
                    </div>
                    <input
                        value={block.title}
                        onChange={e => update({ title: e.target.value })}
                        placeholder="CTA Headline..."
                        className="w-full bg-transparent border-none outline-none text-xl font-bold text-slate-900 placeholder-slate-400"
                    />
                    <input
                        value={block.description}
                        onChange={e => update({ description: e.target.value })}
                        placeholder="Supporting text..."
                        className="w-full bg-transparent border-none outline-none text-slate-600 placeholder-slate-400"
                    />
                    <div className="flex gap-4">
                        <input
                            value={block.buttonText}
                            onChange={e => update({ buttonText: e.target.value })}
                            placeholder="Button Text"
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-400 shadow-sm"
                        />
                        <input
                            value={block.buttonLink}
                            onChange={e => update({ buttonLink: e.target.value })}
                            placeholder="Link URL (/quote)"
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-400 shadow-sm"
                        />
                    </div>
                </div>
            );
        default:
            return <div className="text-red-500 text-sm">Unknown block type: {block.type}</div>;
    }
}
