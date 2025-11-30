const User = require('../models/User');
const { generateAccessToken, generateRefreshTokenJWT } = require('../../../../common/utils/tokenUtils');
const RefreshToken = require('../models/RefreshToken');
const LoginOTP = require('../models/LoginOTP');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendOTPEmail, sendPasswordResetEmail } = require('../../../../common/utils/emailService');
const bcrypt = require('bcryptjs');

class UserController {
  static async register(req, res) {
    try {
      const { name, role, email, password, mobile } = req.body;
      
      const user = await User.create({ name, role, email, password, mobile });
      const token = user.generateToken();
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to register user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const user = await User.findByEmail(email);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials or account deactivated'
        });
      }

      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if 2FA is enabled
      if (user.two_factor_enabled) {
        // Generate and send OTP
        const otp = await LoginOTP.create(user.id);
        await sendOTPEmail(user.email, otp.otp);
        
        // OTP expiration in seconds (default: 5 minutes = 300 seconds)
        const otpExpirationSeconds = parseInt(process.env.OTP_EXPIRATION_SECONDS) || 300;
        
        return res.json({
          success: true,
          message: 'OTP sent to your email. Please check your inbox.',
          data: {
            user_id: user.id,
            email: user.email,
            expires_in: otpExpirationSeconds
          }
        });
      }

      // Direct login (2FA disabled)
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Create refresh token
      const refreshToken = await RefreshToken.create({
        userId: user.id,
        deviceInfo: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || 'Unknown'
      });

      const refreshTokenJWT = generateRefreshTokenJWT({
        userId: user.id,
        tokenId: refreshToken.id
      });

      // Refresh token cookie maxAge in milliseconds (default: 7 days)
      const refreshTokenCookieMaxAge = parseInt(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS) || (7 * 24 * 60 * 60 * 1000);
      
      // Access token expiration in seconds (default: 5 minutes = 300 seconds)
      const accessTokenExpirationSeconds = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_SECONDS) || 300;
      
      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshTokenCookieMaxAge
      });

      await user.updateLastLogin();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          accessToken,
          expiresIn: accessTokenExpirationSeconds
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async verifyLoginOTP(req, res) {
    try {
      const { user_id, otp } = req.body;
      
      const isValid = await LoginOTP.verify(user_id, otp);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      const user = await User.findById(user_id);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'User not found or account deactivated'
        });
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      const refreshToken = await RefreshToken.create({
        userId: user.id,
        deviceInfo: req.headers['user-agent'] || 'Unknown',
        ipAddress: req.ip || 'Unknown'
      });

      const refreshTokenJWT = generateRefreshTokenJWT({
        userId: user.id,
        tokenId: refreshToken.id
      });

      // Refresh token cookie maxAge in milliseconds (default: 7 days)
      const refreshTokenCookieMaxAge = parseInt(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS) || (7 * 24 * 60 * 60 * 1000);
      
      res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshTokenCookieMaxAge
      });

      await user.updateLastLogin();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          accessToken,
          expiresIn: 300
        }
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'OTP verification failed'
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: user.toJSON() }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update(req.body);
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: user.toJSON() }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.changePassword(currentPassword, newPassword);
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to change password'
      });
    }
  }

  static async enable2FA(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.enable2FA();
      res.json({
        success: true,
        message: '2FA has been enabled successfully',
        data: { two_factor_enabled: true }
      });
    } catch (error) {
      console.error('Enable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enable 2FA'
      });
    }
  }

  static async disable2FA(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.disable2FA();
      res.json({
        success: true,
        message: '2FA has been disabled successfully',
        data: { two_factor_enabled: false }
      });
    } catch (error) {
      console.error('Disable 2FA error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disable 2FA'
      });
    }
  }

  static async getDoctors(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      
      const result = await User.findAll(page, limit, 'Faculty');
      const result2 = await User.findAll(page, limit, 'Resident');
      
      const doctors = [...result.users, ...result2.users];
      
      res.json({
        success: true,
        data: {
          users: doctors,
          pagination: {
            page,
            limit,
            total: doctors.length,
            pages: Math.ceil(doctors.length / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get doctors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get doctors'
      });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const role = req.query.role || null;
      
      const result = await User.findAll(page, limit, role);
      
      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }

  static async getUserStats(req, res) {
    try {
      const stats = await User.getStats();
      res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics'
      });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: { user: user.toJSON() }
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user'
      });
    }
  }

  static async updateUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update(req.body);
      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: user.toJSON() }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  static async activateUserById(req, res) {
    try {
      if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot activate your own account'
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.activate();
      res.json({
        success: true,
        message: 'User activated successfully',
        data: { user: user.toJSON() }
      });
    } catch (error) {
      console.error('Activate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate user'
      });
    }
  }

  static async deactivateUserById(req, res) {
    try {
      if (parseInt(req.params.id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.deactivate();
      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: { user: user.toJSON() }
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate user'
      });
    }
  }

  static async deleteUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.delete();
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);
      
      // Always return success to prevent email enumeration
      if (user && user.is_active) {
        const token = await PasswordResetToken.create(user.id);
        await sendPasswordResetEmail(user.email, token.token);
      }

      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset OTP has been sent.',
        data: {
          token: 'dummy-token', // In real implementation, return actual token
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  }

  static async verifyOTP(req, res) {
    try {
      const { token, otp } = req.body;
      const isValid = await PasswordResetToken.verify(token, otp);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP'
      });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const resetToken = await PasswordResetToken.findByToken(token);
      
      if (!resetToken || !resetToken.is_valid || resetToken.used) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const user = await User.findById(resetToken.user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.updatePassword(newPassword);
      await PasswordResetToken.markAsUsed(token);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  }

  /**
   * Refresh access token
   * Session expires if user inactive for configured timeout
   */
  static async refreshToken(req, res) {
    try {
      const RefreshToken = require('../models/RefreshToken');
      const { generateAccessToken, verifyRefreshTokenJWT } = require('../../../../common/utils/tokenUtils');
      
      const refreshTokenJWT = req.cookies?.refreshToken;
      if (!refreshTokenJWT) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Verify refresh token JWT
      let decoded;
      try {
        decoded = verifyRefreshTokenJWT(refreshTokenJWT);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Find refresh token record by ID from JWT
      const tokenRecord = await RefreshToken.findById(decoded.tokenId);
      if (!tokenRecord) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Check if expired
      const isExpired = await RefreshToken.isExpired(tokenRecord.id);
      if (isExpired) {
        await RefreshToken.revoke(tokenRecord.id);
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        return res.status(401).json({
          success: false,
          message: 'Session expired due to inactivity',
          code: 'SESSION_EXPIRED'
        });
      }

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || !user.is_active) {
        await RefreshToken.revoke(tokenRecord.id);
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Update activity
      await RefreshToken.updateActivity(tokenRecord.id);

      // Generate new access token
      const accessTokenExpirationSeconds = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_SECONDS) || 300;
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: accessTokenExpirationSeconds
        }
      });
    } catch (error) {
      console.error('[UserController.refreshToken] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Logout - Revoke refresh token
   */
  static async logout(req, res) {
    try {
      const RefreshToken = require('../models/RefreshToken');
      const { verifyRefreshTokenJWT } = require('../../../../common/utils/tokenUtils');
      const refreshTokenJWT = req.cookies?.refreshToken;

      if (refreshTokenJWT) {
        try {
          const decoded = verifyRefreshTokenJWT(refreshTokenJWT);
          await RefreshToken.revoke(decoded.tokenId);
        } catch (error) {
          // Token might be invalid, but still clear cookie
          console.warn('[UserController.logout] Invalid token during logout:', error.message);
        }
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('[UserController.logout] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to logout',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update activity timestamp
   */
  static async updateActivity(req, res) {
    try {
      const RefreshToken = require('../models/RefreshToken');
      const { verifyRefreshTokenJWT } = require('../../../../common/utils/tokenUtils');
      const refreshTokenJWT = req.cookies?.refreshToken;

      if (!refreshTokenJWT) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      let decoded;
      try {
        decoded = verifyRefreshTokenJWT(refreshTokenJWT);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const tokenRecord = await RefreshToken.findById(decoded.tokenId);
      if (!tokenRecord) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      const isExpired = await RefreshToken.isExpired(tokenRecord.id);
      if (isExpired) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      await RefreshToken.updateActivity(tokenRecord.id);

      return res.json({
        success: true,
        message: 'Activity updated'
      });
    } catch (error) {
      console.error('[UserController.updateActivity] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update activity',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get session info
   */
  static async getSessionInfo(req, res) {
    try {
      const RefreshToken = require('../models/RefreshToken');
      const { verifyRefreshTokenJWT } = require('../../../../common/utils/tokenUtils');
      const refreshTokenJWT = req.cookies?.refreshToken;

      if (!refreshTokenJWT) {
        return res.status(401).json({
          success: false,
          message: 'No active session'
        });
      }

      let decoded;
      try {
        decoded = verifyRefreshTokenJWT(refreshTokenJWT);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const tokenRecord = await RefreshToken.findById(decoded.tokenId);
      if (!tokenRecord) {
        return res.status(401).json({
          success: false,
          message: 'Session not found'
        });
      }

      const isExpired = await RefreshToken.isExpired(tokenRecord.id);
      if (isExpired) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session'
        });
      }

      // Calculate expiry based on inactivity timeout
      const inactivityTimeoutMs = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MS) || (15 * 60 * 1000);
      const lastActivity = new Date(tokenRecord.last_activity);
      const sessionExpiresAt = new Date(lastActivity.getTime() + inactivityTimeoutMs);
      const now = new Date();
      const secondsUntilExpiry = Math.max(
        0,
        Math.floor((sessionExpiresAt - now) / 1000)
      );

      return res.json({
        success: true,
        data: {
          lastActivity: tokenRecord.last_activity,
          sessionExpiresAt: sessionExpiresAt.toISOString(),
          secondsUntilExpiry,
          deviceInfo: tokenRecord.device_info
        }
      });
    } catch (error) {
      console.error('[UserController.getSessionInfo] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get session info',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = UserController;

