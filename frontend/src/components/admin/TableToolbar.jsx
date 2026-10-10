import React from 'react';

export function TableToolbar({
    tabs = [],
    activeTab,
    onTabChange,
    searchTerm,
    onSearchChange,
    searchPlaceholder = "Search...",
    actions
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {tabs.length > 0 && (
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium text-slate-500">Filter:</span>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap items-center">
                    {onSearchChange && (
                        <div className="relative flex-1 min-w-[200px] lg:w-64">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="w-full pl-11 pr-4 py-2.5 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white text-sm outline-none transition-all"
                                value={searchTerm}
                                onChange={onSearchChange}
                            />
                            <svg className="h-5 w-5 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    )}
                    {actions}
                </div>
            </div>
        </div>
    );
}

export function TablePagination({
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange
}) {
    // Generate page numbers
    const getPageNumbers = () => {
        let pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (page <= 3) {
            pages = [1, 2, 3, 4, 5];
        } else if (page >= totalPages - 2) {
            pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [page - 2, page - 1, page, page + 1, page + 2];
        }
        return pages;
    };

    const startItem = ((page - 1) * pageSize) + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-b-xl">
            <div className="flex items-center gap-4 text-sm text-slate-500">
                <div>
                    Showing <span className="font-semibold text-slate-900">{startItem}</span>–<span className="font-semibold text-slate-900">{endItem}</span> of <span className="font-semibold text-slate-900">{totalItems}</span> rows
                </div>
                <div className="hidden sm:block w-px h-4 bg-slate-200"></div>
                <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="hidden sm:block">Rows per flex:</label>
                    <select 
                        id="pageSize" 
                        value={pageSize} 
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 py-1.5 pl-3 pr-8 shadow-sm outline-none cursor-pointer"
                    >
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-slate-100 text-slate-700 hover:bg-slate-50 disabled:hover:bg-white flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    <span className="hidden sm:inline">Prev</span>
                </button>

                <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`min-w-[36px] h-9 px-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center ${page === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm shadow-blue-200'
                                : 'border-2 border-slate-100 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                <div className="sm:hidden text-sm font-bold text-slate-700 px-3">
                    {page} / {totalPages}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages || totalPages === 0}
                    className="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-slate-100 text-slate-700 hover:bg-slate-50 disabled:hover:bg-white flex items-center gap-1"
                >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
}
