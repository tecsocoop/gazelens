console.log('GAZELENS is loading...');
let availableFunctions = [];
const LIBRARY_VERSION = '4.10.0';
let isOpenCvReady = false;
let canProcessImagge = false;
let executionOrderDown = true;
let isImageReady = false;
let matrixImageSource = null;
let extensionUpload = null;
let offsetHeight = 0;
let offsetWidth = 0;


/**
 * A class representing a configurable image processing function.
 * 
 * The ConfigFunction class is designed to encapsulate various parameters and execute both
 * JavaScript and Python code snippets for a given image processing task, leveraging the OpenCV library.
 * 
 * @class
 * @param {string} functionName - The internal name of the function.
 * @param {string} displayName - The human-readable name of the function.
 * @param {string} help - A URL or text snippet that provides more information or help regarding the function.
 * @param {Object} [parameters={}] - A key-value object representing the parameters required for the function.
 * @param {string} jsCode - The JavaScript code snippet executed to perform the image processing.
 * @param {string} [pythonCode=''] - The Python code snippet or a template (optional) that complements the JavaScript code.
 * @param {string} [comments=''] - Additional comments about the function.
 * @param {Array} [dependencies=[]] - An array of function names that this function depends on for execution.
 * 
 * @method execute - A method to execute the JavaScript code, replacing placeholders with actual parameter values and generating Python code for the function.
 * 
 * @param {Object} cv - The OpenCV object used for image processing.
 * @param {Object} src - The source matrix image on which the function is applied.
 * @param {Object} params - The parameters object containing values to be replaced in the function code.
 * 
 * @returns {Object} The processed destination matrix image.
 */
class ConfigFunction {

    constructor(functionName, displayName, help, img, parameters = {}, jsCode, pythonCode = '', comments = '', dependencies = []) {
        Object.assign(this, { function: functionName, displayName, help, img, parameters, jsCode, pythonCode, comments, dependencies });
    }

    /**
     * Executes the image processing function using the provided OpenCV object (cv), source matrix image (src),
     * and function parameters (params). This method generates a Python code snippet based on the function's
     * configuration, executing the JavaScript code necessary for the image transformation.
     * 
     * @param {Object} cv - The OpenCV instance utilized for image processing operations.
     * @param {Object} src - The source matrix image that the processing is applied to.
     * @param {Object} params - Parameters for the function's execution, replacing any necessary placeholders
     *                          in the JavaScript and Python code.
     * 
     * @returns {Object} The resulting matrix image after applying the processing function.
     * 
     * The method first constructs a Python code snippet by adapting the template with function-specific
     * parameters. It then dynamically generates a JavaScript function using the `new Function` constructor. 
     * The JavaScript code defined in this function uses OpenCV operations to process the `src` matrix 
     * and produce a `dst` matrix with the applied transformations. The `src` matrix is deleted after processing.
     */
    execute(cv, src, params) {
        const executeFunction = new Function('cv', 'src', 'params', `
            let dst = new cv.Mat();
            ${this.jsCode}
            if (src) src.delete();
            return dst;
        `);
        return executeFunction(cv, src, params);
    }

    pythonSource(params) {
        let newCode = this.pythonCode;
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                newCode = newCode.replaceAll(`%${key}%`, value);
            }
        }

        let code = `
# ${this.displayName}${newCode}
`;
        return code;
    }

    javascriptSource(params) {
        let newCode = this.jsCode;
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (typeof (value) === 'string') {
                    newCode = newCode.replaceAll(`params.${key}`, `'${value}'`);
                } else {
                    newCode = newCode.replaceAll(`params.${key}`, value);
                }
            }
        }
        let code = `
// ${this.displayName}
let dst = new cv.Mat();${newCode}
if (src) src.delete();
src = dst;
`;
        return code;
    }
}

/**
 * Toggles the visibility of an HTML element by adding or removing the 'is-hidden' class.
 * 
 * @param {string} id - The ID or tag element of the HTML element to toggle.
 * @param {string} clas - The class name to toggle.
 * @param {string} force - Used un toggle function, it's a boolean o null.
*/
function toggleClass(id, clas, force = null) {
    let element = id;
    if (typeof (id) === 'string')
        element = document.getElementById(id);

    if (element) element.classList.toggle(clas, force);

}

/**
 * Toggles the visibility of an HTML element by adding or removing the 'is-hidden' class.
 * 
 * @param {string} id - The ID of the HTML element to toggle.
*/
function toggleAppliedFunction(id) {
    const element = document.getElementById(id);

    if (element) {
        element.classList.toggle('is-hidden');
    }
}

/**
 * Toggles the visibility of the sidebar and adjusts the main content layout.
 * Updates the sidebar's display state, the main content column classes,
 * and the appearance and source of the toggle button image.
 */
function toggleSidebar() {
    const sidebar = document.getElementById('left_sidebar');
    const mainContent = document.getElementById('main_work');
    const image = document.getElementById('close_3_left_bar');
    const isSidebarHidden = sidebar.classList.contains('is-hidden');

    sidebar.classList.toggle('is-hidden', !isSidebarHidden);

    mainContent.classList.toggle('is-7', isSidebarHidden);
    mainContent.classList.toggle('is-9', !isSidebarHidden);

    image.classList.toggle('thin-image', isSidebarHidden);
    image.classList.toggle('thin-image-wheel', !isSidebarHidden);

    image.src = isSidebarHidden
        ? './img/work/close-left-bar.svg'
        : './img/work/color-wheel.svg';
}


/**
 * Initializes tab functionality for elements with the 'tabs' class.
 * Attaches click event listeners to each tab, toggling the active tab's styles,
 * hiding inactive content, and displaying the target content for the selected tab.
 */
function initializeTabs() {
    const tabs = document.querySelectorAll('.tabs li');
    const tabContents = document.querySelectorAll('#tab-content > div');

    tabs.forEach((tab) => {
        tab.onclick = function (event) {
            event.preventDefault();

            const linkText = this.querySelector('div > div > a').textContent;
            const additionalClass = linkText === 'Code'
                ? 'buttons-medium-left-side-right'
                : 'buttons-medium-side-right';

            tabs.forEach((t) =>
                t.classList.remove('is-active', 'buttons-medium-side-right', 'buttons-medium-left-side-right')
            );

            this.classList.add('is-active', additionalClass);

            tabContents.forEach((content) => content.classList.add('is-hidden'));

            const targetId = this.querySelector('a').getAttribute('href').substring(1);
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('is-hidden');
            }
        };
    });
}

