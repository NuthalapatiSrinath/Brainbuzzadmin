import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Video,
  FileText,
  Users,
} from "lucide-react";
import DataTable from "../../components/DataTable";
import CourseModal from "../../components/modals/CourseModal";
import {
  fetchCourses,
  deleteCourse,
  publishCourse,
  unpublishCourse,
} from "../../store/slices/courseSlice";

const CourseManager = () => {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.courses);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    contentType: "ONLINE_COURSE",
  });

  useEffect(() => {
    dispatch(fetchCourses(filters));
  }, [dispatch, filters]);

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await dispatch(deleteCourse(id)).unwrap();
        dispatch(fetchCourses(filters));
      } catch (error) {
        console.error("Failed to delete course:", error);
        alert("Failed to delete course: " + error);
      }
    }
  };

  const handleToggleActive = async (course) => {
    try {
      if (course.isActive) {
        await dispatch(unpublishCourse(course._id)).unwrap();
      } else {
        await dispatch(publishCourse(course._id)).unwrap();
      }
      dispatch(fetchCourses(filters));
    } catch (error) {
      console.error("Failed to toggle course status:", error);
      alert("Failed to toggle course status: " + error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters };
    if (searchTerm.trim()) {
      newFilters.search = searchTerm.trim();
    } else {
      delete newFilters.search;
    }
    setFilters(newFilters);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleModalSuccess = () => {
    dispatch(fetchCourses(filters));
  };

  const columns = [
    {
      key: "thumbnail",
      label: "Image",
      render: (course) => (
        <div className="w-20 h-20 flex-shrink-0">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.name}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <Video className="text-gray-400" size={24} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "info",
      label: "Course Details",
      render: (course) => (
        <div className="flex-1 min-w-[250px]">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {course.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {course.languages && course.languages.length > 0 && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                {course.languages[0].name}
              </span>
            )}
            {course.accessType && (
              <span
                className={`text-xs px-2 py-1 rounded ${
                  course.accessType === "FREE"
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                }`}
              >
                {course.accessType}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "categories",
      label: "Category",
      render: (course) => (
        <div className="flex flex-col gap-1 min-w-[150px]">
          {course.categories && course.categories.length > 0 && (
            <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
              {course.categories[0].name}
            </span>
          )}
          {course.subCategories && course.subCategories.length > 0 && (
            <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded">
              {course.subCategories[0].name}
            </span>
          )}
          {(!course.categories || course.categories.length === 0) &&
            (!course.subCategories || course.subCategories.length === 0) && (
              <span className="text-sm text-gray-400 dark:text-gray-500">
                No category
              </span>
            )}
        </div>
      ),
    },
    {
      key: "stats",
      label: "Content",
      render: (course) => (
        <div className="flex flex-col gap-1 min-w-[120px]">
          {course.tutors && course.tutors.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Users size={14} />
              <span>{course.tutors.length} Tutors</span>
            </div>
          )}
          {course.classes && course.classes.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Video size={14} />
              <span>{course.classes.length} Classes</span>
            </div>
          )}
          {course.studyMaterials && course.studyMaterials.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <FileText size={14} />
              <span>{course.studyMaterials.length} Materials</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (course) => (
        <div className="min-w-[100px]">
          {course.accessType === "FREE" ? (
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              FREE
            </div>
          ) : (
            <>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                ₹{course.discountPrice || course.originalPrice || 0}
              </div>
              {course.originalPrice &&
                course.discountPrice &&
                course.originalPrice > course.discountPrice && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    ₹{course.originalPrice}
                  </div>
                )}
            </>
          )}
        </div>
      ),
    },
    {
      key: "validity",
      label: "Validity",
      render: (course) => (
        <div className="min-w-[120px]">
          {course.validities && course.validities.length > 0 ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {course.validities
                .map((v) => v.label || `${v.durationInDays} days`)
                .join(", ")}
            </p>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">
              No validity
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (course) => (
        <button
          onClick={() => handleToggleActive(course)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            course.isActive
              ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {course.isActive ? (
            <>
              <CheckCircle size={14} />
              Active
            </>
          ) : (
            <>
              <XCircle size={14} />
              Inactive
            </>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (course) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(course)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(course._id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Online Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your online course catalog
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Course
        </button>
      </div>

      {/* Data Table */}
      <DataTable data={courses} columns={columns} loading={loading} />

      {/* Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        course={selectedCourse}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default CourseManager;
