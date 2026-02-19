import { NavLink } from "react-router-dom";
import { Tooltip } from "@heroui/tooltip";
/* import { Link } from "@heroui/link"; */
import { appColor } from "@/theme/theme.config";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
}

export const NavItem = ({ href, icon, label, isCollapsed }: NavItemProps) => {
  return (
    <Tooltip
      content={label}
      isDisabled={!isCollapsed}
      placement="right"
      color="default"
    >
      <NavLink
        to={href}
        className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? `bg-${appColor}/10 text-${appColor}`
                    : "text-default-500 hover:bg-default-100 hover:text-default-900"
                }
                ${isCollapsed ? "justify-center" : ""}
            `}
      >
        {({ isActive }) => (
          <>
            <div
              className={`text-xl ${isActive ? `text-${appColor}` : "text-current"}`}
            >
              {icon}
            </div>
            {!isCollapsed && (
              <span className="font-medium truncate transition-opacity duration-300">
                {label}
              </span>
            )}
          </>
        )}
      </NavLink>
    </Tooltip>
  );
};
