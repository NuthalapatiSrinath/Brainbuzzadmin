import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit2, Trash2, Clock, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

// Components
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/common/SearchBar";
import GenericModal from "../../components/modals/GenericModal";

// Actions
import {
  fetchValidities,
  createValidity,
  updateValidity,
  deleteValidity,
} from "../../store/slices/validitySlice";

const ValidityManager = () => {
  const dispatch = useDispatch();
  const { items: validities, loading } = useSelector(
    (state) => state.validities,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchValidities());
  }, [dispatch]);

  // --- HANDLERS ---
  const openCreateModal = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCreate = async (data) => {
    try {
      await dispatch(createValidity(data)).unwrap();
      toast.success("Validity option created successfully");
      setModalOpen(false);
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to create validity",
      );
    }
  };

  const handleUpdate = async (data) => {
    try {
      await dispatch(updateValidity({ id: selectedItem._id, data })).unwrap();
      toast.success("Validity updated successfully");
      setModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error("Failed to update validity");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this option?")) {
      try {
        await dispatch(deleteValidity(id)).unwrap();
        toast.success("Validity deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  // --- FILTERS ---
  const filteredData = useMemo(() => {
    if (!search) return validities;
    return validities.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [validities, search]);

  // --- COLUMNS ---
  const columns = [
    {
      header: "Label",
      accessor: "label",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-700">{row.label}</span>
        </div>
      ),
    },
    {
      header: "Duration (Days)",
      accessor: "durationInDays",
      render: (row) => (
        <span className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
          <Calendar className="w-4 h-4 text-slate-400" />
          {row.durationInDays} Days
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
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
            onClick={() => openEditModal(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // --- MODAL CONFIG ---
  const modalFields = [
    {
      name: "label",
      label: "Label",
      type: "text",
      required: true,
      placeholder: "e.g. 6 Months",
    },
    {
      name: "durationInDays",
      label: "Duration (in Days)",
      type: "number",
      required: true,
      placeholder: "e.g. 180",
    },
    {
      name: "isActive",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: true },
        { label: "Inactive", value: false },
      ],
      required: true,
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Validity Options
          </h1>
          <p className="text-slate-500 mt-1">Manage course duration options.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <SearchBar onSearch={setSearch} placeholder="Search options..." />
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Option
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-indigo-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} hideSearch={true} />
        )}
      </div>

      {/* Modal */}
      <GenericModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedItem ? handleUpdate : handleCreate}
        initialData={selectedItem}
        title={selectedItem ? "Edit Validity" : "Add Validity"}
        fields={modalFields}
      />
    </div>
  );
};

export default ValidityManager;
