import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { SHOP } from '../../shop.config.ts';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Company Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <ShoppingBag size={24} className="text-primary-600" />
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{SHOP.name}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                            📍 {SHOP.address}
                        </p>
                        <div className="text-slate-600 dark:text-slate-400 text-sm mb-3 space-y-1">
                            {SHOP.phones.map((phone) => (
                                <p key={phone.tel}>📞 <a href={`tel:${phone.tel}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{phone.display}</a> - {phone.label}</p>
                            ))}
                        </div>
                        <p className="text-slate-500 dark:text-slate-500 text-xs">
                            {SHOP.copyright}
                        </p>
                    </div>
                    {/* Google Map */}
                    <div className="w-full lg:w-auto">
                        <iframe
                            src={SHOP.mapEmbedUrl}
                            width="300"
                            height="150"
                            style={{ border: 0, borderRadius: '12px' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="shadow-md"
                            title={`${SHOP.name} Location`}
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
};