/**
 * Reads the selected image file from the input element and displays it.
 * The function uses a FileReader to load the image, updates the source of the image element,
 * and triggers subsequent processing steps once the image is loaded.
 */
function readURL() {
    const input = document.getElementById('input_file');
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    extensionUpload = file.name.split('.').pop();
    const reader = new FileReader();
    reader.onload = function (event) {
        const imageElement = document.getElementById('image_src');
        if (!imageElement) return;
        imageElement.src = event.target.result;
        displaySection(true);
        imageElement.onload = function () {
            isImageReady = true;
            if (typeof cv !== 'undefined') {
                matrixImageSource = cv.imread('image_src');
                // printMat(matrixImageSource);
                processImage();
                showOriginal(matrixImageSource.clone());
                showHistogram(matrixImageSource.clone());
            } else {
                messageBox('OpenCV library is not loaded.');
            }
        };
    };
    reader.readAsDataURL(file);
}


/**
 * Checks if the application is ready for image processing.
 * Verifies whether OpenCV is loaded and an image has been successfully loaded.
 * Displays appropriate messages if either condition is not met.
 * 
 * @returns {boolean} - Returns true if both OpenCV and the image are ready; otherwise, false.
 */
function checkIsReady() {
    if (!isOpenCvReady) {
        messageBox('Wait until OpenCV is loaded!');
        return false;
    }

    if (!isImageReady) {
        messageBox('Please load an image first.');
        return false;
    }

    return true;
}

/**
 * Reduces the size of the input image to fit within a target width while maintaining aspect ratio.
 * If OpenCV or the image is not ready, it displays a message and exits.
 * 
 * @param {number} targetWidth - The desired maximum width of the resized image (default is 480).
 * @param {cv.Mat} src - The source image as an OpenCV Mat object.
 * @returns {cv.Mat|null} - The resized image as an OpenCV Mat object, or null if an error occurs.
 */
function reduceSizeImage(targetWidth, src) {
    if (!checkIsReady()) return null;

    const width = src.cols;
    const height = src.rows;
    const maxDim = Math.max(width, height);
    const scale = targetWidth / maxDim;

    const roi = new cv.Rect();
    if (width >= height) {
        roi.width = targetWidth;
        roi.x = 0;
        roi.height = Math.floor(height * scale);
        roi.y = Math.floor((targetWidth - roi.height) / 2);
    } else {
        roi.y = 0;
        roi.height = targetWidth;
        roi.width = Math.floor(width * scale);
        roi.x = Math.floor((targetWidth - roi.width) / 2);
    }
    const dst = new cv.Mat();
    cv.resize(src, dst, new cv.Size(roi.width, roi.height));
    src.delete();
    return dst;
}

/**
 * Reduces the size of the input image to fit within a target width while maintaining aspect ratio.
 * If OpenCV or the image is not ready, it displays a message and exits.
 * 
 * @param {cv.Mat} src - The source image as an OpenCV Mat object.
 *
 * @returns {cv.Mat|null} - The resized image as an OpenCV Mat object, or null if an error occurs.
 */
function reduceSize(src) {
    if (offsetHeight === 0) {
        const mainWorkElement = document.getElementById('main_work');
        offsetHeight = mainWorkElement.offsetHeight - 50;
        offsetWidth = mainWorkElement.offsetWidth - 50;
    }

    return reduceSizeImage(Math.min(offsetWidth, offsetHeight), src);
}

/**
 * Reduces the size of the input image to fit within a target width while maintaining aspect ratio.
 * If OpenCV or the image is not ready, it displays a message and exits.
 * 
 * @param {cv.Mat} src - The source image as an OpenCV Mat object.
 * @returns {cv.Mat|null} - The resized image as an OpenCV Mat object, or null if an error occurs.
 */
function reduceThumbnail(src) {
    return reduceSizeImage(80, src);
}

/**
 * Toggles the visibility of histogram-related elements (hide, show, and canvas) based on their current state.
 * 
 * @param {string} parameter - Specifies whether the 'original' or 'output' histogram is being toggled. 
 *                             Defaults to 'original'.
 */
function toggleOriginalHistogram(parameter = 'original') {
    const hiddenClass = 'is-hidden';
    const hideElement = document.getElementById(`div_hide_${parameter}`);
    const showElement = document.getElementById(`div_show_${parameter}`);
    const canvasElement = document.getElementById(
        parameter === 'original' ? 'canvas_input' : 'canvas_output_histogram'
    );

    if (!hideElement || !showElement || !canvasElement) {
        return;
    }

    const isHidden = hideElement.classList.contains(hiddenClass);

    hideElement.classList.toggle(hiddenClass, !isHidden);
    canvasElement.classList.toggle(hiddenClass, !isHidden);
    showElement.classList.toggle(hiddenClass, isHidden);
}

/**
 * Displays the original image on the input canvas after reducing its size to a thumbnail.
 * The function uses OpenCV to render the image and releases memory after processing.
 * 
 * @param src — The source image as an OpenCV Mat object.
 */
function showOriginal(src) {
    const matOriginal = reduceThumbnail(src);
    if (!matOriginal) {
        messageBox('Failed to generate the thumbnail.');
        return;
    }
    cv.imshow('canvas_input', matOriginal);
    matOriginal.delete();
}

/**
 * Computes and displays the histogram of the image shown on the 'canvas_output' element.
 * The histogram is calculated using OpenCV, scaled, and rendered on the 'canvas_output_histogram' element.
 * Ensures proper memory management by releasing OpenCV matrices after use.
 * @param {cv.Mat} src - The source image as an OpenCV Mat object.
 */
function showHistogram(src) {
    const srcVec = new cv.MatVector();
    srcVec.push_back(src);

    const accumulate = false;
    const channels = [0]; // Grayscale or single-channel
    const histSize = [256]; // Number of bins
    const ranges = [0, 255]; // Pixel intensity range
    const hist = new cv.Mat();
    const mask = new cv.Mat();
    const color = new cv.Scalar(255, 255, 255); // White color for the histogram
    const scale = 2; // Scale factor for drawing the histogram

    cv.calcHist(srcVec, channels, mask, hist, histSize, ranges, accumulate);
    const { maxVal: max } = cv.minMaxLoc(hist, mask);

    const histogramHeight = 80;
    const dst = new cv.Mat.zeros(histogramHeight, histSize[0] * scale, cv.CV_8UC3);

    for (let i = 0; i < histSize[0]; i++) {
        const binValue = hist.data32F[i] * histogramHeight / max;
        const point1 = new cv.Point(i * scale, histogramHeight - 1);
        const point2 = new cv.Point((i + 1) * scale - 1, histogramHeight - binValue);
        cv.rectangle(dst, point1, point2, color, cv.FILLED);
    }
    cv.imshow('canvas_output_histogram', dst);
    src.delete(); dst.delete(); srcVec.delete(); mask.delete(); hist.delete();
}

