document.getElementById("calculateButton").addEventListener("click", function () {
    const fileInput = document.getElementById("fileInput");
    const result = document.getElementById("result");

    if (!fileInput.files.length) {
        result.textContent = "Please select at least one file.";
        return;
    }

    let totalHours = 0; // Initialize the total hours counter
    let filesProcessed = 0; // Track the number of files processed

    // Process each file
    Array.from(fileInput.files).forEach((file) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                // Assume the first sheet in the workbook contains the data
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Sum up the values in cells D16 to D31
                for (let row = 16; row <= 31; row++) {
                    const cellAddress = `D${row}`;
                    const cell = worksheet[cellAddress];
                    totalHours += parseFloat(cell.v) || 0;
                }
            } catch (error) {
                console.error(`Error processing file: ${file.name}`, error);
                result.textContent = `Error processing one or more files. Check the console for details.`;
            }

            // Increment the files processed counter
            filesProcessed++;

            // Once all files are processed, display the total
            if (filesProcessed === fileInput.files.length) {
                result.textContent = `Total Hours Worked: ${totalHours.toFixed(2)}`;
            }
        };

        reader.onerror = function () {
            console.error(`Error reading file: ${file.name}`);
            result.textContent = `Error reading one or more files. Check the console for details.`;
        };

        // Read the file as an ArrayBuffer
        reader.readAsArrayBuffer(file);
    });
});
