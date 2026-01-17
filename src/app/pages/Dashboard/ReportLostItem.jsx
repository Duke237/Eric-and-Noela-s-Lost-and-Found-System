import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, MapPin, Calendar, FileText, Tag, Mail, CheckCircle, Image } from 'lucide-react';
import { itemsAPI } from '@/services/api';

export default function ReportLostItem() {
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    location: '',
    date: '',
    contactInfo: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = ['Electronics', 'Accessories', 'Documents', 'Clothing', 'Bags', 'Other'];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      const file = files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({ ...prev, image: 'Please upload a valid image file' }));
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
          return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        
        setFormData(prev => ({ ...prev, image: file }));
        setErrors(prev => ({ ...prev, image: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Contact info is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await itemsAPI.create({
        ...formData,
        type: 'lost',
        userId: user.id || '1',
      });

      if (response.success) {
        setSubmitted(true);
        setFormData({
          itemName: '',
          category: '',
          description: '',
          location: '',
          date: '',
          contactInfo: '',
          image: null,
        });
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[600px] p-4 sm:p-6"
      >
        <div className="bg-white p-6 sm:p-12 rounded-2xl shadow-xl text-center max-w-md w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-10 sm:w-12 h-10 sm:h-12 text-green-600" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Your lost item has been reported. We'll notify you if we find any matches.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-shadow text-sm sm:text-base"
          >
            Report Another Item
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 sm:w-6 h-5 sm:h-6 text-red-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Report Lost Item</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Fill out the form below to report your lost item</p>
        </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-8 rounded-xl shadow-lg space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Item Name*
              </div>
            </label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border ${errors.itemName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., iPhone 13 Pro"
            />
            {errors.itemName && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.itemName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Category*
              </div>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.category}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4 text-blue-600" />
              Upload Image
            </div>
          </label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border ${errors.image ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.image && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.image}</p>}
          {imagePreview && (
            <div className="mt-4 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-40 sm:h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData(prev => ({ ...prev, image: null }));
                }}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Description*
            </div>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Provide a detailed description of the item..."
          />
          {errors.description && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Last Seen Location*
              </div>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border ${errors.location ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., Central Library, 2nd Floor"
            />
            {errors.location && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Date Lost*
              </div>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border ${errors.date ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.date && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.date}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              Contact Information*
            </div>
          </label>
          <input
            type="text"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border ${errors.contactInfo ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Email or phone number"
          />
          {errors.contactInfo && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.contactInfo}</p>}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 sm:py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-xl transition-shadow disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5" />
              Report Lost Item
            </>
          )}
        </motion.button>
      </motion.form>
      </div>
    </div>
  );
}