import { populateTotal, populateTable, populateChart } from "./populate.js";
import { checkForIndexedDb, useIndexedDb } from "./indexedDb.js";

const toast = document.querySelector("#toast");

export function sendTransaction(isAdding, transactions) {
    let nameEl = document.querySelector("#t-name");
    let amountEl = document.querySelector("#t-amount");
    let errorEl = document.querySelector(".form .error");

    // validate form
    if (nameEl.value === "" || amountEl.value === "") {
        errorEl.textContent = "Missing Information";
        return;
    }
    else {
        errorEl.textContent = "";
    }

    // create record
    let transaction = {
        name: nameEl.value,
        value: amountEl.value,
        date: new Date().toISOString()
    };

    console.log(transaction); // test

    // if subtracting funds, convert amount to negative number
    if (!isAdding) {
        transaction.value *= -1;
    }

    // add to beginning of current array of data
    transactions.unshift(transaction);

    // re-run logic to populate ui with new record
    // populateChart();
    // populateTable();
    // populateTotal();

    populateChart(transactions);
    populateTable(transactions);
    populateTotal(transactions);

    // also send to server
    fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(transaction),
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.errors) {
                errorEl.textContent = "Missing Information";
            }
            else {
                // clear form
                nameEl.value = "";
                amountEl.value = "";
            }
        })
        .catch(err => {
            // fetch failed, so save in indexed db
            saveRecord(transaction);

            // clear form
            nameEl.value = "";
            amountEl.value = "";
        });
}

export function saveRecord(transaction) {
    console.log(transaction); // test
    if (checkForIndexedDb()) {
        if (!navigator.onLine) {
            console.log(navigator.onLine); // test
            toast.classList.add("success");
        }
        useIndexedDb("transactions", "TransactionStore", "put", transaction);
    }
}

function handleToastAnimationEnd() {
    toast.removeAttribute("class");
}

toast.addEventListener("animationend", handleToastAnimationEnd);