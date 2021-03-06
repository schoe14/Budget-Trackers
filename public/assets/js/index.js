import { populateTotal, populateTable, populateChart } from "./populate.js";
import { checkForIndexedDb, useIndexedDb } from "./indexedDb.js";
import { sendTransaction } from "./transaction.js"

let transactions = [];

function renderDataOffline() {
  if (!navigator.onLine) {
    useIndexedDb("transactions", "TransactionStore", "get").then(results => {
      if (results.length > 0) {
        console.log("renderDataOffline() working"); // test
        results.forEach(element => {
          transactions.unshift(element);
        })
        populateTotal(transactions);
        populateTable(transactions);
        populateChart(transactions);
      }
    });
  }
}

function init() {
  fetch("/api/transaction")
    .then(response => {
      return response.json();
    })
    .then(data => {
      // save db data on global variable
      transactions = data;

      populateTotal(transactions);
      populateTable(transactions);
      populateChart(transactions);
      // console.log("init() working"); // test
      // caches.has("runtime-cache").then(function (boolean) {
      //   if (!boolean) location.reload();
      // });
    });
}

function checkDatabase() {
  if (navigator.onLine && checkForIndexedDb()) {
    useIndexedDb("transactions", "TransactionStore", "get").then(results => {
      if (results.length > 0) {
        // console.log("checkDatabase() working"); // test
        // console.log(results); // test
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(results),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
          .then(response => response.json())
          .then(() => {
            useIndexedDb("transactions", "TransactionStore", "deleteAll");
            init();
          });
      }
    });
  }
}

window.onclick = function (event) {
  // console.log(event.target); // test
  if (event.target.className === "delete-btn") {
    deleteData(event.target.id);
  }
}

function deleteData(dataToBeDeleted) {
  // console.log(dataToBeDeleted); // test
  fetch("/api/delete", {
    method: "DELETE",
    body: JSON.stringify({ _id: dataToBeDeleted }),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(() => {
      init();
    });
}

window.addEventListener("online", checkDatabase());
window.addEventListener("offline", renderDataOffline());

document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true, transactions);
}

document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false, transactions);
}

init();