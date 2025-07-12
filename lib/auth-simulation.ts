// JWT Auth Simulation for Offline Authentication
import { localDB, LocalUser } from './local-db'

interface JWTPayload {
  sub: string // user id
  email: string
  name: string
  role: 'user' | 'admin'
  iat: number // issued at
  exp: number // expires at
  iss: string // issuer
}

interface AuthSession {
  user: LocalUser
  token: string
  refreshToken: string
  expiresAt: string
  isValid: boolean
}

interface LoginCredentials {
  email: string
  password: string
}

interface SignupData {
  email: string
  password: string
  name: string
  phone?: string
}

class AuthSimulation {
  private readonly SECRET_KEY = 'fragransia_offline_secret_key_2024'
  private readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days
  
  // Mock user database for offline authentication
  private mockUsers: Array<{
    id: string
    email: string
    password: string // In real app, this would be hashed
    name: string
    phone?: string
    role: 'user' | 'admin'
    isEmailVerified: boolean
    createdAt: string
  }> = [
    {
      id: 'admin_001',
      email: 'admin@fragransia.com',
      password: 'admin123', // In production, use proper hashing
      name: 'Admin User',
      role: 'admin',
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'user_001',
      email: 'demo@example.com',
      password: 'demo123',
      name: 'Demo User',
      role: 'user',
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    }
  ]

  constructor() {
    this.loadMockUsers()
  }

  private loadMockUsers(): void {
    try {
      const stored = localStorage.getItem('mock_users')
      if (stored) {
        this.mockUsers = [...this.mockUsers, ...JSON.parse(stored)]
      }
    } catch (error) {
      console.error('Auth Simulation: Failed to load mock users:', error)
    }
  }

  private saveMockUsers(): void {
    try {
      // Only save user-created accounts, not default ones
      const userCreated = this.mockUsers.filter(u => 
        !['admin_001', 'user_001'].includes(u.id)
      )
      localStorage.setItem('mock_users', JSON.stringify(userCreated))
    } catch (error) {
      console.error('Auth Simulation: Failed to save mock users:', error)
    }
  }

