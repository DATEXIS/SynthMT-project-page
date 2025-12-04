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
        synthetic: Array.from({ length: 6 }, (_, i) => `synthetic_${i}.png`),
        real: Array.from({ length: 6 }, (_, i) => `real_${i}.png`)
    };

    // State
    let state = {
        selectedImage: { type: 'synthetic', filename: 'synthetic_0.png' },
        selectedModels: new Set(['FIESTA', 'SAM3Text']), // Default selection
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
                btn.className = `model-btn ${state.selectedModels.has(model.folder) ? 'active' : ''}`;

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
        if (state.selectedModels.has(folder)) {
            state.selectedModels.delete(folder);
        } else {
            state.selectedModels.add(folder);
        }

        // Update UI highlights
        renderModelList(); // Re-render to update active states
        updateResults();
    }

    // Helper to check if image is selected
    function isSelectedImage(type, filename) {
        return state.selectedImage.type === type && state.selectedImage.filename === filename;
    }

    // Update Results Grid
    function updateResults() {
        resultsGrid.innerHTML = '';

        if (state.selectedModels.size === 0) {
            resultsGrid.innerHTML = '<div class="placeholder-text">Select at least one model to view results</div>';
            return;
        }

        // Sort selected models to match the order in the config
        const sortedSelectedModels = models.filter(m => state.selectedModels.has(m.folder));

        // Set data-count attribute for CSS styling
        resultsGrid.setAttribute('data-count', sortedSelectedModels.length);

        sortedSelectedModels.forEach(model => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const img = document.createElement('img');
            // Check if HPO is enabled for this model
            const hpoEnabled = state.hpoEnabled[model.folder] || false;
            const folderName = hpoEnabled ? `${model.folder}*` : model.folder;

            // The raw images are .png, but the segmented images are .webp
            const filenameWebp = state.selectedImage.filename.replace('.png', '.webp');
            img.src = `images/${state.selectedImage.type}/${folderName}/${filenameWebp}`;
            img.alt = `${model.name} result`;
            img.loading = 'lazy';

            const label = document.createElement('span');
            label.textContent = hpoEnabled ? `${model.name} +HPO` : model.name;

            item.appendChild(img);
            item.appendChild(label);
            resultsGrid.appendChild(item);
        });
    }

    // Run init
    init();
});
