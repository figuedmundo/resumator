const TemplateCard = ({
  template,
  selected,
  onSelect,
}) => {
  return (
    <div
      className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
      onClick={() => onSelect(template.id)}
    >
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center z-10">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Template Preview */}
      <div className="aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden">
        <div
          className={`w-full h-full p-4 text-xs ${
            template.id === "modern"
              ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900"
              : template.id === "classic"
              ? "bg-white text-gray-900 border-2 border-gray-800"
              : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800"
          }`}
        >
          <div
            className={`font-bold text-center pb-2 mb-2 ${
              template.id === "modern"
                ? "border-b-2 border-blue-400"
                : template.id === "classic"
                ? "border-b border-gray-800"
                : "border-b border-gray-400"
            }`}
          >
            John Doe
          </div>

          <div
            className={`text-xs space-y-1 ${
              template.id === "modern"
                ? "text-blue-800"
                : template.id === "classic"
                ? "text-gray-800"
                : "text-gray-700"
            }`}
          >
            <div className="font-semibold">EXPERIENCE</div>
            <div className="h-2 bg-current opacity-20 rounded"></div>
            <div className="h-1 bg-current opacity-20 rounded w-3/4"></div>
            <div className="h-1 bg-current opacity-20 rounded w-1/2"></div>

            <div className="font-semibold mt-2">EDUCATION</div>
            <div className="h-1 bg-current opacity-20 rounded w-5/6"></div>
            <div className="h-1 bg-current opacity-20 rounded w-2/3"></div>

            <div className="font-semibold mt-2">SKILLS</div>
            <div className="h-1 bg-current opacity-20 rounded w-4/5"></div>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
        <p className="text-sm text-gray-600 mb-3">{template.description}</p>

        {template.features && (
          <div className="space-y-1">
            {template.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center text-xs text-gray-500"
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    template.id === "modern"
                      ? "bg-blue-400"
                      : template.id === "classic"
                      ? "bg-gray-600"
                      : "bg-gray-400"
                  }`}
                ></div>
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div
        className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
          selected
            ? "opacity-0"
            : "opacity-0 group-hover:opacity-10 bg-blue-500"
        }`}
      ></div>
    </div>
  );
};

export default TemplateCard;
