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
    const thumbnailStamp = document.getElementById('thumbnail-stamp');
    
    // Set current date
    const date = new Date();
    currentDateStr.innerText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

    // Allow re-uploading by clicking the explicit button
    const uploadAnotherBtn = document.getElementById('upload-another-btn');
    if (uploadAnotherBtn) {
        uploadAnotherBtn.addEventListener('click', () => {
            fileInput.value = ''; // Reset the input so the same file can be selected again
            fileInput.click();
        });
    }

    // Modal Events
    if (thumbnailPreview) {
        thumbnailPreview.parentElement.addEventListener('click', () => {
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
            modalStamp.innerText = "ANALYZING...";
            modalStamp.className = "modal-stamp"; // default
            if (thumbnailStamp) thumbnailStamp.classList.add('hidden');
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
        if (thumbnailStamp) thumbnailStamp.classList.remove('hidden');

        if (isAi) {
            nodeOutput.classList.add('ai-result');
            outputTitle.innerText = "LIKELY AI";
            modalStamp.innerText = "LIKELY AI";
            modalStamp.className = "modal-stamp";
            if (thumbnailStamp) {
                thumbnailStamp.innerText = "LIKELY AI";
                thumbnailStamp.className = "thumbnail-stamp";
            }
        } else {
            nodeOutput.classList.add('real-result');
            outputTitle.innerText = "REAL IMAGE";
            modalStamp.innerText = "REAL IMAGE";
            modalStamp.className = "modal-stamp real-result";
            if (thumbnailStamp) {
                thumbnailStamp.innerText = "REAL IMAGE";
                thumbnailStamp.className = "thumbnail-stamp real-result";
            }
        }
        outputScore.innerText = conf.toFixed(0) + '%';
    }
});
