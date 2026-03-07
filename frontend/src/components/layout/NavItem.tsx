import { NavLink } from "react-router-dom";
import { Tooltip } from "@heroui/tooltip";

/* import { Link } from "@heroui/link"; */
import { appColorVariants } from "@/theme/app-color-variants";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
}

export const NavItem = ({ href, icon, label, isCollapsed }: NavItemProps) => {
  return (
    <Tooltip
      color="default"
      content={label}
      isDisabled={!isCollapsed}
      placement="right"
    >
      <NavLink
        className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? appColorVariants.navActive
                    : "text-default-500 hover:bg-default-100 hover:text-default-900"
                }
                ${isCollapsed ? "justify-center" : ""}
            `}
        to={href}
      >
        {({ isActive }) => (
          <>
            <div
              className={`text-xl ${isActive ? appColorVariants.text : "text-current"}`}
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
