import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Loader2,
  Layers,
  FolderTree,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/common/SearchBar";
import GenericModal from "../../components/modals/GenericModal";
import TestSeriesModal from "../../components/modals/TestSeriesModal"; // The mega modal
import {
  fetchTestSeries,
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,
} from "../../store/slices/testSeriesSlice";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../store/slices/categorySlice";
import {
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../../store/slices/subCategorySlice";

const TEST_SERIES_CONTENT_TYPE = "TEST_SERIES";

const TestSeriesManager = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("series");

  // Redux
  const { items: seriesList, loading } = useSelector(
    (state) => state.testSeries,
  );
  const { categories } = useSelector((state) => state.category);
  const { subCategories } = useSelector((state) => state.subCategory);

  // Local
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'series', 'category', 'subcategory'
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [targetParentId, setTargetParentId] = useState(null);

  useEffect(() => {
    dispatch(fetchTestSeries({}));
    dispatch(fetchCategories({ contentType: TEST_SERIES_CONTENT_TYPE }));
    dispatch(fetchSubCategories({ contentType: TEST_SERIES_CONTENT_TYPE }));
  }, [dispatch]);

  // Actions
  const openModal = (type, parentId = null, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (parentId) setTargetParentId(parentId);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setTargetParentId(null);
  };

  const handleCreate = async (data) => {
    try {
      if (modalType === "series")
        await dispatch(createTestSeries(data)).unwrap();
      else if (modalType === "category")
        await dispatch(
          createCategory({ ...data, contentType: TEST_SERIES_CONTENT_TYPE }),
        ).unwrap();
      else if (modalType === "subcategory")
        await dispatch(
          createSubCategory(
            targetParentId ? { ...data, category: targetParentId } : data,
          ),
        ).unwrap();
      toast.success("Created!");
      closeModal();
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const id = selectedItem._id;
      if (modalType === "series" && data._isEdit)
        await dispatch(
          updateTestSeries({ id: data.id, data: data.data }),
        ).unwrap();
      else if (modalType === "category")
        await dispatch(updateCategory({ id, formData: data })).unwrap();
      else if (modalType === "subcategory")
        await dispatch(updateSubCategory({ id, formData: data })).unwrap();
      toast.success("Updated!");
      closeModal();
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Delete?")) return;
    try {
      if (type === "series") await dispatch(deleteTestSeries(id)).unwrap();
      else if (type === "category") await dispatch(deleteCategory(id)).unwrap();
      else if (type === "subcategory")
        await dispatch(deleteSubCategory(id)).unwrap();
      toast.success("Deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  // Helpers
  const toggleExpand = (id) =>
    setExpandedCategories((p) => ({ ...p, [id]: !p[id] }));
  const groupedSubCategories = useMemo(() => {
    const g = {};
    subCategories.forEach((s) => {
      const pid = s.category?._id || s.category;
      if (!g[pid]) g[pid] = [];
      g[pid].push(s);
    });
    return g;
  }, [subCategories]);

  // Filters
  const filteredSeries = useMemo(
    () =>
      seriesList.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [seriesList, search],
  );
  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  );

  const columns = [
    {
      header: "Series Name",
      accessor: "name",
      render: (r) => (
        <div className="flex gap-3 items-center">
          {r.thumbnail && (
            <img src={r.thumbnail} className="w-10 h-10 rounded object-cover" />
          )}
          <span className="font-bold text-slate-800">{r.name}</span>
        </div>
      ),
    },
    {
      header: "Tests",
      accessor: "noOfTests",
      render: (r) => (
        <span className="badge bg-slate-100">{r.noOfTests} Tests</span>
      ),
    },
    {
      header: "Price",
      accessor: "originalPrice",
      render: (r) => (
        <span className="font-bold text-green-600">₹{r.originalPrice}</span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (r) => (
        <span
          className={`badge ${r.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {r.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "_id",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openModal("series", null, r)}
            className="btn-icon text-indigo-600 hover:bg-indigo-50"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete("series", r._id)}
            className="btn-icon text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="header-box flex justify-between items-center">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {["series", "classification"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`tab-btn ${activeTab === t ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}
            >
              {t === "series" ? "Test Series" : "Classifications"}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search..."
          />
          <button
            onClick={() =>
              openModal(activeTab === "series" ? "series" : "category")
            }
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" /> Add New
          </button>
        </div>
      </div>

      <div className="content-box min-h-[400px]">
        {activeTab === "series" ? (
          loading ? (
            <div className="flex justify-center h-96 items-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <DataTable columns={columns} data={filteredSeries} hideSearch />
          )
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => (
              <div key={cat._id} className="card-box group">
                <div
                  className="p-4 flex justify-between items-center border-b border-slate-100 bg-slate-50 cursor-pointer"
                  onClick={() => toggleExpand(cat._id)}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold">{cat.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal("category", null, cat);
                      }}
                      className="p-1 hover:bg-white rounded"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete("category", cat._id);
                      }}
                      className="p-1 hover:bg-white rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <button
                    onClick={() => toggleExpand(cat._id)}
                    className="w-full flex items-center gap-2 text-xs font-bold text-slate-400 mb-3"
                  >
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${expandedCategories[cat._id] ? "rotate-90" : ""}`}
                    />{" "}
                    {expandedCategories[cat._id] ? "Hide" : "Show"}{" "}
                    Subcategories
                  </button>
                  {expandedCategories[cat._id] && (
                    <div className="space-y-2 animate-in fade-in">
                      {groupedSubCategories[cat._id]?.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex justify-between items-center p-2 hover:bg-slate-50 rounded"
                        >
                          <span className="text-sm flex gap-2 items-center">
                            <FolderTree className="w-3 h-3 text-slate-400" />{" "}
                            {sub.name}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                openModal("subcategory", null, sub)
                              }
                              className="text-slate-400 hover:text-indigo-600"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete("subcategory", sub._id)
                              }
                              className="text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => openModal("subcategory", cat._id)}
                        className="w-full py-2 border-dashed border-2 rounded text-xs font-bold text-indigo-500 hover:bg-indigo-50"
                      >
                        + Add Subcategory
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalType === "series" ? (
        <TestSeriesModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={modalType === "series" ? handleUpdate : handleCreate}
          initialData={selectedItem}
        />
      ) : (
        <GenericModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={selectedItem ? handleUpdate : handleCreate}
          initialData={selectedItem}
          title={`${selectedItem ? "Edit" : "Add"} ${modalType}`}
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            {
              name: "thumbnail",
              label: "Thumbnail",
              type: "file",
              previewKey: "thumbnailUrl",
            },
          ]}
        />
      )}
    </div>
  );
};

// Tailwind Classes
const btnPrimary =
  "bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-indigo-700 transition-all";
// (Add these styles to your index.css or use inline as done above)

export default TestSeriesManager;
