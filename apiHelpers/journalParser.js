var moment = require("moment-timezone");

function Parser() {}

Parser.journalParser = function(body) {
    let firstLine = body[0];
    let journal = {
        name: firstLine.asiento,
        descripcion: `Importado el ${moment().format("YYYY-MM-DD")}`,
        fecha: moment(firstLine.fecha).format("YYYY-MM-DD"),
        isManual: false,
        isDraft: true,
        estado: "por aplicar"
    };
    journal.journalItem = JSON.stringify(body.map(line => getLineValue(line)));
    return (journal);
}

function getLineValue(line) {
    var moneda = line.dolares != '' ? 'dolares' : 'colones';
    var montoEnMoneda = moneda == 'dolares' ? line.dolares : line.debe || line.haber;
    var value = {
        name: line.asiento,
        accountCode: line.cuenta,
        debito: parseFloat(line.debe.trim().replace(/,/g, '')),
        descripcion: line.detalle,
        moneda: moneda,
        montoEnMoneda: parseFloat(montoEnMoneda.trim().replace(/,/g, '')),
        fecha: moment(line.fecha).format("YYYY-MM-DD"),
        credito: parseFloat(line.haber.trim().replace(/,/g, ''))
    };
    return value;
}

module.exports = Parser;
