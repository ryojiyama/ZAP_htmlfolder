document.getElementById('submit-btn').addEventListener('click', function() {
    var productionDate = document.getElementById('production-date').value;
    var inspectionDate = document.getElementById('inspection-date').value;
    var productName = document.getElementById('product-name').value;
    var weather = document.getElementById('weather').value;
    var temperature = document.getElementById('temperature').value;
    var humidity = document.getElementById('humidity').value;
    var extra1 = document.getElementById('extra1').value;
    var extra2 = document.getElementById('extra2').value;

    var table = document.getElementById('inspection-results');
    var row = table.insertRow(-1);
    row.insertCell(0).innerHTML = '<div data-label="生産日">' + productionDate + '</div>';
    row.insertCell(1).innerHTML = '<div data-label="検査日">' + inspectionDate + '</div>';
    row.insertCell(2).innerHTML = '<div data-label="製品名">' + productName + '</div>';
    row.insertCell(3).innerHTML = '<div data-label="天候">' + weather + '</div>';
    row.insertCell(4).innerHTML = '<div data-label="気温">' + temperature + '</div>';
    row.insertCell(5).innerHTML = '<div data-label="湿度">' + humidity + '</div>';
    row.insertCell(6).innerHTML = '<div data-label="項目1">' + extra1 + '</div>';
    row.insertCell(7).innerHTML = '<div data-label="項目2">' + extra2 + '</div>';
    row.insertCell(8).innerHTML = '<button class="delete-btn">削除</button>';
});

document.getElementById('export-csv').addEventListener('click', function() {
    var table = document.getElementById('inspection-results');
    var csv = [];
    var rows = table.rows;

    for (var i = 0; i < rows.length; i++) {
        var cols = rows[i].cells;
        var row = [];

        for (var j = 0; j < cols.length; j++) {
            row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
        }

        csv.push(row.join(','));
    }

    var csvData = csv.join('\n');

    // Shift-JISにエンコード
    var sjisArray = Encoding.convert(Encoding.stringToCode(csvData), {
        to: 'SJIS',
        from: 'UNICODE',
        type: 'array'
    });

    var blob = new Blob([new Uint8Array(sjisArray)], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);

    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inspection_results.csv');
    link.click();
});

document.addEventListener('click', function(e) {
    if (e.target && e.target.className == 'delete-btn') {
        var row = e.target.parentNode.parentNode;
        row.parentNode.removeChild(row);
    }
});
