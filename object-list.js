class ObjectList extends HTMLElement {
    constructor() {
        super();
        this.objectList = [];
        this.filteredObjects = [];
        this.attachShadow({ mode: 'open' });
        this.renderStyles();
        this.render();

        // Binding the shortcut handler
        this.loadCachedShortcut = this.loadCachedShortcut.bind(this);
        this.initEventListeners();
    }

    connectedCallback() {
        // Count existing <object-list> elements on the page
        const componentNumber = document.querySelectorAll('object-list').length + 1;

        this.id = this.getAttribute('id') || `objectList${componentNumber}`;
        this.storageKey = `cachedList-${this.id}`;

        this.maxObjects = parseInt(this.getAttribute('max-objects')) || 0;
        this.deleteLabel = this.getAttribute('delete-label') || 'Delete';

        // Read the counterLabel format from the attribute, defaulting to a generic format
        this.counterLabel = this.getAttribute('counter-label') || 'Total Objects: {count}/{max}';
        this.filteredLabel = this.getAttribute('data-filtered-label') || 'Filtered: {count}';

        // Read delete Confirmation Message attribute
        this.deleteConfirmationMessage = this.getAttribute('delete-confirmation-message') || 'Are you sure you want to delete this object ( {obj} )?';

        // If maxObjects is unlimited, remove the {max} placeholder
        if (this.maxObjects === 0) {
            this.counterLabel = this.counterLabel.replace('/{max}', '');
        }

        // for prevent duplication, true that's mean check exists by full attribute elements
        this.checkFullAttributes = this.getAttribute('check-full-attributes') === 'true';

        // Read already exists Message attribute 
        this.alreadyExistMessage = this.getAttribute('already-exist-message') || 'Object with these attributes already exists.';

        // Read already exists Message attribute 
        this.limitReachedMessage = this.getAttribute('limit-reached-message') || 'Maximum limit of {max} objects reached.';

        // for caching the object value
        this.cacheObjects = this.hasAttribute('cache-objects') ? this.getAttribute('cache-objects') === 'true' : true;

        // Read cached hint text attribute 
        this.cachedHintText = this.getAttribute('cached-hint-text') || 'Cached data available for this component. Press (Alt + Shift + A) to load.';

        this.renderList();
        this.updateCounter();

        // Initialize component with caching if enabled
        if (this.cacheObjects && this.hasCachedObjects()) {
            this.cacheHint();
        }

        this.updateMaxHeight(); // Adjust max-height on component load
    }

    renderStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                width: 100%;
                box-sizing: border-box;
                padding: 10px;
                border-radius: 8px;
                background-color: #f8f9fa;
                overflow-x: hidden;
                margin-top: 20px;
                font-family: Arial, sans-serif;
            }

            #counter {
                font-size: 1.1rem;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
                text-align: center;
            }

            #filter-container {
                display: flex;
                /*align-items: center;*/
                margin-bottom: 10px;
            }

            #filter-input {
                flex: 1;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-right: 8px;
                font-size: 14px;
            }

            #clear-filter-btn {
                padding: 8px;
                border: none;
                background-color: #dc3545;
                color: white;
                border-radius: 4px;
                cursor: pointer;
            }

            #object-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }

            #object-list {
                display: flex;
                flex-wrap: wrap; /* Allow items to wrap into the next line */
                gap: 8px; /* Space between items */
                
                max-height: 80%; /* Set the height as a percentage of the parent */
                overflow-y: auto; /* Enable vertical scrolling */
                
            }

            .object-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background-color: white;
                cursor: pointer;
                width: calc(50% - 8px);
                box-sizing: border-box;
                font-weight: bold;
                font-size: 14px;
                transition: background-color 0.3s;
            }

            .object-item {
                flex: 1 1 calc(25% - 8px); /* Default: 4 items in a row */
                box-sizing: border-box; /* Ensure padding and margin are included in width */
            }

            /* Adjust the number of items based on screen size */
            @media (max-width: 1200px) {
                .object-item {
                    flex: 1 1 calc(33.33% - 8px); /* 3 items in a row */
                    padding: 12px;
                    font-size: 22px;
                }
            }

            @media (max-width: 800px) {
                .object-item {
                    flex: 1 1 calc(50% - 8px); /* 2 items in a row */
                    padding: 12px;
                    font-size: 22px;
                }

                #filter-container {
                    flex-direction: column;
                }

                #filter-input {
                    margin-bottom: 8px;
                }
            }

            @media (max-width: 500px) {
                .object-item {
                    flex: 1 1 100%; /* 1 item in a row */
                    padding: 12px;
                    font-size: 22px;
                }
            }




            .object-item:hover {
                background-color: #e9ecef;
            }

            .object-item:focus {
                outline: 2px solid #007bff;
            }

            .delete-btn {
                background-color: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                padding: 5px 10px;
            }

            .delete-btn:hover {
                background-color: #c82333;
            }

            /* Modal overlay */
            #modal-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            /* Modal box */
            #confirmation-modal {
                background: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                max-width: 300px;
                text-align: center;
            }

            #confirmation-message{
                font-weight: bold;
                font-size: 15px;
            }

            /* Modal buttons */
            .modal-button {
                padding: 8px 16px;
                margin: 5px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            .confirm-btn {
                background-color: #007bff;
                color: white;
            }

            .cancel-btn {
                background-color: #dc3545;
                color: white;
            }

        `;
        this.shadowRoot.appendChild(style);
    }

    render() {
        this.shadowRoot.innerHTML += `
            <div id="counter">${this.counterLabel} 0</div>
            <div id="filter-container">
                <input id="filter-input" type="text" placeholder="Filter objects..." />
                <button id="clear-filter-btn" aria-label="Clear Filter">✖</button>
            </div>
            <div id="object-list"></div>

            <!-- Custom Confirmation Modal -->
            <div id="modal-overlay" tabindex="0" role="dialog" aria-labelledby="confirmation-message">
                <div id="confirmation-modal">
                    <p id="confirmation-message">Are you sure you want to delete this object?</p>
                    <button class="modal-button cancel-btn">No (Esc)</button>
                    <button class="modal-button confirm-btn">Yes (Ctrl+Enter)</button>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector('#filter-input').addEventListener('input', (e) => {
            this.filterObjects(e.target.value);
        });

        this.shadowRoot.querySelector('#clear-filter-btn').addEventListener('click', () => {
            this.clearFilter();
        });

        this.shadowRoot.querySelector('.cancel-btn').onclick = () => {
            this.closeDelConfirm();
        };
    }

    // Function to display a message box
    showMessageBox(message, callback = null) {
        const overlay = this.shadowRoot.querySelector('#modal-overlay');
        const messageBox = overlay.querySelector('#confirmation-message');
        messageBox.innerHTML = message;

        overlay.style.display = 'flex';
        overlay.focus()

        const confirmBtn = overlay.querySelector('.confirm-btn');
        const cancelBtn = overlay.querySelector('.cancel-btn');
        cancelBtn.style.display = 'none';
        confirmBtn.innerText = 'OK'

        confirmBtn.onclick = () => {
            if (callback) callback(); // Call the callback if provided
            overlay.style.display = 'none';
        };

        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                overlay.style.display = 'none';
            }
        });
    }

    addObject(object) {
        if (this.maxObjects > 0 && this.objectList.length >= this.maxObjects) {
            let msg = this.limitReachedMessage.replace('{max}', this.maxObjects);
            this.showMessageBox(msg);
            return;
        }

        const existingIndex = this.findExistingObjectIndex(object);
        if (existingIndex !== -1) {
            this.focusOnExistingObject(existingIndex);
            this.showMessageBox(this.alreadyExistMessage);
            return;
        }

        this.objectList.push(object);
        this.filteredObjects = this.objectList;
        if (this.cacheObjects) this.updateCache();
        this.renderList();
        this.dispatchEvent(new CustomEvent('object-added', { detail: { object } }));
        this.dispatchEvent(new CustomEvent('list-updated', { detail: { list: this.objectList } }));
    }

    loadObjects(jsonString) {
        try {

            if (!jsonString || typeof jsonString !== 'string') {
                throw new Error("Invalid JSON string provided");
            }

            // Parse the JSON string
            const externalObjects = JSON.parse(jsonString);

            // Loop through each object
            externalObjects.forEach(element => {
                // Get values without keys
                const values = Object.values(element);

                // Create attributes array
                const attributes = values.map(value => value.trim()); // Trim any whitespace
                const object = { attributes }; // Create the object


                this.addObject(object); // Assuming addObject method adds the object to this.objectList
            });

            console.log('Object List after loading:', this.objectList);

            // Render the updated object list
            this.renderList();
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    }

    // Save the current list to cache
    updateCache() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.objectList));
        } catch (e) {
            console.error("Caching failed:", e);
        }
    }

    // Load cached objects on component initialization
    loadCachedObjects() {
        const cachedData = localStorage.getItem(this.storageKey);
        return cachedData ? JSON.parse(cachedData) : null;
    }

    hasCachedObjects() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    // Add a hint element under the component
    cacheHint() {
        const hint = document.createElement('div');
        hint.className = 'cache-hint';
        hint.textContent = this.cachedHintText
        hint.style.fontSize = '0.9em';
        hint.style.color = 'gray';
        hint.style.padding = '8px';

        // Append the hint below the component
        this.insertAdjacentElement('afterend', hint);
    }

    // Remove the cache hint element if it exists
    removeCacheHint() {
        const hint = this.nextElementSibling; // Get the next sibling element
        if (hint && hint.classList.contains('cache-hint')) {
            hint.remove(); // Remove the hint from the DOM
        }
    }

    findExistingObjectIndex(newObject) {
        if (this.checkFullAttributes) {
            return this.objectList.findIndex(obj =>
                JSON.stringify(obj.attributes) === JSON.stringify(newObject.attributes)
            );
        } else {
            return this.objectList.findIndex(obj =>
                obj.attributes[0] === newObject.attributes[0]
            );
        }
    }

    focusOnExistingObject(index) {
        const listContainer = this.shadowRoot.querySelector('#object-list');
        const existingItem = listContainer.children[index];
        existingItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        existingItem.focus();
        this.dispatchEvent(new CustomEvent('object-focus', { detail: { object: this.objectList[index] } }));
    }

    deleteObject(index) {
        // Show the modal overlay
        const overlay = this.shadowRoot.querySelector('#modal-overlay');
        overlay.style.display = 'flex';

        // setting the confirm message context
        const confirmMsg = overlay.querySelector('#confirmation-message');
        confirmMsg.innerHTML = this.deleteConfirmationMessage.replace('{obj}', this.objectList[index].attributes[0]);

        const confirmBtn = overlay.querySelector('.confirm-btn');
        const cancelBtn = overlay.querySelector('.cancel-btn');

        // Event listener for confirming deletion
        confirmBtn.onclick = () => {
            const deletedObject = this.filteredObjects.splice(index, 1)[0];
            this.objectList = this.objectList.filter(obj => obj !== deletedObject);
            this.filteredObjects = this.objectList;
            this.renderList();
            this.dispatchEvent(new CustomEvent('object-deleted', { detail: { deletedObject } }));
            this.dispatchEvent(new CustomEvent('list-updated', { detail: { list: this.objectList } }));
            this.updateCache();
            // Hide the modal after deletion
            overlay.style.display = 'none';
        };
        // Set tab indexes for cancel and confirm buttons
        cancelBtn.tabIndex = 0;
        confirmBtn.tabIndex = 0;
        cancelBtn.focus(); // Default focus on the cancel button
        overlay.focus();

        // Trap focus within the confirmation modal
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault(); // Prevent default tabbing behavior
                this.closeDelConfirm();
            }
            if (e.ctrlKey && e.key === 'Enter') {
                confirmBtn.click();
            }
        });

        // Event listener for canceling deletion
        cancelBtn.onclick = () => {
            overlay.style.display = 'none';
        };
    }

    closeDelConfirm() {
        this.shadowRoot.querySelector('#modal-overlay').style.display = 'none';
    }

    // Clear the list and remove from cache
    clearList() {
        this.filteredObjects = this.objectList = [];
        this.renderList();
        this.updateCounter(false);  // Revert to default counter label
        this.clearCache();
    }

    clearCache() {
        localStorage.removeItem(this.storageKey);
        this.removeCacheHint();
    }

    clearFilter() {
        this.shadowRoot.querySelector('#filter-input').value = '';
        this.filteredObjects = this.objectList;
        this.renderList();
        this.updateCounter(false);  // Revert to default counter label
        this.dispatchEvent(new CustomEvent('clear-filter'));
    }

    filterObjects(filterText) {
        this.filteredObjects = this.objectList.filter(obj =>
            obj.attributes.some(attr => attr.toLowerCase().includes(filterText.toLowerCase()))
        );
        this.renderList(this.filteredObjects);
        this.updateCounter(filterText.length > 0);  // Update counter with filter check
        this.dispatchEvent(new CustomEvent('filter', { detail: { filterText } }));
    }

    renderList(objects = this.filteredObjects) {
        const listContainer = this.shadowRoot.querySelector('#object-list');
        listContainer.innerHTML = '';
        objects.forEach((obj, index) => {
            const item = document.createElement('div');
            item.className = 'object-item';
            item.tabIndex = 0;
            item.innerHTML = `
                <span>${obj.attributes.join(', ')}</span>
                <button class="delete-btn" data-index="${index}">${this.deleteLabel}</button>
            `;
            item.querySelector('.delete-btn').addEventListener('click', () => this.deleteObject(index));
            item.addEventListener('focus', () => this.highlightItem(item));
            item.addEventListener('blur', () => this.handleBlur(item, obj));

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Delete') {
                    item.querySelector('.delete-btn').click();
                }
            });

            listContainer.appendChild(item);
        });
        this.updateCounter();
    }

    highlightItem(item) {
        item.style.backgroundColor = '#d1ecf1';
        item.addEventListener('blur', () => {
            item.style.backgroundColor = '';
        });
    }

    handleBlur(item, object) {
        this.dispatchEvent(new CustomEvent('object-leave', { detail: { object } }));
        item.style.backgroundColor = '';
    }

    updateCounter(isFiltered = false) {
        const counter = this.shadowRoot.querySelector('#counter');
        const countText = this.counterLabel
            .replace('{count}', this.objectList.length)
            .replace('{max}', this.maxObjects > 0 ? this.maxObjects : '∞');

        if (isFiltered) {
            // Use the filtered label if filtering is active
            counter.innerText = `${countText} | ${this.filteredLabel.replace('{count}', this.filteredObjects.length)}`;
        } else {
            // Default counter label without filter
            counter.innerText = countText;
        }
    }

    getObjectsAsJson() {
        return JSON.stringify(this.objectList, null, 2);
    }

    // Set up shortcut for retrieving cached data
    loadCachedShortcut(e) {
        if (e.altKey && e.shiftKey && e.key === "A") {
            // Retrieve cached data on shortcut and render
            this.filteredObjects = this.objectList = this.loadCachedObjects() || [];
            this.renderList();
            this.updateCounter(false);  // Revert to default counter label
            //console.log(`Shortcut activated for component: ${this.id}`);
        }
    }

    initEventListeners() {
        // Attach the shortcut handler to document
        document.addEventListener("keydown", this.loadCachedShortcut);
    }

    // Function to update max-height dynamically if needed
    updateMaxHeight() {
        const parentHeight = this.parentElement.clientHeight; // Get the height of the parent element
        const maxHeightAttr = this.getAttribute('max-height'); // Get the custom max-height attribute
        let maxHeight;

        if (maxHeightAttr) {
            // If attribute is set, calculate max-height as a percentage of the parent
            //maxHeight = Math.min(parentHeight * (parseFloat(maxHeightAttr) / 100), parentHeight);
            maxHeight = parseFloat(maxHeightAttr);
        } else {
            // Default to 1.5% if no attribute is set
            maxHeight = parentHeight * 1.5;
        }

        this.shadowRoot.querySelector('#object-list').style.maxHeight = `${maxHeight}px`; // Set max-height
    }
}

customElements.define('object-list', ObjectList);
