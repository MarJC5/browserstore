function jsonViewer(json, collapsible=false) {
    var TEMPLATES = {
        item: '<div class="json__item"><div class="json__key">%KEY%</div><div class="json__value json__value--%TYPE%">%VALUE%</div></div>',
        itemCollapsible: '<label class="json__item json__item--collapsible"><input type="checkbox" class="json__toggle"/><div class="json__key">%KEY%</div><div class="json__value json__value--%TYPE%">%VALUE%</div>%CHILDREN%</label>',
        itemCollapsibleOpen: '<label class="json__item json__item--collapsible"><input type="checkbox" checked class="json__toggle"/><div class="json__key">%KEY%</div><div class="json__value json__value--%TYPE%">%VALUE%</div>%CHILDREN%</label>'
    };

    function createItem(key, value, type){
        var element = TEMPLATES.item.replace('%KEY%', key);

        if(type == 'string') {
            element = element.replace('%VALUE%', '"' + value + '"');
        } else {
            element = element.replace('%VALUE%', value);
        }

        element = element.replace('%TYPE%', type);

        return element;
    }

    function createCollapsibleItem(key, value, type, children){
        var tpl = 'itemCollapsible';
        
        if(collapsible) {
            tpl = 'itemCollapsibleOpen';
        }
        
        var element = TEMPLATES[tpl].replace('%KEY%', key);

        element = element.replace('%VALUE%', type);
        element = element.replace('%TYPE%', type);
        element = element.replace('%CHILDREN%', children);

        return element;
    }

    function handleChildren(key, value, type) {
        var html = '';

        for(var item in value) { 
            var _key = item,
                _val = value[item];

            html += handleItem(_key, _val);
        }

        return createCollapsibleItem(key, value, type, html);
    }

    function handleItem(key, value) {
        var type = typeof value;

        if(typeof value === 'object') {        
            return handleChildren(key, value, type);
        }

        return createItem(key, value, type);
    }

    function parseObject(obj) {
        var _result = '<div class="json">';

        for(var item in obj) { 
            var key = item,
                value = obj[item];

            _result += handleItem(key, value);
        }

        _result += '</div>';

        return _result;
    }
    
    return parseObject(json);
};


document.addEventListener('DOMContentLoaded', () => {
    console.log("Popup loaded");

    const renderItems = (items, container) => {
        container.innerHTML = ''; // Clear previous items

        items.forEach(item => {
            let li = document.createElement('li');
            li.className = "mb-2 flex flex-col shadow p-4 rounded";

            let keySpan = document.createElement('span');
            keySpan.className = "font-bold";
            keySpan.textContent = item.key + " - " + item.size;

            let infoSpan = document.createElement('span');
            infoSpan.textContent = `(Created: ${item.creationDate})`;

            let buttonContainer = document.createElement('div');
            buttonContainer.className = "mt-2 flex justify-between";

            let deleteButton = document.createElement('button');
            deleteButton.className = "p-2 bg-red-500 text-white rounded hover:bg-red-400 transition-colors duration-300";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener('click', () => {
                localStorage.removeItem(item.key);
                li.remove();
                // Update total size
                browser.runtime.sendMessage({ command: "getLocalStorageDetails" }, (response) => {
                    document.getElementById('totalSize').innerText = "Total Size: " + response.totalSize;
                });
            });

            let previewButton = document.createElement('button');
            previewButton.className = "p-2 bg-blue-500 text-white rounded hover:bg-blue-400 transition-colors duration-300";
            previewButton.textContent = "Preview JSON";
            previewButton.addEventListener('click', () => {
                const previewModal = document.getElementById('previewModal');
                const preview = document.getElementById('preview');
                preview.innerHTML = jsonViewer({ [item.key]: item }, true);
                previewModal.style.display = 'flex';
            });

            buttonContainer.appendChild(deleteButton);
            buttonContainer.appendChild(previewButton);

            li.appendChild(keySpan);
            li.appendChild(infoSpan);
            li.appendChild(buttonContainer);
            container.appendChild(li);
        });
    };

    const filterItems = (query, items) => {
        return items.filter(item => item.key.toLowerCase().includes(query.toLowerCase()));
    };

    // Close preview modal
    document.getElementById('closePreview').addEventListener('click', () => {
        document.getElementById('previewModal').style.display = 'none';
    });

    browser.runtime.sendMessage({ command: "getLocalStorageDetails" }, (response) => {
        console.log("Received response:", response);
        if (response) {
            const { localStorage, sessionStorage } = response;
            document.getElementById('totalSize').innerText = `LocalStorage: ${localStorage.totalSize}, SessionStorage: ${sessionStorage.totalSize}`;

            const localStorageList = document.getElementById('localStorageList');
            const sessionStorageList = document.getElementById('sessionStorageList');

            renderItems(localStorage.details, localStorageList);
            renderItems(sessionStorage.details, sessionStorageList);

            // Add event listener for search input
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', (e) => {
                const filteredLocalItems = filterItems(e.target.value, localStorage.details);
                const filteredSessionItems = filterItems(e.target.value, sessionStorage.details);

                renderItems(filteredLocalItems, localStorageList);
                renderItems(filteredSessionItems, sessionStorageList);
            });
        } else {
            document.getElementById('totalSize').innerText = "No storage items found.";
        }
    });
});
