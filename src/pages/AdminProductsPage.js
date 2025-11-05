import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import useAuthStore from '../store/authStore';
import { useToast } from '../components/Toast';

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    packSize: '',
    unitPrice: '',
    stock: '',
    images: [],
    featured: false
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/products');
    }
    fetchProducts();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : (res.data.products || []));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingImages(true);

    try {
      // Upload new images first
      const uploadedImageUrls = [...formData.images]; // Keep existing images

      if (imageFiles.length > 0) {
        toast.info(`Uploading ${imageFiles.length} image(s)...`);

        for (const file of imageFiles) {
          const formDataObj = new FormData();
          formDataObj.append('image', file);

          const uploadRes = await axios.post('/admin/upload-image', formDataObj, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          // Get full URL with backend host
          const imageUrl = `http://localhost:5000${uploadRes.data.imageUrl}`;
          uploadedImageUrls.push(imageUrl);
        }

        toast.success('Images uploaded successfully');
      }

      const payload = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        stock: parseInt(formData.stock),
        images: uploadedImageUrls
      };

      if (editingProduct) {
        await axios.put(`/admin/products/${editingProduct.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/admin/products', payload);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      sku: product.sku,
      packSize: product.packSize,
      unitPrice: product.unitPrice.toString(),
      stock: product.stock.toString(),
      images: product.images || [],
      featured: product.featured || false
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      sku: '',
      packSize: '',
      unitPrice: '',
      stock: '',
      images: [],
      featured: false
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        toast.error(`${file.name} is not a valid image file`);
      }
      return isImage;
    });

    // Create previews
    const newPreviews = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeImagePreview = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-1">Manage your ice cream catalog - Create, Edit, Delete products</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2"
          >
            <span className="text-xl">+</span>
            <span>Add Product</span>
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                {product.featured && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                    Featured
                  </span>
                )}
                <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded ${
                  product.stock > 50 ? 'bg-green-500 text-white' : product.stock > 0 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    {product.category && (
                      <span className="text-xs text-gray-500">{product.category}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-600">₹{product.unitPrice}</div>
                    <div className="text-xs text-gray-500">{product.packSize}</div>
                  </div>
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  <span className="font-semibold">SKU:</span> {product.sku}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded font-medium hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first product</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Classic Vanilla Bean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Classic Flavors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Premium vanilla bean ice cream made with real Madagascar vanilla pods..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="ICE-VAN-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pack Size *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.packSize}
                    onChange={(e) => setFormData({...formData, packSize: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="5L Tub"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="450"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Images
                </label>

                {/* Existing images from editing */}
                {formData.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((img, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={img}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New image previews */}
                {imagePreviews.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">New Images to Upload:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={`preview-${index}`} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-orange-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeImagePreview(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File upload input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Click to upload images</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Mark as Featured Product
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold transition-all ${
                    uploadingImages ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {uploadingImages ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;
