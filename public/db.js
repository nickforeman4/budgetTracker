const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("tracker", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;
    console.log("index.db initialized");
    if (navigator.onLine) {
        getFromDatabase();
    };
};

request.onerror = function (event) {
    console.log("Woops! " + event.target.errorCode);
};


function saveRecord(data) {
    const transaction = db.transaction(["tracker"], "readwrite");
    let store = transaction.objectStore("tracker");
    store.add(data);
};

function getFromDatabase() {
    const transaction = db.transaction(["tracker"], "readwrite");
    let store = transaction.objectStore("tracker");
    let getRecord = store.getAll()
        getRecord.onsuccess = function () {
            if (getRecord.result.length > 0) {
                fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(getRecord.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                }).then(dataInserted => {
                    console.log("Records updated to database.");
                    return response.json();
                })
            }
        }
};

window.addEventListener("online", getFromDatabase);