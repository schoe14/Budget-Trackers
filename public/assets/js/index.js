import { populateTotal, populateTable, populateChart } from "./populate.js";
import { checkForIndexedDb, useIndexedDb } from "./indexedDb.js";
import { sendTransaction } from "./transaction.js"

let transactions = [];
// let myChart;

init();

function init() {
  fetch("/api/transaction")
    .then(response => {
      return response.json();
    })
    .then(data => {
      // save db data on global variable
      transactions = data;

      // populateTotal();
      // populateTable();
      // populateChart();

      populateTotal(transactions);
      populateTable(transactions);
      populateChart(transactions);
      console.log("fetch /api/transaction working"); // test
    });
}

function checkDatabase() {
  if (checkForIndexedDb()) {
    useIndexedDb("transactions", "TransactionStore", "get").then(results => {
      console.log("checkDatabase working"); // test
      console.log(results); // test

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
          useIndexedDb("transactions", "TransactionStore", "delete");
          init();
        });
    });
  }
}

// function populateTotal() {
//   // reduce transaction amounts to a single total value
//   let total = transactions.reduce((total, t) => {
//     return total + parseInt(t.value);
//   }, 0);

//   let totalEl = document.querySelector("#total");
//   totalEl.textContent = total;
// }

// function populateTable() {
//   let tbody = document.querySelector("#tbody");
//   tbody.innerHTML = "";

//   transactions.forEach(transaction => {
//     // create and populate a table row
//     let tr = document.createElement("tr");
//     tr.innerHTML = `
//       <td>${transaction.name}</td>
//       <td>${transaction.value}</td>
//     `;

//     tbody.appendChild(tr);
//   });
// }

// function populateChart() {
//   // copy array and reverse it
//   let reversed = transactions.slice().reverse();
//   let sum = 0;

//   // create date labels for chart
//   let labels = reversed.map(t => {
//     let date = new Date(t.date);
//     return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
//   });

//   // create incremental values for chart
//   let data = reversed.map(t => {
//     sum += parseInt(t.value);
//     return sum;
//   });

//   // remove old chart if it exists
//   if (myChart) {
//     myChart.destroy();
//   }

//   let ctx = document.getElementById("myChart").getContext("2d");

//   myChart = new Chart(ctx, {
//     type: 'line',
//     data: {
//       labels,
//       datasets: [{
//         label: "Total Over Time",
//         fill: true,
//         backgroundColor: "#6666ff",
//         data
//       }]
//     }
//   });
// }

// function sendTransaction(isAdding) {
//   let nameEl = document.querySelector("#t-name");
//   let amountEl = document.querySelector("#t-amount");
//   let errorEl = document.querySelector(".form .error");

//   // validate form
//   if (nameEl.value === "" || amountEl.value === "") {
//     errorEl.textContent = "Missing Information";
//     return;
//   }
//   else {
//     errorEl.textContent = "";
//   }

//   // create record
//   let transaction = {
//     name: nameEl.value,
//     value: amountEl.value,
//     date: new Date().toISOString()
//   };

//   console.log(transaction); // test

//   // if subtracting funds, convert amount to negative number
//   if (!isAdding) {
//     transaction.value *= -1;
//   }

//   // add to beginning of current array of data
//   transactions.unshift(transaction);

//   // re-run logic to populate ui with new record
//   // populateChart();
//   // populateTable();
//   // populateTotal();

//   populateChart(transactions);
//   populateTable(transactions);
//   populateTotal(transactions);

//   // also send to server
//   fetch("/api/transaction", {
//     method: "POST",
//     body: JSON.stringify(transaction),
//     headers: {
//       Accept: "application/json, text/plain, */*",
//       "Content-Type": "application/json"
//     }
//   })
//     .then(response => {
//       return response.json();
//     })
//     .then(data => {
//       if (data.errors) {
//         errorEl.textContent = "Missing Information";
//       }
//       else {
//         // clear form
//         nameEl.value = "";
//         amountEl.value = "";
//       }
//     })
//     .catch(err => {
//       // fetch failed, so save in indexed db
//       saveRecord(transaction);

//       // clear form
//       nameEl.value = "";
//       amountEl.value = "";
//     });
// }

// document.querySelector("#add-btn").onclick = function () {
//   sendTransaction(true);
// };

// document.querySelector("#sub-btn").onclick = function () {
//   sendTransaction(false);
// };

window.addEventListener("online", checkDatabase());

document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true, transactions);
};

document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false, transactions);
};

// Use IndexedDb
// function checkForIndexedDb() {
//   if (!window.indexedDB) {
//     console.log("Your browser doesn't support a stable version of IndexedDB.");
//     return false;
//   }
//   return true;
// }

// function useIndexedDb(databaseName, storeName, method, object) {
//   return new Promise((resolve, reject) => {
//     const request = window.indexedDB.open(databaseName, 1);
//     let db,
//       tx,
//       store;

//     request.onupgradeneeded = function (e) {
//       const db = request.result;
//       db.createObjectStore(storeName, { keyPath: "indexedDb_id", autoIncrement: true });
//     };

//     request.onerror = function (e) {
//       console.log("There was an error");
//     };

//     request.onsuccess = function (e) {
//       db = request.result;
//       tx = db.transaction(storeName, "readwrite");
//       store = tx.objectStore(storeName);

//       db.onerror = function (e) {
//         console.log("error");
//       };
//       if (method === "put") {
//         store.put(object);
//       } else if (method === "get") {
//         const all = store.getAll();
//         all.onsuccess = function () {
//           resolve(all.result);
//         };
//       } else if (method === "delete") {
//         // store.delete(object.indexedDb_id);
//         store.clear();
//       }
//       tx.oncomplete = function () {
//         db.close();
//       };
//     };
//   });
// }

// function saveRecord(transaction) {
//   console.log(transaction); // test
//   if (checkForIndexedDb()) {
//     useIndexedDb("transactions", "TransactionStore", "put", transaction);
//   }
// }