/**
 * Resets the application state to its initial condition.
 * Clears the applied functions list and code editor content,
 * and hides relevant sections by updating the UI.
 */
function initFromTheBeginning() {
    const appliedFunctionsElement = document.getElementById('applied_functions');
    if (appliedFunctionsElement) appliedFunctionsElement.textContent = '';
    const codeEditorElement = document.getElementById('textarea_code');
    if (codeEditorElement) codeEditorElement.textContent = '';
    displaySection(false);
}

/**
 * Processes and downloads the output image displayed on the canvas.
 * Verifies that the application is ready, the image is loaded, and the canvas has valid dimensions.
 * Handles memory cleanup after processing.
 */
function downloadImage() {
    if (!checkIsReady()) return;
    const imageSrc = document.getElementById('image_src');
    if (!imageSrc) {
        messageBox('Image does not exist.');
        return;
    }
    if (!imageSrc.complete || imageSrc.naturalWidth === 0) {
        messageBox('Image is not fully loaded.');
        return;
    }
    const canvas = document.getElementById('canvas_output');
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
        messageBox('Canvas has no valid dimensions.');
        return;
    }
    let srcMatrix;
    try {
        srcMatrix = matrixImageSource.clone();
    } catch (error) {
        messageBox('Error processing the image. Please try again.');
        return;
    }

    const processedMatrix = executeFunctions(srcMatrix);

    const outputCanvas = document.getElementById('canvas_output_original');
    if (outputCanvas) {
        cv.imshow('canvas_output_original', processedMatrix);
        const link = document.createElement('a');
        link.download = 'processed_image.' + extensionUpload;
        link.href = outputCanvas.toDataURL();
        link.click();
        messageBox('Download completed.', false);
    } else {
        messageBox('Failed to find the output canvas.');
    }

    try {
        srcMatrix.delete();
    } catch (ignore) { }

    try {
        processedMatrix.delete();
    } catch (ignore) { }
}


/**
 * Dynamically generates and loads UI elements for available image processing functions.
 * Each function is represented as a card with interactive elements for help and addition to the applied list.
 */
function loadFunctions() {
    const availableFilterList = document.getElementById('available_filter_list');
    if (!availableFilterList) {
        messageBox("The 'available_filter_list' element was not found.");
        return;
    }

    availableFunctions.forEach((config) => {
        const card = document.createElement('div');
        card.classList.add(
            'card',
            'card-content',
            'is-fullwidth',
            'direction-ltr',
            'section-filters-card-color',
            'pb-2',
            'mb-2',
            'my-1'
        );

        const columns = document.createElement('div');
        columns.classList.add(
            'columns',
            'is-fullwidth',
            'section-filters-card-columns',
            'section-filters-card-color'
        );
        card.appendChild(columns);

        columns.appendChild(createColumnPreview(config));
        columns.appendChild(createColumnAddButton(config));
        columns.appendChild(createColumnFunctionName(config));


        availableFilterList.appendChild(card);
    });
}

/**
 * Creates the first column of the filter card, which includes a help icon.
 * Clicking the icon opens a help link in a new tab if available.
 * 
 * @param {Object} config - The configuration object for the filter, containing its display name and help link.
 * @returns {HTMLElement} - The constructed first column element.
 */
function createColumnPreview(config) {
    const column = document.createElement('div');
    column.classList.add(
        'column',
        'is-2',
        'p-0',
        'section-filters-card-color',
        'section-filters-card-color-img',
    );
    column.title = `Help with ${config.displayName}`;

    const previewIcon = document.createElement('img');
    previewIcon.classList.add(
        'p-0',
        'section-filters-card-color',
        'handover'
    );
    previewIcon.src = config.img;
    
    let timer = 0;
    previewIcon.onmouseenter = (event) => {
        timer = setTimeout(() => {
            timer = 0;
            zoomIn(event, config);
        }, 1500, event, config);
    };
    previewIcon.onmouseleave = () => {
        if (timer) {
            clearTimeout(timer);
        }
        zoomOut();
    };
    
    previewIcon.onclick = (event) => {
        addFunction(event, config);
    };


    column.appendChild(previewIcon);


    return column;
}

/**
 * Creates the second column of the filter card, which includes an add icon.
 * Clicking the icon adds the filter to the applied functions list.
 * 
 * @param {Object} config - The configuration object for the filter, containing its function and display name.
 * @returns {HTMLElement} - The constructed second column element.
 */
function createColumnAddButton(config) {
    const column = document.createElement('div');
    column.classList.add(
        'column',
        'is-narrow',
        'p-0',
        'section-filters-card-color',
        'handover'
    );
    column.title = `Add ${config.displayName}`;
    column.dataset.function = config.function;

    const addIcon = document.createElement('img');
    addIcon.classList.add(
        'is-48x48',
        'section-filters-card-color'
    );
    addIcon.src = './img/work/add-circle.svg';
    addIcon.onclick = (event) => {
        addFunction(event, config);
    };
    
    const addIconInfo = document.createElement('img');
    addIconInfo.classList.add(
        'is-48x48',
        'section-filters-card-color'
    );
    addIconInfo.src = './img/work/info-help.svg';
    addIconInfo.onclick = (event) => {
        if (config.help) {
            window.open(config.help, '_blank').focus();
        }
    };

    column.appendChild(addIcon);
    column.appendChild(document.createElement('br'));
    column.appendChild(addIconInfo);


    return column;
}

/**
 * Creates the third column of the filter card, which displays the filter name.
 * Clicking the name adds the filter to the applied functions list.
 * 
 * @param {Object} config - The configuration object for the filter, containing its function and display name.
 * @returns {HTMLElement} - The constructed third column element.
 */
function createColumnFunctionName(config) {
    const column = document.createElement('div');
    column.classList.add(
        'column',
        'p-0',
        'section-filters-card-color'
    );
    column.title = `Add ${config.displayName}`;

    const nameLabel = document.createElement('div');
    nameLabel.classList.add(
        'label-black',
        'has-text-left',
        'section-filters-card-color',
        'handover'
    );
    nameLabel.dataset.function = config.function;
    nameLabel.textContent = config.displayName;
    column.appendChild(nameLabel);

    nameLabel.onclick = (event) => {
        addFunction(event, config);
    };

    return column;
}

