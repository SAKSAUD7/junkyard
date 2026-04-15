/**
 * SafeImage - An img wrapper that silently falls back to a placeholder
 * when the source image fails to load (e.g. deleted blobs, 404s).
 */
const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M35 40 Q50 25 65 40 L70 65 L30 65 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='60' cy='35' r='7' fill='%23cbd5e1'/%3E%3C/svg%3E`;

export default function SafeImage({ src, alt = '', className = '', style = {}, loading = 'lazy', ...props }) {
    const handleError = (e) => {
        if (e.target.src !== PLACEHOLDER_SVG) {
            e.target.src = PLACEHOLDER_SVG;
        }
    };

    return (
        <img
            src={src || PLACEHOLDER_SVG}
            alt={alt}
            className={className}
            style={style}
            loading={loading}
            onError={handleError}
            {...props}
        />
    );
}
