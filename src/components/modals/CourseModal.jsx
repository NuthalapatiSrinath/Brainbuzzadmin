import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Video,
  FileText,
  User,
  Image,
} from "lucide-react";
import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSubCategories } from "../../store/slices/subCategorySlice";
import { fetchLanguages } from "../../store/slices/languageSlice";
import { fetchValidities } from "../../store/slices/validitySlice";
import { createCourse, updateCourse } from "../../store/slices/courseSlice";

const CourseModal = ({ isOpen, onClose, course = null, onSuccess }) => {
  const dispatch = useDispatch();
  const { categories = [] } = useSelector((state) => state.category || {});
  const { subCategories = [] } = useSelector(
    (state) => state.subCategory || {},
  );
  const { items: languages = [] } = useSelector(
    (state) => state.languages || {},
  );
  const { items: validities = [] } = useSelector(
    (state) => state.validities || {},
  );
  const { loading } = useSelector((state) => state.courses);

  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: "",
    courseType: "",
    startDate: "",
    categoryId: "",
    subCategoryId: "",
    languageIds: [],
    validityIds: [],
    originalPrice: "",
    discountPrice: "",
    accessType: "PAID",
    pricingNote: "",
    shortDescription: "",
    detailedDescription: "",
    thumbnail: null,
    thumbnailPreview: null,
    isActive: true,
  });

  const [tutors, setTutors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);

  // Load dependencies
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategories({ contentType: "ONLINE_COURSE" }));
      dispatch(fetchSubCategories({ contentType: "ONLINE_COURSE" }));
      dispatch(fetchLanguages());
      dispatch(fetchValidities());
    }
  }, [isOpen, dispatch]);

  // Populate form when editing
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || "",
        courseType: course.courseType || "",
        startDate: course.startDate ? course.startDate.split("T")[0] : "",
        categoryId: course.categories?.[0]?._id || course.categories?.[0] || "",
        subCategoryId:
          course.subCategories?.[0]?._id || course.subCategories?.[0] || "",
        languageIds: course.languages?.map((l) => l._id || l) || [],
        validityIds: course.validities?.map((v) => v._id || v) || [],
        originalPrice: course.originalPrice || "",
        discountPrice: course.discountPrice || "",
        accessType: course.accessType || "PAID",
        pricingNote: course.pricingNote || "",
        shortDescription: course.shortDescription || "",
        detailedDescription: course.detailedDescription || "",
        thumbnailPreview: course.thumbnailUrl || null,
        thumbnail: null,
        isActive: course.isActive !== undefined ? course.isActive : true,
      });
      setTutors(
        course.tutors?.map((t) => ({ ...t, photoPreview: t.photoUrl })) || [],
      );
      setClasses(
        course.classes?.map((c) => ({
          ...c,
          thumbnailPreview: c.thumbnailUrl,
          lecturePhotoPreview: c.lecturePhotoUrl,
          videoPreview: c.videoUrl,
        })) || [],
      );
      setStudyMaterials(
        course.studyMaterials?.map((m) => ({
          ...m,
          filePreview: m.fileUrl,
        })) || [],
      );
    } else {
      resetForm();
    }
  }, [course]);

  const resetForm = () => {
    setFormData({
      name: "",
      courseType: "",
      startDate: "",
      categoryId: "",
      subCategoryId: "",
      languageIds: [],
      validityIds: [],
      originalPrice: "",
      discountPrice: "",
      accessType: "PAID",
      pricingNote: "",
      shortDescription: "",
      detailedDescription: "",
      thumbnail: null,
      thumbnailPreview: null,
      isActive: true,
    });
    setTutors([]);
    setClasses([]);
    setStudyMaterials([]);
    setActiveTab("basic");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const currentValues = prev[name];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [name]: newValues };
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file),
      }));
    }
  };

  // Tutors
  const addTutor = () => {
    setTutors([
      ...tutors,
      {
        name: "",
        subject: "",
        qualification: "",
        photo: null,
        photoPreview: null,
      },
    ]);
  };

  const updateTutor = (index, field, value) => {
    const updated = [...tutors];
    if (field === "photo") {
      const file = value;
      updated[index].photo = file;
      updated[index].photoPreview = URL.createObjectURL(file);
    } else {
      updated[index][field] = value;
    }
    setTutors(updated);
  };

  const removeTutor = (index) => {
    setTutors(tutors.filter((_, i) => i !== index));
  };

  // Classes
  const addClass = () => {
    setClasses([
      ...classes,
      {
        title: "",
        topic: "",
        order: classes.length + 1,
        isFree: false,
        video: null,
        thumbnail: null,
        lecturePhoto: null,
        videoPreview: null,
        thumbnailPreview: null,
        lecturePhotoPreview: null,
      },
    ]);
  };

  const updateClass = (index, field, value) => {
    const updated = [...classes];
    if (
      field === "video" ||
      field === "thumbnail" ||
      field === "lecturePhoto"
    ) {
      const file = value;
      updated[index][field] = file;
      updated[index][`${field}Preview`] = URL.createObjectURL(file);
    } else {
      updated[index][field] = value;
    }
    setClasses(updated);
  };

  const removeClass = (index) => {
    setClasses(classes.filter((_, i) => i !== index));
  };

  // Study Materials
  const addMaterial = () => {
    setStudyMaterials([
      ...studyMaterials,
      { title: "", description: "", file: null, filePreview: null },
    ]);
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...studyMaterials];
    if (field === "file") {
      const file = value;
      updated[index].file = file;
      updated[index].filePreview = file.name;
    } else {
      updated[index][field] = value;
    }
    setStudyMaterials(updated);
  };

  const removeMaterial = (index) => {
    setStudyMaterials(studyMaterials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      alert("Course name is required");
      return;
    }
    if (!formData.originalPrice) {
      alert("Original price is required");
      return;
    }
    if (!formData.categoryId) {
      alert("Category is required");
      return;
    }

    const courseData = {
      name: formData.name,
      courseType: formData.courseType,
      startDate: formData.startDate,
      categoryIds: formData.categoryId ? [formData.categoryId] : [],
      subCategoryIds: formData.subCategoryId ? [formData.subCategoryId] : [],
      languageIds: formData.languageIds,
      validityIds: formData.validityIds,
      originalPrice: formData.originalPrice,
      discountPrice: formData.discountPrice,
      accessType: formData.accessType,
      pricingNote: formData.pricingNote,
      shortDescription: formData.shortDescription,
      detailedDescription: formData.detailedDescription,
      isActive: formData.isActive,
      thumbnail: formData.thumbnail,
      tutors,
      classes,
      studyMaterials,
    };

    try {
      if (course) {
        await dispatch(updateCourse({ id: course._id, courseData })).unwrap();
      } else {
        await dispatch(createCourse(courseData)).unwrap();
      }
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to save course:", error);
      alert(`Failed to save course: ${error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] min-h-[600px] overflow-hidden flex flex-col shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {course ? "Edit Online Course" : "Create Online Course"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 sticky top-[73px] bg-white dark:bg-gray-800 z-10">
          {["basic", "tutors", "classes", "materials"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course Type
                    </label>
                    <input
                      type="text"
                      name="courseType"
                      value={formData.courseType}
                      onChange={handleInputChange}
                      placeholder="e.g., Beginner, Advanced"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Access Type *
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="accessType"
                          value="FREE"
                          checked={formData.accessType === "FREE"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Free Course
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="accessType"
                          value="PAID"
                          checked={formData.accessType === "PAID"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Paid Course
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Original Price *
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Price
                    </label>
                    <input
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="">Select Category</option>
                      {(categories || []).map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sub Category
                    </label>
                    <select
                      value={formData.subCategoryId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subCategoryId: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select Sub Category (Optional)</option>
                      {(subCategories || []).map((sub) => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Languages
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md dark:border-gray-600 max-h-32 overflow-y-auto">
                      {(languages || []).map((lang) => (
                        <label
                          key={lang._id}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <input
                            type="checkbox"
                            checked={formData.languageIds.includes(lang._id)}
                            onChange={() =>
                              handleMultiSelect("languageIds", lang._id)
                            }
                            className="rounded"
                          />
                          <span className="text-sm dark:text-white">
                            {lang.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Validities
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md dark:border-gray-600 max-h-32 overflow-y-auto">
                      {(validities || []).map((val) => (
                        <label
                          key={val._id}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <input
                            type="checkbox"
                            checked={formData.validityIds.includes(val._id)}
                            onChange={() =>
                              handleMultiSelect("validityIds", val._id)
                            }
                            className="rounded"
                          />
                          <span className="text-sm dark:text-white">
                            {val.label || `${val.durationInDays} days`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thumbnail
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.thumbnailPreview && (
                        <img
                          src={formData.thumbnailPreview}
                          alt="Thumbnail"
                          className="w-32 h-32 object-cover rounded-md"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Short Description
                    </label>
                    <textarea
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Detailed Description
                    </label>
                    <textarea
                      name="detailedDescription"
                      value={formData.detailedDescription}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pricing Note
                    </label>
                    <input
                      type="text"
                      name="pricingNote"
                      value={formData.pricingNote}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tutors Tab */}
            {activeTab === "tutors" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={addTutor}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus size={18} />
                  Add Tutor
                </button>

                {tutors.map((tutor, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-300 rounded-md dark:border-gray-600 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold dark:text-white">
                        Tutor {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeTutor(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={tutor.name}
                        onChange={(e) =>
                          updateTutor(index, "name", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Subject"
                        value={tutor.subject}
                        onChange={(e) =>
                          updateTutor(index, "subject", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Qualification"
                        value={tutor.qualification}
                        onChange={(e) =>
                          updateTutor(index, "qualification", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white md:col-span-2"
                      />
                      <div className="md:col-span-2">
                        <label className="block text-sm mb-1 dark:text-gray-300">
                          Photo
                        </label>
                        <div className="flex items-center gap-3">
                          {tutor.photoPreview && (
                            <img
                              src={tutor.photoPreview}
                              alt="Tutor"
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              updateTutor(index, "photo", e.target.files[0])
                            }
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Classes Tab */}
            {activeTab === "classes" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={addClass}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus size={18} />
                  Add Class
                </button>

                {classes.map((cls, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-300 rounded-md dark:border-gray-600 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold dark:text-white">
                        Class {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeClass(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={cls.title}
                        onChange={(e) =>
                          updateClass(index, "title", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Topic"
                        value={cls.topic}
                        onChange={(e) =>
                          updateClass(index, "topic", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="Order"
                        value={cls.order}
                        onChange={(e) =>
                          updateClass(index, "order", e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <label className="flex items-center gap-2 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={cls.isFree}
                          onChange={(e) =>
                            updateClass(index, "isFree", e.target.checked)
                          }
                          className="rounded"
                        />
                        <span className="text-sm dark:text-white">Is Free</span>
                      </label>

                      <div className="md:col-span-2">
                        <label className="block text-sm mb-1 dark:text-gray-300">
                          Video
                        </label>
                        <div className="flex items-center gap-3">
                          {cls.videoPreview && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Video selected
                            </span>
                          )}
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) =>
                              updateClass(index, "video", e.target.files[0])
                            }
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm mb-1 dark:text-gray-300">
                          Thumbnail
                        </label>
                        <div className="flex items-center gap-3">
                          {cls.thumbnailPreview && (
                            <img
                              src={cls.thumbnailPreview}
                              alt="Thumbnail"
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              updateClass(index, "thumbnail", e.target.files[0])
                            }
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm mb-1 dark:text-gray-300">
                          Lecture Photo
                        </label>
                        <div className="flex items-center gap-3">
                          {cls.lecturePhotoPreview && (
                            <img
                              src={cls.lecturePhotoPreview}
                              alt="Lecture"
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              updateClass(
                                index,
                                "lecturePhoto",
                                e.target.files[0],
                              )
                            }
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Study Materials Tab */}
            {activeTab === "materials" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={addMaterial}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus size={18} />
                  Add Material
                </button>

                {studyMaterials.map((material, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-300 rounded-md dark:border-gray-600 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold dark:text-white">
                        Material {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeMaterial(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Title"
                        value={material.title}
                        onChange={(e) =>
                          updateMaterial(index, "title", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <textarea
                        placeholder="Description"
                        value={material.description}
                        onChange={(e) =>
                          updateMaterial(index, "description", e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <div>
                        <label className="block text-sm mb-1 dark:text-gray-300">
                          File (PDF, DOC, etc.)
                        </label>
                        <div className="flex items-center gap-3">
                          {material.filePreview && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              {material.filePreview}
                            </span>
                          )}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            onChange={(e) =>
                              updateMaterial(index, "file", e.target.files[0])
                            }
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 flex justify-end gap-4 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : course
                  ? "Update Course"
                  : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
