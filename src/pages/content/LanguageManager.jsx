import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit2, Trash2, Languages, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Components
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/common/SearchBar";
import GenericModal from "../../components/modals/GenericModal";

// Actions
import {
  fetchLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
} from "../../store/slices/languageSlice";

const LanguageManager = () => {
  const dispatch = useDispatch();
  const { items: languages, loading } = useSelector((state) => state.languages);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchLanguages());
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
      await dispatch(createLanguage(data)).unwrap();
      toast.success("Language added successfully");
      setModalOpen(false);
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to create language",
      );
    }
  };

  const handleUpdate = async (data) => {
    try {
      await dispatch(updateLanguage({ id: selectedItem._id, data })).unwrap();
      toast.success("Language updated successfully");
      setModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error("Failed to update language");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this language?")) {
      try {
        await dispatch(deleteLanguage(id)).unwrap();
        toast.success("Language deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  // --- FILTERS ---
  const filteredData = useMemo(() => {
    if (!search) return languages;
    return languages.filter(
      (lang) =>
        lang.name.toLowerCase().includes(search.toLowerCase()) ||
        lang.code?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [languages, search]);

  // --- COLUMNS ---
  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase">
            {row.code || row.name.substring(0, 2)}
          </div>
          <span className="font-bold text-slate-700">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Code",
      accessor: "code",
      render: (row) => (
        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono font-bold">
          {row.code || "-"}
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
      name: "name",
      label: "Language Name",
      type: "text",
      required: true,
      placeholder: "e.g. English",
    },
    {
      name: "code",
      label: "Language Code",
      type: "text",
      placeholder: "e.g. en",
    },
    // Optional: Add isActive status toggle if needed
    // { name: "isActive", label: "Status", type: "select", options: [{label: "Active", value: true}, {label: "Inactive", value: false}] }
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Languages className="w-6 h-6 text-indigo-600" />
            Language Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage supported languages for content.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search languages..."
          />
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Language
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
        title={selectedItem ? "Edit Language" : "Add Language"}
        fields={modalFields}
      />
    </div>
  );
};

export default LanguageManager;
