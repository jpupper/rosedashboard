// Obtener las columnas del nodo Get Columns
const columns = $('Get Columns').first().json.values[0];

// Obtener los items para las filas
const items = $input.all().map(item => item.json);

// Formatear las filas y filtrar las que tienen datos
const rows = items
    .filter(item => {
        // Verificar si el item tiene al menos un valor en alguna columna
        return columns.some(column => item[column] !== undefined && item[column] !== '');
    })
    .map(item => ({
        row_number: item.row_number,
        data: columns.reduce((acc, column) => {
            acc[column] = item[column];
            return acc;
        }, {})
    }));

// Retornar el resultado formateado
return [{
    json: {
        columns,
        rows,
        metadata: {
            totalRows: rows.length || 0 // Asegurar que sea 0 si no hay filas
        }
    }
}];