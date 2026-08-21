"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Order, Product } from "@/lib/types";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminDashboardPage() {
  const [unreadInquiries, setUnreadInquiries] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [ordersToday, setOrdersToday] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<{ id: number; name: string; stock: number; status: string }[]>([]);
  const [dailyIncomeData, setDailyIncomeData] = useState<{ day: string; income: number }[]>([
    { day: "Mon", income: 0 },
    { day: "Tue", income: 0 },
    { day: "Wed", income: 0 },
    { day: "Thu", income: 0 },
    { day: "Fri", income: 0 },
    { day: "Sat", income: 0 },
    { day: "Sun", income: 0 },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [unreadRes, ordersRes, productsRes] = await Promise.all([
          fetchApi<{ unread_count: number }>("/inquiries/unread").catch(() => ({ unread_count: 0 })),
          fetchApi<{ status: string; data: Order[] }>("/admin/orders").catch(() => ({ status: "error", data: [] })),
          fetchApi<{ data: Product[] } | Product[]>("/products").catch(() => [])
        ]);
        
        setUnreadInquiries(unreadRes.unread_count || 0);

        if (ordersRes && ordersRes.data) {
          const fetchedOrders = ordersRes.data;
          setOrders(fetchedOrders);

          // Calculate total revenue (excluding cancelled)
          const revenue = fetchedOrders
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
          setTotalRevenue(revenue);

          // Calculate orders today
          const today = new Date().toISOString().split('T')[0];
          const todayCount = fetchedOrders.filter((o) => o.created_at?.startsWith(today)).length;
          setOrdersToday(todayCount);

          // Process daily income for the graph (last 7 days)
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
          });

          const incomeByDate: Record<string, number> = {};
          last7Days.forEach(d => incomeByDate[d] = 0);

          const validOrders = fetchedOrders.filter((o) => o.status !== 'cancelled');

          validOrders.forEach((o: any) => {
            if (o.created_at) {
              const dateStr = o.created_at.split('T')[0];
              if (incomeByDate[dateStr] !== undefined) {
                incomeByDate[dateStr] += (Number(o.total) || 0);
              }
            }
          });

          const formattedIncomeData = last7Days.map(dateStr => {
            const dateObj = new Date(dateStr);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            return {
              day: dayName,
              income: incomeByDate[dateStr]
            };
          });

          setDailyIncomeData(formattedIncomeData);
        }

        // Process products for low stock alerts (stock <= 10)
        const productsArray = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
        const lowStock = productsArray
          .filter((p: Product) => p.stock_quantity <= 10 && p.is_active)
          .sort((a: Product, b: Product) => a.stock_quantity - b.stock_quantity)
          .slice(0, 5)
          .map((p: Product) => ({
            id: p.id,
            name: p.title,
            stock: p.stock_quantity,
            status: p.stock_quantity <= 5 ? 'Critical' : 'Low',
          }));
        setLowStockProducts(lowStock);

      } catch (err) {
        console.error("Could not fetch dashboard data", err);
      }
    }
    fetchData();
  }, []);

  const adminModules = [
    {
      title: "Contact Inquiries",
      description: "View and respond to client message submissions from the contact page.",
      href: "/admin/inquiries",
      badge: unreadInquiries > 0 ? `${unreadInquiries} Unread` : null,
      icon: (
        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Orders Management",
      description: "Manage client product and paper roll order requests.",
      href: "/admin/orders",
      badge: null,
      icon: (
        <svg className="w-6 h-6 text-[#01A7E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      title: "Products & Paper Rolls",
      description: "Update paper roll catalog items, pricing, stock, and specs.",
      href: "/admin/products",
      badge: null,
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: "Services Management",
      description: "Manage IT services, custom software development offerings, and headers.",
      href: "/admin/services",
      badge: null,
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-6z" />
        </svg>
      ),
    },
    // {
    //   title: "Team Members",
    //   description: "Add, update or remove company executive and developer profiles.",
    //   href: "/admin/team",
    //   badge: null,
    //   icon: (
    //     <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    //     </svg>
    //   ),
    // },
    // {
    //   title: "Software Products",
    //   description: "Manage pre-built software solutions, POS systems, and tools.",
    //   href: "/admin/software",
    //   badge: null,
    //   icon: (
    //     <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    //     </svg>
    //   ),
    // },
    // {
    //   title: "Site Navigation & Settings",
    //   description: "Main site contact parameters, social links, and COD settings.",
    //   href: "/admin/settings",
    //   badge: null,
    //   icon: (
    //     <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    //     </svg>
    //   ),
    // },
  ];

  const maxIncome = Math.max(...dailyIncomeData.map(d => d.income), 1); // Minimum 1 to avoid division by zero

  const mockCashIncome = {
    total: `Rs. ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    trend: "Lifetime",
  };

  const mockOrdersStats = {
    today: ordersToday,
    trend: "Today",
    totalThisWeek: orders.length,
  };



  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Administration Control Panel</span>
            <h1 className="text-3xl font-extrabold text-white mt-1">Admin Dashboard</h1>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition"
          >
            ← Back to Main Site
          </Link>
        </div>

        {/* --- Top Dashboard Widgets --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Cash Income */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20"></div>
            <div>
              <h3 className="text-slate-400 text-sm font-semibold mb-1 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Total Cash Income
              </h3>
              <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                {mockCashIncome.total}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold">
                {mockCashIncome.trend}
              </span>
              <span className="text-xs text-slate-500">revenue</span>
            </div>
          </div>

          {/* Orders Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-slate-400 text-sm font-semibold mb-1">Orders Received Today</h3>
              <div className="text-4xl font-extrabold text-white mt-2 tracking-tight">
                {mockOrdersStats.today}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold">
                {mockOrdersStats.trend}
              </span>
              <span className="text-xs text-slate-500">({mockOrdersStats.totalThisWeek} total orders)</span>
            </div>
          </div>

          {/* Daily Income Graph */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-400 text-sm font-semibold">Daily Income (Last 7 Days)</h3>
              <span className="text-xs text-emerald-400 font-medium">Weekly View</span>
            </div>
            <div className="flex-1 flex items-end gap-2 sm:gap-4 justify-between h-32 mt-auto">
              {dailyIncomeData.map((data, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group h-full">
                  <div className="w-full relative flex justify-center h-full items-end">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Rs. {data.income.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div 
                      className="w-full max-w-[40px] bg-emerald-500/20 group-hover:bg-emerald-500/80 border-t border-emerald-500/50 rounded-t-sm transition-all duration-300 min-h-[4px]"
                      style={{ height: `${Math.max((data.income / maxIncome) * 100, 4)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{data.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Low Stock Alert List */}
          <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-6 flex flex-col h-[450px] lg:col-span-1 shadow-[0_0_15px_rgba(220,38,38,0.05)]">
            <h3 className="text-slate-300 text-sm font-bold flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Low Stock Alerts
            </h3>
            
            <div className="flex-1 space-y-3 overflow-y-auto">
              {lowStockProducts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  All products are well stocked ✓
                </div>
              ) : (
                lowStockProducts.map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                    <div className="truncate pr-3">
                      <div className="text-xs font-bold text-slate-200 truncate" title={item.name}>{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Stock: {item.stock} left</div>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded border ${item.status === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <Link href="/admin/products" className="mt-4 text-xs text-center text-slate-400 hover:text-white transition w-full py-2 bg-slate-950 rounded-lg border border-slate-800 hover:border-slate-700">
              Manage Inventory
            </Link>
          </div>

          {/* Admin Modules Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {adminModules.map((mod) => (
              <Link
                key={mod.title}
                href={mod.href}
                className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl group-hover:border-cyan-500/30 transition">
                      {mod.icon}
                    </div>
                    {mod.badge && (
                      <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 rounded-full animate-pulse">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-[11px] font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform uppercase tracking-wide">
                  <span>Access Module</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

