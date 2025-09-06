// components/ui/TabNavigation.tsx
interface Tab {
  id: string;
  label: string;
  color?: "blue" | "green" | "purple" | "red";
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}: TabNavigationProps) {
  const getTabColors = (color: string = "blue", isActive: boolean) => {
    const colors = {
      blue: isActive
        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
        : "text-gray-600 hover:text-gray-900",
      green: isActive
        ? "text-green-600 border-b-2 border-green-600 bg-green-50"
        : "text-gray-600 hover:text-gray-900",
      purple: isActive
        ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
        : "text-gray-600 hover:text-gray-900",
      red: isActive
        ? "text-red-600 border-b-2 border-red-600 bg-red-50"
        : "text-gray-600 hover:text-gray-900",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`bg-white shadow-sm ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${getTabColors(
                tab.color,
                activeTab === tab.id
              )}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
