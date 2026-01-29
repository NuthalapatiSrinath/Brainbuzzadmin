import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Layers,
  Settings,
  FileText,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

// Services
import testSeriesService from "../../../api/testSeriesService";
import categoryService from "../../../api/categoryService";
import subCategoryService from "../../../api/subCategoryService";
import languageService from "../../../api/languageService";

// Components
import CustomDropdown from "../../../components/common/CustomDropdown";

const TEST_SERIES_CONTENT_TYPE = "TEST_SERIES";

const SeriesDashboard = () => {
  const { id } = useParams(); // If present, we are editing
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("settings"); // 'settings' | 'content'

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // Data
  const [formData, setFormData] = useState({
    name: "",
    noOfTests: 0,
    description: "",
    originalPrice: 0,
    isActive: true,
    accessType: "PAID",
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
  });
  const [tests, setTests] = useState([]); // List of tests in this series

  useEffect(() => {
    loadDropdowns();
    if (id) {
      loadSeriesData(id);
    }
  }, [id]);

  const loadDropdowns = async () => {
    try {
      const [cat, lang] = await Promise.all([
        categoryService.getAll(TEST_SERIES_CONTENT_TYPE, true),
        languageService.getAll(),
      ]);
      setCategories(cat.data.map((c) => ({ label: c.name, value: c._id })));
      setLanguages(lang.data.map((l) => ({ label: l.name, value: l._id })));
    } catch (e) {
      console.error(e);
    }
  };

  // Dependent Subcategory Load
  useEffect(() => {
    if (!formData.categoryIds?.[0]) {
      setSubCategories([]);
      return;
    }
    subCategoryService
      .getAll(TEST_SERIES_CONTENT_TYPE, formData.categoryIds[0])
      .then((res) =>
        setSubCategories(
          res.data.map((s) => ({ label: s.name, value: s._id })),
        ),
      );
  }, [formData.categoryIds]);

  const loadSeriesData = async (seriesId) => {
    setLoading(true);
    try {
      const res = await testSeriesService.getFullById(seriesId);
      const data = res.data;
      setFormData({
        name: data.name,
        noOfTests: data.noOfTests,
        description: data.description,
        originalPrice: data.originalPrice,
        isActive: data.isActive,
        accessType: data.accessType,
        categoryIds: data.categories.map((c) => c._id),
        subCategoryIds: data.subCategories.map((s) => s._id),
        languageIds: data.languages.map((l) => l._id),
      });
      setTests(data.tests || []);
    } catch (e) {
      toast.error("Failed to load series");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeries = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare form data logic (JSON or FormData based on your backend preference from prev files)
      // Assuming JSON for simplicity here, but if file upload needed, switch to FormData
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key.includes("Ids"))
          payload.append(
            key.replace("Ids", "").replace("Id", ""),
            JSON.stringify(formData[key]),
          );
        else payload.append(key, formData[key]);
      });

      if (id) {
        await testSeriesService.update(id, payload);
        toast.success("Series Updated");
      } else {
        const res = await testSeriesService.create(payload);
        toast.success("Series Created");
        navigate(`/test-series/${res.data._id}`); // Redirect to edit mode
      }
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // Test Actions
  const handleAddTest = async () => {
    const name = prompt("Enter Test Name:");
    if (!name) return;
    try {
      await testSeriesService.addTest(id, {
        testName: name,
        noOfQuestions: 10,
        totalMarks: 100,
        positiveMarks: 1,
        negativeMarks: 0,
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
      });
      toast.success("Test Added");
      loadSeriesData(id); // Reload to get new test
    } catch (e) {
      toast.error("Failed to add test");
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm("Delete this test?")) return;
    try {
      await testSeriesService.deleteTest(id, testId);
      loadSeriesData(id);
      toast.success("Test Deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  if (loading && !formData.name)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/test-series")}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {id ? formData.name : "Create New Series"}
            </h1>
            <p className="text-slate-500 text-sm">
              {id
                ? "Manage series settings and content"
                : "Enter basic details to start"}
            </p>
          </div>
        </div>
        {id && (
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "settings" ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "content" ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Layers className="w-4 h-4" /> Tests ({tests.length})
            </button>
          </div>
        )}
      </div>

      {/* SETTINGS TAB */}
      {(activeTab === "settings" || !id) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4">
          <form onSubmit={handleSaveSeries} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b pb-2">
                  Basic Info
                </h3>
                <div>
                  <label className="label">Series Name</label>
                  <input
                    className="input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input resize-none"
                    rows="4"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">No. Tests</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.noOfTests}
                      onChange={(e) =>
                        setFormData({ ...formData, noOfTests: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Price (₹)</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b pb-2">
                  Classification & Status
                </h3>
                <CustomDropdown
                  label="Category"
                  options={categories}
                  value={formData.categoryIds[0]}
                  onChange={(v) =>
                    setFormData({ ...formData, categoryIds: [v] })
                  }
                  icon={Layers}
                />
                <CustomDropdown
                  label="SubCategory"
                  options={subCategories}
                  value={formData.subCategoryIds[0]}
                  onChange={(v) =>
                    setFormData({ ...formData, subCategoryIds: [v] })
                  }
                  icon={Layers}
                  disabled={!formData.categoryIds.length}
                />
                <CustomDropdown
                  label="Language"
                  options={languages}
                  value={formData.languageIds[0]}
                  onChange={(v) =>
                    setFormData({ ...formData, languageIds: [v] })
                  }
                  icon={FileText}
                />

                <div className="flex items-center gap-4 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-5 h-5 accent-indigo-600"
                    />
                    <span className="font-bold text-slate-700">
                      Active / Published
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Save className="w-5 h-5" />{" "}
                {id ? "Update Series" : "Create Series"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTENT TAB (TESTS LIST) */}
      {activeTab === "content" && id && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg shadow-indigo-200">
            <div>
              <h2 className="text-xl font-bold">Manage Tests</h2>
              <p className="text-indigo-100 text-sm">
                Add, edit, and organize tests within this series.
              </p>
            </div>
            <button
              onClick={handleAddTest}
              className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-bold shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Test
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tests.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-medium bg-white rounded-2xl border-2 border-dashed">
                No tests created yet.
              </div>
            )}

            {tests.map((test, i) => (
              <div
                key={test._id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex justify-between items-center group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center border border-slate-200">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {test.testName}
                    </h3>
                    <div className="flex gap-3 text-xs font-medium text-slate-500 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {test.noOfQuestions || 0} Qs
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {test.totalMarks || 0} Marks
                      </span>
                      <span
                        className={`${test.isFree ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"} px-2 py-0.5 rounded`}
                      >
                        {test.isFree ? "Free" : "Paid"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() =>
                      navigate(`/test-series/${id}/tests/${test._id}`)
                    }
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-100 flex items-center gap-2"
                  >
                    <Edit className="w-3 h-3" /> Design
                  </button>
                  <button
                    onClick={() => handleDeleteTest(test._id)}
                    className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// CSS Utils
const label = "block text-xs font-bold text-slate-500 uppercase mb-1.5";
const input =
  "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700";

export default SeriesDashboard;
