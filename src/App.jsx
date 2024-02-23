import { useState } from "react";
import "./App.css";

export default function App() {
  const [files, setFiles] = useState({});
  const [table, setTable] = useState(null);
  const fileName = Object.keys(files);

  const changeFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setFiles({ ...files, [file.name]: reader.result });
      parseCsv(reader.result.split("\n"));
    };

    if (file) {
      reader.readAsText(file);
    }
  };

  const removeFile = (fileNameToRemove) => {
    const updatedFiles = { ...files };
    delete updatedFiles[fileNameToRemove];
    setFiles(updatedFiles);
  };

  function parseCsv(data) {
    setTable(data);
  }

  function renderTable() {
    return (
      <table>
        <tbody>
          {table.map((row, index) => (
            <tr key={index}>
              {row.split(",").map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function joinTable() {
    let newFile = files[fileName[0]].split("\n");
    let rowCount = files[fileName[0]].split("\n").length;

    for (let i = 1; i < fileName.length; i++) {
      for (let j = 0; j < rowCount; j++) {
        newFile[j] = newFile[j].concat(",", files[fileName[i]].split("\n")[j]);
      }
    }
    parseCsv(newFile);
  }

  return (
    <div>
      <div className="header">
        Csv Uploader App
      </div>
      <input className="container" type="file" accept=".csv" onChange={(e) => changeFile(e)} />

      <p>
        Selected files are{" "}
        <span>
          {fileName.map((i) => (
            <>
              <button onClick={() => parseCsv(files[i].split("\n"))}>
                {i}
                
              </button>{""}
              
              <button onClick={() => removeFile(i)}>-</button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </>
          ))}
        </span>
      </p>

      {Array.isArray(table) && renderTable()}

      <button className="btn" onClick={joinTable}>Join file content</button>
      <footer>

      </footer>
    </div>
  );
}
