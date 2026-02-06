const Cart  = require("../../models/cartSchema")
const getCartQuantity = async (req, res) => {
    try {
      const { emailId } = req.params; // Changed from req.query to req.params
      
      if (!emailId) {
        return res.status(400).json({ 
          success: false, 
          message: "emailId is required" 
        });
      }
  
      const cart = await Cart.findOne({ emailId });
      
      if (!cart) {
        return res.json({ 
          success: true, 
          quantity: 0 
        });
      }
  
      const totalQuantity = cart.cart.reduce((sum, item) => sum + item.quantity, 0);
  
      res.json({ 
        success: true, 
        quantity: totalQuantity 
      });
  
    } catch (error) {
      console.error("Get cart quantity error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error" 
      });
    }
  };
  
  
  module.exports = getCartQuantity