/**
 * Adds a new filter card to the applied functions list.
 * Initializes a card UI with controls for collapsing, moving up/down, and removing the filter.
 * Also updates the parameter controls and triggers reprocessing.
 * 
 * @param {Event} event - The event object triggered by the user action.
 * @param {Object} config - The configuration object for the filter, containing function details and display settings.
 */
function addFunction(event, config) {
    if (!checkIsReady()) return;

    const uniqueKey = `${Date.now()}`;
    const appliedFunctions = document.getElementById('applied_functions');
    if (!appliedFunctions) return;

    const card = document.createElement('div');
    card.classList.add('card', 'card-spaces');
    card.dataset.function = config.function;
    card.id = `card_container_${uniqueKey}`;
    card.dataset.key = uniqueKey;

    const header = document.createElement('div');
    header.classList.add('card-header');
    header.dataset.key = uniqueKey;
    header.id = `card_header_${uniqueKey}`;
    card.appendChild(header);

    const title = document.createElement('div');
    title.classList.add('card-header-title', 'custom-card-header-title');
    title.dataset.key = uniqueKey;
    title.id = `card_header_title_${uniqueKey}`;
    header.appendChild(title);

    const field = document.createElement('div');
    field.classList.add('field');
    title.appendChild(field);

    const columns = document.createElement('div');
    columns.classList.add('columns');
    columns.dataset.key = uniqueKey;
    columns.id = `card_header_title_columns_${uniqueKey}`;
    field.appendChild(columns);

    columns.appendChild(createColumnCollapse(uniqueKey));
    columns.appendChild(createColumnName(config, uniqueKey));
    columns.appendChild(createColumnDrop(uniqueKey));

    if (config.comments) {
        const comments = document.createElement('div');
        comments.classList.add('field', 'applied-function-comment');
        comments.id = `applied_function_comment_${uniqueKey}`;
        comments.textContent = config.comments;
        title.appendChild(comments);
    }

    updateParameterControls(card, config, uniqueKey);
    if (executionOrderDown) {
        appliedFunctions.appendChild(card);
    } else {
        appliedFunctions.insertBefore(card, appliedFunctions.children[0]);
    }
    removeAngleDownUp();
    processImage();
}

/**
 * Creates the collapse control column for the card header.
 * Toggles the visibility of the card's details when clicked.
 * 
 * @param {string} uniqueKey - A unique identifier for the card.
 * @returns {HTMLElement} - The constructed collapse control column element.
 */
function createColumnCollapse(uniqueKey) {
    const column = document.createElement('div');
    column.classList.add(
        'column',
        'is-1',
        'custom-card-header-title-column-menu',
        'custom-card-column'
    );
    column.dataset.key = uniqueKey;
    column.id = `card_header_title_columns_first_${uniqueKey}`;

    const img = document.createElement('img');
    img.src = './img/work/menu.svg';
    img.classList.add('custom-card-column', 'handover');
    img.dataset.key = uniqueKey;
    img.id = `card_header_title_columns_first_img_${uniqueKey}`;
    img.title = 'Collapse Filter';

    column.appendChild(img);

    column.onclick = () => {
        toggleAppliedFunction(`card_content_${uniqueKey}`);
        toggleAppliedFunction(`applied_function_comment_${uniqueKey}`);
        processImage();
    };

    return column;
}

/**
 * Creates the name display column for the card header.
 * Includes the filter name and controls for moving the card up or down in the list.
 * 
 * @param {Object} config - The configuration object for the filter, containing the display name.
 * @param {string} uniqueKey - A unique identifier for the card.
 * @returns {HTMLElement} - The constructed name display column element.
 */
function createColumnName(config, uniqueKey) {
    const column = document.createElement('div');
    column.classList.add(
        'column',
        'is-10',
        'work-right-filter-columns-text',
        'custom-card-header-title-column-name',
        'custom-card-column'
    );
    column.id = `card_header_title_columns_second_${uniqueKey}`;
    column.dataset.key = uniqueKey;

    const name = document.createElement('div');
    name.classList.add('custom-card-column');
    name.dataset.key = uniqueKey;
    name.id = `card_header_title_columns_second_div_${uniqueKey}`;
    name.textContent = config.displayName;
    column.appendChild(name);

    column.appendChild(createDivUpDown(uniqueKey, true));
    column.appendChild(createDivUpDown(uniqueKey, false));

    return column;
}


/**
 * Creates a control for moving the card up or down in the applied functions list.
 * 
 * @param {string} uniqueKey - A unique identifier for the card.
 * @param {boolean} up - If true, creates an 'up' control; otherwise, creates a 'down' control.
 * @returns {HTMLElement} - The constructed move control element.
 */
function createDivUpDown(uniqueKey, up) {
    const img = document.createElement('img');
    img.classList.add('custom-card-column', 'handover');
    img.dataset.key = uniqueKey;

    if (up) {
        img.src = './img/work/angle-up.svg';
        img.id = `card_header_title_columns_second_up_${uniqueKey}`;
        img.title = 'Move Filter Up';
    } else {
        img.src = './img/work/angle-down.svg';
        img.id = `card_header_title_columns_second_down_${uniqueKey}`;
        img.title = 'Move Filter Down';
    }

    img.onclick = () => {
        if (!checkIsReady()) return;
        const divElement = document.getElementById(`card_container_${uniqueKey}`);
        if (!divElement) return;

        const parentElement = document.getElementById('applied_functions');
        if (!parentElement) return;

        const index = Array.prototype.indexOf.call(parentElement.children, divElement);

        if (up && index > 0) {
            parentElement.insertBefore(divElement, parentElement.children[index - 1]);
        } else if (!up && index < parentElement.children.length - 1) {
            parentElement.insertBefore(parentElement.children[index + 1], divElement);
        }

        removeAngleDownUp();
        processImage();
    };

    return img;
}

/**
 * Creates the remove control column for the card header.
 * Clicking the control removes the card from the applied functions list.
 * 
 * @param {string} uniqueKey - A unique identifier for the card.
 * @returns {HTMLElement} - The constructed remove control column element.
 */
