function deleteStorage(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
}

deleteStorage();