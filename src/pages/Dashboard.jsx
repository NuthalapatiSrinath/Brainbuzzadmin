import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOpen,
  FileText,
  Video,
  Newspaper,
  ShoppingCart,
  Tag,
  Image,
  Users,
  FileQuestion,
  Languages,
  Clock,
  Book,
  Layers,
  TrendingUp,
  Activity,
} from "lucide-react";

// Import actions
import { fetchCoupons } from "../store/slices/couponSlice";
import { fetchOrders } from "../store/slices/orderSlice";
import { fetchCourses } from "../store/slices/courseSlice";
import { fetchLiveClasses } from "../store/slices/liveClassSlice";
import { fetchTestSeries } from "../store/slices/testSeriesSlice";
import { fetchCurrentAffairs } from "../store/slices/currentAffairsSlice";
import { fetchEBooks } from "../store/slices/eBookSlice";
import { fetchDailyQuizzes } from "../store/slices/dailyQuizSlice";
import { fetchLanguages } from "../store/slices/languageSlice";
import { fetchValidities } from "../store/slices/validitySlice";
import { fetchPublications } from "../store/slices/publicationSlice";

const Dashboard = () => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const { items: coupons = [] } = useSelector((state) => state.coupons);
  const { items: orders = [] } = useSelector((state) => state.orders);
  const { courses = [] } = useSelector((state) => state.courses);
  const { items: liveClasses = [] } = useSelector((state) => state.liveClasses);
  const { testSeries = [] } = useSelector((state) => state.testSeries);
  const { items: currentAffairs = [] } = useSelector(
    (state) => state.currentAffairs,
  );
  const { items: ebooks = [] } = useSelector((state) => state.ebooks);
  const { items: dailyQuizzes = [] } = useSelector(
    (state) => state.dailyQuizzes,
  );
  const { items: languages = [] } = useSelector((state) => state.languages);
  const { items: validities = [] } = useSelector((state) => state.validities);
  const { items: publications = [] } = useSelector(
    (state) => state.publications,
  );

  // Fetch all data on mount
  useEffect(() => {
    dispatch(fetchCoupons());
    dispatch(fetchOrders());
    dispatch(fetchCourses());
    dispatch(fetchLiveClasses({}));
    dispatch(fetchTestSeries());
    dispatch(fetchCurrentAffairs());
    dispatch(fetchEBooks());
    dispatch(fetchDailyQuizzes());
    dispatch(fetchLanguages());
    dispatch(fetchValidities());
    dispatch(fetchPublications());
  }, [dispatch]);

  // Calculate active/inactive counts
  const activeCourses = courses.filter((c) => c.isActive).length;
  const activeLiveClasses = liveClasses.filter((lc) => lc.isActive).length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  // Stats cards configuration
  const statsCards = [
    {
      title: "Online Courses",
      count: courses.length,
      active: activeCourses,
      icon: BookOpen,
      color: "blue",
      link: "/courses",
    },
    {
      title: "Live Classes",
      count: liveClasses.length,
      active: activeLiveClasses,
      icon: Video,
      color: "rose",
      link: "/live-classes",
    },
    {
      title: "Test Series",
      count: testSeries.length,
      icon: FileText,
      color: "purple",
      link: "/test-series",
    },
    {
      title: "Current Affairs",
      count: currentAffairs.length,
      icon: Newspaper,
      color: "green",
      link: "/current-affairs",
    },
    {
      title: "E-Books",
      count: ebooks.length,
      icon: Book,
      color: "orange",
      link: "/ebooks",
    },
    {
      title: "Daily Quizzes",
      count: dailyQuizzes.length,
      icon: Activity,
      color: "teal",
      link: "/daily-quizzes",
    },
    {
      title: "Orders",
      count: orders.length,
      pending: pendingOrders,
      icon: ShoppingCart,
      color: "indigo",
      link: "/orders",
    },
    {
      title: "Coupons",
      count: coupons.length,
      icon: Tag,
      color: "yellow",
      link: "/coupons",
    },
    {
      title: "Publications",
      count: publications.length,
      icon: FileQuestion,
      color: "cyan",
      link: "/publications",
    },
    {
      title: "Languages",
      count: languages.length,
      icon: Languages,
      color: "emerald",
      link: "/languages",
    },
    {
      title: "Validity Options",
      count: validities.length,
      icon: Clock,
      color: "amber",
      link: "/validity",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    fuchsia: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-indigo-100 text-lg">
          Welcome back! Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-xl ${colorClasses[stat.color]} border`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>

              <div className="space-y-1">
                <h3 className="text-slate-600 text-sm font-medium">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-slate-800">
                  {stat.count}
                </p>

                {/* Additional info */}
                <div className="flex gap-2 text-xs font-medium mt-2">
                  {stat.active !== undefined && (
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.active} Active
                    </span>
                  )}
                  {stat.pending !== undefined && stat.pending > 0 && (
                    <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      {stat.pending} Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Content Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Content Items</span>
              <span className="font-bold text-slate-800">
                {courses.length +
                  liveClasses.length +
                  testSeries.length +
                  currentAffairs.length +
                  ebooks.length +
                  dailyQuizzes.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Active Courses</span>
              <span className="font-bold text-green-600">{activeCourses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Active Live Classes</span>
              <span className="font-bold text-rose-600">
                {activeLiveClasses}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            Sales Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Orders</span>
              <span className="font-bold text-slate-800">{orders.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pending Orders</span>
              <span className="font-bold text-orange-600">{pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Active Coupons</span>
              <span className="font-bold text-purple-600">
                {coupons.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            System Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Languages</span>
              <span className="font-bold text-emerald-600">
                {languages.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Validity Options</span>
              <span className="font-bold text-amber-600">
                {validities.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Publications</span>
              <span className="font-bold text-cyan-600">
                {publications.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
