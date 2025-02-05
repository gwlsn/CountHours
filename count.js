document.getElementById("calculateButton").addEventListener("click", function () {
    const fileInputs = [
        { element: document.getElementById("fileInput1"), total: 0, mutation: (sum) => sum * 0.1095, filesProcessed: 0 },
        { element: document.getElementById("fileInput2"), total: 0, mutation: (sum) => sum * 0.2138, filesProcessed: 0 },
        { element: document.getElementById("fileInput3"), total: 0, mutation: (sum) => sum * 0.2737, filesProcessed: 0 },
        { element: document.getElementById("fileInput4"), total: 0, mutation: (sum) => sum * 0.2245, filesProcessed: 0 }
    ];
    const result = document.getElementById("result");

    let totalFiles = 0; // Count total files across all inputs
    let inputsProcessed = 0; // Track completed file inputs

    // Count total number of files
    fileInputs.forEach(input => {
        totalFiles += input.element.files.length;
    });

    if (totalFiles === 0) {
        result.textContent = "Please select at least one file.";
        return;
    }

    // Process each file input separately
    fileInputs.forEach(input => {
        let filesInInput = input.element.files.length;

        // If an input has no files, mark it as processed immediately
        if (filesInInput === 0) {
            inputsProcessed++;
            return;
        }

        Array.from(input.element.files).forEach(file => {
            const reader = new FileReader();

            reader.onload = function (event) {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: "array" });

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Get value in cell G40
                    const cell = worksheet[`G40`];
                    const rawValue = parseFloat(cell?.v) || 0;

                    // Accumulate sum for this file input
                    input.total += rawValue;
                } catch (error) {
                    console.error(`Error processing file: ${file.name}`, error);
                    result.textContent = `Error processing one or more files. Check the console for details.`;
                }

                // Track processed files
                input.filesProcessed++;

                // Once all files for this input are processed, apply mutation
                if (input.filesProcessed === filesInInput) {
                    input.total = input.mutation(input.total);
                    inputsProcessed++;
                }

                // Once all inputs are processed, display results
                if (inputsProcessed === fileInputs.length) {
                    const grandTotal = fileInputs.reduce((sum, input) => sum + input.total, 0);

                    result.innerHTML = `
                        Backpay owed for Apr 1, 2021 - Mar 31, 2022: <strong>$${fileInputs[0].total.toFixed(2)}</strong> <br>
                        Backpay owed for Apr 1, 2022 - Mar 31, 2023: <strong>$${fileInputs[1].total.toFixed(2)}</strong> <br>
                        Backpay owed for Apr 1, 2023 - Mar 31, 2024: <strong>$${fileInputs[2].total.toFixed(2)}</strong> <br>
                        Backpay owed for Apr 1, 2024 - Mar 31, 2025: <strong>$${fileInputs[3].total.toFixed(2)}</strong> <br>
                        <br><h2><strong>Grand Total: $${grandTotal.toFixed(2)}</strong></h2>
                    `;
                }
            };

            reader.onerror = function () {
                console.error(`Error reading file: ${file.name}`);
                result.textContent = `Error reading one or more files. Check the console for details.`;
                filesProcessed++;

                // If all files processed, apply mutation and log totals
                if (filesProcessed % filesInInput === 0) {
                    input.total = input.mutation(input.total);
                    inputsProcessed++;
                }

                if (inputsProcessed === fileInputs.length) {
                    console.log("Final Totals:");
                    fileInputs.forEach((input, index) => {
                        console.log(`Backpay owed for FileInput${index + 1}:`, input.total);
                    });
                }
            };

            reader.readAsArrayBuffer(file);
        });
    });
});