function createColumnDrop(uniqueKey) {
    const column = document.createElement('div');
    column.classList.add(
        'column',
        'is-1',
        'custom-card-header-title-column-menu',
        'custom-card-column'
    );
    column.dataset.key = uniqueKey;
    column.id = `card_header_title_columns_third_${uniqueKey}`;

    const img = document.createElement('img');
    img.src = './img/work/close.svg';
    img.dataset.key = uniqueKey;
    img.classList.add(
        'custom-card-column',
        'handover',
        'is-32x32'
    );
    img.id = `card_header_title_columns_third_img_${uniqueKey}`;
    img.title = 'Remove Filter';

    column.appendChild(img);

    img.onclick = () => {
        if (!checkIsReady()) return;
        document.getElementById(`card_container_${uniqueKey}`).remove();
        removeAngleDownUp();
        processImage();
    };

    return column;
}

/**
 * Adjusts the visibility of 'Move Up' and 'Move Down' controls for each filter card.
 * Ensures the first card's 'Move Up' and the last card's 'Move Down' buttons are hidden.
 */
function removeAngleDownUp() {
    const parentElement = document.getElementById('applied_functions');
    if (!parentElement) {
        messageBox("'applied_functions' element not found.");
        return;
    }

    const children = Array.from(parentElement.children);
    const childrenLength = children.length - 1;

    children.forEach((element, index) => {
        const up = element.querySelector(`#card_header_title_columns_second_up_${element.dataset.key}`);
        const down = element.querySelector(`#card_header_title_columns_second_down_${element.dataset.key}`);

        if (up) up.classList.remove('is-hidden');
        if (down) down.classList.remove('is-hidden');

        if (up && index === 0) {
            up.classList.add('is-hidden');
        }
        if (down && index === childrenLength) {
            down.classList.add('is-hidden');
        }
    });
}

/**
 * Dynamically generates parameter controls for a filter card based on its configuration.
 * Supports sliders for numeric values, dropdowns for selection, and text fields for object parameters.
 * 
 * @param {HTMLElement} cardContainer - The container element to which the controls are appended.
 * @param {Object} config - The configuration object containing parameters and their settings.
 * @param {string} uniqueKey - A unique identifier for the filter card and its elements.
 */
function updateParameterControls(cardContainer, config, uniqueKey) {
    if (!config.parameters || Object.keys(config.parameters).length === 0) return;

    const cardContent = document.createElement('div');
    cardContent.classList.add(
        'card-content',
        'is-fullwidth',
        'custom-card-content'
    );
    cardContent.dataset.key = uniqueKey;
    cardContent.id = `card_content_${uniqueKey}`;
    cardContainer.appendChild(cardContent);

    const params = config.parameters;
    let counter = 0;

    for (const [key, value] of Object.entries(params)) {
        counter++;
        const uniqueKeyObject = `${key}_${uniqueKey}`;

        const cardContentHeader = createParameterHeader(key, value, uniqueKey, uniqueKeyObject);
        cardContent.appendChild(cardContentHeader);

        if (Array.isArray(value)) {
            createDropdownControl(cardContent, value, uniqueKey, uniqueKeyObject);
        } else if (typeof value === 'number' || typeof value === 'object') {
            createSliderControl(cardContent, key, value, uniqueKey, uniqueKeyObject, config, counter);
        }
    }
}

/**
 * Creates a parameter header displaying the name and default value of the parameter.
 * 
 * @param {string} key - The name of the parameter.
 * @param {any} value - The value or configuration of the parameter.
 * @param {string} uniqueKey - The unique identifier for the card.
 * @param {string} uniqueKeyObject - The unique identifier for the parameter.
 * @returns {HTMLElement} - The constructed parameter header element.
 */
function createParameterHeader(key, value, uniqueKey, uniqueKeyObject) {
    const header = document.createElement('div');
    header.classList.add(
        'field',
        'mb-1',
        'card-content-display'
    );
    header.id = `card_content_header_${uniqueKeyObject}`;
    header.dataset.key = uniqueKey;
    header.dataset.keyObject = uniqueKeyObject;

    const title = document.createElement('div');
    title.classList.add(
        'text-black-bold',
        'custom-card-column',
        'card-content-display',
        'function-config-parameter'
    );
    title.id = `card_content_header_title_${uniqueKeyObject}`;
    title.dataset.key = uniqueKey;
    title.dataset.keyObject = uniqueKeyObject;
    title.textContent = `${key}:`;
    header.appendChild(title);

    const valueDisplay = document.createElement('div');
    valueDisplay.classList.add('text-black-bold', 'custom-card-column');
    valueDisplay.id = `card_content_header_value_${uniqueKeyObject}`;
    valueDisplay.dataset.key = uniqueKey;
    valueDisplay.dataset.keyObject = uniqueKeyObject;
    valueDisplay.textContent = Array.isArray(value) ? '' : typeof value === 'object' ? value.default : value;
    header.appendChild(valueDisplay);

    return header;
}

/**
 * Creates a dropdown control for array-based parameters.
 * 
 * @param {HTMLElement} container - The parent container for the dropdown.
 * @param {Array} options - The array of selectable options.
 * @param {string} uniqueKey - The unique identifier for the card.
 * @param {string} uniqueKeyObject - The unique identifier for the parameter.
 */
function createDropdownControl(container, options, uniqueKey, uniqueKeyObject) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('field', 'mb-2');
    wrapper.dataset.key = uniqueKey;
    wrapper.dataset.keyObject = uniqueKeyObject;

    const selectWrapper = document.createElement('div');
    selectWrapper.classList.add('select', 'is-fullwidth');
    wrapper.appendChild(selectWrapper);

    const select = document.createElement('select');
    select.classList.add('work-right-filter-select', 'function-config-parameter');
    select.dataset.key = uniqueKey;
    select.dataset.keyObject = uniqueKeyObject;

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });

    select.addEventListener('change', processImage);
    selectWrapper.appendChild(select);
    container.appendChild(wrapper);
}

/**
 * Creates a slider control for numeric or object-based parameters.
 * 
 * @param {HTMLElement} container - The parent container for the slider.
 * @param {string} key - The name of the parameter.
 * @param {any} value - The value or configuration of the parameter.
 * @param {string} uniqueKey - The unique identifier for the card.
 * @param {string} uniqueKeyObject - The unique identifier for the parameter.
 * @param {Object} config - The configuration object containing the function's metadata.
 * @param {number} counter - A counter to ensure unique IDs for the sliders.
 */
