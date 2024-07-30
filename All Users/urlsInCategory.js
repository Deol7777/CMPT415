const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

// Function to load JSON data from multiple files
function loadJSONFiles(filePaths) {
    return filePaths.map(filePath => JSON.parse(fs.readFileSync(filePath)));
}

// Function to aggregate URLs by category from multiple JSON files
function aggregateURLsByCategory(jsonData) {
    return jsonData.reduce((acc, item) => {
        const category = item.data.siteInfo.categoryName;
        const url = item.data.siteInfo.url;
        const timeActive = item.data.siteInfo.timeActive;

        if (!acc[category]) {
            acc[category] = { urls: [], totalTimeSpent: 0, totalUrls: 0 };
        }

        acc[category].urls.push(url);
        acc[category].totalTimeSpent += timeActive;
        acc[category].totalUrls += 1;

        return acc;
    }, {});
}

// Convert aggregated data to an array of objects for easier processing
function convertAggregatedDataToArray(aggregatedData) {
    return Object.keys(aggregatedData).map(category => ({
        category,
        urls: aggregatedData[category].urls.join(', '),
        totalTimeSpent: aggregatedData[category].totalTimeSpent,
        totalUrls: aggregatedData[category].totalUrls
    }));
}


// Convert to Excel
function convertToExcel(data, filename) {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    xlsx.writeFile(workbook, filename);
}


// Main function to process files and aggregate data
function processFiles(filePaths, outputDir) {
    const jsonDataArray = loadJSONFiles(filePaths);

    const allData = jsonDataArray.flatMap(jsonData => jsonData.data);
    const aggregatedData = aggregateURLsByCategory(allData);

    const aggregatedDataArray = convertAggregatedDataToArray(aggregatedData);


    // Write Excel file for aggregated data
    convertToExcel(aggregatedDataArray, path.join(outputDir, 'urlsInCategory.xlsx'));

    console.log('Data aggregation and conversion completed successfully.');
}

// Specify the file paths and output directory
const baseFileName = 'allDocuments';
const fileExtension = '.json';
// Adjust this to the number of files you expect
const numberOfFiles = 3;
//const filePaths = ['allDocuments01.json', 'allDocuments02.json', 'allDocuments03.json']; // Replace with your file paths
const filePaths = [];

for (let i = 1; i <= numberOfFiles; i++) {
    const filePath = `${baseFileName}${String(i).padStart(2, '0')}${fileExtension}`;
    filePaths.push(filePath);
}
// Create a new folder
const outputDir = path.join(__dirname, 'Urls_In_Category');
try {
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
        fs.mkdirSync(outputDir);
    } else {
        fs.mkdirSync(outputDir);
    }
} catch (err) {
    console.error('Error:', err);
}


// Run the script
processFiles(filePaths, outputDir);
