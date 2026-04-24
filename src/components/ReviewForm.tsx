'use client';

import { useState } from 'react';
import { submitProductReview } from '@/lib/woocommerce';

interface Props {
    productId: number;
    productName: string;
    onSuccess: () => void;
}

export default function ReviewForm({ productId, productName, onSuccess }: Props) {
    const [rating, setRating] = useState(5);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        
        // Max 5 fotoğraf sınırı
        if (files.length + selectedFiles.length > 5) {
            setError('En fazla 5 fotoğraf ekleyebilirsiniz.');
            return;
        }

        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);

        // Önizleme oluştur
        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        // Mevcut objeyi temizle
        URL.revokeObjectURL(previews[index]);
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('product_id', String(productId));
        formData.append('author_name', name);
        formData.append('author_email', email);
        formData.append('rating', String(rating));
        formData.append('review_text', comment);
        
        files.forEach((file) => {
            formData.append('photos[]', file);
        });

        const result = await submitProductReview(formData);
        
        if (result.success) {
            // sGTM Push
            const { pushEvent } = await import('@/lib/gtm');
            pushEvent('add_review', {
                product_id: productId,
                product_name: productName,
                rating: rating,
                has_photo: files.length > 0
            });

            onSuccess();
        } else {
            setError(result.message || 'Yorum gönderilirken bir hata oluştu.');
        }
        setLoading(false);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                <h4 className="font-headline font-bold text-xl tracking-tight text-brand-black uppercase">
                    {productName} için Yorum Yap
                </h4>

                {/* Rating Stars */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-black">Puanın</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setRating(n)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <span 
                                    className={`material-symbols-outlined text-[28px] ${n <= rating ? 'text-brand-green' : 'text-brand-border'}`}
                                    style={{ fontVariationSettings: n <= rating ? "'FILL' 1" : "'FILL' 0" }}
                                >star</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-brand-black">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-[0.2em] uppercase">Adın Soyadın</label>
                        <input 
                            type="text" 
                            required 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full h-12 px-4 bg-brand-surface border border-brand-border focus:border-brand-black focus:outline-none rounded-sm font-body text-sm"
                            placeholder="Örn: Özgür Yıldırım"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-[0.2em] uppercase">E-Posta Adresin</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full h-12 px-4 bg-brand-surface border border-brand-border focus:border-brand-black focus:outline-none rounded-sm font-body text-sm"
                            placeholder="Örn: ozgur@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2 text-brand-black">
                    <label className="text-[10px] font-bold tracking-[0.2em] uppercase">Yorumun</label>
                    <textarea 
                        required 
                        rows={4}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="w-full p-4 bg-brand-surface border border-brand-border focus:border-brand-black focus:outline-none rounded-sm font-body text-sm resize-none"
                        placeholder="Ürün hakkındaki deneyimlerini paylaş..."
                    />
                </div>

                {/* Photo Upload */}
                <div className="space-y-3">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-black">Fotoğraf Ekle (Opsiyonel — Max 5)</p>
                    
                    <div className="flex flex-wrap gap-3">
                        {previews.map((src, i) => (
                            <div key={i} className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-sm overflow-hidden border border-brand-border">
                                <img src={src} className="w-full h-full object-cover" alt="önizleme" />
                                <button 
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-brand-black/80 text-white rounded-full flex items-center justify-center hover:bg-brand-black transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </div>
                        ))}

                        {files.length < 5 && (
                            <label className="w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center bg-brand-surface border-2 border-dashed border-brand-border rounded-sm cursor-pointer hover:border-brand-green hover:bg-brand-green/5 transition-all text-brand-muted hover:text-brand-green">
                                <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
                                <span className="text-[10px] uppercase font-bold tracking-tighter mt-1">Yükle</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    multiple 
                                    onChange={handleFileChange} 
                                />
                            </label>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm font-body bg-red-50 p-3 rounded-sm border border-red-100">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full md:w-auto px-10 py-4 bg-brand-black text-white font-headline font-bold text-[13px] tracking-[0.1em] uppercase rounded-sm btn-press ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Gönderiliyor...' : 'Yorumu Yayınla'}
                </button>
            </form>
        </>
    );
}
