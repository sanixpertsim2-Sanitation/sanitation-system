// ======================================================
// SANIXPERT AUTHENTICATION & LINE LOCKING SYSTEM
// Give & Go Facilities - Manual Authentication
// ======================================================

class SanixpertAuth {
    constructor() {
        this.currentUser = null;
        this.currentLine = null;
        this.lockedLines = new Map();
        this.init();
    }

    // Initialize authentication system
    init() {
        this.loadCurrentUser();
        this.setupLineLocking();
        console.log('🔐 Sanixpert Auth System initialized');
    }

    // Load current user from localStorage
    loadCurrentUser() {
        const userData = localStorage.getItem('sanixpert_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    // Save current user to localStorage
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('sanixpert_user', JSON.stringify(this.currentUser));
        }
    }

    // Manual user authentication
    async authenticateUser(userName, role = null) {
        try {
            const supabase = window.supabaseClient;
            
            // Check if user exists in registry
            const { data: existingUser, error: fetchError } = await supabase
                .from('user_registry')
                .select('*')
                .eq('name', userName.trim())
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            let userRecord;

            if (existingUser) {
                // User exists, update last login
                userRecord = existingUser;
                const { error: updateError } = await supabase
                    .from('user_registry')
                    .update({ 
                        last_login_at: new Date().toISOString(),
                        is_active: true 
                    })
                    .eq('id', existingUser.id);

                if (updateError) throw updateError;

            } else {
                // New user - register with role
                if (!role) {
                    role = await this.promptForRole();
                }

                const { data: newUser, error: insertError } = await supabase
                    .from('user_registry')
                    .insert({
                        name: userName.trim(),
                        role: role,
                        first_login_at: new Date().toISOString(),
                        last_login_at: new Date().toISOString(),
                        is_active: true
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;
                userRecord = newUser;
            }

            // Set current user
            this.currentUser = {
                id: userRecord.id,
                name: userRecord.name,
                role: userRecord.role,
                firstLogin: userRecord.first_login_at,
                lastLogin: new Date().toISOString()
            };

            this.saveCurrentUser();
            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('Authentication error:', error);
            return { success: false, error: error.message };
        }
    }

    // Prompt for role selection
    async promptForRole() {
        return new Promise((resolve) => {
            const roleModal = this.createRoleModal(resolve);
            document.body.appendChild(roleModal);
        });
    }

    // Create role selection modal
    createRoleModal(resolve) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 24px; border-radius: 12px; width: 90%; max-width: 320px;">
                <h3 style="margin: 0 0 16px 0; text-align: center;">👤 Select Your Role</h3>
                <p style="margin: 0 0 16px 0; text-align: center; color: #6b7280;">First time user? Please select your role:</p>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button onclick="selectRole('Sanitation')" style="padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🧹 Sanitation
                    </button>
                    <button onclick="selectRole('Maintenance')" style="padding: 12px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🔧 Maintenance
                    </button>
                    <button onclick="selectRole('Production')" style="padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🏭 Production
                    </button>
                    <button onclick="selectRole('Contractor')" style="padding: 12px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        👷 Contractor
                    </button>
                </div>
            </div>
        `;

        // Add global function for role selection
        window.selectRole = (role) => {
            modal.remove();
            resolve(role);
            delete window.selectRole;
        };

        return modal;
    }

    // Lock a line for a user
    async lockLine(lineId, lineName) {
        try {
            const supabase = window.supabaseClient;

            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            // Check if line is already locked
            const { data: lineData, error: fetchError } = await supabase
                .from('lines')
                .select('*')
                .eq('id', lineId)
                .single();

            if (fetchError) throw fetchError;

            if (lineData.locked_by && lineData.locked_by !== this.currentUser.name) {
                // Line is locked by someone else
                return {
                    success: false,
                    error: `${lineData.locked_by} is currently working on this line. You cannot access this line now.`
                };
            }

            // Lock the line
            const { error: lockError } = await supabase.rpc('lock_line', {
                line_uuid: lineId,
                user_name: this.currentUser.name
            });

            if (lockError) throw lockError;

            this.currentLine = {
                id: lineId,
                name: lineName,
                lockedAt: new Date().toISOString()
            };

            // Store in localStorage for persistence
            localStorage.setItem('sanixpert_current_line', JSON.stringify(this.currentLine));

            return { success: true, line: this.currentLine };

        } catch (error) {
            console.error('Line locking error:', error);
            return { success: false, error: error.message };
        }
    }

    // Unlock current line
    async unlockLine() {
        try {
            const supabase = window.supabaseClient;

            if (!this.currentLine || !this.currentUser) {
                return { success: false, error: 'No line currently locked' };
            }

            // Unlock the line
            const { error: unlockError } = await supabase.rpc('unlock_line', {
                line_uuid: this.currentLine.id,
                user_name: this.currentUser.name
            });

            if (unlockError) throw unlockError;

            // Clear current line
            this.currentLine = null;
            localStorage.removeItem('sanixpert_current_line');

            return { success: true };

        } catch (error) {
            console.error('Line unlocking error:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if user can access a line
    async canAccessLine(lineId) {
        try {
            const supabase = window.supabaseClient;

            const { data: lineData, error } = await supabase
                .from('lines')
                .select('*')
                .eq('id', lineId)
                .single();

            if (error) throw error;

            // If line is not locked, user can access
            if (!lineData.locked_by) {
                return { canAccess: true };
            }

            // If line is locked by current user, user can access
            if (lineData.locked_by === this.currentUser?.name) {
                return { canAccess: true };
            }

            // Line is locked by someone else
            return {
                canAccess: false,
                lockedBy: lineData.locked_by,
                message: `${lineData.locked_by} is currently working on this line. You cannot access this line now.`
            };

        } catch (error) {
            console.error('Line access check error:', error);
            return { canAccess: false, error: error.message };
        }
    }

    // Get line status
    async getLineStatus(lineId) {
        try {
            const supabase = window.supabaseClient;

            const { data: lineData, error } = await supabase
                .from('lines')
                .select('*')
                .eq('id', lineId)
                .single();

            if (error) throw error;

            return {
                status: lineData.status,
                lockedBy: lineData.locked_by,
                lockedAt: lineData.lock_timestamp,
                canAccess: !lineData.locked_by || lineData.locked_by === this.currentUser?.name
            };

        } catch (error) {
            console.error('Line status check error:', error);
            return { error: error.message };
        }
    }

    // Setup line locking monitoring
    setupLineLocking() {
        // Monitor for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentLine) {
                // Page is hidden, keep lock
                console.log('🔒 Page hidden, maintaining line lock');
            }
        });

        // Monitor for page unload
        window.addEventListener('beforeunload', () => {
            if (this.currentLine) {
                // Save current line info to localStorage for recovery
                localStorage.setItem('sanixpert_line_recovery', JSON.stringify({
                    line: this.currentLine,
                    user: this.currentUser,
                    timestamp: new Date().toISOString()
                }));
            }
        });

        // Check for line recovery on load
        this.checkLineRecovery();
    }

    // Check for line recovery
    checkLineRecovery() {
        const recoveryData = localStorage.getItem('sanixpert_line_recovery');
        if (recoveryData) {
            const recovery = JSON.parse(recoveryData);
            const timeDiff = new Date() - new Date(recovery.timestamp);
            
            // If less than 5 minutes, offer to recover
            if (timeDiff < 5 * 60 * 1000) {
                this.currentUser = recovery.user;
                this.currentLine = recovery.line;
                this.saveCurrentUser();
                
                // Show recovery notification
                if (window.mobileNext) {
                    window.mobileNext.showToast(
                        `Line ${recovery.line.name} recovered from previous session`,
                        'info'
                    );
                }
            }
            
            localStorage.removeItem('sanixpert_line_recovery');
        }
    }

    // Logout user
    logout() {
        this.currentUser = null;
        this.currentLine = null;
        localStorage.removeItem('sanixpert_user');
        localStorage.removeItem('sanixpert_current_line');
        localStorage.removeItem('sanixpert_line_recovery');
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Get current line info
    getCurrentLine() {
        return this.currentLine;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check if user has a line locked
    hasLockedLine() {
        return this.currentLine !== null;
    }
}

// Initialize global auth instance
window.sanixpertAuth = new SanixpertAuth();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SanixpertAuth;
}
