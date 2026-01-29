import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Loader2,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  fetchTestSeries,
  deleteTestSeries,
} from "../../../store/slices/testSeriesSlice";
import DataTable from "../../../components/DataTable";

const TestSeriesList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: seriesList, loading } = useSelector(
    (state) => state.testSeries,
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchTestSeries({}));
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (
      !confirm("Are you sure? This will delete all tests within this series.")
    )
      return;
    try {
      await dispatch(deleteTestSeries(id)).unwrap();
      toast.success("Series deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const filteredData = seriesList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      header: "Series Name",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            {row.thumbnail ? (
              <img
                src={row.thumbnail}
                className="w-full h-full object-cover rounded-xl"
                alt=""
              />
            ) : (
              <BookOpen className="w-6 h-6" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-800">{row.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {row.noOfTests} Tests • {row.accessType}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "originalPrice",
      render: (row) => (
        <div className="font-bold text-slate-700">
          {row.originalPrice > 0 ? (
            `₹${row.originalPrice}`
          ) : (
            <span className="text-green-600">Free</span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${row.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
        >
          {row.isActive ? "Active" : "Draft"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(`/test-series/${row._id}`)}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> Manage
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Test Series Manager
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your exam bundles and packages
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search series..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => navigate("/test-series/create")}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Create Series
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} hideSearch />
        )}
      </div>
    </div>
  );
};

export default TestSeriesList;
