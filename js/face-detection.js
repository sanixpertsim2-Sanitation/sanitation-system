/**
 * Face Detection & Authentication System
 * Sanixpert Digital Sanitation Intelligence
 */

class FaceDetectionSystem {
    constructor() {
        this.isInitialized = false;
        this.videoElement = null;
        this.canvasElement = null;
        this.stream = null;
        this.faceMatcher = null;
        this.modelsLoaded = false;
        this.detectionActive = false;
    }

    /**
     * Initialize face detection system
     */
    async initialize() {
        try {
            // Load face-api.js models
            await this.loadModels();
            this.isInitialized = true;
            console.log('Face detection system initialized');
        } catch (error) {
            console.error('Failed to initialize face detection:', error);
            // Fallback to PIN authentication
            return false;
        }
        return true;
    }

    /**
     * Load face detection models
     */
    async loadModels() {
        try {
            // Using CDN for face-api.js models
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
            
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]);
            
            this.modelsLoaded = true;
        } catch (error) {
            console.error('Failed to load face detection models:', error);
            throw error;
        }
    }

    /**
     * Start camera and detect face
     */
    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });

            // Create video element if not exists
            if (!this.videoElement) {
                this.videoElement = document.createElement('video');
                this.videoElement.autoplay = true;
                this.videoElement.muted = true;
                document.body.appendChild(this.videoElement);
                this.videoElement.style.display = 'none';
            }

            this.videoElement.srcObject = stream;
            this.stream = stream;

            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve(this.videoElement);
                };
            });
        } catch (error) {
            console.error('Camera access denied:', error);
            throw error;
        }
    }

    /**
     * Stop camera
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }

    /**
     * Detect face from video stream
     */
    async detectFace() {
        if (!this.modelsLoaded || !this.videoElement) {
            throw new Error('Face detection not initialized');
        }

        const detections = await faceapi
            .detectAllFaces(this.videoElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();

        return detections;
    }

    /**
     * Register new user face
     */
    async registerUser(userName, userRole) {
        try {
            await this.startCamera();
            
            // Show registration dialog
            const result = await this.showRegistrationDialog(userName);
            
            if (result.success) {
                // Save face data to database
                await this.saveFaceData(userName, userRole, result.descriptor);
                
                // Show success message
                this.showNotification('Face registered successfully!', 'success');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Face registration failed:', error);
            this.showNotification('Face registration failed. Using PIN fallback.', 'error');
            return false;
        } finally {
            this.stopCamera();
        }
    }

    /**
     * Authenticate user with face detection
     */
    async authenticateUser() {
        try {
            // Check if user exists in database
            const userData = await this.loadUserData();
            
            if (!userData || userData.length === 0) {
                // No users registered, show registration
                return await this.showFirstTimeRegistration();
            }

            await this.startCamera();
            
            // Show authentication dialog
            const result = await this.showAuthenticationDialog(userData);
            
            if (result.success) {
                return result.user;
            }
            
            // Fallback to PIN if face detection fails
            return await this.authenticateWithPIN();
            
        } catch (error) {
            console.error('Face authentication failed:', error);
            return await this.authenticateWithPIN();
        } finally {
            this.stopCamera();
        }
    }

    /**
     * Show registration dialog
     */
    async showRegistrationDialog(userName) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'face-dialog-overlay';
            dialog.innerHTML = `
                <div class="face-dialog">
                    <h3>Register Face for ${userName}</h3>
                    <div class="camera-container">
                        <video id="regVideo" autoplay muted></video>
                        <canvas id="regCanvas"></canvas>
                    </div>
                    <div class="face-instructions">
                        <p>Position your face in the center</p>
                        <p>Keep good lighting</p>
                        <p>Stay still for 3 seconds</p>
                    </div>
                    <div class="dialog-buttons">
                        <button id="captureFace" class="btn-primary">Capture Face</button>
                        <button id="skipFace" class="btn-secondary">Skip (Use PIN)</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            const video = dialog.querySelector('#regVideo');
            const canvas = dialog.querySelector('#regCanvas');
            const captureBtn = dialog.querySelector('#captureFace');
            const skipBtn = dialog.querySelector('#skipFace');
            
            // Setup video stream
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                });
            
            let captureCountdown = 0;
            let captureInterval;
            
            captureBtn.addEventListener('click', async () => {
                captureBtn.disabled = true;
                captureCountdown = 3;
                
                captureInterval = setInterval(async () => {
                    captureCountdown--;
                    captureBtn.textContent = `Capturing in ${captureCountdown}...`;
                    
                    if (captureCountdown === 0) {
                        clearInterval(captureInterval);
                        
                        // Capture face descriptor
                        const detections = await faceapi
                            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                            .withFaceLandmarks()
                            .withFaceDescriptor();
                        
                        if (detections) {
                            // Stop stream
                            video.srcObject.getTracks().forEach(track => track.stop());
                            
                            if (dialog && dialog.parentNode) {
                                document.body.removeChild(dialog);
                            }
                            resolve({
                                success: true,
                                descriptor: Array.from(detections.descriptor)
                            });
                        } else {
                            captureBtn.disabled = false;
                            captureBtn.textContent = 'Capture Face';
                            this.showNotification('No face detected. Try again.', 'error');
                        }
                    }
                }, 1000);
            });
            
            skipBtn.addEventListener('click', () => {
                video.srcObject.getTracks().forEach(track => track.stop());
                if (dialog && dialog.parentNode) {
                    document.body.removeChild(dialog);
                }
                resolve({ success: false });
            });
        });
    }

    /**
     * Show authentication dialog
     */
    async showAuthenticationDialog(userData) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'face-dialog-overlay';
            dialog.innerHTML = `
                <div class="face-dialog">
                    <h3>Face Authentication</h3>
                    <div class="camera-container">
                        <video id="authVideo" autoplay muted></video>
                        <canvas id="authCanvas"></canvas>
                    </div>
                    <div class="face-instructions">
                        <p>Look at the camera</p>
                        <p>Face will be detected automatically</p>
                    </div>
                    <div class="dialog-buttons">
                        <button id="usePIN" class="btn-secondary">Use PIN Instead</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            const video = dialog.querySelector('#authVideo');
            const usePINBtn = dialog.querySelector('#usePIN');
            
            // Setup video stream
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                    this.detectionActive = true;
                    
                    // Start face detection loop
                    const detectLoop = async () => {
                        if (!this.detectionActive) return;
                        
                        try {
                            const detections = await faceapi
                                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                                .withFaceLandmarks()
                                .withFaceDescriptors();
                            
                            if (detections.length > 0) {
                                // Match against registered faces
                                for (const user of userData) {
                                    if (user.face_descriptor) {
                                        const distance = faceapi.euclideanDistance(
                                            detections[0].descriptor,
                                            new Float32Array(user.face_descriptor)
                                        );
                                        
                                        if (distance < 0.6) {
                                            // Face matched
                                            this.detectionActive = false;
                                            video.srcObject.getTracks().forEach(track => track.stop());
                                            if (dialog && dialog.parentNode) {
                                                document.body.removeChild(dialog);
                                            }
                                            
                                            resolve({
                                                success: true,
                                                user: {
                                                    name: user.name,
                                                    role: user.role
                                                }
                                            });
                                            return;
                                        }
                                    }
                                }
                            }
                            
                            // Continue detection loop
                            if (this.detectionActive) {
                                setTimeout(detectLoop, 500);
                            }
                        } catch (error) {
                            console.error('Detection error:', error);
                            if (this.detectionActive) {
                                setTimeout(detectLoop, 500);
                            }
                        }
                    };
                    
                    detectLoop();
                });
            
            usePINBtn.addEventListener('click', () => {
                this.detectionActive = false;
                video.srcObject.getTracks().forEach(track => track.stop());
                if (dialog && dialog.parentNode) {
                    document.body.removeChild(dialog);
                }
                resolve({ success: false });
            });
        });
    }

    /**
     * Authenticate with PIN fallback using employee ID
     */
    async authenticateWithPIN() {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'pin-dialog-overlay';
            dialog.innerHTML = `
                <div class="pin-dialog">
                    <h3>PIN Authentication</h3>
                    <p>Enter your Employee ID and PIN:</p>
                    <div class="form-group">
                        <input type="text" id="employeeIdInput" maxlength="6" placeholder="Employee ID (6 digits)">
                    </div>
                    <div class="form-group">
                        <input type="password" id="pinInput" maxlength="4" placeholder="PIN (4 digits)">
                    </div>
                    <div class="dialog-buttons">
                        <button id="submitPIN" class="btn-primary">Submit</button>
                        <button id="cancelPIN" class="btn-secondary">Cancel</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            const employeeIdInput = dialog.querySelector('#employeeIdInput');
            const pinInput = dialog.querySelector('#pinInput');
            const submitBtn = dialog.querySelector('#submitPIN');
            const cancelBtn = dialog.querySelector('#cancelPIN');
            
            employeeIdInput.focus();
            
            // Auto-focus PIN when employee ID is complete
            employeeIdInput.addEventListener('input', (e) => {
                if (e.target.value.length === 6) {
                    pinInput.focus();
                }
            });
            
            const submitPIN = async () => {
                const employeeId = employeeIdInput.value.trim();
                const pin = pinInput.value;
                
                if (employeeId.length !== 6) {
                    this.showNotification('Please enter a valid 6-digit Employee ID', 'error');
                    employeeIdInput.focus();
                    return;
                }
                
                if (pin.length !== 4) {
                    this.showNotification('Please enter a valid 4-digit PIN', 'error');
                    pinInput.focus();
                    return;
                }
                
                // Get valid PIN from environment or configuration
                const validPIN = window.SANIXPERT_CONFIG?.ADMIN_PIN || '2451'; // Fallback for development
                
                if (pin === validPIN) {
                    // Lookup employee name automatically
                    const employeeName = await this.lookupEmployee(employeeId, null, null);
                    
                    if (!employeeName) {
                        this.showNotification('Employee ID not found. Please contact HR.', 'error');
                        employeeIdInput.value = '';
                        pinInput.value = '';
                        employeeIdInput.focus();
                        return;
                    }
                    
                    if (dialog && dialog.parentNode) {
                        document.body.removeChild(dialog);
                    }
                    resolve({
                        success: true,
                        user: {
                            name: employeeName,
                            role: 'sanitation',
                            employeeId: employeeId
                        }
                    });
                } else {
                    this.showNotification('Invalid PIN', 'error');
                    pinInput.value = '';
                    pinInput.focus();
                }
            };
            
            submitBtn.addEventListener('click', submitPIN);
            
            // Handle Enter key on both inputs
            employeeIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && employeeIdInput.value.length === 6) {
                    pinInput.focus();
                }
            });
            
            pinInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') submitPIN();
            });
            
            cancelBtn.addEventListener('click', () => {
                if (dialog && dialog.parentNode) {
                    document.body.removeChild(dialog);
                }
                resolve({ success: false });
            });
        });
    }

    /**
     * Show first-time registration with employee ID lookup
     */
    async showFirstTimeRegistration() {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'registration-dialog-overlay';
            dialog.innerHTML = `
                <div class="registration-dialog">
                    <h3>Welcome to Sanixpert!</h3>
                    <p>First time setup - Enter your Employee ID:</p>
                    <div class="form-group">
                        <label>Employee ID:</label>
                        <input type="text" id="employeeId" placeholder="Enter your employee ID" maxlength="6">
                    </div>
                    <div class="form-group">
                        <label>Department:</label>
                        <select id="userRole">
                            <option value="sanitation">Sanitation</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="production">Production</option>
                            <option value="area_lead">Area Lead</option>
                        </select>
                    </div>
                    <div class="dialog-buttons">
                        <button id="lookupEmployee" class="btn-primary">Lookup & Register</button>
                    </div>
                    <div id="employeeInfo" style="display: none; margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px;">
                        <p id="employeeName"></p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            const employeeIdInput = dialog.querySelector('#employeeId');
            const userRoleSelect = dialog.querySelector('#userRole');
            const lookupBtn = dialog.querySelector('#lookupEmployee');
            const employeeInfoDiv = dialog.querySelector('#employeeInfo');
            const employeeNameP = dialog.querySelector('#employeeName');
            
            employeeIdInput.focus();
            
            // Auto-lookup when 6 digits entered
            employeeIdInput.addEventListener('input', async (e) => {
                const employeeId = e.target.value.trim();
                if (employeeId.length === 6) {
                    await this.lookupEmployee(employeeId, employeeNameP, employeeInfoDiv);
                } else {
                    employeeInfoDiv.style.display = 'none';
                }
            });
            
            lookupBtn.addEventListener('click', async () => {
                const employeeId = employeeIdInput.value.trim();
                const userRole = userRoleSelect.value;
                
                if (!employeeId || employeeId.length !== 6) {
                    this.showNotification('Please enter a valid 6-digit Employee ID', 'error');
                    return;
                }
                
                // Lookup employee first
                const employeeName = await this.lookupEmployee(employeeId, employeeNameP, employeeInfoDiv);
                if (!employeeName) {
                    this.showNotification('Employee ID not found. Please contact HR.', 'error');
                    return;
                }
                
                // Try to register face with auto-identified name
                const faceRegistered = await this.registerUser(employeeName, userRole);
                
                // Save user to database
                await this.saveUserData(employeeName, userRole, employeeId);
                
                if (dialog && dialog.parentNode) {
                    document.body.removeChild(dialog);
                }
                resolve({
                    success: true,
                    user: { name: employeeName, role: userRole, employeeId: employeeId }
                });
            });
        });
    }

    /**
     * Lookup employee by ID
     */
    async lookupEmployee(employeeId, nameElement = null, infoDiv = null) {
        try {
            // Use employee database if available
            if (window.SANIXPERT_EMPLOYEES) {
                const employee = window.SANIXPERT_EMPLOYEES.getEmployee(employeeId);
                
                if (employee && nameElement && infoDiv) {
                    nameElement.textContent = `Found: ${employee.name} - ${employee.role}`;
                    infoDiv.style.display = 'block';
                }
                
                return employee ? employee.name : null;
            }
            
            // Fallback to mock database for development
            const employeeDatabase = {
                '100001': 'John Smith',
                '100002': 'Sarah Johnson', 
                '100003': 'Mike Davis',
                '100004': 'Emily Wilson',
                '100005': 'David Brown',
                '100006': 'Lisa Anderson',
                '100007': 'James Taylor',
                '100008': 'Maria Garcia',
                '100009': 'Robert Martinez',
                '100010': 'Jennifer Lee'
            };
            
            const employeeName = employeeDatabase[employeeId];
            
            if (employeeName && nameElement && infoDiv) {
                nameElement.textContent = `Found: ${employeeName}`;
                infoDiv.style.display = 'block';
            }
            
            return employeeName || null;
        } catch (error) {
            console.error('Employee lookup failed:', error);
            return null;
        }
    }

    /**
     * Save face data to database
     */
    async saveFaceData(userName, userRole, descriptor) {
        try {
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            const { data, error } = await window.supabaseClient
                .from('user_registry')
                .update({
                    face_descriptor: descriptor,
                    face_registered: true,
                    updated_at: new Date().toISOString()
                })
                .eq('name', userName);
                
            if (error) throw error;
        } catch (error) {
            console.error('Failed to save face data:', error);
        }
    }

    /**
     * Save user data to database
     */
    async saveUserData(userName, userRole, employeeId = null) {
        try {
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            const userData = {
                name: userName,
                role: userRole,
                is_active: true,
                first_login_at: new Date().toISOString(),
                last_login_at: new Date().toISOString()
            };

            // Add employee ID if provided
            if (employeeId) {
                userData.employee_id = employeeId;
            }

            const { data, error } = await window.supabaseClient
                .from('user_registry')
                .upsert(userData);
                
            if (error) throw error;
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    }

    /**
     * Load user data from database
     */
    async loadUserData() {
        try {
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                console.warn('Supabase client not initialized, returning empty data');
                return [];
            }

            const { data, error } = await window.supabaseClient
                .from('user_registry')
                .select('*')
                .eq('is_active', true);
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to load user data:', error);
            return [];
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global instance
window.faceDetection = new FaceDetectionSystem();

// CSS for face detection dialogs
const faceDetectionCSS = `
.face-dialog-overlay, .pin-dialog-overlay, .registration-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.face-dialog, .pin-dialog, .registration-dialog {
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.face-dialog h3, .pin-dialog h3, .registration-dialog h3 {
    margin: 0 0 24px 0;
    color: #1e293b;
    font-size: 24px;
    text-align: center;
}

.camera-container {
    position: relative;
    width: 320px;
    height: 240px;
    margin: 0 auto 24px;
    border-radius: 12px;
    overflow: hidden;
    background: #f8fafc;
}

.camera-container video, .camera-container canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.face-instructions {
    text-align: center;
    margin-bottom: 24px;
    color: #64748b;
}

.face-instructions p {
    margin: 4px 0;
    font-size: 14px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #374151;
    font-weight: 500;
}

.form-group input, .form-group select {
    width: 100%;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
}

.form-group input:focus, .form-group select:focus {
    outline: none;
    border-color: #3b82f6;
}

.dialog-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.btn-primary, .btn-secondary {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #2563eb;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
}

.btn-secondary:hover {
    background: #e5e7eb;
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10001;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    background: #10b981;
}

.notification-error {
    background: #ef4444;
}

.notification-info {
    background: #3b82f6;
}

#pinInput, #employeeIdInput {
    text-align: center;
    font-size: 20px;
    letter-spacing: 4px;
}

#employeeIdInput {
    letter-spacing: 2px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    text-align: center;
}

.form-group input:focus {
    outline: none;
    border-color: #3b82f6;
}
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = faceDetectionCSS;
document.head.appendChild(styleSheet);