  // Simple JWT-like token generation (for simulation only)
  private generateToken(payload: JWTPayload): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }

    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    
    // Simple signature simulation (not cryptographically secure)
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${this.SECRET_KEY}`)
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  // Decode JWT-like token
  private decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      
      const payload = JSON.parse(atob(parts[1]))
      
      // Verify signature (simple check)
      const expectedSignature = btoa(`${parts[0]}.${parts[1]}.${this.SECRET_KEY}`)
      if (parts[2] !== expectedSignature) return null
      
      // Check expiration
      if (payload.exp < Date.now()) return null
      
      return payload
    } catch (error) {
      return null
    }
  }

  // Generate refresh token
  private generateRefreshToken(userId: string): string {
    const payload = {
      sub: userId,
      type: 'refresh',
      iat: Date.now(),
      exp: Date.now() + this.REFRESH_TOKEN_EXPIRY
    }
    
    return this.generateToken(payload as any)
  }

  // Simulate user authentication
  async signIn(credentials: LoginCredentials): Promise<{
    success: boolean
    data?: AuthSession
    error?: string
  }> {
    try {
      // Find user in mock database
      const user = this.mockUsers.find(u => 
        u.email.toLowerCase() === credentials.email.toLowerCase()
      )

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        }
      }

      // Check password (in production, use proper password hashing)
      if (user.password !== credentials.password) {
        return {
          success: false,
          error: 'Invalid password'
        }
      }

      // Create JWT payload
      const payload: JWTPayload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + this.TOKEN_EXPIRY,
        iss: 'fragransia-offline'
      }

      // Generate tokens
      const token = this.generateToken(payload)
      const refreshToken = this.generateRefreshToken(user.id)

      // Create local user object
      const localUser: LocalUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        lastLoginAt: new Date().toISOString()
      }

      // Create session
      const session: AuthSession = {
        user: localUser,
        token,
        refreshToken,
        expiresAt: new Date(payload.exp).toISOString(),
        isValid: true
      }

      // Save session
      await this.saveSession(session)
      await localDB.saveUser(localUser)

      return {
        success: true,
        data: session
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Authentication failed'
      }
    }
  }

  // Simulate user registration
  async signUp(data: SignupData): Promise<{
    success: boolean
    data?: AuthSession
    error?: string
  }> {
    try {
      // Check if user already exists
      const existingUser = this.mockUsers.find(u => 
        u.email.toLowerCase() === data.email.toLowerCase()
      )

      if (existingUser) {
        return {
          success: false,
          error: 'User already exists'
        }
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: data.email,
        password: data.password, // In production, hash this
        name: data.name,
        phone: data.phone,
        role: 'user' as const,
        isEmailVerified: false,
        createdAt: new Date().toISOString()
      }

      // Add to mock database
      this.mockUsers.push(newUser)
      this.saveMockUsers()

      // Create JWT payload
      const payload: JWTPayload = {
        sub: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        iat: Date.now(),
        exp: Date.now() + this.TOKEN_EXPIRY,
        iss: 'fragransia-offline'
      }

      // Generate tokens
      const token = this.generateToken(payload)
      const refreshToken = this.generateRefreshToken(newUser.id)

      // Create local user object
      const localUser: LocalUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        isEmailVerified: newUser.isEmailVerified,
        createdAt: newUser.createdAt,
        lastLoginAt: new Date().toISOString()
      }

      // Create session
      const session: AuthSession = {
        user: localUser,
        token,
        refreshToken,
        expiresAt: new Date(payload.exp).toISOString(),
        isValid: true
      }

      // Save session
      await this.saveSession(session)
      await localDB.saveUser(localUser)

      return {
        success: true,
        data: session
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed'
      }
    }
  }

  // Get current session
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const stored = localStorage.getItem('auth_session')
      if (!stored) return null

      const session: AuthSession = JSON.parse(stored)
      
      // Validate token
      const payload = this.decodeToken(session.token)
      if (!payload) {
        // Try to refresh token
        return await this.refreshSession(session.refreshToken)
      }

      // Check if session is still valid
      if (new Date(session.expiresAt) < new Date()) {
        return await this.refreshSession(session.refreshToken)
      }

      return session
    } catch (error) {
      console.error('Auth Simulation: Failed to get current session:', error)
      return null
    }
  }

  // Refresh session using refresh token
  async refreshSession(refreshToken: string): Promise<AuthSession | null> {
    try {
      const payload = this.decodeToken(refreshToken)
      if (!payload || payload.type !== 'refresh') {
        await this.signOut()
        return null
      }

      // Find user
      const user = this.mockUsers.find(u => u.id === payload.sub)
      if (!user) {
        await this.signOut()
        return null
      }

      // Create new JWT payload
      const newPayload: JWTPayload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        iat: Date.now(),
        exp: Date.now() + this.TOKEN_EXPIRY,
        iss: 'fragransia-offline'
      }

      // Generate new tokens
      const newToken = this.generateToken(newPayload)
      const newRefreshToken = this.generateRefreshToken(user.id)

      // Create local user object
      const localUser: LocalUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        lastLoginAt: new Date().toISOString()
      }

      // Create new session
      const newSession: AuthSession = {
        user: localUser,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(newPayload.exp).toISOString(),
        isValid: true
      }

      // Save new session
      await this.saveSession(newSession)

      return newSession
    } catch (error) {
      console.error('Auth Simulation: Failed to refresh session:', error)
      await this.signOut()
      return null
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      localStorage.removeItem('auth_session')
      localDB.clearUserSession()
    } catch (error) {
      console.error('Auth Simulation: Failed to sign out:', error)
    }
  }

  // Validate token
  validateToken(token: string): JWTPayload | null {
    return this.decodeToken(token)
  }

  // Check if user has specific role
  hasRole(token: string, role: 'user' | 'admin'): boolean {
    const payload = this.decodeToken(token)
    return payload?.role === role || false
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return session?.isValid || false
  }

  // Get user from token
  getUserFromToken(token: string): LocalUser | null {
    const payload = this.decodeToken(token)
    if (!payload) return null

    const user = this.mockUsers.find(u => u.id === payload.sub)
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastLoginAt: new Date().toISOString()
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<Pick<LocalUser, 'name' | 'phone'>>): Promise<{
    success: boolean
    data?: LocalUser
    error?: string
  }> {
    try {
      const session = await this.getCurrentSession()
      if (!session) {
        return {
          success: false,
          error: 'Not authenticated'
        }
      }

      // Find and update user in mock database
      const userIndex = this.mockUsers.findIndex(u => u.id === session.user.id)
      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found'
        }
      }

      // Update user
      if (updates.name) this.mockUsers[userIndex].name = updates.name
      if (updates.phone) this.mockUsers[userIndex].phone = updates.phone

      this.saveMockUsers()

      // Update local user
      const updatedUser: LocalUser = {
        ...session.user,
        ...updates
      }

      // Update session
      session.user = updatedUser
      await this.saveSession(session)
      await localDB.saveUser(updatedUser)

      return {
        success: true,
        data: updatedUser
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Profile update failed'
      }
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const session = await this.getCurrentSession()
      if (!session) {
        return {
          success: false,
          error: 'Not authenticated'
        }
      }

      // Find user
      const userIndex = this.mockUsers.findIndex(u => u.id === session.user.id)
      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found'
        }
      }

      // Verify current password
      if (this.mockUsers[userIndex].password !== currentPassword) {
        return {
          success: false,
          error: 'Current password is incorrect'
        }
      }

      // Update password
      this.mockUsers[userIndex].password = newPassword
      this.saveMockUsers()

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Password change failed'
      }
    }
  }

  // Save session to localStorage
  private async saveSession(session: AuthSession): Promise<void> {
    try {
      localStorage.setItem('auth_session', JSON.stringify(session))
      localDB.saveUserSession(session.user, session.token)
    } catch (error) {
      console.error('Auth Simulation: Failed to save session:', error)
    }
  }

  // Reset password (simulate email sending)
  async resetPassword(email: string): Promise<{
    success: boolean
    message?: string
    error?: string
  }> {
    try {
      const user = this.mockUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase()
      )

      if (!user) {
        // Don't reveal if user exists for security
        return {
          success: true,
          message: 'If an account with this email exists, you will receive a password reset link.'
        }
      }

      // In a real app, you would send an email here
      // For simulation, we'll just log it
      console.log(`Password reset requested for: ${email}`)
      
      // Store reset token (in real app, this would be sent via email)
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(`reset_token_${user.id}`, resetToken)

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Password reset failed'
      }
    }
  }

  // Get all mock users (admin only)
  async getAllUsers(): Promise<LocalUser[]> {
    const session = await this.getCurrentSession()
    if (!session || !this.hasRole(session.token, 'admin')) {
      return []
    }

    return this.mockUsers.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastLoginAt: new Date().toISOString()
    }))
  }
}

// Export singleton instance
export const authSimulation = new AuthSimulation()

export type { AuthSession, LoginCredentials, SignupData, JWTPayload }

