/**
 * Configuration is loaded from public/js/config.js
 * which is auto-generated from .env file by build-config.js
 *
 * To update configuration:
 *   1. Edit .env file with your values
 *   2. Run: npm run build:config
 *   3. Or just run: npm start (builds config automatically)
 *
 * The CONFIG object is now available from config.js
 */

// Session management
function generateSessionId() {
    const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatSessionId', id);
    return id;
}

function getSessionId() {
    return localStorage.getItem('chatSessionId') || generateSessionId();
}

// Auto-resize textarea
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = newHeight + 'px';
}

// Chat functionality
class ChatApp {
    constructor() {
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.voiceButton = document.getElementById('voiceButton');
        this.voiceVisualizerContainer = document.getElementById('voiceVisualizerContainer');
        this.voiceTimer = document.getElementById('voiceTimer');
        this.voiceVisualizer = document.getElementById('voiceVisualizer');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatMessagesContainer = document.getElementById('chatMessagesContainer');
        this.chatInterface = document.getElementById('chatInterface');
        this.chatHeader = document.getElementById('chatHeader');
        this.suggestionsCarousel = document.getElementById('suggestionsCarousel');
        this.carouselLeft = document.getElementById('carouselLeft');
        this.carouselRight = document.getElementById('carouselRight');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.mouseFollower = document.getElementById('mouseFollower');
        this.attachmentsContainer = document.getElementById('attachmentsContainer');
        this.userDropdown = document.getElementById('userDropdown');
        this.appointmentsContainer = document.getElementById('appointmentsContainer');
        this.appointmentsLeft = document.getElementById('appointmentsLeft');
        this.appointmentsRight = document.getElementById('appointmentsRight');
        this.socialMediaContainer = document.getElementById('socialMediaContainer');
        this.socialMediaLeft = document.getElementById('socialMediaLeft');
        this.socialMediaRight = document.getElementById('socialMediaRight');
        this.thumbnailsContainer = document.getElementById('thumbnailsContainer');
        this.thumbnailsLeft = document.getElementById('thumbnailsLeft');
        this.thumbnailsRight = document.getElementById('thumbnailsRight');
        this.blogContainer = document.getElementById('blogContainer');
        this.blogLeft = document.getElementById('blogLeft');
        this.blogRight = document.getElementById('blogRight');
        this.blogDropdown = document.getElementById('blogDropdown');
        this.blogRefreshBtn = document.getElementById('blogRefresh');
        this.appointmentsRefreshBtn = document.getElementById('appointmentsRefresh');
        this.socialMediaRefreshBtn = document.getElementById('socialMediaRefresh');
        this.thumbnailsRefreshBtn = document.getElementById('thumbnailsRefresh');

        // Analytics elements
        this.analyticsLoading = document.getElementById('analyticsLoading');
        this.analyticsContent = document.getElementById('analyticsContent');
        this.analyticsError = document.getElementById('analyticsError');
        this.analyticsPlatforms = document.getElementById('analyticsPlatforms');
        this.analyticsDetails = document.getElementById('analyticsDetails');
        this.analyticsRefreshBtn = document.getElementById('analyticsRefresh');
        this.analyticsRetryBtn = document.getElementById('analyticsRetry');

        this.userSelectionOverlay = document.getElementById('userSelectionOverlay');
        this.userSelectionLoading = document.getElementById('userSelectionLoading');
        this.userCardsContainer = document.getElementById('userCardsContainer');

        // Tab navigation elements
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.mobileTabIndicator = document.getElementById('mobileTabIndicator');
        this.navItems = document.querySelectorAll('.nav-item');
        this.modulePanels = document.querySelectorAll('.module-panel');
        this.sidebarUserName = document.getElementById('sidebarUserName');
        this.userInitials = document.getElementById('userInitials');

        // Current active tab
        this.activeTab = 'chat';

        this.sessionId = getSessionId();
        this.markdownEnabled = typeof marked !== 'undefined';
        this.attachments = [];
        this.mousePosition = { x: 0, y: 0 };
        this.chatStarted = false; // Track if chat session has started
        this.selectedUser = null; // Store selected user info
        this.requestInProgress = false; // Track if a message request is in progress
        this.lastSentMessage = ''; // Track last sent message to prevent duplicates
        this.lastSentTime = 0; // Track when last message was sent
        this.sentMessages = new Set(); // Track recently sent messages (last 5 minutes)
        this.activeRequestIds = new Set(); // Track active request IDs to prevent duplicates
        this.requestIdCounter = 0; // Counter for generating unique request IDs

        // Appointments tracking
        this.currentUserId = null; // Track current user for appointments refresh
        this.currentAppointments = []; // Store current appointments
        this.appointmentsRefreshTimer = null; // Timer for auto-refresh

        // Social media tracking
        this.currentPosts = []; // Store current social media posts
        this.postsRefreshTimer = null; // Timer for auto-refresh
        this.hiddenPosts = new Set(); // Track hidden post IDs

        // Thumbnails tracking
        this.hiddenThumbnails = new Set(); // Track hidden thumbnail IDs

        // Blog tracking
        this.currentBlogs = []; // Store all blogs
        this.currentBlogPosts = []; // Store current blog posts
        this.selectedBlogId = null; // Track selected blog

        // Social media platform account mapping (loaded from CONFIG)
        // Only platforms configured in .env will be included
        this.platformAccounts = CONFIG.platformAccounts || {};

        // Analytics-specific profile IDs (loaded from CONFIG)
        // Only platforms configured in .env will be included
        this.analyticsProfileIds = CONFIG.analyticsProfileIds || {};

        // Speech recognition setup
        this.isRecording = false;
        this.recordingTime = 0;
        this.recordingTimer = null;
        this.transcribedText = '';
        this.interimTranscript = '';
        this.recognition = null;
        this.visualizerInterval = null;

        this.initSpeechRecognition();
        this.initVisualizer();

        // Show warning if markdown is disabled
        if (!this.markdownEnabled) {
            this.showMarkdownWarning();
        }

        this.initializeEventListeners();
        this.initInfiniteCarousel();
        this.initTabNavigation();

        // Check password authentication first
        this.initPasswordProtection();
    }

    showMarkdownWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'message bot';
        warningDiv.innerHTML = `
            <div class="message-avatar">
                <span class="avatar-text">⚠️</span>
            </div>
            <div class="message-content" style="background: rgba(255, 149, 0, 0.1); color: #ff9500; border: 1px solid rgba(255, 149, 0, 0.2);">
                <strong>Notice:</strong> Enhanced formatting is temporarily unavailable. Messages will display as plain text.
            </div>
        `;
        this.chatMessages.appendChild(warningDiv);
    }

    initTabNavigation() {
        // Tab switching for sidebar navigation
        this.navItems.forEach(navItem => {
            navItem.addEventListener('click', () => {
                const tab = navItem.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Mobile menu toggle
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close sidebar when clicking overlay
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Media filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.dataset.filter;
                this.filterMedia(filter);
                // Update active state
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    switchTab(tab) {
        // Update active tab
        this.activeTab = tab;

        // Update nav items
        this.navItems.forEach(navItem => {
            if (navItem.dataset.tab === tab) {
                navItem.classList.add('active');
            } else {
                navItem.classList.remove('active');
            }
        });

        // Update module panels
        this.modulePanels.forEach(panel => {
            if (panel.dataset.module === tab) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Update mobile tab indicator
        const tabNames = {
            'chat': 'Chat',
            'thumbnails': 'Thumbnails',
            'media': 'Media',
            'blogs': 'Blog Studio',
            'analytics': 'Analytics'
        };
        if (this.mobileTabIndicator) {
            this.mobileTabIndicator.textContent = tabNames[tab] || 'Chat';
        }

        // Close sidebar on mobile after selecting tab
        this.closeSidebar();

        // Lazy load data for tabs when first accessed
        if (tab === 'thumbnails' && !this.thumbnailsLoaded) {
            this.thumbnailsLoaded = true;
            this.fetchThumbnails();
        } else if (tab === 'media' && !this.mediaLoaded) {
            this.mediaLoaded = true;
            this.fetchSocialMediaPosts();
            this.fetchAudioUsage();
            this.fetchVideoUsage();
        } else if (tab === 'blogs' && !this.blogsLoaded) {
            this.blogsLoaded = true;
            this.fetchBlogs();
        } else if (tab === 'analytics' && !this.analyticsLoaded) {
            this.analyticsLoaded = true;
            this.fetchAnalytics();
        }
    }

    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('open');
        }
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.toggle('active');
        }
    }

    closeSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.remove('open');
        }
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('active');
        }
    }

    filterMedia(filter) {
        const mediaCards = document.querySelectorAll('.media-card');
        mediaCards.forEach(card => {
            const type = card.dataset.type;
            if (filter === 'all' || type === filter) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateSidebarUser(user) {
        if (this.sidebarUserName && user) {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
            this.sidebarUserName.textContent = fullName;

            // Update initials
            if (this.userInitials) {
                const initials = this.getInitials(fullName);
                this.userInitials.textContent = initials;
            }
        }
    }

    getInitials(name) {
        if (!name) return '--';
        const parts = name.split(' ').filter(p => p);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return (name.substring(0, 2)).toUpperCase();
    }

    initializeEventListeners() {
        // Auto-resize textarea on input
        this.chatInput.addEventListener('input', () => {
            this.sendButton.disabled = !this.chatInput.value.trim();
            autoResizeTextarea(this.chatInput);
        });

        // Send message on Enter key
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && this.chatInput.value.trim()) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Voice button for speech-to-text
        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => this.toggleSpeechRecognition());
        }

        // Mouse follower effect
        this.chatInput.addEventListener('focus', () => {
            this.mouseFollower.classList.add('active');
        });

        this.chatInput.addEventListener('blur', () => {
            this.mouseFollower.classList.remove('active');
        });

        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            this.mouseFollower.style.left = e.clientX + 'px';
            this.mouseFollower.style.top = e.clientY + 'px';
        });

        // Suggestion button event listeners are now handled in initInfiniteCarousel()
        // to prevent duplicate event attachments

        // Carousel arrow navigation
        if (this.carouselLeft && this.suggestionsCarousel) {
            this.carouselLeft.addEventListener('click', () => {
                const scrollAmount = this.suggestionsCarousel.offsetWidth * 0.8;
                this.suggestionsCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        if (this.carouselRight && this.suggestionsCarousel) {
            this.carouselRight.addEventListener('click', () => {
                const scrollAmount = this.suggestionsCarousel.offsetWidth * 0.8;
                this.suggestionsCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }

        // Refresh buttons
        if (this.appointmentsRefreshBtn) {
            this.appointmentsRefreshBtn.addEventListener('click', () => {
                if (this.currentUserId) {
                    this.appointmentsRefreshBtn.classList.add('refreshing');
                    this.fetchCalendarEvents(this.currentUserId).finally(() => {
                        this.appointmentsRefreshBtn.classList.remove('refreshing');
                    });
                }
            });
        }

        if (this.socialMediaRefreshBtn) {
            this.socialMediaRefreshBtn.addEventListener('click', () => {
                this.socialMediaRefreshBtn.classList.add('refreshing');
                // Fetch both posts and usage data in parallel
                Promise.all([
                    this.fetchSocialMediaPosts(),
                    this.fetchAudioUsage(),
                    this.fetchVideoUsage()
                ]).finally(() => {
                    this.socialMediaRefreshBtn.classList.remove('refreshing');
                });
            });
        }

        if (this.thumbnailsRefreshBtn) {
            this.thumbnailsRefreshBtn.addEventListener('click', () => {
                this.thumbnailsRefreshBtn.classList.add('refreshing');
                this.fetchThumbnails().finally(() => {
                    this.thumbnailsRefreshBtn.classList.remove('refreshing');
                });
            });
        }

        // Analytics refresh and retry buttons
        if (this.analyticsRefreshBtn) {
            this.analyticsRefreshBtn.addEventListener('click', () => {
                this.analyticsRefreshBtn.classList.add('refreshing');
                this.fetchAnalytics().finally(() => {
                    this.analyticsRefreshBtn.classList.remove('refreshing');
                });
            });
        }

        if (this.analyticsRetryBtn) {
            this.analyticsRetryBtn.addEventListener('click', () => {
                this.fetchAnalytics();
            });
        }

        // Blog dropdown change handler
        if (this.blogDropdown) {
            this.blogDropdown.addEventListener('change', (e) => {
                const blogId = e.target.value;
                if (blogId) {
                    this.selectedBlogId = blogId;
                    this.fetchBlogPosts(blogId);
                } else {
                    this.selectedBlogId = null;
                    this.blogContainer.innerHTML = '<div class="blog-placeholder">Select a blog to view posts</div>';
                    this.hideBlogChevrons();
                }
            });
        }

        // Blog refresh button
        if (this.blogRefreshBtn) {
            this.blogRefreshBtn.addEventListener('click', () => {
                this.blogRefreshBtn.classList.add('refreshing');
                const refreshPromise = this.selectedBlogId
                    ? this.fetchBlogPosts(this.selectedBlogId)
                    : this.fetchBlogs();
                refreshPromise.finally(() => {
                    this.blogRefreshBtn.classList.remove('refreshing');
                });
            });
        }

        // Blog carousel navigation
        if (this.blogLeft && this.blogContainer) {
            this.blogLeft.addEventListener('click', () => {
                this.blogContainer.scrollBy({ left: -400, behavior: 'smooth' });
            });
        }

        if (this.blogRight && this.blogContainer) {
            this.blogRight.addEventListener('click', () => {
                this.blogContainer.scrollBy({ left: 400, behavior: 'smooth' });
            });
        }

        // Desktop video idea button event listeners
        const videoIdeaButtons = document.querySelectorAll('.video-idea-btn');
        videoIdeaButtons.forEach(button => {
            button.addEventListener('click', () => {
                const prompt = button.dataset.videoPrompt;
                if (prompt) {
                    this.chatInput.value = prompt;
                    this.sendButton.disabled = false;
                    autoResizeTextarea(this.chatInput);
                    this.chatInput.focus();
                }
            });
        });

        // Mobile video idea button event listeners
        const mobileVideoIdeaButtons = document.querySelectorAll('.mobile-video-idea-btn');
        mobileVideoIdeaButtons.forEach(button => {
            button.addEventListener('click', () => {
                const prompt = button.dataset.videoPrompt;
                if (prompt) {
                    this.chatInput.value = prompt;
                    this.sendButton.disabled = false;
                    autoResizeTextarea(this.chatInput);
                    this.chatInput.focus();
                }
            });
        });

        // Mobile carousel navigation
        this.initMobileCarousel();
    }

    initMobileCarousel() {
        const carouselScroll = document.getElementById('mobileVideoIdeasScroll');
        const leftArrow = document.getElementById('mobileVideoLeft');
        const rightArrow = document.getElementById('mobileVideoRight');

        if (!carouselScroll) return;

        // No auto-scrolling - just manual scroll
        // Arrows are hidden via CSS, so no event listeners needed
    }

    handleAttach() {
        const mockFileName = `document-${Date.now()}.pdf`;
        this.attachments.push(mockFileName);
        this.renderAttachments();
    }

    renderAttachments() {
        if (this.attachments.length === 0) {
            this.attachmentsContainer.innerHTML = '';
            return;
        }

        this.attachmentsContainer.innerHTML = this.attachments.map((file, index) => `
            <div class="attachment-item">
                <span>${file}</span>
                <button class="attachment-remove" onclick="chatApp.removeAttachment(${index})">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    removeAttachment(index) {
        this.attachments.splice(index, 1);
        this.renderAttachments();
    }

    hideLandingPage() {
        // Scroll header up and make it compact, keep suggestions visible
        if (this.chatHeader) {
            this.chatHeader.classList.add('compact');
        }
    }

    addMessage(content, isUser = false) {
        // Hide landing page on first message
        if (!this.chatStarted) {
            this.chatStarted = true;
            this.hideLandingPage();
        }

        // Show messages container if hidden
        if (this.chatMessagesContainer.style.display === 'none') {
            this.chatMessagesContainer.style.display = 'block';
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

        // Parse markdown for bot messages, escape HTML for user messages
        const formattedContent = isUser ? this.escapeHtml(content) : this.parseMarkdown(content);

        // Debug logging
        if (!isUser) {
            console.log('Original content:', content);
            console.log('Formatted content:', formattedContent);
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <span class="avatar-text">${isUser ? 'You' : 'AI'}</span>
            </div>
            <div class="message-content markdown-body">${formattedContent}</div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    parseMarkdown(text) {
        // If markdown is not enabled, return plain text with line breaks
        if (!this.markdownEnabled) {
            console.warn('⚠️ Markdown disabled, returning plain text');
            // Convert line breaks to <br> for basic formatting
            return this.escapeHtml(text).replace(/\n/g, '<br>');
        }

        try {
            // Configure marked options once
            if (typeof marked.setOptions === 'function') {
                marked.setOptions({
                    breaks: true,      // Convert line breaks to <br>
                    gfm: true,         // GitHub Flavored Markdown
                    headerIds: false,  // Disable header IDs
                    mangle: false,     // Don't mangle email addresses
                    sanitize: false,   // Allow HTML
                    smartLists: true,  // Use smarter list behavior
                    smartypants: false // Don't use "smart" typographic punctuation
                });
            }

            // Parse markdown to HTML (handle different API versions)
            let html;
            if (typeof marked.parse === 'function') {
                html = marked.parse(text);
                console.log('✅ Markdown parsed with marked.parse()');
            } else if (typeof marked === 'function') {
                html = marked(text);
                console.log('✅ Markdown parsed with marked()');
            } else {
                throw new Error('No valid marked parsing function found');
            }

            return html;
        } catch (error) {
            console.error('❌ Error parsing markdown:', error);
            console.error('📝 Falling back to plain text');
            // Fallback to plain text with line breaks
            return this.escapeHtml(text).replace(/\n/g, '<br>');
        }
    }

    // Helper function to fetch with timeout
    async fetchWithTimeout(url, options = {}, timeout = 600000) {
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            // Check if error is due to abort (timeout)
            if (error.name === 'AbortError') {
                const timeoutError = new Error('Request timeout');
                timeoutError.name = 'TimeoutError';
                throw timeoutError;
            }
            throw error;
        }
    }

    // Helper function to disable suggestion buttons during requests
    disableSuggestionButtons() {
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }

    // Helper function to enable suggestion buttons after requests
    enableSuggestionButtons() {
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Create a unique message key (lowercase, trimmed)
        const messageKey = message.toLowerCase().trim();
        const now = Date.now();

        // Generate unique request ID
        this.requestIdCounter++;
        const requestId = `${this.sessionId}-${now}-${this.requestIdCounter}`;

        console.log(`📤 [${requestId}] Attempting to send message:`, message.substring(0, 50) + '...');

        // Check if this exact message was sent in the last 5 minutes (300000 ms)
        const recentlySent = this.lastSentMessage === messageKey && (now - this.lastSentTime) < 300000;

        if (recentlySent) {
            console.log(`⚠️ [${requestId}] Duplicate message detected within 5 minutes, ignoring`);
            // Clear input to prevent accidental resubmission
            this.chatInput.value = '';
            this.chatInput.style.height = '60px';
            return;
        }

        // Prevent concurrent requests
        if (this.requestInProgress) {
            console.log(`⚠️ [${requestId}] Request already in progress, ignoring duplicate request`);
            return;
        }

        // Check if we're already processing this specific request
        if (this.activeRequestIds.has(requestId)) {
            console.log(`⚠️ [${requestId}] This request ID is already being processed, blocking duplicate`);
            return;
        }

        // Set request in progress flag and disable suggestion buttons
        this.requestInProgress = true;
        this.activeRequestIds.add(requestId);
        this.disableSuggestionButtons();

        // Store this message as last sent
        this.lastSentMessage = messageKey;
        this.lastSentTime = now;

        // Add user message to chat
        this.addMessage(message, true);
        this.chatInput.value = '';
        this.chatInput.style.height = '60px';
        this.sendButton.disabled = true;

        // Clear attachments (if any were added)
        this.attachments = [];
        this.renderAttachments();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            console.log(`🚀 [${requestId}] Sending POST request to webhook`);

            // Fetch with 10-minute timeout (600000 ms)
            const response = await this.fetchWithTimeout(CONFIG.webhookUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'sendMessage',
                    sessionId: this.sessionId,
                    chatInput: message,
                    requestId: requestId // Include request ID in payload for server-side deduplication
                })
            }, 600000); // 10 minutes timeout

            this.hideTypingIndicator();

            console.log(`📡 [${requestId}] Response status:`, response.status, response.statusText);
            console.log(`📋 [${requestId}] Response headers:`, {
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length')
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the raw response text first
            const responseText = await response.text();
            console.log(`📥 [${requestId}] Response received, length:`, responseText.length);

            // Check if response is empty
            if (!responseText || responseText.trim() === '') {
                console.warn(`⚠️ [${requestId}] Empty response received`);
                this.addMessage('I received your message but got an empty response. Please check your configuration.', false);
                return;
            }

            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
                console.log(`✅ [${requestId}] Parsed response data successfully`);
            } catch (parseError) {
                console.error(`❌ [${requestId}] JSON parse error:`, parseError.message);

                // Check if it's plain text instead of JSON
                if (responseText.length > 0) {
                    console.log(`💡 [${requestId}] Response appears to be plain text, not JSON`);
                    // Try to use the response as-is
                    this.addMessage(responseText, false);
                    return;
                }

                throw new Error(`Invalid JSON response from server: ${parseError.message}`);
            }

            const botResponse = data.output || data.message || 'I received your message. How else can I help you?';
            this.addMessage(botResponse);
            console.log(`✅ [${requestId}] Request completed successfully`);

        } catch (error) {
            this.hideTypingIndicator();
            console.error(`❌ [${requestId}] Error occurred:`, error);

            // Check if it's a timeout error
            if (error.name === 'TimeoutError') {
                console.warn(`⏱️ [${requestId}] Request timed out after 10 minutes`);
                this.addMessage('Your request is being processed, it\'ll take 7-9 minutes to process, meanwhile you can carry on with other tasks', false);
            } else {
                console.error(`💥 [${requestId}] Request failed with error: ${error.name}`);
                // For other errors, show the new user-friendly message
                this.addMessage('Your request is being processed, it\'ll take 7-9 minutes to process, meanwhile you can carry on with other tasks', false);
            }
        } finally {
            // Always reset request state and re-enable buttons
            console.log(`🔓 [${requestId}] Cleaning up request state`);
            this.requestInProgress = false;
            this.activeRequestIds.delete(requestId);
            this.enableSuggestionButtons();
            this.sendButton.disabled = false;
        }
    }

    initInfiniteCarousel() {
        if (!this.suggestionsCarousel) return;

        const carousel = this.suggestionsCarousel;
        const buttons = Array.from(carousel.querySelectorAll('.suggestion-btn'));
        const leftArrow = document.getElementById('carouselLeft');
        const rightArrow = document.getElementById('carouselRight');

        if (buttons.length === 0) return;

        // Helper function to attach click handler (prevents duplicate code)
        const attachClickHandler = (btn) => {
            btn.addEventListener('click', () => {
                const suggestion = btn.dataset.suggestion;
                this.chatInput.value = suggestion;
                this.sendButton.disabled = false;
                autoResizeTextarea(this.chatInput);
                this.chatInput.focus();
            });
        };

        // Attach event listeners to original buttons
        buttons.forEach(button => {
            attachClickHandler(button);
        });

        // Set up carousel navigation with chevron buttons
        if (leftArrow) {
            leftArrow.addEventListener('click', () => {
                const scrollAmount = carousel.offsetWidth * 0.6;
                carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener('click', () => {
                const scrollAmount = carousel.offsetWidth * 0.6;
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    }

    // Appointments functionality
    initAppointments() {
        // Fetch users and populate dropdown
        this.fetchUsers();

        // Add event listener to dropdown
        if (this.userDropdown) {
            this.userDropdown.addEventListener('change', (e) => {
                const userId = e.target.value;
                if (userId) {
                    this.fetchCalendarEvents(userId);
                } else {
                    this.appointmentsContainer.innerHTML = '<div class="appointments-placeholder">Select a user to view their upcoming appointments</div>';
                    this.hideAppointmentChevrons();
                }
            });
        }

        // Add chevron click handlers
        if (this.appointmentsLeft && this.appointmentsContainer) {
            this.appointmentsLeft.addEventListener('click', () => {
                const scrollAmount = this.appointmentsContainer.offsetWidth * 0.8;
                this.appointmentsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        if (this.appointmentsRight && this.appointmentsContainer) {
            this.appointmentsRight.addEventListener('click', () => {
                const scrollAmount = this.appointmentsContainer.offsetWidth * 0.8;
                this.appointmentsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    }

    showAppointmentChevrons() {
        if (this.appointmentsLeft) this.appointmentsLeft.style.display = 'flex';
        if (this.appointmentsRight) this.appointmentsRight.style.display = 'flex';
    }

    hideAppointmentChevrons() {
        if (this.appointmentsLeft) this.appointmentsLeft.style.display = 'none';
        if (this.appointmentsRight) this.appointmentsRight.style.display = 'none';
    }

    // Social Media Posts Section
    initSocialMedia() {
        // Fetch social media posts and usage data
        this.fetchSocialMediaPosts();
        this.fetchAudioUsage();
        this.fetchVideoUsage();

        // Set up scroll handlers
        if (this.socialMediaLeft && this.socialMediaContainer) {
            this.socialMediaLeft.addEventListener('click', () => {
                const scrollAmount = this.socialMediaContainer.offsetWidth * 0.8;
                this.socialMediaContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        if (this.socialMediaRight && this.socialMediaContainer) {
            this.socialMediaRight.addEventListener('click', () => {
                const scrollAmount = this.socialMediaContainer.offsetWidth * 0.8;
                this.socialMediaContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    }

    async fetchSocialMediaPosts() {
        // Show loading state
        this.socialMediaContainer.innerHTML = '<div class="loading-spinner">Loading social media posts...</div>';

        try {
            const payload = {
                type: 'draft',
                accounts: Object.values(this.platformAccounts).join(','),
                skip: '0',
                limit: '30',
                includeUsers: 'true',
                postType: 'post'
            };

            console.log('📱 Fetching social media posts...', payload);

            const response = await fetch(`${CONFIG.apiBaseUrl}/social-media-posting/${CONFIG.locationId}/posts/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Full API Response:', data);

            // Posts are nested in results.posts, not at top level
            const posts = data.results?.posts || data.posts || [];

            console.log(`✅ Found ${posts.length} social media posts`);
            if (posts.length > 0) {
                console.log('📝 First post sample:', posts[0]);
            }

            // Sort posts by createdAt (most recent first)
            posts.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA; // Most recent first
            });

            // Store posts
            this.currentPosts = posts;

            this.displaySocialMediaPosts(posts);

        } catch (error) {
            console.error('❌ Error fetching social media posts:', error);
            this.socialMediaContainer.innerHTML = '<div class="social-media-placeholder">Error loading social media posts. Please try again later.</div>';
        }
    }

    async fetchAudioUsage() {
        // Check if API key is configured
        if (!CONFIG.xiApiKey || CONFIG.xiApiKey === '' || CONFIG.xiApiKey === 'YOUR_ELEVENLABS_API_KEY_HERE') {
            console.log('⚠️ Audio service not configured');
            this.updateAudioUsageBar(0, 0, false);
            return;
        }

        try {
            console.log('🎤 Fetching audio usage...');

            const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
                method: 'GET',
                headers: {
                    'xi-api-key': CONFIG.xiApiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const characterCount = data.character_count || 0;
            const characterLimit = data.character_limit || 0;

            this.updateAudioUsageBar(characterCount, characterLimit, true);

        } catch (error) {
            console.error('❌ Error fetching audio usage:', error);
            this.updateAudioUsageBar(0, 0, false);
        }
    }

    async fetchVideoUsage() {
        // Check if API key is configured
        if (!CONFIG.xApiKey || CONFIG.xApiKey === '' || CONFIG.xApiKey === 'YOUR_HEYGEN_API_KEY_HERE') {
            console.log('⚠️ Video service not configured');
            this.updateVideoUsageBar(0, false);
            return;
        }

        try {
            console.log('🎥 Fetching video usage...');

            const response = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
                method: 'GET',
                headers: {
                    'x-api-key': CONFIG.xApiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const remainingQuota = data.data?.remaining_quota || 0;

            this.updateVideoUsageBar(remainingQuota, true);

        } catch (error) {
            console.error('❌ Error fetching video usage:', error);
            this.updateVideoUsageBar(0, false);
        }
    }

    updateAudioUsageBar(characterCount, characterLimit, hasData) {
        const wrapper = document.getElementById('audioUsageWrapper');
        const fill = document.getElementById('audioUsageFill');
        const text = document.getElementById('audioUsageText');
        const overlay = document.getElementById('audioUsageOverlay');

        if (!fill || !text || !overlay || !wrapper) {
            console.warn('⚠️ Audio usage bar elements not found');
            return;
        }

        if (!hasData) {
            fill.style.width = '0%';
            text.textContent = '--/--';
            overlay.style.display = 'none';
            wrapper.style.opacity = '0.5';
            return;
        }

        wrapper.style.opacity = '1';

        // Calculate percentage
        const percentage = characterLimit > 0 ? (characterCount / characterLimit) * 100 : 0;

        // Update fill width
        fill.style.width = `${Math.min(percentage, 100)}%`;

        // Update text
        text.textContent = `${characterCount.toLocaleString()}/${characterLimit.toLocaleString()}`;

        // Show overlay if over limit
        if (characterCount >= characterLimit) {
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }

        console.log(`🎤 Audio usage updated: ${characterCount}/${characterLimit} (${percentage.toFixed(1)}%)`);
    }

    updateVideoUsageBar(remainingQuota, hasData) {
        const wrapper = document.getElementById('videoUsageWrapper');
        const fill = document.getElementById('videoUsageFill');
        const text = document.getElementById('videoUsageText');

        if (!fill || !text || !wrapper) {
            console.warn('⚠️ Video usage bar elements not found');
            return;
        }

        if (!hasData) {
            fill.style.width = '0%';
            text.textContent = '--/1660';
            wrapper.style.opacity = '0.5';
            return;
        }

        wrapper.style.opacity = '1';

        // Calculate credits: remaining_quota / 60
        const credits = remainingQuota / 60;
        const maxCredits = 1660;

        // Calculate percentage
        const percentage = (credits / maxCredits) * 100;

        // Update fill width
        fill.style.width = `${Math.min(percentage, 100)}%`;

        // Update text
        text.textContent = `${credits.toFixed(1)}/1660`;

        console.log(`🎥 Video usage updated: ${remainingQuota} quota = ${credits.toFixed(1)}/1660 credits (${percentage.toFixed(1)}%)`);
    }

    displaySocialMediaPosts(posts) {
        // Debug: Log all post statuses
        if (posts.length > 0) {
            const statuses = posts.map(p => p.status);
            console.log('📊 All post statuses:', statuses);
            console.log('📊 Unique statuses:', [...new Set(statuses)]);
        }

        // Filter out hidden posts and posts without media URLs
        const relevantPosts = posts.filter(post => {
            const postId = post.postId || post._id;
            const isNotHidden = !this.hiddenPosts.has(postId);

            // Check if post has valid media with URL
            const hasValidMedia = post.media && Array.isArray(post.media) &&
                post.media.some(item => item.url && item.url.trim() !== '');

            if (!hasValidMedia) {
                console.log(`🚫 Filtering out post ${postId} - no valid media URL`);
            }

            return isNotHidden && hasValidMedia;
        });

        console.log(`🔍 Filtered ${relevantPosts.length} relevant posts from ${posts.length} total`);

        if (relevantPosts.length === 0) {
            this.socialMediaContainer.innerHTML = '<div class="social-media-placeholder">No draft posts found.</div>';
            this.hideSocialMediaChevrons();
            return;
        }

        this.socialMediaContainer.innerHTML = '';

        relevantPosts.forEach(post => {
            const card = this.createSocialMediaCard(post);
            this.socialMediaContainer.appendChild(card);
        });

        // Show chevrons if there are posts
        if (relevantPosts.length > 0) {
            this.showSocialMediaChevrons();
        }
    }

    createSocialMediaCard(post) {
        const card = document.createElement('div');
        card.className = 'media-card';
        card.dataset.postId = post.postId || post._id;

        // Get platform name from accountIds
        const platform = this.getPlatformFromAccountId(post.accountIds?.[0] || '');

        // Get media (image or video)
        const media = post.media?.[0];
        const mediaUrl = media?.url || '';
        const mediaType = media?.type || '';

        // Set data-type for filtering
        card.dataset.type = mediaType.startsWith('video') ? 'video' : 'image';

        // Format status
        const status = post.status || 'unknown';
        const scheduleDate = post.scheduleDate || post.displayDate;
        const formattedDate = scheduleDate ? this.formatDateTime(scheduleDate) : 'Not scheduled';

        // Truncate summary for preview
        const summary = post.summary || 'No caption available';
        const truncatedSummary = summary.length > 150 ? summary.substring(0, 150) + '...' : summary;

        card.innerHTML = `
            <div class="social-media-card-header">
                <div class="social-media-platform-badge ${platform}">
                    ${this.getPlatformIcon(platform)}
                    <span>${platform}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div class="social-media-status-badge ${status}">
                        ${status === 'scheduled' ? '📅' : '📝'} ${status}
                    </div>
                    <button class="hide-post-btn" title="Hide this post">
                        Hide
                    </button>
                </div>
            </div>

            ${mediaUrl ? `
                <div class="social-media-card-media">
                    ${mediaType.startsWith('video') ?
                    `<video src="${mediaUrl}" controls style="width: 100%; border-radius: 0.5rem;"></video>` :
                    `<img src="${mediaUrl}" alt="Post media" style="width: 100%; border-radius: 0.5rem; object-fit: cover;">`
                }
                </div>
            ` : ''}

            <div class="social-media-card-content">
                <p class="social-media-caption">${truncatedSummary}</p>
                ${summary.length > 150 ? `<button class="read-more-btn">Read more</button>` : ''}
            </div>

            <div class="social-media-card-footer">
                <div class="social-media-schedule">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${formattedDate}</span>
                </div>
                <div class="social-media-actions">
                    <button class="delete-post-btn" title="Delete this post">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                    ${status === 'draft' ? `
                        <button class="schedule-btn" title="Schedule this post">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Schedule
                        </button>
                        <button class="post-now-btn" title="Publish this post now">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="10 8 16 12 10 16"></polyline>
                            </svg>
                            Post Now
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        // Store full post data for read more and post now
        card.dataset.fullSummary = summary;
        card.dataset.postData = JSON.stringify(post);

        // Add read more handler if truncated
        if (summary.length > 150) {
            const readMoreBtn = card.querySelector('.read-more-btn');
            readMoreBtn.addEventListener('click', () => {
                this.showPopup('Post Caption', summary, true);
            });
        }

        // Add post now handler for draft posts
        if (status === 'draft') {
            const postNowBtn = card.querySelector('.post-now-btn');
            postNowBtn.addEventListener('click', () => {
                this.publishPost(post);
            });

            // Add schedule handler for draft posts
            const scheduleBtn = card.querySelector('.schedule-btn');
            scheduleBtn.addEventListener('click', () => {
                this.showSchedulePopup(post);
            });
        }

        // Add delete handler (for both draft and scheduled posts)
        const deleteBtn = card.querySelector('.delete-post-btn');
        deleteBtn.addEventListener('click', () => {
            this.deletePost(post);
        });

        // Add hide handler
        const hideBtn = card.querySelector('.hide-post-btn');
        hideBtn.addEventListener('click', () => {
            this.hidePost(post);
        });

        return card;
    }

    getPlatformFromAccountId(accountId) {
        for (const [platform, id] of Object.entries(this.platformAccounts)) {
            if (accountId === id) {
                return platform.charAt(0).toUpperCase() + platform.slice(1);
            }
        }
        return 'Unknown';
    }

    getPlatformIcon(platform) {
        const icons = {
            'Facebook': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            'Instagram': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            'Threads': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068V12c.015-3.63.905-6.498 2.646-8.533C6.014 1.367 8.765.137 12.29.007c.33-.013.66-.007.99.006 3.354.148 5.994 1.39 7.848 3.695 1.756 2.182 2.667 5.068 2.709 8.582v.062c-.027 3.553-.923 6.406-2.665 8.484-1.808 2.156-4.413 3.164-8.005 3.164zm-.108-22.5c-.273 0-.549.003-.825.014-2.976.114-5.235 1.129-6.715 3.02-1.495 1.908-2.248 4.489-2.238 7.676v.05c0 3.143.745 5.683 2.214 7.552 1.428 1.817 3.622 2.822 6.523 2.987l.138.002c3.133 0 5.239-.828 6.637-2.608 1.505-1.918 2.269-4.556 2.27-7.841v-.031c-.037-3.141-.822-5.725-2.335-7.686-1.523-1.973-3.688-3.016-6.44-3.1-.075-.002-.152-.005-.229-.005zm5.443 12.163c-.229-1.542-.876-2.752-1.924-3.601-.956-.776-2.152-1.189-3.556-1.228l-.016-.001c-1.59 0-2.968.519-4.1 1.543-.048.044-.095.089-.14.136l-.875-.904c.057-.058.117-.114.178-.169 1.335-1.209 3-1.824 4.952-1.824l.024.001c1.658.045 3.072.534 4.203 1.454 1.217.99 1.997 2.4 2.32 4.193l-1.066.4zm-5.32-3.35c1.169.033 2.14.366 2.888.99.813.679 1.303 1.631 1.459 2.834.068.523.074 1.058.019 1.588l-1.061-.397c.025-.395.012-.793-.039-1.186-.11-.848-.445-1.523-1-2.009-.524-.458-1.208-.694-2.033-.703h-.023c-.968 0-1.782.292-2.422.868-.678.61-1.05 1.488-1.105 2.61-.055 1.124.183 2.074.709 2.826.515.736 1.234 1.133 2.137 1.179l.09.002c.782 0 1.424-.233 1.908-.693.449-.427.696-1.001.735-1.704.03-.549-.083-.997-.337-1.33-.236-.31-.579-.507-1.02-.586-.172-.03-.346-.045-.52-.045-.57 0-1.05.153-1.426.456-.345.277-.522.649-.527 1.107v.029c.012.33.143.587.388.762.272.195.62.283 1.064.27l.04-.002c.256-.012.457-.06.598-.143l.425 1.003c-.27.142-.619.23-1.037.261-.115.008-.229.012-.342.012-.687 0-1.27-.175-1.73-.521-.51-.382-.782-.92-.809-1.6v-.05c.01-.801.335-1.463.966-1.97.605-.486 1.365-.732 2.26-.732.246 0 .492.021.735.062.686.123 1.239.428 1.643.907.43.51.642 1.171.63 1.963-.057 1.036-.424 1.87-1.091 2.481-.702.643-1.614.968-2.71.968l-.115-.002c-1.267-.065-2.285-.625-3.027-1.664-.71-1.002-1.03-2.252-.952-3.718.08-1.503.599-2.702 1.546-3.565.896-.815 2.003-1.229 3.293-1.229h.024z"/></svg>',
            'Gbp': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
            'Linkedin': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
            'Tiktok': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
            'Youtube': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            'Pinterest': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>',
            'Community': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/></svg>',
            'Bluesky': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>',
            'Unknown': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        return icons[platform] || icons['Unknown'];
    }

    async publishPost(post) {
        if (!confirm(`Are you sure you want to publish this post now?`)) {
            return;
        }

        try {
            console.log('📤 Publishing post:', post._id);

            // Create simplified payload - only send essential fields that need updating
            const payload = {
                status: 'published', // Change from draft to published
                accountIds: post.accountIds || [],
                summary: post.summary || '',
                type: post.type || 'post',
                userId: post.createdBy || '' // Use createdBy as userId
            };

            // Include media if present
            if (post.media && post.media.length > 0) {
                payload.media = post.media;
            }

            // Include platform-specific details if they exist
            if (post.facebookPostDetails) {
                payload.facebookPostDetails = post.facebookPostDetails;
            }
            if (post.instagramPostDetails) {
                payload.instagramPostDetails = post.instagramPostDetails;
            }
            if (post.linkedinPostDetails) {
                payload.linkedinPostDetails = post.linkedinPostDetails;
            }
            if (post.tiktokPostDetails) {
                payload.tiktokPostDetails = post.tiktokPostDetails;
            }
            if (post.youtubePostDetails) {
                payload.youtubePostDetails = post.youtubePostDetails;
            }
            if (post.gmbPostDetails) {
                payload.gmbPostDetails = post.gmbPostDetails;
            }
            if (post.pinterestPostDetails) {
                payload.pinterestPostDetails = post.pinterestPostDetails;
            }

            const response = await fetch(`${CONFIG.apiBaseUrl}/social-media-posting/${CONFIG.locationId}/posts/${post._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Post published successfully:', result);

            // Show success message
            this.showToast('Post published successfully! 🎉', 'success');

            // Refresh posts to show updated status
            this.fetchSocialMediaPosts();

        } catch (error) {
            console.error('❌ Error publishing post:', error);
            this.showToast('Failed to publish post. Please try again.', 'error');
        }
    }

    showConfirmDialog(title, message, onConfirm) {
        // Remove any existing confirm dialogs
        const existingDialog = document.querySelector('.confirm-dialog-overlay');
        if (existingDialog) {
            existingDialog.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'confirm-dialog-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: var(--card-bg);
            border: 1px solid var(--glass-border);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        dialog.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 0.75rem 0; color: var(--text-primary); font-size: 1.25rem;">${title}</h3>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">${message}</p>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                <button id="cancelDialogBtn" style="
                    padding: 0.75rem 1.5rem;
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.5rem;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    Cancel
                </button>
                <button id="confirmDialogBtn" style="
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border: none;
                    border-radius: 0.5rem;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    Delete
                </button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Add event listeners
        const cancelBtn = dialog.querySelector('#cancelDialogBtn');
        const confirmBtn = dialog.querySelector('#confirmDialogBtn');

        const closeDialog = () => {
            overlay.remove();
        };

        cancelBtn.addEventListener('click', closeDialog);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog();
            }
        });

        confirmBtn.addEventListener('click', () => {
            closeDialog();
            onConfirm();
        });

        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    async deletePost(post) {
        this.showConfirmDialog(
            'Delete Post',
            'Are you sure you want to delete this post? This action cannot be undone.',
            async () => {
                try {
                    const postId = post.postId || post._id;
                    console.log('🗑️ Deleting post:', postId);

                    const response = await fetch(`${CONFIG.apiBaseUrl}/social-media-posting/${CONFIG.locationId}/posts/${postId}`, {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                            'Version': '2021-07-28',
                            'Authorization': `Bearer ${CONFIG.apiToken}`
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('❌ API Error:', errorData);
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    console.log('✅ Post deleted successfully');

                    // Show success message
                    this.showToast('Post deleted successfully! 🗑️', 'success');

                    // Refresh posts to remove deleted post
                    this.fetchSocialMediaPosts();

                } catch (error) {
                    console.error('❌ Error deleting post:', error);
                    this.showToast('Failed to delete post. Please try again.', 'error');
                }
            }
        );
    }

    hidePost(post) {
        const postId = post.postId || post._id;
        this.hiddenPosts.add(postId);

        // Find and remove the card from DOM with animation
        const card = document.querySelector(`[data-post-id="${postId}"]`);
        if (card) {
            card.style.transition = 'opacity 0.3s, transform 0.3s';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.remove();

                // Check if we need to show placeholder
                const container = this.socialMediaContainer;
                if (container && container.children.length === 0) {
                    container.innerHTML = '<div class="social-media-placeholder">No draft posts found.</div>';
                    this.hideSocialMediaChevrons();
                }
            }, 300);
        }
    }

    showSchedulePopup(post) {
        // Remove any existing popups
        const existingPopup = document.querySelector('.schedule-popup-overlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'schedule-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        //Get current date/time or use existing schedule date
        const now = new Date();
        let selectedDate = post.scheduleDate ? new Date(post.scheduleDate) : new Date(now.getTime() + 3600000); // 1 hour from now

        // State for calendar
        let viewingMonth = selectedDate.getMonth();
        let viewingYear = selectedDate.getFullYear();
        let selectedHour = String(selectedDate.getHours()).padStart(2, '0');
        let selectedMinute = String(selectedDate.getMinutes()).padStart(2, '0');

        const popup = document.createElement('div');
        popup.className = 'schedule-popup-content';
        popup.style.cssText = `
            background: var(--card-bg);
            border: 1px solid var(--glass-border);
            border-radius: 1rem;
            padding: 1.5rem;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        const renderCalendar = () => {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            const firstDay = new Date(viewingYear, viewingMonth, 1).getDay();
            const daysInMonth = new Date(viewingYear, viewingMonth + 1, 0).getDate();
            const prevMonthDays = new Date(viewingYear, viewingMonth, 0).getDate();

            let calendarHTML = `
                <div style="margin-bottom: 1rem;">
                    <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 1.25rem;">Schedule Post</h3>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">Select date and time</p>
                </div>

                <!-- Month/Year Navigator -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <button class="calendar-nav-btn" data-action="prev-month" style="
                        padding: 0.5rem;
                        background: var(--glass-bg);
                        border: 1px solid var(--glass-border);
                        border-radius: 0.5rem;
                        color: var(--text-primary);
                        cursor: pointer;
                    ">‹</button>
                    <span style="color: var(--text-primary); font-weight: 600; font-size: 1rem;">
                        ${monthNames[viewingMonth]} ${viewingYear}
                    </span>
                    <button class="calendar-nav-btn" data-action="next-month" style="
                        padding: 0.5rem;
                        background: var(--glass-bg);
                        border: 1px solid var(--glass-border);
                        border-radius: 0.5rem;
                        color: var(--text-primary);
                        cursor: pointer;
                    ">›</button>
                </div>

                <!-- Day Names -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; margin-bottom: 0.5rem;">
                    ${dayNames.map(day => `<div style="text-align: center; color: var(--text-tertiary); font-size: 0.75rem; font-weight: 500; padding: 0.25rem;">${day}</div>`).join('')}
                </div>

                <!-- Calendar Days -->
                <div id="calendarDays" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; margin-bottom: 1rem;">
            `;

            // Previous month days (grayed out)
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = prevMonthDays - i;
                calendarHTML += `<div style="text-align: center; padding: 0.5rem; color: var(--text-tertiary); opacity: 0.3; font-size: 0.85rem;">${day}</div>`;
            }

            // Current month days
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(viewingYear, viewingMonth, day);
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                calendarHTML += `
                    <button class="calendar-day-btn" data-day="${day}" ${isPast ? 'disabled' : ''} style="
                        padding: 0.5rem;
                        background: ${isSelected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : isToday ? 'rgba(102, 126, 234, 0.2)' : 'var(--glass-bg)'};
                        border: 1px solid ${isSelected ? 'transparent' : 'var(--glass-border)'};
                        border-radius: 0.375rem;
                        color: ${isSelected ? 'white' : isPast ? 'var(--text-tertiary)' : 'var(--text-primary)'};
                        cursor: ${isPast ? 'not-allowed' : 'pointer'};
                        font-size: 0.85rem;
                        font-weight: ${isSelected ? '600' : '400'};
                        opacity: ${isPast ? '0.4' : '1'};
                    ">${day}</button>
                `;
            }

            calendarHTML += `
                </div>

                <!-- Time Picker -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-size: 0.85rem; font-weight: 500;">Time</label>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <input type="number" id="hourInput" min="0" max="23" value="${selectedHour}" style="
                            width: 4rem;
                            padding: 0.625rem;
                            background: var(--glass-bg);
                            border: 1px solid var(--glass-border);
                            border-radius: 0.5rem;
                            color: var(--text-primary);
                            font-size: 1rem;
                            text-align: center;
                        " />
                        <span style="color: var(--text-primary); font-size: 1.25rem;">:</span>
                        <input type="number" id="minuteInput" min="0" max="59" value="${selectedMinute}" style="
                            width: 4rem;
                            padding: 0.625rem;
                            background: var(--glass-bg);
                            border: 1px solid var(--glass-border);
                            border-radius: 0.5rem;
                            color: var(--text-primary);
                            font-size: 1rem;
                            text-align: center;
                        " />
                    </div>
                </div>

                <!-- Actions -->
                <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                    <button id="cancelScheduleBtn" style="
                        padding: 0.75rem 1.5rem;
                        background: var(--glass-bg);
                        border: 1px solid var(--glass-border);
                        border-radius: 0.5rem;
                        color: var(--text-primary);
                        font-size: 0.9rem;
                        cursor: pointer;
                    ">
                        Cancel
                    </button>
                    <button id="confirmScheduleBtn" style="
                        padding: 0.75rem 1.5rem;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 0.5rem;
                        color: white;
                        font-size: 0.9rem;
                        font-weight: 500;
                        cursor: pointer;
                    ">
                        Schedule Post
                    </button>
                </div>
            `;

            popup.innerHTML = calendarHTML;

            // Event listeners for navigation
            popup.querySelectorAll('.calendar-nav-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.dataset.action === 'prev-month') {
                        viewingMonth--;
                        if (viewingMonth < 0) {
                            viewingMonth = 11;
                            viewingYear--;
                        }
                    } else {
                        viewingMonth++;
                        if (viewingMonth > 11) {
                            viewingMonth = 0;
                            viewingYear++;
                        }
                    }
                    renderCalendar();
                });
            });

            // Event listeners for day selection
            popup.querySelectorAll('.calendar-day-btn').forEach(btn => {
                if (!btn.disabled) {
                    btn.addEventListener('click', () => {
                        const day = parseInt(btn.dataset.day);
                        selectedDate = new Date(viewingYear, viewingMonth, day, parseInt(selectedHour), parseInt(selectedMinute));
                        renderCalendar();
                    });
                }
            });

            // Time input listeners
            const hourInput = popup.querySelector('#hourInput');
            const minuteInput = popup.querySelector('#minuteInput');

            hourInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value) || 0;
                if (val < 0) val = 0;
                if (val > 23) val = 23;
                selectedHour = String(val).padStart(2, '0');
                e.target.value = selectedHour;
                selectedDate.setHours(val);
            });

            minuteInput.addEventListener('change', (e) => {
                let val = parseInt(e.target.value) || 0;
                if (val < 0) val = 0;
                if (val > 59) val = 59;
                selectedMinute = String(val).padStart(2, '0');
                e.target.value = selectedMinute;
                selectedDate.setMinutes(val);
            });

            // Cancel button
            popup.querySelector('#cancelScheduleBtn').addEventListener('click', () => {
                overlay.remove();
            });

            // Confirm button
            popup.querySelector('#confirmScheduleBtn').addEventListener('click', () => {
                const finalDate = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    parseInt(selectedHour),
                    parseInt(selectedMinute)
                );

                if (finalDate < now) {
                    this.showToast('Please select a future date and time', 'error');
                    return;
                }

                overlay.remove();
                this.schedulePost(post, finalDate.toISOString());
            });
        };

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        renderCalendar();

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    async schedulePost(post, scheduleDate) {
        try {
            console.log('📅 Scheduling post:', post._id, 'for', scheduleDate);

            // Create payload with all fields from original post
            const payload = {
                status: 'scheduled', // Change from draft to scheduled
                scheduleDate: scheduleDate, // New schedule date
                accountIds: post.accountIds || [],
                summary: post.summary || '',
                type: post.type || 'post',
                userId: post.createdBy || '' // Use createdBy as userId
            };

            // Include media if present
            if (post.media && post.media.length > 0) {
                payload.media = post.media;
            }

            // Include platform-specific details if they exist
            if (post.facebookPostDetails) {
                payload.facebookPostDetails = post.facebookPostDetails;
            }
            if (post.instagramPostDetails) {
                payload.instagramPostDetails = post.instagramPostDetails;
            }
            if (post.linkedinPostDetails) {
                payload.linkedinPostDetails = post.linkedinPostDetails;
            }
            if (post.tiktokPostDetails) {
                payload.tiktokPostDetails = post.tiktokPostDetails;
            }
            if (post.youtubePostDetails) {
                payload.youtubePostDetails = post.youtubePostDetails;
            }
            if (post.gmbPostDetails) {
                payload.gmbPostDetails = post.gmbPostDetails;
            }
            if (post.pinterestPostDetails) {
                payload.pinterestPostDetails = post.pinterestPostDetails;
            }

            const response = await fetch(`${CONFIG.apiBaseUrl}/social-media-posting/${CONFIG.locationId}/posts/${post._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Post scheduled successfully:', result);

            // Show success message
            const formattedDate = this.formatDateTime(scheduleDate);
            this.showToast(`Post scheduled for ${formattedDate}! 📅`, 'success');

            // Refresh posts to show updated status
            this.fetchSocialMediaPosts();

        } catch (error) {
            console.error('❌ Error scheduling post:', error);
            this.showToast('Failed to schedule post. Please try again.', 'error');
        }
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    startPostsRefresh() {
        // Clear any existing timer
        if (this.postsRefreshTimer) {
            clearInterval(this.postsRefreshTimer);
        }

        // Refresh posts display every minute
        this.postsRefreshTimer = setInterval(() => {
            if (this.currentPosts && this.currentPosts.length > 0) {
                console.log('🔄 Refreshing social media posts display...');
                this.displaySocialMediaPosts(this.currentPosts);
            }
        }, 60000); // Refresh every 60 seconds
    }

    stopPostsRefresh() {
        if (this.postsRefreshTimer) {
            clearInterval(this.postsRefreshTimer);
            this.postsRefreshTimer = null;
        }
    }

    showSocialMediaChevrons() {
        if (this.socialMediaLeft) this.socialMediaLeft.style.display = 'flex';
        if (this.socialMediaRight) this.socialMediaRight.style.display = 'flex';
    }

    hideSocialMediaChevrons() {
        if (this.socialMediaLeft) this.socialMediaLeft.style.display = 'none';
        if (this.socialMediaRight) this.socialMediaRight.style.display = 'none';
    }

    // Thumbnails Section
    initThumbnails() {
        // Fetch thumbnails
        this.fetchThumbnails();

        // Set up scroll handlers
        if (this.thumbnailsLeft && this.thumbnailsContainer) {
            this.thumbnailsLeft.addEventListener('click', () => {
                this.thumbnailsContainer.scrollBy({ left: -400, behavior: 'smooth' });
            });
        }

        if (this.thumbnailsRight && this.thumbnailsContainer) {
            this.thumbnailsRight.addEventListener('click', () => {
                this.thumbnailsContainer.scrollBy({ left: 400, behavior: 'smooth' });
            });
        }
    }

    async fetchThumbnails() {
        // Show loading state
        this.thumbnailsContainer.innerHTML = '<div class="loading-spinner">Loading thumbnails...</div>';

        try {
            console.log('🖼️ Fetching thumbnails...');

            if (!CONFIG.airtableApiKey || CONFIG.airtableApiKey === 'YOUR_AIRTABLE_API_KEY_HERE') {
                throw new Error('Storage service not configured');
            }

            // Fetch 100 records sorted by Created field descending (most recent first)
            // We'll filter out entries without Video URL and take first 30
            const url = new URL(`https://api.airtable.com/v0/${CONFIG.airtableBaseId}/${CONFIG.airtableTableId}`);
            url.searchParams.append('maxRecords', '100');
            url.searchParams.append('sort[0][field]', 'Created'); // Sort by creation date
            url.searchParams.append('sort[0][direction]', 'desc'); // Most recent first

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${CONFIG.airtableApiKey}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Storage service error:', response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            let records = data.records || [];
            console.log(`✅ Fetched ${records.length} thumbnail records`);

            // Filter out records without Video URL
            const recordsWithVideo = records.filter(record => {
                const videoUrl = record.fields['Video Url'];
                const hasVideo = videoUrl && videoUrl.trim() !== '';
                if (!hasVideo) {
                    console.log(`🚫 Filtering out record without Video URL:`, record.id);
                }
                return hasVideo;
            });

            console.log(`📹 Found ${recordsWithVideo.length} records with Video URL from ${records.length} total`);

            // Take first 30 records with video
            const finalRecords = recordsWithVideo.slice(0, 30);
            console.log(`📊 Displaying ${finalRecords.length} thumbnails (last 30 with Video URL)`);

            this.displayThumbnails(finalRecords);

        } catch (error) {
            console.error('❌ Error fetching thumbnails:', error);
            this.thumbnailsContainer.innerHTML = '<div class="thumbnails-placeholder">Error loading thumbnails. Please try again later.</div>';
        }
    }

    displayThumbnails(records) {
        // Filter out hidden thumbnails and thumbnails without media
        const relevantRecords = records.filter(record => {
            const thumbnailId = record.id;
            const isNotHidden = !this.hiddenThumbnails.has(thumbnailId);

            // Check if thumbnail has valid media
            const fields = record.fields;
            const hasValidMedia = fields['Image url'] && fields['Image url'].trim() !== '';

            if (!hasValidMedia) {
                console.log(`🚫 Filtering out thumbnail ${thumbnailId} - no valid image URL`);
            }

            return isNotHidden && hasValidMedia;
        });

        console.log(`🔍 Filtered ${relevantRecords.length} relevant thumbnails from ${records.length} total`);

        if (relevantRecords.length === 0) {
            this.thumbnailsContainer.innerHTML = '<div class="thumbnails-placeholder">No thumbnails found.</div>';
            this.hideThumbnailsChevrons();
            return;
        }

        this.thumbnailsContainer.innerHTML = '';

        relevantRecords.forEach(record => {
            const card = this.createThumbnailCard(record);
            this.thumbnailsContainer.appendChild(card);
        });

        // Show chevrons if there are thumbnails
        if (relevantRecords.length > 0) {
            this.showThumbnailsChevrons();
        }
    }

    createThumbnailCard(record) {
        const card = document.createElement('div');
        card.className = 'thumbnail-card';
        card.dataset.thumbnailId = record.id;

        const fields = record.fields;
        const caption = fields.Caption || '';
        const imageUrl = fields['Image url'] || '';
        const videoUrl = fields['Video Url'] || '';

        // Create image HTML with fallback
        const imageHtml = imageUrl ? `
            <div class="thumbnail-image" ${videoUrl ? `data-video-url="${videoUrl}"` : ''}>
                <img src="${imageUrl}" alt="Thumbnail" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22320%22%3E%3Crect width=%22320%22 height=%22320%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3EImage not available%3C/text%3E%3C/svg%3E'">
                ${videoUrl ? `
                <div class="thumbnail-play-overlay">
                    <svg viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
                ` : ''}
            </div>
        ` : '<div class="thumbnail-image" style="height: 320px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.05); color: var(--text-tertiary); font-size: 0.875rem;">No image available</div>';

        card.innerHTML = `
            <div class="thumbnail-card-header">
                <button class="hide-thumbnail-btn" title="Hide this thumbnail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            ${imageHtml}
            <div class="thumbnail-caption">${this.escapeHtml(caption)}</div>
            <div class="thumbnail-actions">
                ${videoUrl ? `
                <button class="thumbnail-btn thumbnail-watch-btn" data-video-url="${this.escapeHtml(videoUrl)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Watch Video
                </button>
                ` : ''}
                <button class="thumbnail-btn thumbnail-copy-btn" data-caption="${this.escapeHtml(caption)}" data-video-url="${this.escapeHtml(videoUrl)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Caption
                </button>
            </div>
        `;

        // Add event listeners to buttons
        const hideBtn = card.querySelector('.hide-thumbnail-btn');
        hideBtn.addEventListener('click', () => {
            this.hideThumbnail(record);
        });

        const thumbnailImage = card.querySelector('.thumbnail-image[data-video-url]');
        if (thumbnailImage && videoUrl) {
            thumbnailImage.addEventListener('click', () => this.openVideoUrl(videoUrl));
        }

        const watchBtn = card.querySelector('.thumbnail-watch-btn');
        if (watchBtn) {
            watchBtn.addEventListener('click', () => {
                const url = watchBtn.dataset.videoUrl;
                this.openVideoUrl(url);
            });
        }

        const copyBtn = card.querySelector('.thumbnail-copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const caption = copyBtn.dataset.caption;
                const videoUrl = copyBtn.dataset.videoUrl;

                // Combine caption and video URL
                let textToCopy = caption;
                if (videoUrl && videoUrl.trim() !== '') {
                    textToCopy = `${caption}\n\nVideo: ${videoUrl}`;
                }

                this.copyToClipboard(textToCopy, 'Caption & Video Link');
            });
        }

        return card;
    }

    openVideoUrl(url) {
        if (url && url.trim() !== '') {
            window.open(url, '_blank');
        }
    }

    copyToClipboard(text, label = 'Text') {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast(`${label} copied to clipboard! 📋`, 'success');
        }).catch(err => {
            console.error('Failed to copy text:', err);
            this.showToast(`Failed to copy ${label.toLowerCase()}`, 'error');
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showThumbnailsChevrons() {
        if (this.thumbnailsLeft) this.thumbnailsLeft.style.display = 'flex';
        if (this.thumbnailsRight) this.thumbnailsRight.style.display = 'flex';
    }

    hideThumbnailsChevrons() {
        if (this.thumbnailsLeft) this.thumbnailsLeft.style.display = 'none';
        if (this.thumbnailsRight) this.thumbnailsRight.style.display = 'none';
    }

    hideThumbnail(record) {
        const thumbnailId = record.id;
        this.hiddenThumbnails.add(thumbnailId);

        // Find and remove the card from DOM with animation
        const card = document.querySelector(`[data-thumbnail-id="${thumbnailId}"]`);
        if (card) {
            card.style.transition = 'opacity 0.3s, transform 0.3s';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.remove();

                // Check if we need to show placeholder
                const container = this.thumbnailsContainer;
                if (container && container.children.length === 0) {
                    container.innerHTML = '<div class="thumbnails-placeholder">No thumbnails found.</div>';
                    this.hideThumbnailsChevrons();
                }
            }, 300);
        }
    }

    // Blog Section
    initBlogs() {
        // Fetch all blogs on initialization
        this.fetchBlogs();
    }

    async fetchBlogs() {
        try {
            console.log('📚 Fetching blogs...');

            const response = await fetch(`${CONFIG.apiBaseUrl}/blogs/site/all?locationId=${CONFIG.locationId}&skip=0&limit=20`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Blogs API Response:', data);

            const blogs = data.data || [];
            this.currentBlogs = blogs;

            console.log(`✅ Found ${blogs.length} blogs`);

            // Populate dropdown
            this.populateBlogDropdown(blogs);

            // Show refresh button if there are blogs
            if (blogs.length > 0 && this.blogRefreshBtn) {
                this.blogRefreshBtn.style.display = 'flex';
            }

            // Auto-select and load the first blog
            if (blogs.length > 0) {
                const firstBlog = blogs[0];
                this.selectedBlogId = firstBlog._id;
                this.blogDropdown.value = firstBlog._id;
                this.fetchBlogPosts(firstBlog._id);
                console.log(`🎯 Auto-selected first blog: ${firstBlog.name}`);
            }

        } catch (error) {
            console.error('❌ Error fetching blogs:', error);
            this.blogDropdown.innerHTML = '<option value="">Error loading blogs</option>';
        }
    }

    populateBlogDropdown(blogs) {
        // Clear existing options except the first one
        this.blogDropdown.innerHTML = '<option value="">Select a blog...</option>';

        blogs.forEach(blog => {
            const option = document.createElement('option');
            option.value = blog._id;
            option.textContent = blog.name;
            this.blogDropdown.appendChild(option);
        });

        console.log(`📋 Populated dropdown with ${blogs.length} blogs`);
    }

    async fetchBlogPosts(blogId) {
        this.blogContainer.innerHTML = '<div class="loading-spinner">Loading blog posts...</div>';

        try {
            console.log(`📝 Fetching blog posts for blog: ${blogId}`);

            const response = await fetch(`${CONFIG.apiBaseUrl}/blogs/posts/all?locationId=${CONFIG.locationId}&blogId=${blogId}&limit=10&offset=0&status=DRAFT`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Blog Posts API Response:', data);

            const posts = data.blogs || []; // Changed from data.posts to data.blogs
            this.currentBlogPosts = posts;

            console.log(`✅ Found ${posts.length} blog posts`);

            this.displayBlogPosts(posts);

        } catch (error) {
            console.error('❌ Error fetching blog posts:', error);
            this.blogContainer.innerHTML = '<div class="blog-placeholder">Error loading blog posts. Please try again later.</div>';
        }
    }

    displayBlogPosts(posts) {
        if (posts.length === 0) {
            this.blogContainer.innerHTML = '<div class="blog-placeholder">No blog posts found.</div>';
            this.hideBlogChevrons();
            return;
        }

        this.blogContainer.innerHTML = '';

        posts.forEach(post => {
            const card = this.createBlogCard(post);
            this.blogContainer.appendChild(card);
        });

        // Show chevrons if there are posts
        if (posts.length > 0) {
            this.showBlogChevrons();
        }
    }

    createBlogCard(post) {
        const card = document.createElement('div');
        card.className = 'blog-card';

        const title = post.title || 'Untitled Post';
        const imageUrl = post.imageUrl || '';
        const description = post.description || '';
        const status = post.status || 'DRAFT';
        const postId = post._id;

        // Construct preview URL
        const previewUrl = `https://app.nxai.com.au/v2/location/${CONFIG.locationId}/blogs/post/${postId}/preview`;

        // Determine status class
        let statusClass = 'status-draft';
        if (status === 'PUBLISHED') {
            statusClass = 'status-published';
        } else if (status === 'SCHEDULED') {
            statusClass = 'status-scheduled';
        }

        // Create image HTML with fallback
        const imageHtml = imageUrl ? `
            <div class="blog-image">
                <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22%3E%3Crect width=%22320%22 height=%22180%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3EImage not available%3C/text%3E%3C/svg%3E'">
            </div>
        ` : `
            <div class="blog-image">
                <img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22%3E%3Crect width=%22320%22 height=%22180%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3ENo image%3C/text%3E%3C/svg%3E" alt="No image">
            </div>
        `;

        card.innerHTML = `
            ${imageHtml}
            <div class="blog-content">
                <h3 class="blog-post-title">${title}</h3>
                ${description ? `<p class="blog-description">${description}</p>` : ''}
                <div class="blog-meta">
                    <span class="blog-status ${statusClass}">${status}</span>
                    <a href="${previewUrl}" target="_blank" class="blog-preview-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Preview
                    </a>
                </div>
                <div class="blog-actions">
                    <button class="blog-action-btn delete-blog-btn" title="Delete post">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                    <button class="blog-action-btn schedule-blog-btn" title="Schedule post">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Schedule
                    </button>
                    <button class="blog-action-btn post-now-blog-btn" title="Post now">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        Post Now
                    </button>
                </div>
            </div>
        `;

        // Add event listeners for action buttons
        const deleteBtn = card.querySelector('.delete-blog-btn');
        deleteBtn.addEventListener('click', () => this.showDeleteConfirmation(post));

        const scheduleBtn = card.querySelector('.schedule-blog-btn');
        scheduleBtn.addEventListener('click', () => this.showBlogSchedulePopup(post));

        const postNowBtn = card.querySelector('.post-now-blog-btn');
        postNowBtn.addEventListener('click', () => this.showPostNowConfirmation(post));

        return card;
    }

    showBlogChevrons() {
        if (this.blogLeft) this.blogLeft.style.display = 'flex';
        if (this.blogRight) this.blogRight.style.display = 'flex';
    }

    hideBlogChevrons() {
        if (this.blogLeft) this.blogLeft.style.display = 'none';
        if (this.blogRight) this.blogRight.style.display = 'none';
    }

    // Blog Post Actions
    showDeleteConfirmation(post) {
        // Remove any existing popups
        const existingPopup = document.querySelector('.blog-confirm-overlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'blog-confirm-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        const popup = document.createElement('div');
        popup.className = 'blog-confirm-content';
        popup.style.cssText = `
            background: var(--card-bg);
            border: 1px solid var(--glass-border);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        popup.innerHTML = `
            <div style="margin-bottom: 1.5rem; text-align: center;">
                <div style="margin-bottom: 1rem;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="margin: 0 auto;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                </div>
                <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 1.25rem;">Delete Blog Post?</h3>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Are you sure you want to delete "${post.title}"? This action will archive the post.</p>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <button class="blog-cancel-btn" style="
                    flex: 1;
                    padding: 0.75rem 1.5rem;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.5rem;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    Cancel
                </button>
                <button class="blog-delete-confirm-btn" style="
                    flex: 1;
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    border: none;
                    border-radius: 0.5rem;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    Delete
                </button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Event listeners
        const cancelBtn = popup.querySelector('.blog-cancel-btn');
        const confirmBtn = popup.querySelector('.blog-delete-confirm-btn');

        cancelBtn.addEventListener('click', () => overlay.remove());
        confirmBtn.addEventListener('click', () => {
            overlay.remove();
            this.deleteBlogPost(post);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    showPostNowConfirmation(post) {
        // Remove any existing popups
        const existingPopup = document.querySelector('.blog-confirm-overlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'blog-confirm-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        const popup = document.createElement('div');
        popup.className = 'blog-confirm-content';
        popup.style.cssText = `
            background: var(--card-bg);
            border: 1px solid var(--glass-border);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        popup.innerHTML = `
            <div style="margin-bottom: 1.5rem; text-align: center;">
                <div style="margin-bottom: 1rem;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="margin: 0 auto;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="9 11 12 14 15 10"></polyline>
                    </svg>
                </div>
                <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 1.25rem;">Publish Blog Post Now?</h3>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Are you sure you want to publish "${post.title}" immediately?</p>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <button class="blog-cancel-btn" style="
                    flex: 1;
                    padding: 0.75rem 1.5rem;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.5rem;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    Cancel
                </button>
                <button class="blog-publish-confirm-btn" style="
                    flex: 1;
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    border: none;
                    border-radius: 0.5rem;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    Publish Now
                </button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Event listeners
        const cancelBtn = popup.querySelector('.blog-cancel-btn');
        const confirmBtn = popup.querySelector('.blog-publish-confirm-btn');

        cancelBtn.addEventListener('click', () => overlay.remove());
        confirmBtn.addEventListener('click', () => {
            overlay.remove();
            this.postBlogNow(post);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    async deleteBlogPost(post) {

        try {
            console.log('🗑️ Deleting blog post:', post._id);

            // Prepare payload with all required fields, changing status to ARCHIVED
            const payload = {
                title: post.title || '',
                locationId: CONFIG.locationId,
                blogId: post.blogId || this.selectedBlogId,
                imageUrl: post.imageUrl || '',
                description: post.description || '',
                rawHTML: post.rawHTML || '',
                status: 'ARCHIVED', // Change to ARCHIVED for delete
                imageAltText: post.imageAltText || '',
                categories: post.categories || [],
                tags: post.tags || [],
                author: post.author || '',
                urlSlug: post.urlSlug || '',
                canonicalLink: post.canonicalLink || '',
                publishedAt: post.publishedAt || new Date().toISOString()
            };

            const response = await fetch(`${CONFIG.apiBaseUrl}/blogs/posts/${post._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Blog post deleted successfully:', result);

            this.showToast('Blog post deleted successfully! 🗑️', 'success');

            // Refresh blog posts
            if (this.selectedBlogId) {
                this.fetchBlogPosts(this.selectedBlogId);
            }

        } catch (error) {
            console.error('❌ Error deleting blog post:', error);
            this.showToast('Failed to delete blog post. Please try again.', 'error');
        }
    }

    async postBlogNow(post) {
        try {
            console.log('📤 Publishing blog post now:', post._id);

            // Prepare payload with all required fields, changing status to PUBLISHED
            const payload = {
                title: post.title || '',
                locationId: CONFIG.locationId,
                blogId: post.blogId || this.selectedBlogId,
                imageUrl: post.imageUrl || '',
                description: post.description || '',
                rawHTML: post.rawHTML || '',
                status: 'PUBLISHED', // Change to PUBLISHED
                imageAltText: post.imageAltText || '',
                categories: post.categories || [],
                tags: post.tags || [],
                author: post.author || '',
                urlSlug: post.urlSlug || '',
                canonicalLink: post.canonicalLink || '',
                publishedAt: new Date().toISOString() // Set to current time
            };

            const response = await fetch(`${CONFIG.apiBaseUrl}/blogs/posts/${post._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Blog post published successfully:', result);

            this.showToast('Blog post published successfully! 🚀', 'success');

            // Refresh blog posts
            if (this.selectedBlogId) {
                this.fetchBlogPosts(this.selectedBlogId);
            }

        } catch (error) {
            console.error('❌ Error publishing blog post:', error);
            this.showToast('Failed to publish blog post. Please try again.', 'error');
        }
    }

    showBlogSchedulePopup(post) {
        // Remove any existing popups
        const existingPopup = document.querySelector('.schedule-popup-overlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'schedule-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        // Get current date/time or use existing schedule date
        const now = new Date();
        let selectedDate = post.publishedAt ? new Date(post.publishedAt) : new Date(now.getTime() + 3600000); // 1 hour from now

        // State for calendar
        let viewingMonth = selectedDate.getMonth();
        let viewingYear = selectedDate.getFullYear();
        let selectedHour = String(selectedDate.getHours()).padStart(2, '0');
        let selectedMinute = String(selectedDate.getMinutes()).padStart(2, '0');

        const popup = document.createElement('div');
        popup.className = 'schedule-popup-content';
        popup.style.cssText = `
            background: var(--card-bg);
            border: 1px solid var(--glass-border);
            border-radius: 1rem;
            padding: 1.5rem;
            max-width: 420px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        const renderCalendar = () => {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            const firstDay = new Date(viewingYear, viewingMonth, 1).getDay();
            const daysInMonth = new Date(viewingYear, viewingMonth + 1, 0).getDate();
            const prevMonthDays = new Date(viewingYear, viewingMonth, 0).getDate();

            let calendarHTML = `
                <div style="margin-bottom: 1rem;">
                    <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 1.25rem;">Schedule Blog Post</h3>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.85rem;">Select date and time</p>
                </div>

                <!-- Month/Year Navigator -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <button class="calendar-nav-btn" data-action="prev-month" style="
                        padding: 0.5rem;
                        background: var(--glass-bg);
                        border: 1px solid var(--glass-border);
                        border-radius: 0.5rem;
                        color: var(--text-primary);
                        cursor: pointer;
                    ">‹</button>
                    <span style="color: var(--text-primary); font-weight: 600; font-size: 1rem;">
                        ${monthNames[viewingMonth]} ${viewingYear}
                    </span>
                    <button class="calendar-nav-btn" data-action="next-month" style="
                        padding: 0.5rem;
                        background: var(--glass-bg);
                        border: 1px solid var(--glass-border);
                        border-radius: 0.5rem;
                        color: var(--text-primary);
                        cursor: pointer;
                    ">›</button>
                </div>

                <!-- Day Names -->
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; margin-bottom: 0.5rem;">
                    ${dayNames.map(day => `<div style="text-align: center; color: var(--text-tertiary); font-size: 0.75rem; font-weight: 500; padding: 0.25rem;">${day}</div>`).join('')}
                </div>

                <!-- Calendar Days -->
                <div id="calendarDays" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; margin-bottom: 1rem;">
            `;

            // Previous month days (grayed out)
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = prevMonthDays - i;
                calendarHTML += `<div style="text-align: center; padding: 0.5rem; color: var(--text-tertiary); opacity: 0.3; font-size: 0.85rem;">${day}</div>`;
            }

            // Current month days
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(viewingYear, viewingMonth, day);
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                calendarHTML += `
                    <button class="calendar-day-btn" data-day="${day}" ${isPast ? 'disabled' : ''} style="
                        padding: 0.5rem;
                        background: ${isSelected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : isToday ? 'rgba(102, 126, 234, 0.2)' : 'var(--glass-bg)'};
                        border: 1px solid ${isSelected ? 'transparent' : 'var(--glass-border)'};
                        border-radius: 0.375rem;
                        color: ${isSelected ? 'white' : isPast ? 'var(--text-tertiary)' : 'var(--text-primary)'};
                        cursor: ${isPast ? 'not-allowed' : 'pointer'};
                        font-size: 0.85rem;
                        font-weight: ${isSelected ? '600' : '400'};
                        opacity: ${isPast ? '0.4' : '1'};
                    ">${day}</button>
                `;
            }

            calendarHTML += `
                </div>

                <!-- Time Picker -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-size: 0.85rem; font-weight: 500;">Time</label>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <input type="number" id="hourInput" min="0" max="23" value="${selectedHour}" style="
                            width: 4rem;
                            padding: 0.625rem;
                            background: var(--glass-bg);
                            border: 1px solid var(--glass-border);
                            border-radius: 0.5rem;
                            color: var(--text-primary);
                            font-size: 1rem;
                            text-align: center;
                        " />
                        <span style="color: var(--text-primary); font-size: 1.25rem;">:</span>
                        <input type="number" id="minuteInput" min="0" max="59" value="${selectedMinute}" style="
                            width: 4rem;
                            padding: 0.625rem;
                            background: var(--glass-bg);
                            border: 1px solid var(--glass-border);
                            border-radius: 0.5rem;
                            color: var(--text-primary);
                            font-size: 1rem;
                            text-align: center;
                        " />
                    </div>
                </div>

                <!-- Actions -->
                <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                    <button id="cancelScheduleBtn" style="
                        padding: 0.75rem 1.5rem;
                        background: var(--glass-bg);
                        border: 1px solid var(--glass-border);
                        border-radius: 0.5rem;
                        color: var(--text-primary);
                        font-size: 0.9rem;
                        cursor: pointer;
                    ">
                        Cancel
                    </button>
                    <button id="confirmScheduleBtn" style="
                        padding: 0.75rem 1.5rem;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 0.5rem;
                        color: white;
                        font-size: 0.9rem;
                        font-weight: 500;
                        cursor: pointer;
                    ">
                        Schedule Post
                    </button>
                </div>
            `;

            popup.innerHTML = calendarHTML;

            // Event listeners for navigation
            popup.querySelectorAll('.calendar-nav-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.dataset.action === 'prev-month') {
                        viewingMonth--;
                        if (viewingMonth < 0) {
                            viewingMonth = 11;
                            viewingYear--;
                        }
                    } else {
                        viewingMonth++;
                        if (viewingMonth > 11) {
                            viewingMonth = 0;
                            viewingYear++;
                        }
                    }
                    renderCalendar();
                });
            });

            // Event listeners for day selection
            popup.querySelectorAll('.calendar-day-btn').forEach(btn => {
                if (!btn.disabled) {
                    btn.addEventListener('click', () => {
                        const day = parseInt(btn.dataset.day);
                        selectedDate = new Date(viewingYear, viewingMonth, day);
                        renderCalendar();
                    });
                }
            });

            // Event listeners for time inputs
            const hourInput = popup.querySelector('#hourInput');
            const minuteInput = popup.querySelector('#minuteInput');

            hourInput.addEventListener('input', () => {
                let val = parseInt(hourInput.value);
                if (val > 23) hourInput.value = 23;
                if (val < 0) hourInput.value = 0;
                selectedHour = String(hourInput.value || 0).padStart(2, '0');
            });

            minuteInput.addEventListener('input', () => {
                let val = parseInt(minuteInput.value);
                if (val > 59) minuteInput.value = 59;
                if (val < 0) minuteInput.value = 0;
                selectedMinute = String(minuteInput.value || 0).padStart(2, '0');
            });

            // Event listeners for action buttons
            popup.querySelector('#cancelScheduleBtn').addEventListener('click', () => {
                overlay.remove();
            });

            popup.querySelector('#confirmScheduleBtn').addEventListener('click', () => {
                const scheduledDateTime = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    parseInt(selectedHour),
                    parseInt(selectedMinute)
                );

                if (scheduledDateTime <= new Date()) {
                    this.showToast('Please select a future date and time', 'error');
                    return;
                }

                overlay.remove();
                this.scheduleBlogPost(post, scheduledDateTime.toISOString());
            });
        };

        renderCalendar();
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    async scheduleBlogPost(post, scheduleDate) {
        try {
            console.log('📅 Scheduling blog post:', post._id, 'for', scheduleDate);

            // Prepare payload with all required fields, changing status to SCHEDULED
            const payload = {
                title: post.title || '',
                locationId: CONFIG.locationId,
                blogId: post.blogId || this.selectedBlogId,
                imageUrl: post.imageUrl || '',
                description: post.description || '',
                rawHTML: post.rawHTML || '',
                status: 'SCHEDULED', // Change to SCHEDULED
                imageAltText: post.imageAltText || '',
                categories: post.categories || [],
                tags: post.tags || [],
                author: post.author || '',
                urlSlug: post.urlSlug || '',
                canonicalLink: post.canonicalLink || '',
                publishedAt: scheduleDate // Set to selected date
            };

            const response = await fetch(`${CONFIG.apiBaseUrl}/blogs/posts/${post._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Blog post scheduled successfully:', result);

            // Show success message
            const formattedDate = this.formatDateTime(scheduleDate);
            this.showToast(`Blog post scheduled for ${formattedDate}! 📅`, 'success');

            // Refresh blog posts
            if (this.selectedBlogId) {
                this.fetchBlogPosts(this.selectedBlogId);
            }

        } catch (error) {
            console.error('❌ Error scheduling blog post:', error);
            this.showToast('Failed to schedule blog post. Please try again.', 'error');
        }
    }

    // Password Protection
    initPasswordProtection() {
        const passwordOverlay = document.getElementById('passwordOverlay');
        const passwordInput = document.getElementById('passwordInput');
        const passwordSubmit = document.getElementById('passwordSubmit');
        const passwordError = document.getElementById('passwordError');
        const userSelectionOverlay = document.getElementById('userSelectionOverlay');

        // Check if already authenticated in this session
        const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

        if (isAuthenticated) {
            // Already authenticated, hide password overlay and show user selection
            passwordOverlay.style.display = 'none';
            this.showUserSelectionPopup();
            return;
        }

        // Show password overlay
        passwordOverlay.style.display = 'flex';
        userSelectionOverlay.style.display = 'none';

        // Focus password input
        setTimeout(() => passwordInput.focus(), 300);

        // Handle password submission
        const checkPassword = () => {
            const password = passwordInput.value;
            const correctPassword = 'ghlisscam';

            if (password === correctPassword) {
                // Correct password
                sessionStorage.setItem('isAuthenticated', 'true');
                passwordError.style.display = 'none';

                // Animate out password overlay
                passwordOverlay.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    passwordOverlay.style.display = 'none';
                    this.showUserSelectionPopup();
                }, 300);
            } else {
                // Wrong password
                passwordError.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();

                // Shake animation already in CSS
                passwordError.style.animation = 'none';
                setTimeout(() => {
                    passwordError.style.animation = 'shake 0.5s ease';
                }, 10);
            }
        };

        // Submit on button click
        passwordSubmit.addEventListener('click', checkPassword);

        // Submit on Enter key
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }

    // User selection popup functionality
    async showUserSelectionPopup() {
        console.log('🎯 Showing user selection popup...');

        // Show the user selection overlay
        const userSelectionOverlay = document.getElementById('userSelectionOverlay');
        if (userSelectionOverlay) {
            userSelectionOverlay.style.display = 'flex';
        }

        // Ensure loading is visible
        if (this.userSelectionLoading) {
            this.userSelectionLoading.style.display = 'flex';
            console.log('✅ User selection loading shown');
        }
        if (this.userCardsContainer) {
            this.userCardsContainer.style.display = 'none';
        }

        try {
            // Fetch users from API
            console.log('🔍 Fetching users from:', `${CONFIG.apiBaseUrl}/users/?locationId=${CONFIG.locationId}`);

            const response = await fetch(`${CONFIG.apiBaseUrl}/users/?locationId=${CONFIG.locationId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                }
            });

            console.log('📦 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Users data:', data);
            const users = data.users || [];
            console.log(`✅ Found ${users.length} users`);

            if (users.length === 0) {
                console.warn('⚠️ No users found in the response');
                if (this.userSelectionLoading) {
                    this.userSelectionLoading.innerHTML = '<p style="color: var(--text-secondary);">No users found for this location.</p>';
                }
                return;
            }

            // Hide loading, show user cards
            console.log('🔄 Hiding loading, showing user cards...');
            if (this.userSelectionLoading) {
                this.userSelectionLoading.style.display = 'none';
                console.log('✅ User selection loading hidden');
            }
            if (this.userCardsContainer) {
                this.userCardsContainer.style.display = 'grid';
                console.log('✅ User cards container shown');
            }

            // Clear previous cards and dropdown options
            this.userCardsContainer.innerHTML = '';
            if (this.userDropdown) {
                // Keep only the first option (placeholder)
                while (this.userDropdown.options.length > 1) {
                    this.userDropdown.remove(1);
                }
            }

            // Create user cards and populate dropdown
            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'user-card';

                // Get user initials for icon
                const name = user.firstName || user.name || 'User';
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

                userCard.innerHTML = `
                    <div class="user-card-icon">${initials}</div>
                    <div class="user-card-name">${name}</div>
                `;

                // Add click handler
                userCard.addEventListener('click', () => {
                    this.handleUserSelection(user);
                });

                this.userCardsContainer.appendChild(userCard);
                console.log(`Added user card: ${name} (${user.id})`);

                // Also populate the dropdown
                if (this.userDropdown) {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = name;
                    this.userDropdown.appendChild(option);
                }
            });

            console.log('✅ User selection popup populated successfully');

        } catch (error) {
            console.error('❌ Error loading users for selection:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            
            // Ensure loading is visible to show the error
            if (this.userSelectionLoading) {
                this.userSelectionLoading.style.display = 'flex';
                this.userSelectionLoading.innerHTML = `
                    <p style="color: #ff6b6b; margin-bottom: 1rem; font-weight: 600;">Error loading users</p>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">${error.message}</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--gradient-primary); color: white; border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: 600;">Retry</button>
                `;
                console.log('✅ Error message displayed in user selection');
            }
        }
    }

    handleUserSelection(user) {
        console.log('✅ User selected:', user);

        // Store selected user
        this.selectedUser = {
            id: user.id,
            name: user.firstName || user.name || 'User'
        };

        // Hide the popup with animation
        this.userSelectionOverlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            this.userSelectionOverlay.style.display = 'none';
        }, 300);

        // Update greeting with user's name
        this.updateGreeting();

        // Update sidebar user display
        this.updateSidebarUser(user);

        // Initialize appointments with selected user
        this.initAppointmentsForUser(user.id);

        // Initialize social media posts
        this.initSocialMedia();

        // Initialize thumbnails
        this.initThumbnails();

        // Initialize blogs
        this.initBlogs();

        console.log('🎉 Onboarding complete!');
    }

    updateGreeting() {
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle && this.selectedUser) {
            headerTitle.textContent = `Hi ${this.selectedUser.name}, how can I help today?`;
        }
    }

    initAppointmentsForUser(userId) {
        // Set the dropdown value to the selected user (for consistency)
        if (this.userDropdown) {
            this.userDropdown.value = userId;
        }

        // Fetch and display appointments
        this.fetchCalendarEvents(userId);

        // Show refresh button
        if (this.appointmentsRefreshBtn) {
            this.appointmentsRefreshBtn.style.display = 'flex';
        }

        // Set up dropdown change listener for future changes
        if (this.userDropdown) {
            this.userDropdown.addEventListener('change', (e) => {
                const newUserId = e.target.value;
                if (newUserId) {
                    this.fetchCalendarEvents(newUserId);
                    if (this.appointmentsRefreshBtn) {
                        this.appointmentsRefreshBtn.style.display = 'flex';
                    }
                } else {
                    this.appointmentsContainer.innerHTML = '<div class="appointments-placeholder">Select a user to view their upcoming appointments</div>';
                    this.hideAppointmentChevrons();
                    if (this.appointmentsRefreshBtn) {
                        this.appointmentsRefreshBtn.style.display = 'none';
                    }
                }
            });
        }

        // Add chevron click handlers
        if (this.appointmentsLeft && this.appointmentsContainer) {
            this.appointmentsLeft.addEventListener('click', () => {
                const scrollAmount = this.appointmentsContainer.offsetWidth * 0.8;
                this.appointmentsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        if (this.appointmentsRight && this.appointmentsContainer) {
            this.appointmentsRight.addEventListener('click', () => {
                const scrollAmount = this.appointmentsContainer.offsetWidth * 0.8;
                this.appointmentsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    }

    async fetchUsers() {
        try {
            console.log('🔍 Fetching users...');

            const response = await fetch(`${CONFIG.apiBaseUrl}/users/?locationId=${CONFIG.locationId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Users data:', data);
            const users = data.users || [];
            console.log(`✅ Found ${users.length} users`);

            if (users.length === 0) {
                console.warn('⚠️ No users found in the response');
                this.appointmentsContainer.innerHTML = '<div class="appointments-placeholder">No users found for this location.</div>';
                return;
            }

            // Populate dropdown with users
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.firstName || user.name;
                this.userDropdown.appendChild(option);
                console.log(`Added user: ${user.firstName || user.name} (${user.id})`);
            });

            console.log('✅ Users dropdown populated successfully');

        } catch (error) {
            console.error('❌ Error fetching users:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            this.appointmentsContainer.innerHTML = '<div class="appointments-placeholder">Error loading users. Check console for details.</div>';
        }
    }

    async fetchCalendarEvents(userId) {
        // Show loading state
        this.appointmentsContainer.innerHTML = '<div class="loading-spinner">Loading appointments...</div>';

        try {
            // Store current user ID for refresh
            this.currentUserId = userId;

            // Calculate timestamps
            const now = new Date();
            const startTime = now.getTime(); // Current time in milliseconds
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + 7); // 7 days from now
            const endTime = endDate.getTime();

            const response = await fetch(`${CONFIG.apiBaseUrl}/calendars/events?locationId=${CONFIG.locationId}&userId=${userId}&startTime=${startTime}&endTime=${endTime}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Version': '2021-04-15',
                    'Authorization': `Bearer ${CONFIG.apiToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const events = data.events || [];

            // Store appointments
            this.currentAppointments = events;

            this.displayAppointments(events);

        } catch (error) {
            console.error('Error fetching calendar events:', error);
            this.appointmentsContainer.innerHTML = '<div class="appointments-placeholder">Error loading appointments. Please try again later.</div>';
        }
    }

    displayAppointments(events) {
        // Filter out past appointments
        const now = new Date();
        const upcomingEvents = events.filter(event => {
            const eventStartTime = new Date(event.startTime);
            return eventStartTime >= now;
        });

        if (upcomingEvents.length === 0) {
            this.appointmentsContainer.innerHTML = '<div class="appointments-placeholder">No upcoming appointments found for this user.</div>';
            this.hideAppointmentChevrons();
            return;
        }

        // Sort events by start time (earliest first)
        upcomingEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        this.appointmentsContainer.innerHTML = '';

        upcomingEvents.forEach(event => {
            const card = this.createAppointmentCard(event);
            this.appointmentsContainer.appendChild(card);
        });

        // Show chevrons if there are appointments
        if (upcomingEvents.length > 0) {
            this.showAppointmentChevrons();
        }
    }

    startAppointmentsRefresh() {
        // Clear any existing timer
        if (this.appointmentsRefreshTimer) {
            clearInterval(this.appointmentsRefreshTimer);
        }

        // Refresh appointments display every minute to hide past appointments
        this.appointmentsRefreshTimer = setInterval(() => {
            if (this.currentAppointments && this.currentAppointments.length > 0) {
                console.log('🔄 Refreshing appointments display...');
                this.displayAppointments(this.currentAppointments);
            }
        }, 60000); // Refresh every 60 seconds
    }

    stopAppointmentsRefresh() {
        if (this.appointmentsRefreshTimer) {
            clearInterval(this.appointmentsRefreshTimer);
            this.appointmentsRefreshTimer = null;
        }
    }

    createAppointmentCard(event) {
        const card = document.createElement('div');
        card.className = 'appointment-card';

        const formattedTime = this.formatDateTime(event.startTime);
        const hasDescription = event.description && event.description.trim() !== '';
        const hasNotes = event.notes && event.notes.trim() !== '';

        // Store data on card for event handlers
        card.dataset.description = event.description || '';
        card.dataset.notes = event.notes || '';
        card.dataset.eventId = event.id;
        // Store full event data as JSON for details view
        card.dataset.eventData = JSON.stringify(event);

        card.innerHTML = `
            <h3 class="appointment-title">${event.title || 'Untitled Event'}</h3>
            <div class="appointment-id">
                <span>${event.id}</span>
                <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </div>
            <div class="appointment-time">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${formattedTime}
            </div>
            <div class="appointment-footer">
                <div class="appointment-actions">
                    <button class="action-icon-btn description-btn" title="${hasDescription ? 'View description' : 'No description'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </button>
                    <button class="action-icon-btn notes-btn" title="${hasNotes ? 'View notes' : 'No notes'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-icon-btn details-btn" title="View all details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    </button>
                </div>
                ${event.address ? `<a href="${event.address}" target="_blank" class="join-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Join
                </a>` : '<span class="join-btn" style="opacity: 0.5; cursor: not-allowed;">No link</span>'}
            </div>
        `;

        // Add event listeners
        const copyIcon = card.querySelector('.copy-icon');
        copyIcon.addEventListener('click', () => this.copyToClipboard(event.id));

        const descriptionBtn = card.querySelector('.description-btn');
        descriptionBtn.addEventListener('click', () => this.showPopup('Description', event.description, hasDescription));

        const notesBtn = card.querySelector('.notes-btn');
        notesBtn.addEventListener('click', () => this.showPopup('Notes', event.notes, hasNotes));

        const detailsBtn = card.querySelector('.details-btn');
        detailsBtn.addEventListener('click', () => this.showAppointmentDetails(event));

        return card;
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Event ID copied to clipboard:', text);
            // Show a temporary toast notification
            this.showToast('Event ID copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy Event ID');
        });
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--glass-bg);
            backdrop-filter: blur(40px);
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    showPopup(title, content, hasContent) {
        // Remove any existing popups
        const existingPopup = document.querySelector('.popup-overlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';

        const popup = document.createElement('div');
        popup.className = 'popup-content';

        popup.innerHTML = `
            <div class="popup-header">
                <h3 class="popup-title">${title}</h3>
                <button class="popup-close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="popup-body">
                ${hasContent && content ? content : `<p class="popup-empty">No ${title.toLowerCase()} available for this appointment.</p>`}
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Close popup handlers
        const closeBtn = popup.querySelector('.popup-close');
        closeBtn.addEventListener('click', () => overlay.remove());

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    showAppointmentDetails(event) {
        // Format all appointment details
        const formatValue = (value) => {
            if (value === null || value === undefined) return '<span style="color: #888;">N/A</span>';
            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
            if (typeof value === 'object') return '<pre style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 0.25rem; overflow-x: auto;">' + JSON.stringify(value, null, 2) + '</pre>';
            return value.toString();
        };

        const formatDate = (dateString) => {
            if (!dateString) return formatValue(null);
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short'
            });
        };

        // Build details HTML
        const detailsHTML = `
            <div style="display: grid; gap: 1rem;">
                <div class="detail-row">
                    <strong>Event ID:</strong>
                    <div>${formatValue(event.id)}</div>
                </div>
                <div class="detail-row">
                    <strong>Title:</strong>
                    <div>${formatValue(event.title)}</div>
                </div>
                <div class="detail-row">
                    <strong>Start Time:</strong>
                    <div>${formatDate(event.startTime)}</div>
                </div>
                <div class="detail-row">
                    <strong>End Time:</strong>
                    <div>${formatDate(event.endTime)}</div>
                </div>
                <div class="detail-row">
                    <strong>Status:</strong>
                    <div>${formatValue(event.status)}</div>
                </div>
                <div class="detail-row">
                    <strong>Assigned User ID:</strong>
                    <div>${formatValue(event.assignedUserId)}</div>
                </div>
                <div class="detail-row">
                    <strong>Contact ID:</strong>
                    <div>${formatValue(event.contactId)}</div>
                </div>
                <div class="detail-row">
                    <strong>Calendar ID:</strong>
                    <div>${formatValue(event.calendarId)}</div>
                </div>
                <div class="detail-row">
                    <strong>Location ID:</strong>
                    <div>${formatValue(event.locationId)}</div>
                </div>
                <div class="detail-row">
                    <strong>Meeting Location:</strong>
                    <div>${formatValue(event.address)}</div>
                </div>
                <div class="detail-row">
                    <strong>Appointment Type:</strong>
                    <div>${formatValue(event.appointmentType)}</div>
                </div>
                <div class="detail-row">
                    <strong>Description:</strong>
                    <div>${formatValue(event.description)}</div>
                </div>
                <div class="detail-row">
                    <strong>Notes:</strong>
                    <div>${formatValue(event.notes)}</div>
                </div>
                ${event.isRecurring ? `
                    <div class="detail-row">
                        <strong>Recurring:</strong>
                        <div>${formatValue(event.isRecurring)}</div>
                    </div>
                ` : ''}
                ${event.attendees ? `
                    <div class="detail-row">
                        <strong>Attendees:</strong>
                        <div>${formatValue(event.attendees)}</div>
                    </div>
                ` : ''}
            </div>
        `;

        this.showPopup('Appointment Details', detailsHTML, true);
    }

    // Voice Visualizer
    initVisualizer() {
        if (!this.voiceVisualizer) return;

        // Generate 48 visualizer bars
        for (let i = 0; i < 48; i++) {
            const bar = document.createElement('div');
            bar.className = 'voice-visualizer-bar';
            this.voiceVisualizer.appendChild(bar);
        }
    }

    animateVisualizer() {
        const bars = this.voiceVisualizer.querySelectorAll('.voice-visualizer-bar');
        bars.forEach((bar, index) => {
            const randomHeight = 20 + Math.random() * 80;
            bar.style.setProperty('--bar-height', `${randomHeight}%`);
            bar.classList.add('active');

            setTimeout(() => {
                bar.classList.remove('active');
            }, 300);
        });
    }

    stopVisualizer() {
        const bars = this.voiceVisualizer.querySelectorAll('.voice-visualizer-bar');
        bars.forEach(bar => {
            bar.classList.remove('active');
            bar.style.setProperty('--bar-height', '20%');
        });
    }

    updateTimer() {
        const minutes = Math.floor(this.recordingTime / 60);
        const seconds = this.recordingTime % 60;
        this.voiceTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // ============================================
    // Analytics Section
    // ============================================
    async fetchAnalytics() {
        // Show loading state
        if (this.analyticsLoading) this.analyticsLoading.style.display = 'flex';
        if (this.analyticsContent) this.analyticsContent.style.display = 'none';
        if (this.analyticsError) this.analyticsError.style.display = 'none';

        try {
            console.log('📊 Fetching social media analytics...');

            // Use all platforms that have analytics IDs configured in .env
            const platformProfiles = Object.entries(this.analyticsProfileIds || {})
                .filter(([, id]) => Boolean(id));

            if (!platformProfiles.length) {
                throw new Error('No analytics profile IDs configured');
            }

            // Fetch each platform individually so one bad ID doesn't fail all
            const stats = [];
            const errors = [];

            for (const [platform, profileId] of platformProfiles) {
                try {
                    const payload = {
                        profileIds: [profileId],
                        platforms: [platform]
                    };

                    console.log(`📊 Analytics payload (${platform}):`, JSON.stringify(payload));

                    const response = await fetch(`${CONFIG.apiBaseUrl}/social-media-posting/statistics/?locationId=${CONFIG.locationId}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${CONFIG.apiToken}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Version': '2021-07-28'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`❌ Analytics API Error (${platform}):`, errorText);
                        throw new Error(`HTTP ${response.status} for ${platform}: ${errorText}`);
                    }

                    const data = await response.json();
                    console.log(`📦 Analytics API Response (${platform}):`, data);

                    // Map the n8n-style response (results/totals) into the UI format
                    const results = data?.results || {};
                    const totals = results.totals || {};
                    const likes = totals.likes || 0;
                    const comments = totals.comments || 0;
                    const followers = totals.followers || totals.followersCount || 0;
                    const posts = totals.posts || totals.postsCount || 0;
                    const impressions = totals.impressions || totals.reach || 0;

                    stats.push({
                        platform,
                        profileName: results.profileName || platform.toUpperCase(),
                        followers,
                        followersCount: followers,
                        posts,
                        postsCount: posts,
                        engagement: likes + comments,
                        engagementCount: likes + comments,
                        reach: impressions,
                        // Preserve time-series data
                        dayRange: results.dayRange || [],
                        postPerformance: results.postPerformance || {}
                    });
                } catch (err) {
                    errors.push({ platform, message: err.message });
                    console.warn(`Skipping ${platform} due to error: ${err.message}`);
                }
            }

            // If everything failed, surface the error
            if (!stats.length) {
                throw new Error(`Analytics failed. Details: ${errors.map(e => `${e.platform}: ${e.message}`).join(' | ')}`);
            }

            // Normalize into displayAnalytics expected shape
            const data = { statistics: stats };
            
            console.log('✅ Analytics data fetched successfully, showing content...');
            
            // Then render the data
            this.displayAnalytics(data);
            
            // Show content and hide loading AFTER rendering to ensure DOM is ready
            if (this.analyticsLoading) {
                this.analyticsLoading.style.display = 'none';
                console.log('✅ Analytics loading hidden');
            }
            if (this.analyticsContent) {
                this.analyticsContent.style.display = 'block';
                console.log('✅ Analytics content shown');
            }

        } catch (error) {
            console.error('❌ Error fetching analytics:', error);
            console.log('💡 Note: The statistics API may require valid connected social media accounts');

            // Show error state
            if (this.analyticsLoading) this.analyticsLoading.style.display = 'none';
            if (this.analyticsContent) this.analyticsContent.style.display = 'none';
            if (this.analyticsError) this.analyticsError.style.display = 'flex';
        }
    }

    displayAnalytics(data) {
        // Group stats by platform (LinkedIn removed per request)
        const platformStats = {
            facebook: { followers: 0, posts: 0, engagement: 0, reach: 0, profiles: [] },
            instagram: { followers: 0, posts: 0, engagement: 0, reach: 0, profiles: [] }
        };

        // Process the response data
        if (data && data.statistics) {
            data.statistics.forEach(stat => {
                const platform = stat.platform?.toLowerCase() || 'unknown';
                if (!platformStats[platform]) return; // skip platforms not in allowed list

                const followers = stat.followers || stat.followersCount || 0;
                const posts = stat.postsCount || stat.posts || 0;
                const engagement = stat.engagement || stat.engagementCount || 0;
                const reach = stat.reach || stat.impressions || 0;

                platformStats[platform].followers += followers;
                platformStats[platform].posts += posts;
                platformStats[platform].engagement += engagement;
                platformStats[platform].reach += reach;
                platformStats[platform].profiles.push({
                    ...stat,
                    followers,
                    posts,
                    engagement,
                    reach
                });
            });
        }

        // Render platform cards
        if (this.analyticsPlatforms) {
            this.analyticsPlatforms.innerHTML = '';

            const platformsInData = (data?.statistics || [])
                .map(s => (s.platform || '').toLowerCase())
                .filter(p => p === 'facebook' || p === 'instagram'); // enforce allowed set
            const uniquePlatforms = [...new Set(platformsInData)].filter(Boolean);

            const platforms = uniquePlatforms.map(p => ({
                key: p,
                name: this.capitalizeFirst(p),
                icon: p === 'facebook' ? 'f' : p === 'instagram' ? 'ig' : p === 'linkedin' ? 'in' : p.charAt(0)
            }));

            platforms.forEach(platform => {
                const stats = platformStats[platform.key] || { followers: 0, posts: 0, engagement: 0, reach: 0 };
                const card = document.createElement('div');
                card.className = 'platform-card';
                card.innerHTML = `
                    <div class="platform-card-header">
                        <div class="platform-info">
                            <div class="platform-icon ${platform.key}">${platform.icon}</div>
                            <span class="platform-name">${platform.name}</span>
                        </div>
                        <div class="platform-status">
                            <span class="status-dot"></span>
                            Connected
                        </div>
                    </div>
                    <div class="platform-stats">
                        <div class="stat-item">
                            <div class="stat-value">${this.formatNumber(stats.followers)}</div>
                            <div class="stat-label">Followers</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.formatNumber(stats.posts)}</div>
                            <div class="stat-label">Posts</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.formatNumber(stats.engagement)}</div>
                            <div class="stat-label">Engagement</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${this.formatNumber(stats.reach)}</div>
                            <div class="stat-label">Reach</div>
                        </div>
                    </div>
                `;
                this.analyticsPlatforms.appendChild(card);
            });
        }

        // Render detailed stats table and charts
        if (this.analyticsDetails && data.statistics && data.statistics.length > 0) {
            // Build time-series charts data
            const chartsHTML = this.renderAnalyticsCharts(data.statistics);
            
            this.analyticsDetails.innerHTML = `
                <div class="analytics-details-header">
                    <h3 class="analytics-details-title">Profile Performance</h3>
                    <span class="analytics-period">Last 7 Days</span>
                </div>
                <table class="profile-stats-table">
                    <thead>
                        <tr>
                            <th>Profile</th>
                            <th>Platform</th>
                            <th>Followers</th>
                            <th>Posts</th>
                            <th>Engagement</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.statistics.map(stat => `
                            <tr>
                                <td>
                                    <div class="profile-cell">
                                        <div class="profile-avatar">${(stat.profileName || stat.name || 'P').charAt(0).toUpperCase()}</div>
                                        <span class="profile-name">${stat.profileName || stat.name || 'Profile'}</span>
                                    </div>
                                </td>
                                <td>${this.capitalizeFirst(stat.platform || 'Unknown')}</td>
                                <td>${this.formatNumber(stat.followers || stat.followersCount || 0)}</td>
                                <td>${this.formatNumber(stat.postsCount || stat.posts || 0)}</td>
                                <td>${this.formatNumber(stat.engagement || stat.engagementCount || 0)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${chartsHTML}
            `;
        } else if (this.analyticsDetails) {
            this.analyticsDetails.innerHTML = `
                <div class="analytics-details-header">
                    <h3 class="analytics-details-title">Profile Performance</h3>
                    <span class="analytics-period">Last 7 Days</span>
                </div>
                <p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    No detailed statistics available. Connect your social media profiles to see performance data.
                </p>
            `;
        }
    }

    renderAnalyticsCharts(statistics) {
        // Combine data from all platforms
        const combinedData = {
            dayRange: [],
            impressions: [],
            reach: [],
            engagement: [],
            posts: []
        };

        // Get day range from first stat that has it
        const firstStat = statistics.find(s => s.dayRange && s.dayRange.length > 0);
        if (!firstStat || !firstStat.dayRange) {
            return ''; // No time-series data available
        }

        combinedData.dayRange = firstStat.dayRange;
        const numDays = combinedData.dayRange.length;

        // Initialize arrays
        for (let i = 0; i < numDays; i++) {
            combinedData.impressions[i] = 0;
            combinedData.reach[i] = 0;
            combinedData.engagement[i] = 0;
            combinedData.posts[i] = 0;
        }

        // Aggregate data from all platforms
        statistics.forEach(stat => {
            const perf = stat.postPerformance || {};
            
            if (perf.impressions && Array.isArray(perf.impressions)) {
                perf.impressions.forEach((val, i) => {
                    if (i < numDays) combinedData.impressions[i] += val || 0;
                });
            }
            
            if (perf.likes && Array.isArray(perf.likes)) {
                perf.likes.forEach((val, i) => {
                    if (i < numDays) combinedData.engagement[i] += val || 0;
                });
            }
            
            if (perf.comments && Array.isArray(perf.comments)) {
                perf.comments.forEach((val, i) => {
                    if (i < numDays) combinedData.engagement[i] += val || 0;
                });
            }

            if (perf.posts) {
                Object.values(perf.posts).forEach((platformPosts, platformIdx) => {
                    if (Array.isArray(platformPosts)) {
                        platformPosts.forEach((val, i) => {
                            if (i < numDays) combinedData.posts[i] += val || 0;
                        });
                    }
                });
            }
        });

        // Reach is same as impressions for now
        combinedData.reach = [...combinedData.impressions];

        // Find max values for scaling (ensure at least 1 to avoid division by zero)
        const maxImpressions = Math.max(...combinedData.impressions, 1);
        const maxEngagement = Math.max(...combinedData.engagement, 1);
        const maxPosts = Math.max(...combinedData.posts, 1);

        console.log('📊 Chart Data:', { combinedData, maxImpressions, maxEngagement, maxPosts });

        return `
            <div class="analytics-charts" style="margin-top: 2rem;">
                <!-- Impressions/Reach Chart -->
                <div class="chart-container" style="margin-bottom: 2rem;">
                    <h4 class="chart-title" style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;">
                        Impressions & Reach by Day
                    </h4>
                    <div class="chart-wrapper" style="position: relative; height: 240px; padding: 1rem; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-lg);">
                        <div class="chart-bars" style="display: flex; align-items: flex-end; justify-content: space-between; gap: 0.5rem; height: 180px; margin-bottom: 1rem;">
                            ${combinedData.dayRange.map((day, i) => {
                                const value = combinedData.impressions[i];
                                const heightPx = value > 0 ? Math.max((value / maxImpressions) * 170, 4) : 0;
                                return `
                                    <div class="chart-bar-group" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
                                        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 100%;">
                                            <span style="font-size: 0.7rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${value}</span>
                                            <div class="chart-bar" style="width: 80%; height: ${heightPx}px; background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary)); border-radius: var(--radius-sm) var(--radius-sm) 0 0; ${value === 0 ? 'opacity: 0.3;' : ''}" title="${value} impressions"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div style="display: flex; justify-content: space-between; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--glass-border);">
                            ${combinedData.dayRange.map((day) => `
                                <span style="flex: 1; text-align: center; font-size: 0.7rem; font-weight: 600; color: var(--text-tertiary);">${day}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Engagement Chart -->
                <div class="chart-container" style="margin-bottom: 2rem;">
                    <h4 class="chart-title" style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;">
                        Engagement (Likes + Comments) by Day
                    </h4>
                    <div class="chart-wrapper" style="position: relative; height: 240px; padding: 1rem; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-lg);">
                        <div class="chart-bars" style="display: flex; align-items: flex-end; justify-content: space-between; gap: 0.5rem; height: 180px; margin-bottom: 1rem;">
                            ${combinedData.dayRange.map((day, i) => {
                                const value = combinedData.engagement[i];
                                const heightPx = value > 0 ? Math.max((value / maxEngagement) * 170, 4) : 0;
                                return `
                                    <div class="chart-bar-group" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
                                        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 100%;">
                                            <span style="font-size: 0.7rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${value}</span>
                                            <div class="chart-bar" style="width: 80%; height: ${heightPx}px; background: linear-gradient(180deg, var(--accent-pink), var(--accent-orange)); border-radius: var(--radius-sm) var(--radius-sm) 0 0; ${value === 0 ? 'opacity: 0.3;' : ''}" title="${value} engagements"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div style="display: flex; justify-content: space-between; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--glass-border);">
                            ${combinedData.dayRange.map((day) => `
                                <span style="flex: 1; text-align: center; font-size: 0.7rem; font-weight: 600; color: var(--text-tertiary);">${day}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Posts Published Chart -->
                <div class="chart-container">
                    <h4 class="chart-title" style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem;">
                        Posts Published by Day
                    </h4>
                    <div class="chart-wrapper" style="position: relative; height: 240px; padding: 1rem; background: var(--glass-bg); border: 2px solid var(--glass-border); border-radius: var(--radius-lg);">
                        <div class="chart-bars" style="display: flex; align-items: flex-end; justify-content: space-between; gap: 0.5rem; height: 180px; margin-bottom: 1rem;">
                            ${combinedData.dayRange.map((day, i) => {
                                const value = combinedData.posts[i];
                                const heightPx = value > 0 ? Math.max((value / maxPosts) * 170, 4) : 0;
                                return `
                                    <div class="chart-bar-group" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
                                        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; width: 100%;">
                                            <span style="font-size: 0.7rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${value}</span>
                                            <div class="chart-bar" style="width: 80%; height: ${heightPx}px; background: linear-gradient(180deg, var(--accent-cyan), var(--accent-green)); border-radius: var(--radius-sm) var(--radius-sm) 0 0; ${value === 0 ? 'opacity: 0.3;' : ''}" title="${value} posts"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div style="display: flex; justify-content: space-between; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--glass-border);">
                            ${combinedData.dayRange.map((day) => `
                                <span style="flex: 1; text-align: center; font-size: 0.7rem; font-weight: 600; color: var(--text-tertiary);">${day}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatNumber(num) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Speech Recognition Methods
    initSpeechRecognition() {
        // Check if browser supports Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('⚠️ Speech Recognition not supported in this browser');
            // Hide voice button if not supported
            if (this.voiceButton) {
                this.voiceButton.parentElement.style.display = 'none';
            }
            return;
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true; // Keep listening until stopped
            this.recognition.interimResults = true; // Show interim results
            this.recognition.lang = 'en-US'; // Set language (can be made configurable)

            console.log('✅ Speech Recognition initialized');

            // Handle results
            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                // Only process NEW results using resultIndex to avoid duplicates
                // event.resultIndex tells us where the new results start
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Append only NEW final transcriptions
                if (finalTranscript) {
                    this.transcribedText += finalTranscript;
                    console.log('🎤 Final transcription:', this.transcribedText);
                }

                // Store interim results separately so we can use them if user stops mid-speech
                this.interimTranscript = interimTranscript;
                if (interimTranscript) {
                    console.log('🎤 Interim transcription:', interimTranscript);
                }
            };

            // Handle errors
            this.recognition.onerror = (event) => {
                console.error('❌ Speech recognition error:', event.error);

                let errorMessage = 'Speech recognition error';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Microphone not accessible';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone permission denied';
                        break;
                    case 'network':
                        errorMessage = 'Network error';
                        break;
                }

                // Show error in status
                if (this.voiceStatus) {
                    this.voiceStatus.textContent = errorMessage;
                    setTimeout(() => {
                        this.voiceStatus.textContent = 'Click to speak';
                    }, 2000);
                }

                this.stopRecording();
            };

            // Handle end of recognition
            this.recognition.onend = () => {
                console.log('🎤 Speech recognition ended');
                if (this.isRecording) {
                    // User manually stopped - don't restart
                    // Just ensure clean state
                    this.stopRecording();
                }
            };

            // Handle start
            this.recognition.onstart = () => {
                console.log('🎤 Speech recognition started');
            };

        } catch (error) {
            console.error('❌ Failed to initialize speech recognition:', error);
            if (this.micButton) {
                this.micButton.style.display = 'none';
            }
        }
    }

    toggleSpeechRecognition() {
        if (!this.recognition) {
            console.warn('⚠️ Speech recognition not available');
            return;
        }

        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        if (!this.recognition) {
            console.warn('⚠️ Speech recognition not available');
            return;
        }

        try {
            // Reset transcribed text
            this.transcribedText = '';
            this.interimTranscript = '';
            this.recordingTime = 0;
            this.updateTimer();

            this.recognition.start();
            this.isRecording = true;

            // Update UI
            this.voiceButton.classList.add('recording');

            // Show visualizer container
            if (this.voiceVisualizerContainer) {
                this.voiceVisualizerContainer.style.display = 'flex';
            }

            // Start timer
            this.recordingTimer = setInterval(() => {
                this.recordingTime++;
                this.updateTimer();
            }, 1000);

            // Start visualizer animation
            this.visualizerInterval = setInterval(() => {
                this.animateVisualizer();
            }, 200);

            console.log('🎤 Recording started');
        } catch (error) {
            console.error('❌ Error starting recording:', error);
            if (error.name === 'InvalidStateError') {
                console.log('Recognition already active');
            }
        }
    }

    stopRecording() {
        if (!this.recognition) {
            return;
        }

        try {
            this.recognition.stop();
            this.isRecording = false;

            // Update UI
            this.voiceButton.classList.remove('recording');

            // Stop timer
            if (this.recordingTimer) {
                clearInterval(this.recordingTimer);
                this.recordingTimer = null;
            }

            // Stop visualizer
            if (this.visualizerInterval) {
                clearInterval(this.visualizerInterval);
                this.visualizerInterval = null;
            }
            this.stopVisualizer();

            // Hide visualizer container
            if (this.voiceVisualizerContainer) {
                this.voiceVisualizerContainer.style.display = 'none';
            }

            // Reset timer display
            this.recordingTime = 0;
            this.updateTimer();

            console.log('🎤 Recording stopped');

            // Combine final and interim transcripts
            let fullTranscript = this.transcribedText;
            if (this.interimTranscript) {
                fullTranscript += this.interimTranscript;
            }

            // Put transcribed text in input box
            if (fullTranscript && fullTranscript.trim()) {
                console.log('📝 Putting transcription in input box:', fullTranscript);

                // Put text in input box
                this.chatInput.value = fullTranscript.trim();

                // Clear transcribed text
                this.transcribedText = '';
                this.interimTranscript = '';

                // Enable send button
                this.sendButton.disabled = false;

                // Auto-resize textarea
                autoResizeTextarea(this.chatInput);
            } else {
                console.log('⚠️ No transcribed text');
            }

        } catch (error) {
            console.error('❌ Error stopping recording:', error);
        }
    }
}

// Wait for both DOM and marked library to be ready
function initApp() {
    // Check if CONFIG is loaded
    if (typeof CONFIG === 'undefined') {
        console.error('❌ CRITICAL: CONFIG not found!');
        console.error('💡 The config.js file is missing or failed to load.');
        console.error('   For local dev: Run "npm run build:config" to generate config.js');
        console.error('   For Vercel: Check that environment variables are set and build command ran');
        alert('Configuration error: config.js not found. Check console for details.');
        return;
    }

    console.log('✅ Configuration loaded successfully');
    console.log('🔑 Authentication:', CONFIG.apiToken ? 'Ready' : 'MISSING');

    // Check if marked library loaded
    if (typeof marked !== 'undefined') {
        console.log('✅ Marked library loaded successfully');
        console.log('📦 Marked version:', marked.VERSION || 'unknown');
        console.log('🔧 API available:', typeof marked.parse === 'function' ? 'marked.parse()' : typeof marked === 'function' ? 'marked()' : 'none');
    } else {
        console.error('❌ CRITICAL: Marked library not found! Markdown rendering will NOT work.');
        console.error('💡 Please check: 1) Internet connection, 2) CDN accessibility, 3) Browser console for errors');
    }

    // Initialize chat app
    window.chatApp = new ChatApp();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM already loaded
    initApp();
}
