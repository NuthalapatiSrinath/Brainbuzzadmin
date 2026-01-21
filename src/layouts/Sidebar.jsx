import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  Gem, // Jewelry Item
  Coins, // Gold Rates
  ShoppingCart, // Orders
  Users, // Customers
  UserCheck, // Staff/Karigars
  CreditCard, // Payments
  FileBarChart, // Reports
  Settings,
  LogOut,
  X,
  ChevronRight,
  Package,
  Tags,
  Store,
  Truck,
  HelpCircle,
} from "lucide-react";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({
    inventory: false,
    orders: false,
    finance: false,
  });

  // Auto expand menu based on active route
  useEffect(() => {
    if (location.pathname.startsWith("/inventory")) {
      setOpenMenus((p) => ({ ...p, inventory: true }));
    }
    if (location.pathname.startsWith("/orders")) {
      setOpenMenus((p) => ({ ...p, orders: true }));
    }
    if (location.pathname.startsWith("/finance")) {
      setOpenMenus((p) => ({ ...p, finance: true }));
    }
  }, [location.pathname]);

  const toggleMenu = (k) => setOpenMenus((p) => ({ ...p, [k]: !p[k] }));

  const isActiveParent = (paths) =>
    paths.some((p) => location.pathname.startsWith(p));

  const handleLinkClick = () => {
    if (isMobile && onClose) onClose();
  };

  const sidebarClasses = !isMobile
    ? `
      group
      fixed top-0 left-0 h-full z-50
      bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
      transition-all duration-300
      flex flex-col
      w-[72px] hover:w-[280px] shadow-xl
    `
    : `
      fixed top-0 left-0 h-full z-50
      bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
      transition-transform duration-300
      w-[280px] max-w-[85vw] flex flex-col
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside className={sidebarClasses}>
        {/* HEADER */}
        <div className="h-14 md:h-header-h flex items-center px-5 border-b border-slate-200 dark:border-slate-800 shrink-0 gap-3 bg-white dark:bg-slate-900 relative">
          {/* Icon Logo (Always visible) */}
          <div className="w-10 h-10 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg shrink-0">
            <Gem className="w-6 h-6" />
          </div>

          {/* Text Logo */}
          <div
            className={`flex flex-col ${
              isMobile ? "block" : "hidden group-hover:block"
            }`}
          >
            <span className="font-bold text-lg text-slate-800 dark:text-white leading-none">
              Luxe Gold
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Admin Panel
            </span>
          </div>

          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={onClose}
              className="absolute right-4 p-2 rounded-full text-slate-500 hover:text-red-500 bg-slate-50 hover:bg-red-50 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-2 py-6 overflow-y-auto no-scrollbar">
          <ul className="space-y-1">
            {/* Overview Section */}
            <li
              className={`px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 mt-1 ${
                isMobile ? "block" : "hidden group-hover:block"
              }`}
            >
              Overview
            </li>

            <NavItem
              to="/"
              icon={LayoutDashboard}
              label="Dashboard"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            {/* Inventory Section */}
            <li
              className={`px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 mt-6 ${
                isMobile ? "block" : "hidden group-hover:block"
              }`}
            >
              Catalog
            </li>

            <li>
              <MenuButton
                label="Inventory"
                icon={Package}
                isOpen={openMenus.inventory}
                isActive={isActiveParent(["/inventory"])}
                onClick={() => toggleMenu("inventory")}
                isMobile={isMobile}
              />
              <SubMenu isOpen={openMenus.inventory} isMobile={isMobile}>
                <SubNavItem
                  to="/inventory/products"
                  label="All Products"
                  onClick={handleLinkClick}
                />
                <SubNavItem
                  to="/inventory/categories"
                  label="Categories"
                  onClick={handleLinkClick}
                />
                <SubNavItem
                  to="/inventory/stock"
                  label="Stock Adjustment"
                  onClick={handleLinkClick}
                />
              </SubMenu>
            </li>

            <NavItem
              to="/gold-rates"
              icon={Coins}
              label="Gold Rates"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />
            <NavItem
              to="/suppliers"
              icon={Truck}
              label="Suppliers"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            {/* Sales & Orders */}
            <li
              className={`px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 mt-6 ${
                isMobile ? "block" : "hidden group-hover:block"
              }`}
            >
              Sales
            </li>

            <li>
              <MenuButton
                label="Orders"
                icon={ShoppingCart}
                isOpen={openMenus.orders}
                isActive={isActiveParent(["/orders"])}
                onClick={() => toggleMenu("orders")}
                isMobile={isMobile}
              />
              <SubMenu isOpen={openMenus.orders} isMobile={isMobile}>
                <SubNavItem
                  to="/orders/new"
                  label="New Orders"
                  onClick={handleLinkClick}
                />
                <SubNavItem
                  to="/orders/custom"
                  label="Custom Orders"
                  onClick={handleLinkClick}
                />
                <SubNavItem
                  to="/orders/repairs"
                  label="Repairs"
                  onClick={handleLinkClick}
                />
              </SubMenu>
            </li>

            <NavItem
              to="/customers"
              icon={Users}
              label="Customers"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            {/* Management & Finance */}
            <li
              className={`px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 mt-6 ${
                isMobile ? "block" : "hidden group-hover:block"
              }`}
            >
              Management
            </li>

            <li>
              <MenuButton
                label="Finance"
                icon={CreditCard}
                isOpen={openMenus.finance}
                isActive={isActiveParent(["/finance"])}
                onClick={() => toggleMenu("finance")}
                isMobile={isMobile}
              />
              <SubMenu isOpen={openMenus.finance} isMobile={isMobile}>
                <SubNavItem
                  to="/finance/transactions"
                  label="Transactions"
                  onClick={handleLinkClick}
                />
                <SubNavItem
                  to="/finance/invoices"
                  label="Invoices"
                  onClick={handleLinkClick}
                />
                <SubNavItem
                  to="/finance/expenses"
                  label="Expenses"
                  onClick={handleLinkClick}
                />
              </SubMenu>
            </li>

            <NavItem
              to="/staff"
              icon={UserCheck}
              label="Staff / Karigars"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />
            <NavItem
              to="/reports"
              icon={FileBarChart}
              label="Reports"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />
            <NavItem
              to="/showrooms"
              icon={Store}
              label="Showrooms"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />

            {/* System */}
            <li
              className={`px-4 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 mt-6 ${
                isMobile ? "block" : "hidden group-hover:block"
              }`}
            >
              System
            </li>

            <NavItem
              to="/settings"
              icon={Settings}
              label="Settings"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />
            <NavItem
              to="/support"
              icon={HelpCircle}
              label="Support"
              onClick={handleLinkClick}
              isMobile={isMobile}
            />
          </ul>
        </nav>

        {/* FOOTER */}
        <div
          className={`p-6 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 ${
            isMobile ? "block" : "hidden group-hover:block"
          }`}
        >
          <button className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 py-3 rounded-lg font-bold transition-colors text-sm">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/* ---------- SUB COMPONENTS ---------- */

const NavItem = ({ to, icon: Icon, label, onClick, isMobile }) => (
  <li>
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-3.5 rounded-lg mb-1 transition-all duration-200 group/item relative overflow-hidden
        ${
          isActive
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 font-semibold shadow-sm"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />
          )}

          <Icon
            className={`w-5 h-5 mr-3 shrink-0 ${
              isActive
                ? "text-amber-600 dark:text-amber-500"
                : "text-slate-400 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-500"
            }`}
          />
          <span
            className={`truncate ${
              isMobile ? "inline" : "hidden group-hover:inline"
            }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  </li>
);

