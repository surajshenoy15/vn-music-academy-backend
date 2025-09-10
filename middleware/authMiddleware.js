// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

// Admin authentication middleware
export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      if (decoded.type !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }

      // Get admin from database
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, email, name, role, status')
        .eq('id', decoded.adminId)
        .single();

      if (error || !admin) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token or admin not found'
        });
      }

      if (admin.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Admin account is not active'
        });
      }

      req.admin = admin;
      next();
      
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Student authentication middleware
export const authenticateStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      if (decoded.type !== 'student') {
        return res.status(403).json({
          success: false,
          error: 'Student access required'
        });
      }

      // Get student from database
      const { data: student, error } = await supabase
        .from('students')
        .select('id, email, name, status')
        .eq('id', decoded.studentId)
        .single();

      if (error || !student) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token or student not found'
        });
      }

      if (student.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: 'Student account is not active'
        });
      }

      req.student = {
        studentId: student.id,
        email: student.email,
        name: student.name,
        status: student.status
      };
      next();
      
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

  } catch (error) {
    console.error('Student auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// General authentication middleware (for routes that accept both admin and student)
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      if (decoded.type === 'admin') {
        // Get admin from database
        const { data: admin, error } = await supabase
          .from('admins')
          .select('id, email, name, role, status')
          .eq('id', decoded.adminId)
          .single();

        if (error || !admin || admin.status !== 'active') {
          return res.status(401).json({
            success: false,
            error: 'Invalid token or admin not found'
          });
        }

        req.user = { ...admin, type: 'admin' };
        req.admin = admin;
        
      } else if (decoded.type === 'student') {
        // Get student from database
        const { data: student, error } = await supabase
          .from('students')
          .select('id, email, name, status')
          .eq('id', decoded.studentId)
          .single();

        if (error || !student || student.status !== 'active') {
          return res.status(401).json({
            success: false,
            error: 'Invalid token or student not found'
          });
        }

        req.user = { ...student, type: 'student' };
        req.student = {
          studentId: student.id,
          email: student.email,
          name: student.name,
          status: student.status
        };
        
      } else {
        return res.status(403).json({
          success: false,
          error: 'Invalid user type'
        });
      }

      next();
      
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

  } catch (error) {
    console.error('General auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};