function createSliderControl(container, key, value, uniqueKey, uniqueKeyObject, config, counter) {
    const wrapper = document.createElement('div');
    wrapper.classList.add(
        'field',
        'mb-2',
        'custom-card-column'
    );
    wrapper.dataset.key = uniqueKey;
    wrapper.dataset.keyObject = uniqueKeyObject;

    const input = document.createElement('input');
    input.classList.add(
        'slider',
        'is-fullwidth',
        'is-success',
        'is-circle',
        'custom-card-column',
        'function-config-parameter'
    );
    input.type = 'range';
    input.id = `${config.function}-input-${key}-${uniqueKey}-${counter}`;
    input.dataset.key = uniqueKey;
    input.dataset.keyObject = uniqueKeyObject;

    input.min = typeof value === 'object' && value.min !== undefined ? value.min : 0;
    input.max = typeof value === 'object' && value.max !== undefined ? value.max : (key.includes('ksize') ? 21 : 255);
    input.step = typeof value === 'object' && value.step !== undefined ? value.step : (key.includes('ksize') ? 2 : 1);
    input.value = typeof value === 'object' && value.default !== undefined ? value.default : (value !== undefined ? value : 1);

    input.addEventListener('input', (evt) => {
        const label = document.getElementById(`card_content_header_value_${evt.target.dataset.keyObject}`);
        if (label) {
            label.textContent = evt.target.value;
        }
        processImage();
    });

    wrapper.appendChild(input);

    const minMaxWrapper = document.createElement('div');
    minMaxWrapper.classList.add('custom-card-column');
    wrapper.appendChild(minMaxWrapper);

    const minLabel = document.createElement('div');
    minLabel.classList.add(
        'is-pulled-left',
        'text-black-small',
        'custom-card-column'
    );
    minLabel.textContent = input.min;
    minMaxWrapper.appendChild(minLabel);

    const maxLabel = document.createElement('div');
    maxLabel.classList.add(
        'is-pulled-right',
        'text-black-small',
        'custom-card-column'
    );
    maxLabel.textContent = input.max;
    minMaxWrapper.appendChild(maxLabel);

    container.appendChild(wrapper);
}

/**
 * Processes the loaded image by applying configured functions sequentially.
 * Updates the output canvas with the processed image, generates a histogram, and creates Python code for replication.
 */
function processImage() {
    if (!checkIsReady()) return;

    const imageSrc = document.getElementById('image_src');
    if (!imageSrc) {
        messageBox('Please load an image');
        return;
    }

    if (!imageSrc.complete || imageSrc.naturalWidth === 0) {
        messageBox('Image not loaded yet');
        return;
    }

    if (!canProcessImagge) {
        messageBox('A previous process is still running');
        return;
    }

    const canvas = document.getElementById('canvas_output');
    if (canvas.width === 0 || canvas.height === 0) {
        messageBox('Canvas has no dimensions');
        return;
    }

    canProcessImagge = false;

    try {
        const processedImage = executeFunctions(matrixImageSource.clone());
        const reducedImage = reduceSize(processedImage.clone());
        showHistogram(processedImage.clone());
        generateCode();

        if (reducedImage) {
            cv.imshow('canvas_output', reducedImage);
            reducedImage.delete();
        }
        if (processedImage) processedImage.delete();
    } catch (ignore) {
        messageBox('Error processing the image', true, true, ignore);
    } finally {
        canProcessImagge = true;
    }
}

/**
 * Applies the configured functions sequentially to the provided source image.
 * Verifies dependencies, executes functions, and returns the processed image.
 * 
 * @param {cv.Mat} src - The OpenCV Mat object representing the input image.
 * @returns {cv.Mat} - The processed image after applying the functions.
 */
function executeFunctions(src) {
    if (!checkIsReady()) return;

    let appliedFunctions = Array.from(document.getElementById('applied_functions').children);
    const usedFunctions = [];
    const missingDependencies = [];

    if (!executionOrderDown) {
        appliedFunctions = appliedFunctions.reverse();
    }

    for (const functionElement of appliedFunctions) {
        const config = getConfigFunction(functionElement.dataset.function);
        const params = getParameters(functionElement);

        for (const dependency of config.dependencies) {
            if (!usedFunctions.includes(dependency)) {
                missingDependencies.push(getConfigFunction(dependency).displayName);
            }
        }

        if (missingDependencies.length > 0) {
            messageBox(`You must first apply the following filters: ${missingDependencies.join(', ')}`);
            break;
        }

        usedFunctions.push(config.function);

        try {
            src = config.execute(cv, src, params);
        } catch (error) {
            messageBox(`Error processing: ${config.displayName}`, true, true, error);
            return src;
        }
    }

    return src;
}

/**
 * Retrieves the configuration object for a given function name.
 * 
 * @param {string} functionName - The name of the function to retrieve.
 * @returns {Object|null} - The configuration object or null if not found.
 */
function getConfigFunction(functionName) {
    const functionConfig = availableFunctions.find(config => config.function === functionName) || null;

    if (functionConfig) {
        const config = new ConfigFunction();
        for (const key in config) {
            config[key] = functionConfig[key];
        }
        return config;
    } else {
        messageBox(`Function configuration not found for: ${functionName}`);
    }
    return null;
}

/**
 * Extracts parameter values for a specific function from its associated DOM elements.
 * Supports sliders, dropdowns, and text inputs.
 * 
 * @param {HTMLElement} divParent - The parent container of the function controls.
 * @returns {Object} - An object containing the parameter keys and their values.
 */
function getParameters(divParent) {
    const params = {};
    let key = null;
    let value = null;

    divParent.querySelectorAll('.function-config-parameter').forEach(tag => {
        const tagType = tag.nodeName.toLowerCase();

        if (tagType === 'div') {
            key = tag.textContent.replace(/[^a-zA-Z0-9]/g, '');
        } else if (tagType === 'input') {
            value = parseFloat(tag.value);
        } else if (tagType === 'select') {
            value = tag.value;
        }

        if (key !== null && value !== null) {
            params[key] = value;
            key = null;
            value = null;
        }
    });

    return params;
}

/**
 * Displays a temporary alert message on the UI.
 * The message is styled as an error or success and automatically disappears after 5 seconds.
 * Optionally logs the message to the console, with an optional exception for debugging.
 * 
 * @param {string} message - The message to display in the alert box.
 * @param {boolean} [error=true] - Whether the message represents an error (default is true).
 * @param {boolean} [consoleLog=false] - Whether to log the message and optional exception to the console.
 * @param {Error|null} [exc=null] - An optional exception object for additional console logging.
 */
