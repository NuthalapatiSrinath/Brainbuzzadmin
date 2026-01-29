import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Video,
  FileText,
  Layout,
  Scissors,
  HelpCircle,
  GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import testSeriesService from "../../../api/testSeriesService";

const TestDesigner = () => {
  const { seriesId, testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sections"); // details, instructions, sections, video, cutoff
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    setLoading(true);
    try {
      const res = await testSeriesService.getTest(seriesId, testId);
      setTestData(res.data);
    } catch (e) {
      toast.error("Failed to load test");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleUpdateDetails = async () => {
    try {
      await testSeriesService.updateTest(seriesId, testId, testData);
      toast.success("Details Updated");
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleUpdateInstructions = async () => {
    try {
      await testSeriesService.updateInstructions(seriesId, testId, {
        instructionsPage1: testData.instructionsPage1,
        instructionsPage2: testData.instructionsPage2,
        instructionsPage3: testData.instructionsPage3,
      });
      toast.success("Instructions Saved");
    } catch (e) {
      toast.error("Failed");
    }
  };

  // Section & Question Logic
  const handleAddSection = async () => {
    const title = prompt("Section Title:");
    if (!title) return;
    try {
      await testSeriesService.addSection(seriesId, testId, {
        title,
        order: testData.sections.length + 1,
        noOfQuestions: 0,
      });
      fetchTest();
      toast.success("Section Added");
    } catch (e) {
      toast.error("Failed");
    }
  };

  const handleAddQuestion = async (sectionId) => {
    try {
      await testSeriesService.addQuestion(seriesId, testId, sectionId, {
        questionText: "New Question",
        questionNumber: 0, // Backend should auto-inc or handle
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctOptionIndex: 0,
        marks: testData.positiveMarks || 1,
        negativeMarks: testData.negativeMarks || 0,
      });
      fetchTest();
      toast.success("Question Added");
    } catch (e) {
      toast.error("Failed");
    }
  };

  if (!testData) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/test-series/${seriesId}`)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">
              {testData.testName}
            </h1>
            <p className="text-xs text-slate-500">Test Designer</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleUpdateDetails}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <Save className="w-4 h-4" /> Save All Changes
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 gap-2">
          {[
            { id: "details", label: "Basic Details", icon: FileText },
            { id: "instructions", label: "Instructions", icon: HelpCircle },
            { id: "sections", label: "Sections & Questions", icon: Layout },
            { id: "cutoff", label: "Cutoffs", icon: Scissors },
            { id: "video", label: "Explanation Video", icon: Video },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* DETAILS TAB */}
          {activeTab === "details" && (
            <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Test Configuration
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label">Test Name</label>
                  <input
                    className="input"
                    value={testData.testName}
                    onChange={(e) =>
                      setTestData({ ...testData, testName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Duration (Mins)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 120"
                  />
                </div>
                <div>
                  <label className="label">Total Marks</label>
                  <input
                    type="number"
                    className="input"
                    value={testData.totalMarks}
                    onChange={(e) =>
                      setTestData({ ...testData, totalMarks: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Questions</label>
                  <input
                    type="number"
                    className="input"
                    value={testData.noOfQuestions}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        noOfQuestions: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label">+ Marks</label>
                  <input
                    type="number"
                    className="input text-green-600"
                    value={testData.positiveMarks}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        positiveMarks: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label">- Marks</label>
                  <input
                    type="number"
                    className="input text-red-600"
                    value={testData.negativeMarks}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        negativeMarks: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* INSTRUCTIONS TAB */}
          {activeTab === "instructions" && (
            <div className="max-w-3xl mx-auto space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                  <label className="label mb-2">
                    Page {i} Content (HTML Supported)
                  </label>
                  <textarea
                    className="input font-mono text-sm"
                    rows="6"
                    value={testData[`instructionsPage${i}`] || ""}
                    onChange={(e) =>
                      setTestData({
                        ...testData,
                        [`instructionsPage${i}`]: e.target.value,
                      })
                    }
                    placeholder={`Enter instructions for page ${i}...`}
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  onClick={handleUpdateInstructions}
                  className="btn-primary"
                >
                  Update Instructions
                </button>
              </div>
            </div>
          )}

          {/* SECTIONS & QUESTIONS TAB */}
          {activeTab === "sections" && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                  Sections ({testData.sections?.length || 0})
                </h2>
                <button
                  onClick={handleAddSection}
                  className="btn-primary text-xs"
                >
                  + Add Section
                </button>
              </div>

              {testData.sections?.map((section, sIndex) => (
                <div
                  key={section._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Section Header */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <GripVertical className="text-slate-400 cursor-grab" />
                      <input
                        className="bg-transparent font-bold text-slate-700 outline-none text-lg"
                        value={section.title}
                        onChange={(e) => {
                          const newSections = [...testData.sections];
                          newSections[sIndex].title = e.target.value;
                          setTestData({ ...testData, sections: newSections });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddQuestion(section._id)}
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors"
                      >
                        + Question
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="p-4 space-y-4">
                    {section.questions.length === 0 && (
                      <div className="text-center text-slate-400 text-sm py-4 italic">
                        No questions yet
                      </div>
                    )}
                    {section.questions.map((q, qIndex) => (
                      <div
                        key={q._id}
                        className="border border-slate-100 rounded-xl p-4 hover:border-indigo-100 transition-all bg-slate-50/30"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            Q{qIndex + 1}
                          </span>
                          <button className="text-slate-300 hover:text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <textarea
                          className="w-full bg-transparent resize-none outline-none text-sm text-slate-700 font-medium mb-3"
                          rows="2"
                          value={q.questionText}
                          onChange={() => {}}
                          placeholder="Question text..."
                        />

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {q.options.map((opt, oIndex) => (
                            <div
                              key={oIndex}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${q.correctOptionIndex === oIndex ? "bg-green-50 border-green-200" : "bg-white border-slate-200"}`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${q.correctOptionIndex === oIndex ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}
                              >
                                {String.fromCharCode(65 + oIndex)}
                              </div>
                              <input
                                className="bg-transparent w-full text-xs outline-none"
                                value={opt}
                                onChange={() => {}}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CUTOFF TAB */}
          {activeTab === "cutoff" && (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
              <Scissors className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700">Cutoff Manager</h3>
              <p className="text-slate-400 text-sm mb-6">
                Set category-wise cutoffs for this specific test.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {["General", "OBC", "SC", "ST"].map((cat) => (
                  <div key={cat}>
                    <label className="label">{cat}</label>
                    <input
                      type="number"
                      className="input text-center font-bold"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <button className="btn-primary w-full mt-6">Save Cutoffs</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Utils
const label = "block text-xs font-bold text-slate-500 uppercase mb-1.5";
const input =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700";
const btnPrimary =
  "px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all";

export default TestDesigner;
