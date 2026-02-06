const Product = require('../../models/productSchema');

const getProductByTitle = async (req, res) => {
  try {
    const { titles } = req.query;

    if (!titles) {
      return res.status(400).json({
        success: false,
        message: "Query param 'titles' is required"
      });
    }

    // Convert comma-separated string to array
    const titlesArray = titles.split(',').map((t) => t.trim());

    const products = await Product.find({
      title: { $in: titlesArray.map(title => new RegExp(`^${title}$`, 'i')) }
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    console.error("Get Product By Title Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products by title",
      error: err.message
    });
  }
};

module.exports = getProductByTitle;
