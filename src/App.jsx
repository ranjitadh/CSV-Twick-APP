import React, { useState } from 'react';
import './index.css'; // Import the CSS file

const CsvUploader = () => {
  const [csvData, setCsvData] = useState(null);
  const [newRowData, setNewRowData] = useState({});
  const [existingCsvData, setExistingCsvData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [affectedColumns, setAffectedColumns] = useState([]);
  const [selectedColumnToAdd, setSelectedColumnToAdd] = useState('');
  const [selectedColumnToRemove, setSelectedColumnToRemove] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target.result;
        const parsedCsvData = parseCsv(result);
        const columns = Object.keys(parsedCsvData[0]);
        setCsvData(parsedCsvData);
        setSelectedColumns(columns);
        setAffectedColumns([]);
      };

      reader.readAsText(file);
    }
  };

  const handleExistingFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const result = event.target.result;
        const parsedCsvData = parseCsv(result);

        // Combine columns from the existing CSV and the new CSV
        const combinedColumns = Array.from(new Set([...Object.keys(parsedCsvData[0]), ...selectedColumns]));

        setExistingCsvData(parsedCsvData);
        setSelectedColumns(combinedColumns);
        setAffectedColumns([]);
      };

      reader.readAsText(file);
    }
  };

  const parseCsv = (csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');

    const data = lines.slice(1).map((line) => {
      const values = line.split(',');
      return headers.reduce((entry, header, index) => {
        entry[header.trim()] = values[index].trim();
        return entry;
      }, {});
    });

    return data;
  };

  const addRow = () => {
    if (selectedColumnToAdd) {
      const newRow = { ...newRowData, [selectedColumnToAdd]: newRowData[selectedColumnToAdd] };
      const newData = [...csvData, newRow];
      setCsvData(newData);
      setAffectedColumns([...affectedColumns, newRow]);
      setNewRowData({});
      setSelectedColumnToAdd('');

      // Check if there is existing CSV data to merge with the new row
      if (existingCsvData.length > 0) {
        const updatedExistingCsvData = existingCsvData.map(existingRow => {
          const correspondingNewRow = affectedColumns.find(row => (
            row[selectedColumnToAdd] === existingRow[selectedColumnToAdd]
          ));

          return correspondingNewRow ? { ...existingRow, ...correspondingNewRow } : existingRow;
        });

        setExistingCsvData(updatedExistingCsvData);
      }
    }
  };

  const removeRow = (index, isAffectedRow) => {
    if (isAffectedRow) {
      const newAffectedColumns = [...affectedColumns];
      newAffectedColumns.splice(index, 1);
      setAffectedColumns(newAffectedColumns);
    } else {
      const newData = [...csvData];
      newData.splice(index, 1);
      setCsvData(newData);
    }
  };

  const handleInputChange = (column, value) => {
    setNewRowData((prevData) => ({
      ...prevData,
      [column]: value,
    }));
  };

  const removeColumn = () => {
    if (selectedColumnToRemove) {
      const newCsvData = csvData.map(row => {
        const { [selectedColumnToRemove]: columnToRemove, ...newRow } = row;
        return newRow;
      });

      const newAffectedColumns = affectedColumns.map(row => {
        const { [selectedColumnToRemove]: columnToRemove, ...newRow } = row;
        return newRow;
      });

      setCsvData(newCsvData);
      setAffectedColumns(newAffectedColumns);
      setSelectedColumnToRemove('');
    }
  };

  const updateCsv = () => {
    const allData = [...(csvData || []), ...affectedColumns, ...existingCsvData];

    const csvText =
      Object.keys(allData[0]).join(',') +
      '\n' +
      allData.map(row => Object.values(row).join(',')).join('\n');

    const blob = new Blob([csvText], { type: 'text/csv' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged_data.csv';
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="header">
        <h2>CSV Uploader App</h2>
      </div>
      <div className="container">
        <div>
          <input className="btn" type="file" accept=".csv" onChange={handleFileChange} />
          <input
            className="btn"
            type="file"
            accept=".csv"
            onChange={handleExistingFileChange}
          />
        </div>
        {(csvData || existingCsvData) && (
          <div className="csv-container">
            <h3>Parsed CSV Data:</h3>
            <div className="table-box">
              <table>
                <thead>
                  <tr>
                    {selectedColumns.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(csvData || []).map((row, index) => (
                    <tr key={index}>
                      {selectedColumns.map((column) => (
                        <td key={column}>{row[column]}</td>
                      ))}
                      <td>
                        <button onClick={() => removeRow(index, false)}>-</button>
                      </td>
                    </tr>
                  ))}
                  {(existingCsvData || []).map((row, index) => (
                    <tr key={index}>
                      {selectedColumns.map((column) => (
                        <td key={column}>{row[column]}</td>
                      ))}
                      <td>
                        <button onClick={() => removeRow(index, false)}>-</button>
                      </td>
                    </tr>
                  ))}
                  {(affectedColumns || []).map((row, index) => (
                    <tr key={index}>
                      {selectedColumns.map((column) => (
                        <td key={column}>{row[column]}</td>
                      ))}
                      <td>
                        <button onClick={() => removeRow(index, true)}>-</button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    {selectedColumns.map((column) => (
                      <td key={column}>
                        <input
                          type="text"
                          value={newRowData[column] || ''}
                          onChange={(e) => handleInputChange(column, e.target.value)}
                        />
                      </td>
                    ))}
                    <td>
                      <select
                        value={selectedColumnToAdd}
                        onChange={(e) => setSelectedColumnToAdd(e.target.value)}
                      >
                        <option value="" disabled>Select Column</option>
                        {selectedColumns.map((column) => (
                          <option key={column} value={column}>{column}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button onClick={addRow}>+</button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={selectedColumns.length + 1}>
                      <select
                        value={selectedColumnToRemove}
                        onChange={(e) => setSelectedColumnToRemove(e.target.value)}
                      >
                        <option value="" disabled>Select Column to Remove</option>
                        {selectedColumns.map((column) => (
                          <option key={column} value={column}>{column}</option>
                        ))}
                      </select>
                      <button onClick={removeColumn}>-</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button onClick={updateCsv}>Update CSV</button>
          </div>
        )}
      </div>
      <footer></footer>
    </>
  );
};

export default CsvUploader;
