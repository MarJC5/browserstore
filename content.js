function getStorageDetails(storage) {
    let details = [];
    let totalSize = 0;

    for (let key in storage) {
        if (!storage.hasOwnProperty(key)) continue;

        let size = ((storage[key].length + key.length) * 2);
        totalSize += size;
        details.push({
            key: key,
            size: (size / 1024).toFixed(2) + " KB",
            creationDate: new Date().toLocaleString(),
            content: storage[key]
        });
    }
    return { details, totalSize: (totalSize / 1024).toFixed(2) + " KB" };
}

function getAllStorageDetails() {
    let localStorageDetails = getStorageDetails(localStorage);
    let sessionStorageDetails = getStorageDetails(sessionStorage);

    return {
        localStorage: localStorageDetails,
        sessionStorage: sessionStorageDetails
    };
}

getAllStorageDetails();