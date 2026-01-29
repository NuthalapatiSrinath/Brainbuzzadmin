import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Upload,
  Layers,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  DollarSign,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  Video,
  List,
  Trophy,
  ArrowLeft,
  MoreHorizontal,
  PlayCircle,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Components
import CustomDropdown from "../common/CustomDropdown";

// Services
import testSeriesService from "../../api/testSeriesService";
import categoryService from "../../api/categoryService";
import subCategoryService from "../../api/subCategoryService";
import languageService from "../../api/languageService";
import validityService from "../../api/validityService";

const TEST_SERIES_CONTENT_TYPE = "TEST_SERIES";

const TestSeriesModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("series"); // 'series' | 'test_editor'

  // --- DROPDOWN DATA ---
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [validities, setValidities] = useState([]);

  // --- SERIES DATA ---
  const [seriesData, setSeriesData] = useState({
    name: "",
    noOfTests: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
    isActive: true,
    originalPrice: 0,
    discountType: "",
    discountValue: 0,
    discountValidUntil: "",
    categoryIds: [],
    subCategoryIds: [],
    languageIds: [],
    validityId: "",
    accessType: "PAID",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fullSeriesData, setFullSeriesData] = useState(null); // Contains Tests & Deep Data

  // --- TEST EDITOR STATE (For Drill Down) ---
  const [currentTest, setCurrentTest] = useState(null); // The test being edited
  const [testTab, setTestTab] = useState("details"); // details, instructions, video, sections, cutoff, results

  // --- INIT ---
  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (initialData) {
        populateSeriesForm(initialData);
        fetchFullDetails(initialData._id);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const fetchFullDetails = async (id) => {
    try {
      const res = await testSeriesService.getFullById(id);
      setFullSeriesData(res.data);
      // If we were editing a test, refresh its data in memory
      if (currentTest) {
        const updatedTest = res.data.tests.find(
          (t) => t._id === currentTest._id,
        );
        if (updatedTest) setCurrentTest(updatedTest);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [cat, lang, val] = await Promise.all([
        categoryService.getAll(TEST_SERIES_CONTENT_TYPE, true),
        languageService.getAll(),
        validityService.getAll(),
      ]);
      setCategories(cat.data.map((c) => ({ label: c.name, value: c._id })));
      setLanguages(lang.data.map((l) => ({ label: l.name, value: l._id })));
      setValidities(val.data.map((v) => ({ label: v.label, value: v._id })));
    } catch (e) {
      console.error(e);
    }
  };

  // Dependent SubCategory
  useEffect(() => {
    const loadSub = async () => {
      if (!seriesData.categoryIds?.length) {
        setSubCategories([]);
        return;
      }
      try {
        const res = await subCategoryService.getAll(
          TEST_SERIES_CONTENT_TYPE,
          seriesData.categoryIds[0],
        );
        setSubCategories(
          res.data.map((s) => ({ label: s.name, value: s._id })),
        );
      } catch (e) {
        console.error(e);
      }
    };
    loadSub();
  }, [seriesData.categoryIds]);

  const populateSeriesForm = (data) => {
    setSeriesData({
      name: data.name || "",
      noOfTests: data.noOfTests || 0,
      description: data.description || "",
      date: data.date ? data.date.split("T")[0] : "",
      isActive: data.isActive ?? true,
      originalPrice: data.originalPrice || 0,
      discountType: data.discount?.type || "",
      discountValue: data.discount?.value || 0,
      discountValidUntil: data.discount?.validUntil
        ? data.discount.validUntil.split("T")[0]
        : "",
      categoryIds: data.categories?.map((c) => c._id || c) || [],
      subCategoryIds: data.subCategories?.map((s) => s._id || s) || [],
      languageIds: data.languages?.map((l) => l._id || l) || [],
      validityId: data.validity?._id || data.validity || "",
      accessType: data.accessType || "PAID",
    });
    setPreview(data.thumbnail);
    setThumbnail(null);
  };

  const resetForm = () => {
    setSeriesData({
      name: "",
      noOfTests: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      isActive: true,
      originalPrice: 0,
      discountType: "",
      discountValue: 0,
      discountValidUntil: "",
      categoryIds: [],
      subCategoryIds: [],
      languageIds: [],
      validityId: "",
      accessType: "PAID",
    });
    setThumbnail(null);
    setPreview(null);
    setActiveTab("basic");
    setFullSeriesData(null);
    setViewMode("series");
    setCurrentTest(null);
  };

  // --- SERIES HANDLERS ---
  const handleSeriesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSeriesData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSelect = (field, val) =>
    setSeriesData((prev) => ({
      ...prev,
      [field]: field === "validityId" ? val : Array.isArray(val) ? val : [val],
    }));
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSeriesSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(seriesData).forEach((key) => {
      if (key.includes("Ids") || key === "validityId")
        data.append(
          key.replace("Ids", "").replace("Id", ""),
          JSON.stringify(seriesData[key]),
        );
      else data.append(key, seriesData[key]);
    });
    if (thumbnail) data.append("thumbnail", thumbnail);

    try {
      if (initialData) {
        await onSubmit({ _isEdit: true, id: initialData._id, data });
        fetchFullDetails(initialData._id);
      } else {
        await onSubmit(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- TEST MANIPULATION HANDLERS ---
  const handleAddTest = async () => {
    const name = prompt("Enter Test Name:");
    if (!name) return;
    try {
      await testSeriesService.addTest(initialData._id, {
        testName: name,
        noOfQuestions: 10,
        totalMarks: 10,
        positiveMarks: 1,
        negativeMarks: 0,
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
      });
      toast.success("Test Added");
      fetchFullDetails(initialData._id);
    } catch (e) {
      toast.error("Failed to add test");
    }
  };

  const openTestEditor = (test) => {
    setCurrentTest(test);
    setViewMode("test_editor");
    setTestTab("details");
  };

  // --- TEST SUB-COMPONENTS (Rendered inside the modal) ---
  const renderTestEditor = () => {
    if (!currentTest) return null;

    // Helper to update local test state while editing fields
    const updateLocalTest = (field, value) =>
      setCurrentTest((prev) => ({ ...prev, [field]: value }));

    const saveTestDetails = async () => {
      try {
        await testSeriesService.updateTest(
          initialData._id,
          currentTest._id,
          currentTest,
        );
        toast.success("Test details saved");
        fetchFullDetails(initialData._id);
      } catch (e) {
        toast.error("Failed to save");
      }
    };

    const saveInstructions = async () => {
      try {
        await testSeriesService.updateInstructions(
          initialData._id,
          currentTest._id,
          {
            instructionsPage1: currentTest.instructionsPage1,
            instructionsPage2: currentTest.instructionsPage2,
            instructionsPage3: currentTest.instructionsPage3,
          },
        );
        toast.success("Instructions updated");
      } catch (e) {
        toast.error("Failed");
      }
    };

    const handleVideoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("explanationVideo", file);
      try {
        const loadingToast = toast.loading("Uploading Video...");
        await testSeriesService.updateExplanationVideo(
          initialData._id,
          currentTest._id,
          formData,
        );
        toast.dismiss(loadingToast);
        toast.success("Video uploaded!");
        fetchFullDetails(initialData._id);
      } catch (e) {
        toast.error("Upload failed");
      }
    };

    const saveCutoff = async () => {
      // Assuming cutoff data is stored in a temporary state or inside currentTest object if populated
      // For this UI, let's assume we prompt or use simple inputs mapped to a state
      // Simplified for brevity - ideally use separate state for cutoff
      const general = prompt(
        "General Cutoff:",
        currentTest.cutoff?.general || 0,
      );
      if (general === null) return;
      try {
        await testSeriesService.setCutoff(initialData._id, currentTest._id, {
          general,
          obc: general,
          sc: general,
          st: general,
        }); // Simplification
        toast.success("Cutoff Updated");
      } catch (e) {
        toast.error("Failed");
      }
    };

    return (
      <div className="space-y-6">
        {/* Test Editor Header */}
        <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("series")}
              className="p-1 hover:bg-white rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-indigo-700" />
            </button>
            <h3 className="font-bold text-indigo-900">
              Editing: {currentTest.testName}
            </h3>
          </div>
          <button onClick={saveTestDetails} className="btn-primary text-xs">
            <Save className="w-3 h-3 mr-1" /> Save Details
          </button>
        </div>

        {/* Test Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          {[
            "details",
            "instructions",
            "video",
            "sections",
            "cutoff",
            "results",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setTestTab(t)}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-t-lg transition-all ${testTab === t ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* --- TEST EDITOR CONTENT --- */}
        <div className="p-1">
          {testTab === "details" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Test Name</label>
                <input
                  className="input"
                  value={currentTest.testName}
                  onChange={(e) => updateLocalTest("testName", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Total Marks</label>
                <input
                  type="number"
                  className="input"
                  value={currentTest.totalMarks}
                  onChange={(e) =>
                    updateLocalTest("totalMarks", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="label">Positive Marks</label>
                <input
                  type="number"
                  className="input"
                  value={currentTest.positiveMarks}
                  onChange={(e) =>
                    updateLocalTest("positiveMarks", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="label">Negative Marks</label>
                <input
                  type="number"
                  className="input"
                  value={currentTest.negativeMarks}
                  onChange={(e) =>
                    updateLocalTest("negativeMarks", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={currentTest.date ? currentTest.date.split("T")[0] : ""}
                  onChange={(e) => updateLocalTest("date", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Publish Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={
                    currentTest.resultPublishTime
                      ? new Date(currentTest.resultPublishTime)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    updateLocalTest("resultPublishTime", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {testTab === "instructions" && (
            <div className="space-y-4">
              {[
                "instructionsPage1",
                "instructionsPage2",
                "instructionsPage3",
              ].map((page, i) => (
                <div key={page}>
                  <label className="label">Instruction Page {i + 1}</label>
                  <textarea
                    rows="3"
                    className="input"
                    value={currentTest[page] || ""}
                    onChange={(e) => updateLocalTest(page, e.target.value)}
                    placeholder={`HTML or Text for Page ${i + 1}`}
                  />
                </div>
              ))}
              <button
                onClick={saveInstructions}
                className="btn-primary w-full mt-2"
              >
                Save Instructions
              </button>
            </div>
          )}

          {testTab === "video" && (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
              <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-4">
                {currentTest.totalExplanationVideoUrl
                  ? "Video Uploaded ✅"
                  : "No Video Uploaded"}
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          )}

          {testTab === "sections" && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h4 className="font-bold">Sections</h4>
                <button
                  className="text-xs text-indigo-600 font-bold"
                  onClick={async () => {
                    const title = prompt("Section Title");
                    if (title) {
                      await testSeriesService.addSection(
                        initialData._id,
                        currentTest._id,
                        { title, order: 1, noOfQuestions: 10 },
                      );
                      fetchFullDetails(initialData._id);
                    }
                  }}
                >
                  + Add Section
                </button>
              </div>
              {currentTest.sections?.map((section) => (
                <div
                  key={section._id}
                  className="border p-3 rounded-lg bg-slate-50"
                >
                  <div className="flex justify-between font-bold text-sm">
                    <span>
                      {section.title} ({section.questions.length} Qs)
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600"
                        onClick={async () => {
                          // Add Question Logic (Simplified)
                          await testSeriesService.addQuestion(
                            initialData._id,
                            currentTest._id,
                            section._id,
                            {
                              questionNumber: section.questions.length + 1,
                              questionText: "New Question",
                              options: ["A", "B", "C", "D"],
                              correctOptionIndex: 0,
                            },
                          );
                          fetchFullDetails(initialData._id);
                        }}
                      >
                        + Q
                      </button>
                      <button
                        className="text-red-600"
                        onClick={async () => {
                          if (confirm("Delete Section?")) {
                            await testSeriesService.deleteSection(
                              initialData._id,
                              currentTest._id,
                              section._id,
                            );
                            fetchFullDetails(initialData._id);
                          }
                        }}
                      >
                        Del
                      </button>
                    </div>
                  </div>
                  {/* Question List Preview */}
                  <div className="mt-2 pl-2 border-l-2 border-slate-200">
                    {section.questions.map((q) => (
                      <div
                        key={q._id}
                        className="text-xs text-slate-500 py-1 border-b border-slate-100 flex justify-between"
                      >
                        <span className="truncate w-3/4">
                          {q.questionNumber}. {q.questionText}
                        </span>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={async () => {
                            await testSeriesService.deleteQuestion(
                              initialData._id,
                              currentTest._id,
                              section._id,
                              q._id,
                            );
                            fetchFullDetails(initialData._id);
                          }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {testTab === "cutoff" && (
            <div className="text-center p-10">
              <button onClick={saveCutoff} className="btn-primary">
                Manage Cutoffs
              </button>
            </div>
          )}

          {testTab === "results" && (
            <div className="text-center p-10 text-slate-500 italic">
              Use the "Participants" button on the main dashboard to view
              detailed rankings.
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            {viewMode === "series"
              ? initialData
                ? "Edit Test Series"
                : "New Test Series"
              : "Test Manager"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
          {/* VIEW 1: SERIES FORM */}
          {viewMode === "series" && (
            <>
              {/* Series Tabs */}
              <div className="flex gap-4 border-b border-slate-100 pb-2 mb-6">
                {[
                  "basic",
                  "pricing",
                  "classification",
                  ...(initialData ? ["content"] : []),
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`text-sm font-bold uppercase pb-2 border-b-2 transition-all ${activeTab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <form
                id="series-form"
                onSubmit={handleSeriesSubmit}
                className="space-y-6"
              >
                {activeTab === "basic" && (
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="label">Series Name</label>
                        <input
                          name="name"
                          value={seriesData.name}
                          onChange={handleSeriesChange}
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">No. Tests</label>
                        <input
                          type="number"
                          name="noOfTests"
                          value={seriesData.noOfTests}
                          onChange={handleSeriesChange}
                          className="input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="label">Start Date</label>
                        <input
                          type="date"
                          name="date"
                          value={seriesData.date}
                          onChange={handleSeriesChange}
                          className="input"
                        />
                      </div>
                      <div className="flex items-center mt-6 gap-2">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={seriesData.isActive}
                          onChange={handleSeriesChange}
                          className="w-5 h-5 accent-indigo-600"
                        />{" "}
                        <span className="font-bold text-slate-700">Active</span>
                      </div>
                    </div>
                    <div>
                      <label className="label">Description</label>
                      <textarea
                        name="description"
                        value={seriesData.description}
                        onChange={handleSeriesChange}
                        rows="3"
                        className="input"
                      />
                    </div>
                    <div className="border p-4 rounded-xl flex gap-4 items-center">
                      {preview && (
                        <img
                          src={preview}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <input
                        type="file"
                        onChange={handleFile}
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
                {activeTab === "pricing" && (
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="label">Price (₹)</label>
                        <input
                          type="number"
                          name="originalPrice"
                          value={seriesData.originalPrice}
                          onChange={handleSeriesChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Access</label>
                        <select
                          name="accessType"
                          value={seriesData.accessType}
                          onChange={handleSeriesChange}
                          className="input"
                        >
                          <option value="PAID">Paid</option>
                          <option value="FREE">Free</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                      <div>
                        <label className="label">Discount</label>
                        <select
                          name="discountType"
                          value={seriesData.discountType}
                          onChange={handleSeriesChange}
                          className="input"
                        >
                          <option value="">None</option>
                          <option value="percentage">%</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Value</label>
                        <input
                          type="number"
                          name="discountValue"
                          value={seriesData.discountValue}
                          onChange={handleSeriesChange}
                          className="input"
                          disabled={!seriesData.discountType}
                        />
                      </div>
                      <div>
                        <label className="label">Valid Until</label>
                        <input
                          type="date"
                          name="discountValidUntil"
                          value={seriesData.discountValidUntil}
                          onChange={handleSeriesChange}
                          className="input"
                          disabled={!seriesData.discountType}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "classification" && (
                  <div className="grid grid-cols-2 gap-6">
                    <CustomDropdown
                      label="Category"
                      options={categories}
                      value={seriesData.categoryIds?.[0]}
                      onChange={(v) => handleSelect("categoryIds", v)}
                      placeholder="Select"
                      required
                      icon={Layers}
                    />
                    <CustomDropdown
                      label="Sub Category"
                      options={subCategories}
                      value={seriesData.subCategoryIds?.[0]}
                      onChange={(v) => handleSelect("subCategoryIds", v)}
                      placeholder="Select"
                      disabled={!seriesData.categoryIds.length}
                      icon={Layers}
                    />
                    <CustomDropdown
                      label="Language"
                      options={languages}
                      value={seriesData.languageIds?.[0]}
                      onChange={(v) => handleSelect("languageIds", v)}
                      placeholder="Select"
                      required
                      icon={FileText}
                    />
                    <CustomDropdown
                      label="Validity"
                      options={validities}
                      value={seriesData.validityId}
                      onChange={(v) => handleSelect("validityId", v)}
                      placeholder="Select"
                      icon={Clock}
                    />
                  </div>
                )}
                {activeTab === "content" && fullSeriesData && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl">
                      <h4 className="font-bold text-indigo-900">All Tests</h4>
                      <button
                        type="button"
                        onClick={handleAddTest}
                        className="btn-primary text-xs"
                      >
                        + Add Test
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {fullSeriesData.tests.map((test, i) => (
                        <div
                          key={test._id}
                          onClick={() => openTestEditor(test)}
                          className="border p-4 rounded-xl hover:shadow-md cursor-pointer bg-white flex justify-between items-center group"
                        >
                          <div>
                            <div className="font-bold text-slate-800">
                              Test {i + 1}: {test.testName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {test.noOfQuestions} Qs • {test.totalMarks} Marks
                              • {test.isFree ? "Free" : "Paid"}
                            </div>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </>
          )}

          {/* VIEW 2: TEST EDITOR */}
          {viewMode === "test_editor" && renderTestEditor()}
        </div>

        {/* Footer */}
        {viewMode === "series" && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            {activeTab !== "content" && (
              <button
                type="submit"
                form="series-form"
                disabled={isSubmitting}
                className="btn-primary"
              >
                Save Series
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- CSS UTILS ---
const label = "block text-xs font-bold text-slate-500 uppercase mb-1";
const input =
  "w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-sm font-medium transition-all disabled:bg-slate-100";

export default TestSeriesModal;