function messageBox(message, error = true, consoleLog = false, exc = null) {
    const messageBox = document.getElementById('message_alert_box');
    const messageBoxText = document.getElementById('message_alert_box_text');
    if (!messageBox || !messageBoxText) {
        console.log("Message box or text element not found in the DOM.");
        return;
    }
    messageBoxText.textContent = message;

    if (consoleLog) {
        console.log(message);
        if (exc) {
            console.log(exc);
        }
    }

    const tags = Array.from(
        document.getElementsByClassName(
            error ? 'message_alert_box_column_download' : 'message_alert_box_column_error'
        )
    );

    tags.forEach(tag => {
        tag.classList.toggle('message_alert_box_column_download', !error);
        tag.classList.toggle('message_alert_box_column_error', error);
    });

    messageBox.classList.remove('is-hidden');

    setTimeout(() => {
        messageBox.classList.add('is-hidden');
    }, 5000);
}

/**
 * Generates source code to replicate the current image processing workflow.
 * The generated code is populated into a text area for copying or saving.
 */
function generateCode() {
    const source_code = document.getElementById('source_code').value;
    const div_install_opencv = document.getElementById('div_install_opencv');
    const div_save_image = document.getElementById('div_save_image');
    const div_display_in_colab = document.getElementById('div_display_in_colab');

    let appliedFunctions = Array.from(document.getElementById('applied_functions').children);

    if (!executionOrderDown) {
        appliedFunctions = appliedFunctions.reverse();
    }

    let codeSource = '';
    for (const functionElement of appliedFunctions) {
        const config = getConfigFunction(functionElement.dataset.function);
        const params = getParameters(functionElement);


        try {
            if (source_code === 'PYTHON') {
                codeSource += config.pythonSource(params);
            } else if (source_code === 'JAVASCRIPT') {
                codeSource += config.javascriptSource(params);
            }
        } catch (error) {
        }
    }

    if (source_code === 'PYTHON') {
        div_save_image.classList.remove('is-hidden');
        div_display_in_colab.classList.remove('is-hidden');
        generateCodePython(codeSource);
    } else if (source_code === 'JAVASCRIPT') {
        div_save_image.classList.add('is-hidden');
        div_display_in_colab.classList.add('is-hidden');
        generateCodeJavascript(codeSource);
    }
}

/**
 * Generates Python code to replicate the current image processing workflow.
 * The generated code is populated into a text area for copying or saving.
 */
function generateCodePython(codeSource) {
    const install_opencv = document.getElementById('install_opencv').checked;
    const save_image = document.getElementById('save_image').checked;
    const display_in_colab = document.getElementById('display_in_colab').checked;
    let code = ``;

    if (install_opencv) {
        if (display_in_colab) {
            code += `
!pip install -U opencv-python==4.10.0.84
`;
        } else {
            code += `
pip install -U opencv-python==4.10.0.84
`;
        }
    }

    code += `
import cv2 as cv
import numpy as np

image_path_origin = '' # Provide the original image path here
`;

    if (save_image) {
        code += `
image_path_destination = '' # Specify where to save the result
        `;
    }

    code += `
# Load the original image
ori = cv.imread(image_path_origin)
src = ori.copy()
dst = np.zeros_like(src) # Destination image

`;

    code += codeSource;

    if (save_image) {
        code += `
# Save the result
if len(image_path_destination) > 0:
cv.imwrite(image_path_destination, dst)
`;
    }

    if (display_in_colab) {
        code += `
# Display images in Google Colab
from IPython.display import display, Image
print('Original:')
display(Image(image_path_origin, height=480))
print('Result:')`;
        if (save_image) {
            code += `
display(Image(image_path_destination, height=480))
`;
        } else {
            code += `
image_path_destination = '/tmp/result.png'
cv.imwrite(image_path_destination, dst)
display(Image(image_path_destination, height=480))
`;
        }
    }

    code += `
#################################################
# Continue coding with the src or dst variables #
# THANK YOU for using Gazelens!!!               #
#################################################

`;

    document.getElementById('textarea_code').textContent = code;
}

/**
 * Generates javascript code to replicate the current image processing workflow.
 * The generated code is populated into a text area for copying or saving.
*/
function generateCodeJavascript(codeSource) {
    const install_opencv = document.getElementById('install_opencv').checked;
    let code = ``;

    if (install_opencv) {
        code += `
// <script async src="https://docs.opencv.org/${LIBRARY_VERSION}/opencv.js"
            type="text/javascript"></script>`;
    }

    code += `
// Read image from canvas html
const canvasId = '';
let src = cv.imread(canvasId);
`;

    code += codeSource;

    code += `
///////////////////////////////////////////////////
// Continue coding with the src or dst variables //
// THANK YOU for using Gazelens!!!               //
///////////////////////////////////////////////////

`;

    document.getElementById('textarea_code').textContent = code;
}

/**
 * Copies the generated Python code from the text area to the clipboard.
 * Displays a temporary message to confirm the copy action.
 */
function copyCode() {
    if (!checkIsReady()) return;

    const text = document.getElementById('textarea_code').textContent;
    const button = document.getElementById('copy_code_message');

    navigator.clipboard.writeText(text)
        .then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!!!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        })
        .catch(err => {
            messageBox('Could not copy code', true, true, err);
        });
}

/**
 * Toggles the visibility of the welcome section and the filters section.
 * 
 * @param {boolean} filter - If true, hides the welcome section and shows the filters section.
 *                           If false, reverses this behavior.
 */
function displaySection(filter) {
    const welcome = document.getElementById('section_welcome');
    const filters = document.getElementById('section_filters');

    if (welcome && filters) {
        if (filter) {
            welcome.classList.add('is-hidden');
            filters.classList.remove('is-hidden');
        } else {
            welcome.classList.remove('is-hidden');
            filters.classList.add('is-hidden');
        }
    }
}

/**
 * Initializes the Gazelens application, setting up necessary states and loading defaults.
 * Marks OpenCV and image processing readiness.
 */
function initGaze() {
    isOpenCvReady = true;
    canProcessImagge = true;

    document.getElementById('p_start_editing').textContent = '¡Start Editing!';

    // [BEGINS] DELETE JUST FOR TESTING
    loadDefault();
    // [ENDS] DELETE JUST FOR TESTING

    console.log('GAZELENS is READY !!!!');
}

/**
 * Opens a modal by adding the `is-active` class to its element.
 * 
 * @param {HTMLElement} element - The modal element to be opened.
 */
function openModal(element) {
    if (!element) {
        messageBox('Invalid element passed to openModal.');
        return;
    }
    element.classList.add('is-active');
}

