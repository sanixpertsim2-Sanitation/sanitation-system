/**
 * Camera Integration System
 * Camera-only access with timestamp overlay
 * Sanixpert Digital Sanitation Intelligence
 */

class CameraIntegration {
    constructor() {
        this.stream = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.isInitialized = false;
    }

    /**
     * Initialize camera system
     */
    async initialize() {
        try {
            // Check camera support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not supported on this device');
            }
            
            this.isInitialized = true;
            console.log('Camera system initialized');
            return true;
        } catch (error) {
            console.error('Camera initialization failed:', error);
            return false;
        }
    }

    /**
     * Start camera stream
     */
    async startCamera(containerElement) {
        try {
            // Stop any existing stream
            this.stopCamera();

            // Request camera access (rear camera preferred for mobile)
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            // Try rear camera first, fallback to front
            try {
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (error) {
                // Fallback to front camera
                constraints.video.facingMode = 'user';
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            }

            // Create video element if not exists
            if (!this.videoElement) {
                this.videoElement = document.createElement('video');
                this.videoElement.autoplay = true;
                this.videoElement.muted = true;
                this.videoElement.playsInline = true;
            }

            this.videoElement.srcObject = this.stream;

            // Add to container
            if (containerElement) {
                containerElement.innerHTML = '';
                containerElement.appendChild(this.videoElement);
            }

            // Wait for video to be ready
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = resolve;
            });

            return this.videoElement;
        } catch (error) {
            console.error('Failed to start camera:', error);
            throw new Error('Camera access denied or not available');
        }
    }

    /**
     * Stop camera stream
     */
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
    }

    /**
     * Capture photo with timestamp overlay
     */
    async capturePhoto(timestamp = true, customText = '') {
        if (!this.videoElement) {
            throw new Error('Camera not started');
        }

        // Create canvas for capture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size to video dimensions
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;

        // Draw video frame
        context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

        // Add timestamp overlay if requested
        if (timestamp) {
            this.addTimestampOverlay(context, canvas.width, canvas.height, customText);
        }

        // Convert to blob
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve({
                    blob: blob,
                    dataUrl: canvas.toDataURL('image/jpeg', 0.9),
                    timestamp: new Date().toISOString()
                });
            }, 'image/jpeg', 0.9);
        });
    }

    /**
     * Add timestamp overlay to image
     */
    addTimestampOverlay(context, width, height, customText = '') {
        const now = new Date();
        const timestamp = now.toLocaleString();
        
        // Configure text style
        context.font = 'bold 24px Arial';
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.lineWidth = 3;
        context.textAlign = 'right';
        context.textBaseline = 'bottom';

        // Add background for better readability
        const text = customText ? `${customText} - ${timestamp}` : timestamp;
        const textMetrics = context.measureText(text);
        const padding = 10;
        const boxHeight = 40;
        
        // Draw background box
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(
            width - textMetrics.width - padding * 2,
            height - boxHeight - padding,
            textMetrics.width + padding * 2,
            boxHeight
        );

        // Draw timestamp text
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.fillText(text, width - padding, height - padding);
        context.strokeText(text, width - padding, height - padding);

        // Add Sanixpert watermark
        context.font = '16px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        
        const watermark = 'Sanixpert - Give & Go';
        const watermarkMetrics = context.measureText(watermark);
        
        // Watermark background
        context.fillStyle = 'rgba(59, 130, 246, 0.8)';
        context.fillRect(padding, padding, watermarkMetrics.width + padding * 2, 30);
        
        // Watermark text
        context.fillStyle = 'white';
        context.fillText(watermark, padding * 2, padding * 2);
    }

    /**
     * Upload photo to storage
     */
    async uploadPhoto(blob, fileName, folder = 'sanitation-photos') {
        try {
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            // Generate unique filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const uniqueFileName = `${folder}/${timestamp}-${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await window.supabaseClient.storage
                .from('sanitation-photos')
                .upload(uniqueFileName, blob, {
                    contentType: 'image/jpeg',
                    cacheControl: '3600'
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = window.supabaseClient.storage
                .from('sanitation-photos')
                .getPublicUrl(uniqueFileName);

            return {
                url: publicUrl,
                path: uniqueFileName,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Photo upload failed:', error);
            throw error;
        }
    }

    /**
     * Show camera capture interface
     */
    async showCaptureInterface(title = 'Capture Photo', allowMultiple = false) {
        return new Promise((resolve) => {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'camera-overlay';
            overlay.innerHTML = `
                <div class="camera-modal">
                    <div class="camera-header">
                        <h3>${title}</h3>
                        <button class="close-btn" id="closeCamera">&times;</button>
                    </div>
                    <div class="camera-preview" id="cameraPreview">
                        <div class="camera-placeholder">
                            <div class="camera-icon">📷</div>
                            <p>Initializing camera...</p>
                        </div>
                    </div>
                    <div class="camera-controls">
                        <button class="capture-btn" id="captureBtn">
                            <span class="capture-icon">📸</span>
                            Capture Photo
                        </button>
                        ${allowMultiple ? `
                            <div class="captured-photos" id="capturedPhotos">
                                <p>Captured: <span id="photoCount">0</span> photos</p>
                            </div>
                        ` : ''}
                        <button class="done-btn" id="doneCapture" ${allowMultiple ? '' : 'style="display:none;"'}>
                            Done Capturing
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const preview = overlay.querySelector('#cameraPreview');
            const captureBtn = overlay.querySelector('#captureBtn');
            const closeBtn = overlay.querySelector('#closeCamera');
            const doneBtn = overlay.querySelector('#doneCapture');
            const capturedPhotosDiv = overlay.querySelector('#capturedPhotos');
            const photoCountSpan = overlay.querySelector('#photoCount');

            let capturedPhotos = [];
            let videoElement = null;

            // Initialize camera
            this.startCamera(preview).then(async (video) => {
                videoElement = video;
                captureBtn.disabled = false;
            }).catch(error => {
                preview.innerHTML = `
                    <div class="camera-error">
                        <div class="error-icon">❌</div>
                        <p>Camera access failed</p>
                        <p>${error.message}</p>
                    </div>
                `;
                captureBtn.disabled = true;
            });

            // Capture photo
            captureBtn.addEventListener('click', async () => {
                try {
                    captureBtn.disabled = true;
                    captureBtn.innerHTML = '<span class="loading">⏳</span> Capturing...';

                    const photoData = await this.capturePhoto(true, title);
                    
                    // Upload photo
                    const uploadResult = await this.uploadPhoto(
                        photoData.blob, 
                        `${Date.now()}.jpg`
                    );

                    capturedPhotos.push({
                        url: uploadResult.url,
                        timestamp: photoData.timestamp,
                        dataUrl: photoData.dataUrl
                    });

                    // Update UI
                    if (allowMultiple) {
                        photoCountSpan.textContent = capturedPhotos.length;
                        this.showCapturedPhotos(capturedPhotos, capturedPhotosDiv);
                    } else {
                        // Auto-resolve for single photo
                        this.stopCamera();
                        if (overlay && overlay.parentNode) {
                            document.body.removeChild(overlay);
                        }
                        resolve(capturedPhotos);
                        return;
                    }

                    // Flash effect
                    preview.style.backgroundColor = 'white';
                    setTimeout(() => {
                        preview.style.backgroundColor = '';
                    }, 100);

                } catch (error) {
                    console.error('Capture failed:', error);
                    alert('Failed to capture photo. Please try again.');
                } finally {
                    captureBtn.disabled = false;
                    captureBtn.innerHTML = '<span class="capture-icon">📸</span> Capture Photo';
                }
            });

            // Done capturing
            doneBtn.addEventListener('click', () => {
                this.stopCamera();
                if (overlay && overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
                resolve(capturedPhotos);
            });

            // Close camera
            closeBtn.addEventListener('click', () => {
                this.stopCamera();
                if (overlay && overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
                resolve(null);
            });

            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.stopCamera();
                    if (overlay && overlay.parentNode) {
                        document.body.removeChild(overlay);
                    }
                    resolve(null);
                }
            });
        });
    }

    /**
     * Show captured photos preview
     */
    showCapturedPhotos(photos, container) {
        const photosHtml = photos.map((photo, index) => `
            <div class="captured-photo-item">
                <img src="${photo.dataUrl}" alt="Photo ${index + 1}">
                <div class="photo-timestamp">${new Date(photo.timestamp).toLocaleString()}</div>
                <button class="remove-photo" data-index="${index}">&times;</button>
            </div>
        `).join('');

        container.innerHTML = `
            <p>Captured: <span id="photoCount">${photos.length}</span> photos</p>
            <div class="captured-photos-grid">
                ${photosHtml}
            </div>
        `;

        // Add remove functionality
        container.querySelectorAll('.remove-photo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                photos.splice(index, 1);
                this.showCapturedPhotos(photos, container);
            });
        });
    }

    /**
     * Quick capture (no modal)
     */
    async quickCapture() {
        try {
            await this.startCamera();
            const photoData = await this.capturePhoto(true);
            this.stopCamera();
            
            const uploadResult = await this.uploadPhoto(
                photoData.blob,
                `${Date.now()}.jpg`
            );

            return {
                url: uploadResult.url,
                timestamp: photoData.timestamp
            };
        } catch (error) {
            this.stopCamera();
            throw error;
        }
    }
}

// Global instance
window.cameraIntegration = new CameraIntegration();

// CSS for camera interface
const cameraCSS = `
.camera-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.camera-modal {
    background: #1f2937;
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.camera-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #111827;
    color: white;
}

.camera-header h3 {
    margin: 0;
    font-size: 18px;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.camera-preview {
    position: relative;
    width: 100%;
    height: 400px;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.camera-placeholder, .camera-error {
    text-align: center;
    color: #9ca3af;
}

.camera-icon, .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.camera-preview video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.camera-controls {
    padding: 20px;
    background: #111827;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.capture-btn {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    padding: 16px 24px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
}

.capture-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.capture-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.capture-icon {
    font-size: 20px;
}

.loading {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.captured-photos {
    text-align: center;
    color: #9ca3af;
}

.captured-photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    margin-top: 12px;
}

.captured-photo-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 1;
}

.captured-photo-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-timestamp {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 10px;
    padding: 2px 4px;
    text-align: center;
}

.remove-photo {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.done-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.done-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

@media (max-width: 768px) {
    .camera-modal {
        width: 95%;
        max-height: 95vh;
    }
    
    .camera-preview {
        height: 300px;
    }
    
    .capture-btn {
        padding: 14px 20px;
        font-size: 16px;
    }
}
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = cameraCSS;
document.head.appendChild(styleSheet);
