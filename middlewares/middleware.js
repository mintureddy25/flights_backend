const { supabase } = require("../supabase");

const verifyUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Get the token from Authorization header
  
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }
  
    try {
     
      const { data, error } = await supabase.auth.getUser(token);  // Verifying access token
  
      if (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
  
      // If token is valid, attach user info to the request object
      req.user = data;
      next(); // Proceed to the next route or middleware
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error verifying token' });
    }
  };

  module.exports = {verifyUser};