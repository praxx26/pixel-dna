document.addEventListener('DOMContentLoaded', () => {
    const uploadContainer = document.getElementById('upload-container');
    const targetArea = document.getElementById('target-area');
    const fileInput = document.getElementById('file-input');
    
    // New Node Graph Elements
    const nodeGraphContainer = document.getElementById('node-graph-container');
    const bgPreviewImg = document.getElementById('bg-preview-img');
    const thumbnailPreview = document.getElementById('thumbnail-preview');
    const dataLines = document.querySelectorAll('.data-line');
    
    // Nodes
    const nodeCnn = document.getElementById('node-cnn');
    const nodeMeta = document.getElementById('node-meta');
    const nodeOcr = document.getElementById('node-ocr');
    const statusCnn = document.getElementById('status-cnn');
    const statusMeta = document.getElementById('status-meta');
    const statusOcr = document.getElementById('status-ocr');
    const orbCore = document.querySelector('.orb-core');
    const orbLabel = document.getElementById('orb-label');
    const nodeOutput = document.getElementById('node-output');
    const outputTitle = document.getElementById('output-title');
    const outputScore = document.getElementById('output-score');
    const currentDateStr = document.getElementById('current-date');

    // Modal Elements
    const imageModal = document.getElementById('image-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalImg = document.getElementById('modal-img');
    const modalStamp = document.getElementById('modal-stamp');
    const scannerOverlay = document.getElementById('scanner-overlay');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    const thumbnailBack = document.getElementById('thumbnail-back');
    const thumbnailBackText = document.getElementById('thumbnail-back-text');
    const viewImageBtn = document.getElementById('view-image-btn');
    
    // SVG Icons for Stamps
    const iconAI = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
    const iconReal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`;
    
    // Set current date
    const date = new Date();
    currentDateStr.innerText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

    // 3D Flip State
    let flipRotation = 0;

    // Allow re-uploading by clicking the explicit button
    const uploadAnotherBtn = document.getElementById('upload-another-btn');
    if (uploadAnotherBtn) {
        uploadAnotherBtn.addEventListener('click', () => {
            fileInput.value = ''; // Reset the input so the same file can be selected again
            fileInput.click();
        });
    }

    // Interactive Flip Card Event
    if (thumbnailContainer) {
        thumbnailContainer.addEventListener('click', () => {
            flipRotation += 180;
            const inner = thumbnailContainer.querySelector('.thumbnail-inner');
            if (inner) inner.style.transform = `rotateY(${flipRotation}deg)`;
        });
    }

    // Modal Events
    if (viewImageBtn) {
        viewImageBtn.addEventListener('click', () => {
            imageModal.classList.remove('hidden');
        });
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', () => {
            imageModal.classList.add('hidden');
        });
    }

    // Drag and Drop
    targetArea.addEventListener('click', () => fileInput.click());

    targetArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        targetArea.style.opacity = '0.7';
    });

    targetArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        targetArea.style.opacity = '1';
    });

    targetArea.addEventListener('drop', (e) => {
        e.preventDefault();
        targetArea.style.opacity = '1';
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function logTerminal(msg) {
        // Log removed from UI, keep for debugging
        console.log(`[LOG] ${msg}`);
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        // Reset UI for New Analysis
        targetArea.classList.add('hidden');
        nodeGraphContainer.classList.remove('hidden');
        nodeOutput.classList.add('hidden');
        
        // Reset Nodes
        nodeCnn.classList.remove('active-ai-node', 'active-real-node');
        nodeMeta.classList.remove('active-ai-node', 'active-real-node');
        nodeOcr.classList.remove('active-ai-node', 'active-real-node');
        statusCnn.innerText = "Scanning...";
        statusMeta.innerText = "Scanning...";
        statusOcr.innerText = "Scanning...";
        orbLabel.innerText = "ANALYZING";
        orbCore.className = "orb-core"; // Reset colors
        nodeOutput.className = "node-box output-box hidden";
        dataLines.forEach(l => l.className.baseVal = "data-line animating");

        // Set Background Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            bgPreviewImg.src = e.target.result;
            thumbnailPreview.src = e.target.result;
            modalImg.src = e.target.result;
            // Clear stamp completely from modal
            modalStamp.innerHTML = "";
            modalStamp.classList.add('hidden'); 
            if (viewImageBtn) viewImageBtn.classList.remove('hidden');

            if (thumbnailContainer) {
                const inner = thumbnailContainer.querySelector('.thumbnail-inner');
                if (inner) {
                    // Disable transition to snap back to 0 without "rewind" spinning glitch
                    inner.style.transition = 'none';
                    flipRotation = 0;
                    inner.style.transform = `rotateY(0deg)`;
                    // Force browser layout reflow to apply the snap instantly
                    void inner.offsetWidth;
                    // Re-enable CSS transitions
                    inner.style.transition = '';
                }
            }
            if (scannerOverlay) scannerOverlay.classList.remove('hidden');
        };
        reader.readAsDataURL(file);

        // Upload
        const formData = new FormData();
        formData.append('file', file);

        fetch('/api/analyze', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            console.log("Analysis complete");
            updateResults(data);
        })
        .catch(err => {
            console.error(err);
            alert('An error occurred during analysis.');
            nodeGraphContainer.classList.add('hidden');
            targetArea.classList.remove('hidden');
        });
    }

    function updateResults(data) {
        const isAi = data.final_is_ai;
        const conf = data.final_confidence || 0;
        const aiScore = isAi ? conf : (100 - conf);

        // Stop all data lines animating and set color based on result
        dataLines.forEach(l => {
            l.className.baseVal = isAi ? "data-line animating" : "data-line animating real-flow";
        });

        // Update Input Nodes
        statusCnn.innerText = data.breakdown.cnn.ran ? data.breakdown.cnn.confidence.toFixed(0) + '%' : 'N/A';
        statusMeta.innerText = data.breakdown.metadata.is_ai ? 'Detected' : 'Clear';
        statusOcr.innerText = data.breakdown.ocr.is_ai ? 'Found' : 'Clear';

        // Highlight the winning node
        nodeCnn.classList.remove('active-ai-node', 'active-real-node');
        nodeMeta.classList.remove('active-ai-node', 'active-real-node');
        nodeOcr.classList.remove('active-ai-node', 'active-real-node');

        if (data.breakdown.metadata.is_ai) {
            nodeMeta.classList.add('active-ai-node');
        } else if (data.breakdown.ocr.is_ai) {
            nodeOcr.classList.add('active-ai-node');
        } else if (data.breakdown.cnn.ran) {
            if (data.breakdown.cnn.is_ai) {
                nodeCnn.classList.add('active-ai-node');
            } else {
                nodeCnn.classList.add('active-real-node');
            }
        }

        // Update Center Orb
        orbLabel.innerText = "COMPLETE";
        if (isAi) {
            orbCore.classList.add('ai-result');
        } else {
            orbCore.classList.add('real-result');
        }

        // Update Output Node
        nodeOutput.classList.remove('hidden');
        if (scannerOverlay) scannerOverlay.classList.add('hidden');
        // Do not unhide modalStamp. The modal is just for viewing the pure image now.

        if (isAi) {
            nodeOutput.classList.add('ai-result');
            outputTitle.innerText = "LIKELY AI";
            if (thumbnailBack) {
                thumbnailBackText.innerText = "LIKELY\nAI";
                thumbnailBack.className = "thumbnail-back";
            }
        } else {
            nodeOutput.classList.add('real-result');
            outputTitle.innerText = "REAL IMAGE";
            if (thumbnailBack) {
                thumbnailBackText.innerText = "REAL\nIMAGE";
                thumbnailBack.className = "thumbnail-back real-result";
            }
        }
        
        // Trigger 3D Flip Card! (Spin continuously to the back)
        if (thumbnailContainer) {
            // Only flip if it is currently facing front (even multiple of 180)
            if (flipRotation % 360 === 0) {
                flipRotation += 180;
            }
            const inner = thumbnailContainer.querySelector('.thumbnail-inner');
            if (inner) inner.style.transform = `rotateY(${flipRotation}deg)`;
        }
        
        outputScore.innerText = conf.toFixed(0) + '%';
    }
});
