document.addEventListener('DOMContentLoaded', () => {
    // Configuration - grouped by category
    const modelGroups = [
        {
            name: "Baseline",
            models: [
                {
                    name: "FIESTA",
                    folder: "FIESTA",
                    description: "Tracking Single Particles and Elongated Filaments with Nanometer Precision",
                    paper: "https://www.cell.com/biophysj/fulltext/S0006-3495(11)00467-X",
                    github: "https://github.com/fiesta-tud/FIESTA"
                }
            ]
        },
        {
            name: "Foundation Models for Microscopy",
            models: [
                {
                    name: "StarDist",
                    folder: "StarDist",
                    description: "Cell Detection with Star-Convex Polygons",
                    paper: "https://link.springer.com/chapter/10.1007/978-3-030-00934-2_30",
                    github: "https://github.com/stardist/stardist"
                },
                {
                    name: "TARDIS",
                    folder: "tardis_mt_tirf",
                    description: "Accurate and fast segmentation of filaments and membranes in micrographs and tomograms with TARDIS",
                    paper: "https://www.biorxiv.org/content/10.1101/2024.12.19.629196v2",
                    github: "https://github.com/SMLC-NYSBC/TARDIS"
                },
                {
                    name: "µSAM",
                    folder: "microSAM",
                    description: "Segment Anything for Microscopy",
                    paper: "https://www.nature.com/articles/s41592-024-02580-4",
                    github: "https://github.com/computational-cell-analytics/micro-sam"
                },
                {
                    name: "CellSAM",
                    folder: "CellSAM",
                    description: "A Foundation Model for Cell Segmentation",
                    paper: "https://arxiv.org/abs/2311.11004",
                    github: "https://github.com/vanvalenlab/cellSAM"
                },
                {
                    name: "Cellpose-SAM",
                    folder: "Cellpose-SAM",
                    description: "Cellpose-SAM: superhuman generalization for cellular segmentation",
                    paper: "https://www.biorxiv.org/content/10.1101/2025.04.28.651001v1",
                    github: "https://github.com/MouseLand/cellpose"
                }
            ]
        },
        {
            name: "General Purpose Foundation Models",
            models: [
                {
                    name: "SAM",
                    folder: "SAM",
                    description: "Segment Anything",
                    paper: "https://ai.meta.com/research/publications/segment-anything/",
                    github: "https://github.com/facebookresearch/segment-anything"
                },
                {
                    name: "SAM2",
                    folder: "SAM2",
                    description: "SAM 2: Segment Anything in Images and Videos",
                    paper: "https://ai.meta.com/research/publications/sam-2-segment-anything-in-images-and-videos/",
                    github: "https://github.com/facebookresearch/sam2"
                },
                {
                    name: "SAM3",
                    folder: "SAM3",
                    description: "SAM 3: Segment Anything with Concepts",
                    paper: "https://ai.meta.com/research/publications/sam-3-segment-anything-with-concepts/",
                    github: "https://github.com/facebookresearch/sam3"
                },
                {
                    name: "SAM3Text",
                    folder: "SAM3Text",
                    description: "SAM 3: Segment Anything with Concepts (text prompting mode)",
                    paper: "https://ai.meta.com/research/publications/sam-3-segment-anything-with-concepts/",
                    github: "https://github.com/facebookresearch/sam3"
                }
            ]
        }
    ];

    // Flatten models for easy access
    const models = modelGroups.flatMap(group => group.models);

    const images = {
        synthetic: Array.from({ length: 6 }, (_, i) => `synthetic_${i}.webp`),
        real: Array.from({ length: 6 }, (_, i) => `real_${i}.webp`)
    };

    // State
    let state = {
        selectedImage: { type: 'synthetic', filename: 'synthetic_0.webp' },
        selectedModels: ['FIESTA', 'SAM3Text'], // Array to preserve insertion order
        hpoEnabled: {} // Track HPO state per model folder, e.g., { 'SAM': true, 'FIESTA': false }
    };

    // DOM Elements
    const syntheticGrid = document.getElementById('synthetic-grid');
    const realGrid = document.getElementById('real-grid');
    const modelListLeft = document.getElementById('model-list-left');
    const modelListRight = document.getElementById('model-list-right');
    const resultsGrid = document.getElementById('results-grid');

    // Initialization
    function init() {
        renderImageGrid(syntheticGrid, images.synthetic, 'synthetic');
        renderImageGrid(realGrid, images.real, 'real');
        renderModelList();
        updateResults();

        // Copy citation functionality
        const copyButton = document.getElementById('copy-citation');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                const citationText = document.getElementById('citation-text').innerText;
                navigator.clipboard.writeText(citationText).then(() => {
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 5px;">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Copied!
                    `;
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                    }, 2000);
                });
            });
        }
    }

    // Render Image Grid
    function renderImageGrid(container, imageList, type) {
        container.innerHTML = '';
        imageList.forEach(filename => {
            const img = document.createElement('img');
            img.src = `images/${type}/raw/${filename}`;
            img.className = `image-thumb ${isSelectedImage(type, filename) ? 'active' : ''}`;
            img.alt = `${type} image ${filename}`;
            img.onclick = () => handleImageClick(type, filename);
            container.appendChild(img);
        });
    }

    // Render Model List
    function renderModelList() {
        modelListLeft.innerHTML = '';
        modelListRight.innerHTML = '';

        modelGroups.forEach(group => {
            // Determine which column: General Purpose goes right, others go left
            const targetList = group.name === 'General Purpose Foundation Models' ? modelListRight : modelListLeft;

            // Add group header
            const groupHeader = document.createElement('div');
            groupHeader.className = 'model-group-header';
            groupHeader.textContent = group.name;
            targetList.appendChild(groupHeader);

            // Add models in this group
            group.models.forEach(model => {
                const btn = document.createElement('div');
                btn.className = `model-btn ${state.selectedModels.includes(model.folder) ? 'active' : ''}`;

                // Left side: Model name container (flex: 1 to fill space)
                const nameContainer = document.createElement('span');
                nameContainer.className = 'model-name-container';

                // Inner wrapper that only spans the text width (for precise hover)
                const nameText = document.createElement('span');
                nameText.className = 'model-name-text';
                nameText.textContent = model.name;

                // Tooltip (inside nameText so it shows only when hovering the actual text)
                const tooltip = document.createElement('div');
                tooltip.className = 'model-tooltip';

                const desc = document.createElement('p');
                desc.className = 'tooltip-desc';
                desc.textContent = model.description;
                tooltip.appendChild(desc);

                const links = document.createElement('div');
                links.className = 'tooltip-links';

                if (model.paper) {
                    const paperLink = document.createElement('a');
                    paperLink.href = model.paper;
                    paperLink.target = '_blank';
                    paperLink.innerHTML = '📄 Paper';
                    paperLink.onclick = (e) => e.stopPropagation();
                    links.appendChild(paperLink);
                }

                if (model.github) {
                    const githubLink = document.createElement('a');
                    githubLink.href = model.github;
                    githubLink.target = '_blank';
                    githubLink.innerHTML = '💻 GitHub';
                    githubLink.onclick = (e) => e.stopPropagation();
                    links.appendChild(githubLink);
                }

                tooltip.appendChild(links);
                nameText.appendChild(tooltip);
                nameContainer.appendChild(nameText);
                btn.appendChild(nameContainer);

                // Right side: HPO toggle
                const hpoToggle = document.createElement('label');
                hpoToggle.className = 'hpo-toggle';
                hpoToggle.onclick = (e) => e.stopPropagation(); // Prevent model selection when clicking toggle

                const hpoCheckbox = document.createElement('input');
                hpoCheckbox.type = 'checkbox';
                hpoCheckbox.checked = state.hpoEnabled[model.folder] || false;
                hpoCheckbox.onchange = (e) => {
                    e.stopPropagation();
                    handleHpoToggle(model.folder, e.target.checked);
                };

                const hpoSlider = document.createElement('span');
                hpoSlider.className = 'hpo-slider';

                const hpoLabel = document.createElement('span');
                hpoLabel.className = 'hpo-label';
                hpoLabel.textContent = 'HPO';

                hpoToggle.appendChild(hpoCheckbox);
                hpoToggle.appendChild(hpoSlider);
                hpoToggle.appendChild(hpoLabel);
                btn.appendChild(hpoToggle);

                btn.onclick = () => handleModelClick(model.folder);
                targetList.appendChild(btn);
            });
        });
    }

    // Handle HPO Toggle
    function handleHpoToggle(folder, enabled) {
        state.hpoEnabled[folder] = enabled;
        updateResults();
    }

    // Handle Image Click
    function handleImageClick(type, filename) {
        state.selectedImage = { type, filename };

        // Update UI highlights
        document.querySelectorAll('.image-thumb').forEach(img => {
            img.classList.remove('active');
            if (img.src.includes(`images/${type}/raw/${filename}`)) {
                img.classList.add('active');
            }
        });

        updateResults();
    }

    // Handle Model Click
    function handleModelClick(folder) {
        const index = state.selectedModels.indexOf(folder);
        if (index !== -1) {
            // Remove from array
            state.selectedModels.splice(index, 1);
        } else {
            // Add to end of array
            state.selectedModels.push(folder);
        }

        // Update UI highlights
        renderModelList(); // Re-render to update active states
        updateResults();
    }

    // Helper to check if image is selected
    function isSelectedImage(type, filename) {
        return state.selectedImage.type === type && state.selectedImage.filename === filename;
    }

    // Update Results Grid - Smart diffing to avoid flicker
    function updateResults() {
        if (state.selectedModels.length === 0) {
            resultsGrid.innerHTML = '<div class="placeholder-text">Select at least one model to view results</div>';
            return;
        }

        // Remove placeholder if present
        const placeholder = resultsGrid.querySelector('.placeholder-text');
        if (placeholder) {
            placeholder.remove();
        }

        // Get selected models in selection order (not config order)
        const selectedModelsInOrder = state.selectedModels
            .map(folder => models.find(m => m.folder === folder))
            .filter(Boolean);

        // Set data-count attribute for CSS styling
        resultsGrid.setAttribute('data-count', selectedModelsInOrder.length);

        // Build a map of what should be displayed: key -> {model, hpo, src, label}
        const desiredItems = [];
        selectedModelsInOrder.forEach(model => {
            const hpoEnabled = state.hpoEnabled[model.folder] || false;
            const folderName = hpoEnabled ? `${model.folder}*` : model.folder;
            const filename = state.selectedImage.filename;

            // Use thumbnails initially, full res on demand
            const fullSrc = `images/${state.selectedImage.type}/${folderName}/${filename}`;
            const thumbSrc = `images/${state.selectedImage.type}/${folderName}/thumbnails/${filename}`;

            const labelText = hpoEnabled ? `${model.name} + HPO` : model.name;
            // Include filename in key to force re-render when image changes (fixes caching/stale image issues)
            const key = `${model.folder}-${hpoEnabled ? 'hpo' : 'nohpo'}-${filename}`;
            desiredItems.push({ model, hpoEnabled, fullSrc, thumbSrc, labelText, key });
        });

        // Build a map of current items in the DOM
        const currentItemsByKey = new Map();
        resultsGrid.querySelectorAll('.result-item').forEach(item => {
            const key = item.dataset.key;
            if (key) {
                currentItemsByKey.set(key, item);
            }
        });

        // Set of keys we want to keep
        const desiredKeys = new Set(desiredItems.map(d => d.key));

        // Remove items that are no longer needed
        currentItemsByKey.forEach((item, key) => {
            if (!desiredKeys.has(key)) {
                item.remove();
                currentItemsByKey.delete(key);
            }
        });

        // Now update/add items in order
        let previousElement = null;
        const useFullRes = selectedModelsInOrder.length <= 2;

        desiredItems.forEach(({ model, hpoEnabled, fullSrc, thumbSrc, labelText, key }) => {
            let item = currentItemsByKey.get(key);
            const targetSrc = useFullRes ? fullSrc : thumbSrc;

            // Construct GIF path: replace extension with _buildup.gif
            // e.g. images/real/SAM3Text/real_5.webp -> images/real/SAM3Text/real_5_buildup.gif
            const gifSrc = fullSrc.replace(/\.[^/.]+$/, "_buildup.gif");

            if (item) {
                // Item exists - update the image src if needed (for image change or count change)
                const img = item.querySelector('img');

                // Check if we need to update the image
                // We update if the underlying source changed OR if we switched between thumb/full mode
                // Note: img.src might be the full URL, so we compare with dataset or endsWith
                const currentSrc = img.getAttribute('src'); // Get the raw attribute value

                if (currentSrc !== targetSrc) {
                    img.src = targetSrc;
                    img.dataset.thumbSrc = thumbSrc;
                    img.dataset.fullSrc = fullSrc;
                    img.dataset.gifSrc = gifSrc;
                    img.dataset.loaded = useFullRes ? 'true' : 'false';
                } else {
                    // Ensure gifSrc is updated even if src didn't change (e.g. same image different model?)
                    // Actually key includes model so this is a new item usually.
                    // But if we just switch HPO, key changes.
                    // If we switch image, key changes.
                    // So this block is mostly for when we switch between thumb/full mode without changing key?
                    // No, key includes filename.
                    // Wait, if we add/remove models, the count changes, so useFullRes changes.
                    // The key stays the same for existing items.
                    // So we need to update gifSrc just in case?
                    // Actually gifSrc depends on fullSrc which depends on filename and model.
                    // If key is same, filename and model are same. So gifSrc is same.
                    // So we only need to update if we are updating the image src.
                    // But let's be safe and update dataset always if we are here.
                    img.dataset.gifSrc = gifSrc;
                }

                // Update label if needed
                const label = item.querySelector('span');
                if (label.textContent !== labelText) {
                    label.textContent = labelText;
                }

                // Update click handler
                img.onclick = () => openLightbox(gifSrc, labelText);

            } else {
                // Create new item
                item = document.createElement('div');
                item.className = 'result-item';
                item.dataset.key = key;

                const img = document.createElement('img');
                img.src = targetSrc;
                img.dataset.thumbSrc = thumbSrc;
                img.dataset.fullSrc = fullSrc;
                img.dataset.gifSrc = gifSrc;
                img.dataset.loaded = useFullRes ? 'true' : 'false';
                img.alt = `${model.name} result`;
                img.loading = 'lazy';

                // Hover: Load full res (only if not already loaded)
                img.addEventListener('mouseenter', () => {
                    if (img.dataset.loaded === 'false') {
                        const highRes = new Image();
                        highRes.onload = () => {
                            img.src = img.dataset.fullSrc;
                            img.dataset.loaded = 'true';
                        };
                        highRes.src = img.dataset.fullSrc;
                    }
                });

                // Click: Open Lightbox with GIF
                img.onclick = () => openLightbox(gifSrc, labelText);

                const label = document.createElement('span');
                label.textContent = labelText;

                item.appendChild(img);
                item.appendChild(label);
                currentItemsByKey.set(key, item);
            }            // Ensure correct order: insert after previousElement (or at start)
            if (previousElement) {
                if (item.previousElementSibling !== previousElement) {
                    previousElement.after(item);
                }
            } else {
                if (item !== resultsGrid.firstElementChild) {
                    resultsGrid.prepend(item);
                }
            }

            previousElement = item;
        });
    }

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    function openLightbox(src, caption) {
        if (lightbox && lightboxImg && lightboxCaption) {
            lightbox.style.display = "block";
            lightboxImg.src = src;
            lightboxCaption.textContent = caption;
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }

    if (lightboxClose) {
        lightboxClose.onclick = () => {
            lightbox.style.display = "none";
            document.body.style.overflow = '';
        };
    }

    if (lightbox) {
        lightbox.onclick = (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
                document.body.style.overflow = '';
            }
        };

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === "block") {
                lightbox.style.display = "none";
                document.body.style.overflow = '';
            }
        });
    }

    // Run init
    init();
});
