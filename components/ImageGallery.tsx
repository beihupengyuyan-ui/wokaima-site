"use client";

import { useState, useEffect } from "react";

export default function ImageGallery({
                                         images,
                                         productName,
                                         fullWidth = false,
                                     }: {
    images: string[];
    productName: string;
    fullWidth?: boolean;
}) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenIndex(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const isSingle = images.length === 1;

    return (
        <>
            <div className={isSingle ? "flex justify-center" : "grid md:grid-cols-2 gap-6"}>
                {images.map((img, i) => (
                    <button
                        key={img}
                        onClick={() => setOpenIndex(i)}
                        className={`group overflow-hidden animate-fade-in-up cursor-zoom-in transition-all duration-300 ${
                            fullWidth
                                ? "w-full rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
                                : isSingle
                                    ? "w-full rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
                                    : "bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1"
                        }`}
                        style={{ animationDelay: `${0.08 + i * 0.06}s` }}
                    >
                        <div
                            className={
                                fullWidth || isSingle
                                    ? "w-full"
                                    : "aspect-square flex items-center justify-center p-6"
                            }
                        >
                            <img
                                src={img}
                                alt={`${productName} ${i + 1}`}
                                className={
                                    fullWidth || isSingle
                                        ? "w-full h-auto object-cover"
                                        : "max-h-full max-w-full object-contain"
                                }
                            />
                        </div>
                    </button>
                ))}
            </div>

            {openIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center cursor-zoom-out animate-fade-in"
                    onClick={() => setOpenIndex(null)}
                >
                    <img
                        src={images[openIndex]}
                        alt={`${productName} ${openIndex + 1}`}
                        className="w-screen h-screen object-contain"
                    />
                    <button
                        onClick={() => setOpenIndex(null)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center hover:bg-white/20 transition z-10"
                        aria-label="关闭"
                    >
                        ×
                    </button>
                </div>
            )}
        </>
    );
}