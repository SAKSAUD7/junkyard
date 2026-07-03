import { useEffect, useRef } from 'react';

export default function Captcha({ code, onRefresh }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !code) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background color
        ctx.fillStyle = '#f8fafc'; // slate-50
        ctx.fillRect(0, 0, width, height);

        // Add some noise (dots)
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.2)`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Add noise (lines)
        for (let i = 0; i < 4; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`;
            ctx.lineWidth = Math.random() * 2 + 0.5;
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        // Draw text
        const fontSize = 24;
        ctx.font = `900 ${fontSize}px "Courier New", Courier, monospace`;
        ctx.textBaseline = 'middle';
        
        const chars = code.split('');
        const charWidth = width / chars.length;

        chars.forEach((char, i) => {
            // Randomly rotate each character
            const angle = (Math.random() - 0.5) * 0.4;
            
            ctx.save();
            // Move origin to the center of where the character will be drawn
            ctx.translate(i * charWidth + charWidth / 2, height / 2 + (Math.random() - 0.5) * 4);
            ctx.rotate(angle);
            
            ctx.fillStyle = '#1e293b'; // slate-800
            
            // Draw character
            ctx.fillText(char, -ctx.measureText(char).width / 2, 0);
            ctx.restore();
        });

        // Add a single strikethrough line across the whole text for extra security feel
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(5, height / 2 + (Math.random() - 0.5) * 10);
        ctx.bezierCurveTo(
            width / 3, height / 2 + (Math.random() - 0.5) * 15,
            width / 1.5, height / 2 + (Math.random() - 0.5) * 15,
            width - 5, height / 2 + (Math.random() - 0.5) * 10
        );
        ctx.stroke();

    }, [code]);

    return (
        <div className="flex items-center gap-2">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-12 w-32 shrink-0">
                <canvas 
                    ref={canvasRef} 
                    width={128} 
                    height={48} 
                    className="w-full h-full cursor-default"
                />
            </div>
            {onRefresh && (
                <button
                    type="button"
                    onClick={onRefresh}
                    className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                    title="Refresh CAPTCHA"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            )}
        </div>
    );
}
