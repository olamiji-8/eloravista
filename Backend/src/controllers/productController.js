// src/controllers/productController.js
import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';

const uploadBufferToCloudinary = (file) =>
  cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    {
      folder: 'eloravista/products',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
      ],
    }
);

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, subcategory, search, page = 1, limit = 12, sort = '-createdAt', featured } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;

    const query = {};
    if (category && category !== 'All Categories') query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    // Only filter by featured if explicitly passed
    if (featured === 'true') query.featured = true;

    const products = await Product.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      pages: Math.ceil(count / limitNum),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, subcategory, stock, featured, colors } = req.body;
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadBufferToCloudinary(file);
        imageUrls.push({
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        });
      }
    }

    let colorArray = [];
    if (colors) {
      if (typeof colors === 'string') {
        try {
          colorArray = JSON.parse(colors);
        } catch (e) {
          colorArray = colors.split(',').map(c => c.trim()).filter(c => c);
        }
      } else if (Array.isArray(colors)) {
        colorArray = colors;
      }
    }

    const productData = {
      name,
      description,
      price,
      category,
      stock,
      featured: featured === 'true' || featured === true,
      colors: colorArray,
      images: imageUrls,
    };

    if (subcategory) productData.subcategory = subcategory;

    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.files && req.files.length > 0) {
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }

      const imageUrls = [];
      for (const file of req.files) {
        const uploadResult = await uploadBufferToCloudinary(file);
        imageUrls.push({
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        });
      }
      req.body.images = imageUrls;
    }

    if (req.body.colors) {
      if (typeof req.body.colors === 'string') {
        try {
          req.body.colors = JSON.parse(req.body.colors);
        } catch (e) {
          req.body.colors = req.body.colors.split(',').map(c => c.trim()).filter(c => c);
        }
      }
    }

    if (req.body.category && req.body.category !== 'Fashion') {
      req.body.subcategory = '';
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unfeature a single product (remove from homepage)
// @route   PATCH /api/products/:id/unfeature
// @access  Private/Admin
export const unfeatureProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { featured: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product, message: 'Product removed from featured' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unfeature ALL featured products
// @route   PATCH /api/products/unfeature-all
// @access  Private/Admin
export const unfeatureAllProducts = async (req, res) => {
  try {
    await Product.updateMany({ featured: true }, { featured: false });
    res.status(200).json({ success: true, message: 'All products removed from featured' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};