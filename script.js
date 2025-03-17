document.addEventListener('DOMContentLoaded', async () => {
    setTimeout(() => {
        const intro = document.querySelector('.intro-container');
        if (intro) {
            intro.addEventListener('animationend', (e) => {
                if (e.animationName === 'fadeOut') {
                    intro.style.display = 'none';
                }
            });
        }
    }, 3000);

    let lastScroll = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll <= 0) {
            header.classList.remove('hidden');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('hidden')) {
            header.classList.add('hidden');
        } else if (currentScroll < lastScroll && header.classList.contains('hidden')) {
            header.classList.remove('hidden');
        }
        lastScroll = currentScroll;
    });
    try {
        const indexResponse = await fetch('methodologies.json');
        if (!indexResponse.ok) {
            throw new Error(`HTTP error! status: ${indexResponse.status}`);
        }
        const methodologyIndex = await indexResponse.json();
        console.log('Loaded methodology index:', methodologyIndex);

        if (!methodologyIndex.methodologies || !Array.isArray(methodologyIndex.methodologies)) {
            throw new Error('Invalid methodology data structure');
        }

        renderMethodologyCards(methodologyIndex.methodologies);

        const methodologyContent = document.getElementById('methodology-content');
        if (!methodologyContent) {
            throw new Error('methodology-content element not found');
        }

        methodologyContent.addEventListener('click', async (e) => {
            const card = e.target.closest('.methodology-card');
            if (card) {
                try {
                    const methodologyId = card.dataset.id;
                    const methodology = methodologyIndex.methodologies.find(m => m.id === methodologyId);
                    if (!methodology) {
                        throw new Error(`Methodology not found: ${methodologyId}`);
                    }

                    const response = await fetch(methodology.path);
                    if (!response.ok) {
                        throw new Error(`Failed to load methodology: ${methodology.path}`);
                    }

                    const data = await response.json();
                    showMethodology(data);
                } catch (err) {
                    console.error('Error loading methodology:', err);
                }
            }

            if (e.target.closest('.back-btn')) {
                renderMethodologyCards(methodologyIndex.methodologies);
            }
        });

        const videoSection = document.querySelector('.latest-video-section');
        const tutorialsToggle = document.querySelector('.tutorials-toggle');
        const contentWrapper = document.querySelector('.content-wrapper');

        if (videoSection && tutorialsToggle && contentWrapper) {
            setupTutorialsToggle();

            document.addEventListener('click', (e) => {
                if (videoSection.classList.contains('visible') &&
                    !videoSection.contains(e.target) &&
                    !tutorialsToggle.contains(e.target)) {
                    videoSection.classList.remove('visible');
                    contentWrapper.classList.remove('shifted');
                    tutorialsToggle.innerHTML = `<i class='bx bxl-youtube'></i>Tutorials`;
                }
            });
        }

    } catch (error) {
        console.error('Initialization error:', error);
        const container = document.getElementById('methodology-content');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <i class='bx bx-error-circle'></i>
                    <p>Sorry, we couldn't load the content. Please try refreshing the page.</p>
                </div>
            `;
        }
    }
    window.addEventListener('resize', () => {
        const videoSection = document.querySelector('.latest-video-section');
        const methodologyGrid = document.querySelector('.methodology-grid');

        if (methodologyGrid && videoSection.classList.contains('visible')) {
            const width = window.innerWidth;
            if (width > 1200) {
                methodologyGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(240px, 1fr))';
            } else {
                methodologyGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
            }
        }
    });

    setupToolsToggle();
    setupExtensionsToggle();
    setupWriteupsToggle();
});

function renderMethodologyCards(methodologies) {
    const container = document.getElementById('methodology-content');
    container.innerHTML = `
        <div class="methodology-grid">
            ${methodologies.map(methodology => `
                <div class="methodology-card ${methodology.id === 'tools' ? 'hacking-tools-card' : ''}" data-id="${methodology.id}">
                    <div class="card-icon">
                        <i class='${methodology.icon}'></i>
                    </div>
                    <div class="card-header">
                        <h3 class="card-title">${methodology.title}</h3>
                    </div>
                    <div class="card-content">
                        <div class="card-tags">
                            ${methodology.tags.map(tag => `
                                <span class="tag">
                                    <i class='bx bx-hash'></i>${tag}
                                </span>
                            `).join('')}
                        </div>
                        <div class="card-footer">
                            <i class='bx bx-terminal'></i><span>View Methodology</span>
                            <i class='bx bx-right-arrow-alt'></i>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
function showMethodology(methodology) {
    const container = document.getElementById('methodology-content');
    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Add a unique class for Tools Page - Allows you to change styles without affecting other cards.
    if (methodology.id === "tools") {
        document.body.classList.add('tools-page');
    } else {
        document.body.classList.remove('tools-page');
    }

    if (methodology.id === "tools") {
        container.innerHTML = `
            <div class="methodology-detail">
                <button class="back-btn">
                    <i class='bx bx-arrow-back'></i> Back
                </button>
                <h2 class="methodology-title">
                    <i class='bx bx-code-curly'></i> ${escapeHtml(methodology.title || 'Untitled')}
                </h2>
                <br><br>
                <div class="commands-section">
                    ${methodology.command_groups.map(group => `
                        <div class="command-group">
                            <h3 class="subtitle" data-download-link="${group.cmd[0]?.DownloadLink || ''}">${escapeHtml(group.subtitle || 'No Subtitle')}</h3>
                            <p class="group-info">${escapeHtml(group.info || 'No Info')}</p>
                            ${Array.isArray(group.cmd) ? group.cmd.map(cmd => `
                                <div class="command-block">
                                    <div class="command-content">
                                        ${cmd.DownloadLink ? `
                                        <a href="${escapeHtml(cmd.DownloadLink)}" target="_blank" class="download-button">
                                            <i class='bx bx-download'></i>
                                            <span>Github</span>
                                        </a>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('') : '<p>No commands available in this group.</p>'}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        // Default rendering for other methodologies
        const hasSubtitles = methodology.command_groups && Array.isArray(methodology.command_groups);
        const hasCommands = methodology.commands && Array.isArray(methodology.commands);

        container.innerHTML = `
            <div class="methodology-detail">
                <button class="back-btn">
                    <i class='bx bx-arrow-back'></i> Back
                </button>
                <h2 class="methodology-title">
                    <i class='bx bx-code-curly'></i> ${escapeHtml(methodology.title || 'Untitled')}
                </h2>
                <br><br>
                <div class="commands-section">
                    ${hasSubtitles ? methodology.command_groups.map(group => `
                        <div class="command-group">
                            <h3 class="subtitle">${escapeHtml(group.subtitle || 'No Subtitle')}</h3>
                            <p class="group-info">${escapeHtml(group.info || 'No Info')}</p>
                            ${Array.isArray(group.commands) ? group.commands.map(cmd => `
                                <div class="command-block">
                                    <div class="command-content">
                                        <pre><code>${escapeHtml(cmd || 'No Command')}</code></pre>
                                        <button class="copy-button" data-command="${escapeHtml(cmd || '')}">
                                            <i class='bx bx-copy'></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('') : '<p>No commands in this group.</p>'}
                        </div>
                    `).join('') : hasCommands ? methodology.commands.map(cmd => `
                        <div class="command-block">
                            <div class="command-content">
                                <pre><code>${escapeHtml(cmd.cmd || 'No Command')}</code></pre>
                                <button class="copy-button" data-command="${escapeHtml(cmd.cmd || '')}">
                                    <i class='bx bx-copy'></i>
                                </button>
                            </div>
                            <div class="command-info">
                                <i class='bx bx-info-circle'></i> ${escapeHtml(cmd.info || 'No Info')}
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;


        function copyToClipboard(link) {
            navigator.clipboard.writeText(link).then(() => {
                console.log("Link copied to clipboard!");
            }).catch(err => {
                console.error("Failed to copy: ", err);
            });
        }

        // Attach copy functionality to non-tools pages
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', async () => {
                const command = button.dataset.command;
                try {
                    await navigator.clipboard.writeText(command);
                    const originalHtml = button.innerHTML;
                    button.innerHTML = `<i class='bx bx-check'></i>`;
                    button.classList.add('copied');

                    setTimeout(() => {
                        button.innerHTML = originalHtml;
                        button.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            });
        });
    }
}

function getVideoIdFromUrl(url) {
    if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1].split('?')[0];
    }
    const videoId = url.split('v=')[1];
    if (!videoId) return null;
    return videoId.split('&')[0];
}
function cleanTitle(title) {
    // Remove view count and time information from title
    return title.replace(/\s*\|.*$/, '')           // Remove everything after |
        .replace(/\s*\d+[KMB]?\s*views.*$/, '')  // Remove view count
        .replace(/\s*\d+\s*(minutes?|hours?|days?|weeks?|months?)\s*ago.*$/, '')  // Remove time ago
        .trim();
}
function renderYouTubeVideos(videoData) {
    if (!videoData?.videos?.length) return;
    const container = document.querySelector('.video-scroll-container');

    container.innerHTML = videoData.videos.map(video => {
        const videoId = getVideoIdFromUrl(video.url);
        if (!videoId) return ''; // Skip invalid URLs
        const cleanedTitle = cleanTitle(video.title);

        return `
            <div class="video-container">
                <a href="${video.url}" class="video-card" target="_blank" rel="noopener">
                    <div class="video-thumbnail">
                        <picture>
                            <source srcset="https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg" media="(min-width: 480px)">
                            <img src="https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg" 
                                 alt="${cleanedTitle}"
                                 loading="lazy"
                                 onerror="this.onerror=null; this.src='https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg'">
                        </picture>
                        <div class="play-overlay">
                            <i class='bx bxl-youtube'></i>
                        </div>
                    </div>
                    <div class="video-info">
                        <span class="video-tag">Tutorial</span>
                        <h3 class="video-title">${cleanedTitle}</h3>
                        ${video.description ? `
                            <p class="video-description">${video.description.slice(0, 100)}${video.description.length > 100 ? '...' : ''}</p>
                        ` : ''}
                        <div class="watch-now">
                            Watch on YouTube <i class='bx bx-right-arrow-alt'></i>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');
}
async function fetchYouTubeData() {
    try {
        const response = await fetch('youtube.json');
        if (!response.ok) throw new Error('Failed to fetch YouTube data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading YouTube data:', error);
        return null;
    }
}
function setupTutorialsToggle() {
    const tutorialsToggle = document.querySelector('.tutorials-toggle');
    const videoSection = document.querySelector('.latest-video-section');
    const contentWrapper = document.querySelector('.content-wrapper');
    const methodologyGrid = document.querySelector('.methodology-grid');

    let videosLoaded = false;

    videoSection.classList.add('video-section-transition');
    contentWrapper.classList.add('content-transition');

    tutorialsToggle.addEventListener('click', async () => {
        videoSection.classList.toggle('visible');
        
        setTimeout(() => {
            contentWrapper.classList.toggle('shifted');
            
            if (methodologyGrid) {
                const width = window.innerWidth;
                if (videoSection.classList.contains('visible')) {
                    methodologyGrid.style.gridTemplateColumns = width > 1200 
                        ? 'repeat(auto-fill, minmax(240px, 1fr))'
                        : 'repeat(auto-fill, minmax(280px, 1fr))';
                } else {
                    methodologyGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
                }
            }
        }, 50);

        if (videoSection.classList.contains('visible') && !videosLoaded) {
            const videoData = await fetchYouTubeData();
            renderYouTubeVideos(videoData);
            videosLoaded = true;
        }

        tutorialsToggle.innerHTML = videoSection.classList.contains('visible')
            ? `<i class='bx bx-x'></i>Close`
            : `<i class='bx bxl-youtube'></i>Tutorials`;
    });

    window.addEventListener('resize', () => {
        if (videoSection.classList.contains('visible')) {
            const width = window.innerWidth;
            if (methodologyGrid) {
                methodologyGrid.style.gridTemplateColumns = width > 1200
                    ? 'repeat(auto-fill, minmax(240px, 1fr))'
                    : 'repeat(auto-fill, minmax(280px, 1fr))';
            }
        }
    });
}

function setupToolsToggle() {
    const toolsToggle = document.querySelector('.tools-toggle');
    const toolsSection = document.querySelector('.tools-section');
    const contentWrapper = document.querySelector('.content-wrapper');
    let toolsLoaded = false;

    toolsToggle.addEventListener('click', async () => {
        const videoSection = document.querySelector('.latest-video-section');
        
        if (videoSection.classList.contains('visible')) {
            videoSection.classList.remove('visible');
            document.querySelector('.tutorials-toggle').innerHTML = 
                `<i class='bx bxl-youtube'></i>Tutorials`;
        }

        toolsSection.classList.toggle('visible');
        contentWrapper.classList.toggle('shifted');

        if (toolsSection.classList.contains('visible') && !toolsLoaded) {
            const toolsData = await fetch('tools.json');
            const tools = await toolsData.json();
            renderTools(tools);
            toolsLoaded = true;
        }

        toolsToggle.innerHTML = toolsSection.classList.contains('visible')
            ? `<i class='bx bx-x'></i>Close`
            : `<i class='bx bx-wrench'></i>Tools`;
    });
}

function renderTools(toolsData) {
    const container = document.querySelector('.tools-container');
    const tools = toolsData.command_groups;
    
    container.innerHTML = tools.map(tool => `
        <div class="tool-card">
            <h3 class="tool-title">${tool.subtitle}</h3>
            <p class="tool-info">${tool.info}</p>
            <a href="${tool.cmd[0].DownloadLink}" class="tool-link" target="_blank">
                <i class='bx bxl-github'></i>
                View on GitHub
            </a>
        </div>
    `).join('');
}

function setupExtensionsToggle() {
    const extensionsToggle = document.querySelector('.extensions-toggle');
    const extensionsSection = document.querySelector('.extensions-section');
    const contentWrapper = document.querySelector('.content-wrapper');
    let extensionsLoaded = false;

    extensionsToggle.addEventListener('click', async () => {
        const videoSection = document.querySelector('.latest-video-section');
        const toolsSection = document.querySelector('.tools-section');
        
        // Close other sections if open
        if (videoSection.classList.contains('visible')) {
            videoSection.classList.remove('visible');
            document.querySelector('.tutorials-toggle').innerHTML = 
                `<i class='bx bxl-youtube'></i>Tutorials`;
        }
        if (toolsSection.classList.contains('visible')) {
            toolsSection.classList.remove('visible');
            document.querySelector('.tools-toggle').innerHTML = 
                `<i class='bx bx-wrench'></i>Tools`;
        }

        extensionsSection.classList.toggle('visible');
        contentWrapper.classList.toggle('shifted');

        if (extensionsSection.classList.contains('visible') && !extensionsLoaded) {
            const extensionsData = await fetch('extensions.json');
            const extensions = await extensionsData.json();
            renderExtensions(extensions);
            extensionsLoaded = true;
        }

        extensionsToggle.innerHTML = extensionsSection.classList.contains('visible')
            ? `<i class='bx bx-x'></i>Close`
            : `<i class='bx bx-extension'></i>Extensions`;
    });
}

function renderExtensions(extensionsData) {
    const container = document.querySelector('.extensions-container');
    const extensions = extensionsData.command_groups;
    
    container.innerHTML = extensions.map(extension => `
        <div class="extension-card">
            <h3 class="extension-title">${extension.subtitle}</h3>
            <p class="extension-info">${extension.info}</p>
            <a href="${extension.cmd[0].DownloadLink}" class="extension-link" target="_blank">
                <i class='bx bx-extension'></i>
                Add to your browser
            </a>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const methodologyContent = document.getElementById('methodology-content');

    methodologyContent.addEventListener('click', (e) => {
        const subtitle = e.target.closest('.subtitle');
        if (subtitle) {
            const downloadLink = subtitle.dataset.downloadLink;
            if (downloadLink) {
                copyToClipboard(downloadLink);
            }
        }
    });

    function copyToClipboard(text) {
        const gitCloneCommand = `git clone ${text}`;
        navigator.clipboard.writeText(gitCloneCommand).then(() => {
            showToast('Copied!');
            const subtitle = document.querySelector(`[data-download-link="${text}"]`);
            if (subtitle) {
                updateCopyIcon(subtitle);
            }
        })
    }

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        if (isError) {
            toast.style.backgroundColor = '#ff3333';
        }
        // document.body.appendChild(toast);

        // setTimeout(() => {
        //     toast.classList.add('show');
        // }, 10);

        // setTimeout(() => {
        //     toast.classList.remove('show');
        //     setTimeout(() => {
        //         document.body.removeChild(toast);
        //     }, 300);
        // }, 3000);
    }

    function updateCopyIcon(subtitle) {
        const copyIcon = subtitle.querySelector('.copy-icon i');
        copyIcon.classList.remove('bx-copy');
        copyIcon.classList.add('bx-check');
        setTimeout(() => {
            copyIcon.classList.remove('bx-check');
            copyIcon.classList.add('bx-copy');
        }, 2000);
    }
});

function setupWriteupsToggle() {
    const writeupsToggle = document.querySelector('.writeups-toggle');
    const writeupsSection = document.querySelector('.writeups-section');
    const contentWrapper = document.querySelector('.content-wrapper');
    let writeupsLoaded = false;

    writeupsToggle.addEventListener('click', async () => {
        const videoSection = document.querySelector('.latest-video-section');
        const toolsSection = document.querySelector('.tools-section');
        const extensionsSection = document.querySelector('.extensions-section');
        
        // This closes other sections if open :D
        if (videoSection.classList.contains('visible')) {
            videoSection.classList.remove('visible');
            document.querySelector('.tutorials-toggle').innerHTML = 
                `<i class='bx bxl-youtube'></i>Tutorials`;
        }
        if (toolsSection.classList.contains('visible')) {
            toolsSection.classList.remove('visible');
            document.querySelector('.tools-toggle').innerHTML = 
                `<i class='bx bx-wrench'></i>Tools`;
        }
        if (extensionsSection.classList.contains('visible')) {
            extensionsSection.classList.remove('visible');
            document.querySelector('.extensions-toggle').innerHTML = 
                `<i class='bx bx-extension'></i>Extensions`;
        }

        writeupsSection.classList.toggle('visible');
        contentWrapper.classList.toggle('shifted');

        if (writeupsSection.classList.contains('visible') && !writeupsLoaded) {
            const writeups = [
                {
                    title: "How to identify sensitive data in JavaScript files",
                    desc:"Impressive technique to find sensitive data.",
                    url: "https://medium.com/@coffinxp/how-to-identify-sensitive-data-in-javascript-files-jsrecon-306b8a2e6462?sk=074942180b91fd19f6e61f4e13815f5d"
                },
                {
                    title: "Find XSS vulnerabilities in just 2 minutes",
                    desc:"The best method to quickly find XSS.",
                    url: "https://medium.com/@coffinxp/find-xss-vulnerabilities-in-just-2-minutes-d14b63d000b1?sk=8fadb5146a6220e9e760bf9a930425c6"
                },
                {
                    title: "Find OriginIP of any website behind WAF",
                    desc:"The best method to find origin ip behind any waf.",
                    url: "https://infosecwriteups.com/how-to-find-origin-ip-of-any-website-behind-a-waf-c85095156ef7"
                },
                {
                    title: "PDF.js Arbitrary JavaScript Code Execution",
                    desc:"Vulnerability in PDF.js that allows attackers to run arbitrary Javascript code.",
                    url: "https://infosecwriteups.com/pdf-js-arbitrary-javascript-code-execution-cve-2024-4367-be4a64f877df"
                }
            ];
            renderWriteups(writeups);
            writeupsLoaded = true;
        }

        writeupsToggle.innerHTML = writeupsSection.classList.contains('visible')
            ? `<i class='bx bx-x'></i>Close`
            : `<i class='bx bx-book-content'></i>Writeups`;
    });
}

function renderWriteups(writeups) {
    const container = document.querySelector('.writeups-container');
    
    container.innerHTML = writeups.map(writeup => `
        <div class="writeup-card">
            <h3 class="writeup-title">${writeup.title}</h3>
            <p class"writeup-desc">${writeup.desc}</p>
            <a href="${writeup.url}" class="writeup-link" target="_blank">
                <i class='bx bx-link-external'></i>
                Read Writeup
            </a>
        </div>
    `).join('');
}
