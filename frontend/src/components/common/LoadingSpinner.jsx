export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  text = null,
  className = '' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    red: 'text-red-600',
    green: 'text-green-600',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className=\"flex flex-col items-center space-y-2\">
        <svg
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
          fill=\"none\"
          viewBox=\"0 0 24 24\"
        >
          <circle
            className=\"opacity-25\"
            cx=\"12\"
            cy=\"12\"
            r=\"10\"
            stroke=\"currentColor\"
            strokeWidth=\"4\"
          ></circle>
          <path
            className=\"opacity-75\"
            fill=\"currentColor\"
            d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"
          ></path>
        </svg>
        {text && (
          <p className={`text-sm ${colorClasses[color]} font-medium`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Fullscreen loading overlay
export function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <div className=\"fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50\">
      <LoadingSpinner size=\"lg\" text={text} />
    </div>
  );
}

// Page loading component
export function PageLoading({ text = 'Loading page...' }) {
  return (
    <div className=\"min-h-screen flex items-center justify-center\">
      <LoadingSpinner size=\"lg\" text={text} />
    </div>
  );
}

// Button loading component
export function ButtonLoading({ size = 'sm', className = '' }) {
  return (
    <LoadingSpinner 
      size={size} 
      color=\"white\" 
      className={className}
    />
  );
}

// Card loading skeleton
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className=\"bg-gray-200 rounded-lg p-4 space-y-3\">
        <div className=\"h-4 bg-gray-300 rounded w-3/4\"></div>
        <div className=\"h-3 bg-gray-300 rounded w-1/2\"></div>
        <div className=\"h-3 bg-gray-300 rounded w-2/3\"></div>
        <div className=\"flex space-x-2 mt-4\">
          <div className=\"h-8 bg-gray-300 rounded w-16\"></div>
          <div className=\"h-8 bg-gray-300 rounded w-16\"></div>
        </div>
      </div>
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton({ items = 3 }) {
  return (
    <div className=\"space-y-3\">
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className=\"animate-pulse\">
          <div className=\"flex items-center space-x-4 p-4 bg-white rounded-lg border\">
            <div className=\"h-10 w-10 bg-gray-300 rounded-full\"></div>
            <div className=\"flex-1 space-y-2\">
              <div className=\"h-4 bg-gray-300 rounded w-1/3\"></div>
              <div className=\"h-3 bg-gray-300 rounded w-1/2\"></div>
            </div>
            <div className=\"h-8 w-20 bg-gray-300 rounded\"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
