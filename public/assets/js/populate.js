let myChart;

export function populateTotal(transactions) {
    // reduce transaction amounts to a single total value
    let total = transactions.reduce((total, t) => {
        return total + parseInt(t.value);
    }, 0);

    let totalEl = document.querySelector("#total");
    totalEl.textContent = total;
}

export function populateTable(transactions) {
    let tbody = document.querySelector("#tbody");
    tbody.innerHTML = "";

    transactions.forEach(transaction => {
        // create and populate a table row
        let tr = document.createElement("tr");
        let content = `
        <td>${transaction.value}</td>
        `;
        //     tr.innerHTML = `
        //     <td>${transaction.name}</td>
        //     <td>${transaction.value}</td>
        //   `;
        if (navigator.onLine) {
            content = `
            <td>${transaction.value}<button id=${transaction._id} class="delete-btn" aria-label="Right Align"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
            `;
        }

        tr.innerHTML = `<td>${transaction.name}</td>` + content;
        tbody.appendChild(tr);
    });
}

export function populateChart(transactions) {
    // copy array and reverse it
    let reversed = transactions.slice().reverse();
    let sum = 0;

    // create date labels for chart
    let labels = reversed.map(t => {
        let date = new Date(t.date);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    });

    // create incremental values for chart
    let data = reversed.map(t => {
        sum += parseInt(t.value);
        return sum;
    });

    // remove old chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    let ctx = document.getElementById("myChart").getContext("2d");

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: "Total Over Time",
                fill: true,
                backgroundColor: "#6666ff",
                data
            }]
        }
    });
}