/**
 * Closes a modal by removing the `is-active` class from its element.
 * 
 * @param {HTMLElement} element - The modal element to be closed.
 */
function closeModal(element) {
    if (!element) {
        messageBox('Invalid element passed to closeModal.');
        return;
    }
    element.classList.remove('is-active');
}

/**
 * Closes all modals on the page by removing the `is-active` class from each modal element.
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    if (modals.length === 0) {
        messageBox('No modals found to close.');
        return;
    }

    modals.forEach(modal => {
        closeModal(modal);
    });
}

function convertBool(value) {
    return (value !== undefined && value !== null && value.trim().toLowerCase() === 'true');
}

function zoomIn(event, config) {
    const canvasOutput = document.getElementById('canvas_output');
    const overlay = document.getElementById('overlay');
    overlay.style.zIndex = 1000;
    overlay.style.position = 'fixed';
    overlay.style.backgroundColor = '#FFFFFF';

    const image = document.getElementById('img_example');
    image.src = config.img.replaceAll('/64/', '/');
    
    overlay.style.left = canvasOutput.offsetLeft + 'px';
    overlay.style.top = canvasOutput.offsetTop + 'px';
    overlay.style.display = 'block';
}

function zoomOut() {
  var element = document.getElementById('overlay');
  element.style.display = 'none';
}

window.addEventListener("resize", () => {
    offsetHeight = 0;
    offsetWidth = 0;
});

/**
 * Initializes event listeners and default behaviors when the DOM content is fully loaded.
 * Sets up modal functionality, file input handling, button actions, drag-and-drop support,
 * and initializes application components.
 */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal-trigger').forEach(trigger => {
        const modalElement = document.getElementById(trigger.dataset.target);
        if (!modalElement) return;

        const buttonYes = modalElement.querySelector('#model_yes');

        trigger.addEventListener('click', () => {
            openModal(modalElement);
        });

        buttonYes.addEventListener('click', () => {
            initFromTheBeginning();
        });

    });

    document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button')
        .forEach(closeButton => {
            const modal = closeButton.closest('.modal');
            closeButton.addEventListener('click', () => {
                closeModal(modal);
            });
        });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });

    document.getElementById('button_change_image').onclick = () => {
        document.getElementById('input_file').click();
    };
    document.getElementById('button_download_image').onclick = downloadImage;
    document.getElementById('input_file').addEventListener('change', readURL);
    document.getElementById('input_image').onclick = () => {
        document.getElementById('input_file').click();
    };
    document.getElementById('thin_div').onclick = toggleSidebar;
    document.getElementById('button_original').onclick = () => {
        toggleOriginalHistogram();
    };
    document.getElementById('button_histogram').onclick = () => {
        toggleOriginalHistogram('histogram');
    };
    document.getElementById('button_message_alert_box').onclick = () => {
        document.getElementById('message_alert_box').classList.add('is-hidden');
    };

    Array.from(document.querySelectorAll('.custom-check-orientation')).forEach(tag => {
        tag.onclick = generateCode;
    });


    document.getElementById('source_code').onchange = generateCode;
    document.getElementById('copy_code').onclick = copyCode;

    document.getElementById('filters_applied_arrow').onclick = () => {
        toggleAppliedFunction('filters_applied_arrow_down');
        toggleAppliedFunction('filters_applied_arrow_up');
        executionOrderDown = !executionOrderDown;
        processImage();
    };

    document.getElementById('filters_applied_delete').onclick = () => {
        const appliedFunctions = document.getElementById('applied_functions');
        if (!appliedFunctions) return;

        appliedFunctions.textContent = '';
        while (appliedFunctions.firstChild) {
            appliedFunctions.removeChild(appliedFunctions.firstChild);
        }
        processImage();

    };

    ['dragover', 'drop'].forEach(eventName => {
        const handleDragDrop = (event) => {
            event.preventDefault();
            document.getElementById('input_file').files = event.dataTransfer.files;
            readURL();
        };

        document.getElementById('div_drop_file').addEventListener(eventName, handleDragDrop, false);
        document.getElementById('canvas_output').addEventListener(eventName, handleDragDrop, false);
    });

    initializeTabs();
    loadFunctions();
});


/**
 * Loads the default image into the application, resets applied functions, and displays the image.
 * Fetches the default image from a URL, processes it, and updates the UI with the image and its histogram.
 */
function loadDefault() {
    /**
     * Resets the applied functions and displays the reduced-size and thumbnail images.
     */
    function cleanAppliedFunctions() {
        if (!checkIsReady()) return;

        const appliedFunctionsContainer = document.getElementById('applied_functions');
        appliedFunctionsContainer.innerHTML = '';

        const mat = reduceSize(matrixImageSource.clone());
        const matOriginal = reduceThumbnail(matrixImageSource.clone());

        cv.imshow('canvas_input', matOriginal);
        cv.imshow('canvas_output', mat);

        mat.delete();
        matOriginal.delete();

        document.getElementById('textarea_code').textContent = '';
    }

    /**
     * Fetches an image file from a given URL and converts it into a `File` object.
     * 
     * @param {string} url - The URL of the image to fetch.
     * @returns {Promise<File>} - A promise that resolves with the fetched image file.
     */
    function fetchImage(url) {
        return fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const filename = url.split('/').pop();
                return new File([blob], filename, { type: blob.type });
            });
    }

    fetchImage('./img/delete/aa_usar.jpg').then(file => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const imageSrc = document.getElementById('image_src');

            imageSrc.onload = function () {
                isImageReady = true;
                matrixImageSource = cv.imread('image_src');
                // printMat(matrixImageSource);
                cleanAppliedFunctions(window.screen.availWidth - 1000);
                showHistogram(matrixImageSource.clone());
            };

            imageSrc.src = event.target.result;
            displaySection(true);
        };

        reader.readAsDataURL(file);
    });
}

function printMat(src) {
    for (let row = 0; row < src.rows; row++) {
        if (100 < row) break;
        for (let col = 0; col < src.cols; col++) {
            if (src.isContinuous()) {
                if (100 < col) break;
                let r = src.data[row * src.cols * src.channels() + col * src.channels()];
                let g = src.data[row * src.cols * src.channels() + col * src.channels() + 1];
                let b = src.data[row * src.cols * src.channels() + col * src.channels() + 2];
                let a = src.data[row * src.cols * src.channels() + col * src.channels() + 3];
                console.log('[' + row + '][' + col + '] = [' + r + ' ' + g + ' ' + b + (a ? (' ' + a) : '') + ']');
            }
        }
    }
}

