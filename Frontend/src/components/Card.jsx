const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative backdrop-blur-xl bg-white/70 border border-white/40 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl transition-all duration-300 hover:bg-white/80 hover:shadow-2xl sm:hover:shadow-3xl ${className}`}
      style={{ zIndex: 'auto' }}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 border-b border-white/30 backdrop-blur-sm bg-white/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2 w-full sm:w-auto">{actions}</div>}
        </div>
      )}
      <div className="px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-4 overflow-visible" style={{ zIndex: 'auto' }}>{children}</div>
    </div>
  );
};

export default Card;