const MenuButton = ({
  label,
  icon: Icon,
  isOpen,
  isActive,
  onClick,
  isMobile,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg mb-1 transition-all duration-200 group/item
      ${
        isActive
          ? "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium shadow-sm"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
      }`}
  >
    <div className="flex items-center">
      <Icon
        className={`w-5 h-5 mr-3 ${
          isActive
            ? "text-amber-600 dark:text-amber-500"
            : "text-slate-400 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-500"
        }`}
      />
      <span
        className={`truncate ${
          isMobile ? "inline" : "hidden group-hover:inline"
        }`}
      >
        {label}
      </span>
    </div>

    <ChevronRight
      className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
        isOpen ? "rotate-90" : ""
      } ${isMobile ? "inline" : "hidden group-hover:inline"}`}
    />
  </button>
);

const SubMenu = ({ isOpen, children, isMobile }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.ul
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`ml-5 pl-3 border-l-2 border-slate-200 dark:border-slate-700 overflow-hidden ${
          isMobile ? "block" : "hidden group-hover:block"
        }`}
      >
        {children}
      </motion.ul>
    )}
  </AnimatePresence>
);

const SubNavItem = ({ to, label, onClick }) => (
  <li>
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-4 py-2.5 text-[13px] rounded-r-lg transition-all duration-200
        ${
          isActive
            ? "text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-500 -ml-[2px]"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        }`
      }
    >
      {label}
    </NavLink>
  </li>
);

export default Sidebar;
