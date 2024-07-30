const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

//Data Source filename. Change as needed
const fileName = "stuff.json"

// Load JSON data from a file
const rawData = fs.readFileSync(fileName);
const jsonData = JSON.parse(rawData);

// Create a new folder
const outputDir = path.join(__dirname, 'single_user');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
else {
    throw new Error("Please delete the existing file output folder");
}


// Count categories per qtag type
const qtagCategoryCounts = jsonData.data.reduce((acc, item) => {
    const qtags = Array.isArray(item.data.siteInfo.qtags) ? item.data.siteInfo.qtags : [item.data.siteInfo.qtags];
    const category = item.data.siteInfo.categoryName;

    qtags.forEach(qtag => {
        if (!acc[qtag]) {
            acc[qtag] = {};
        }
        if (!acc[qtag][category]) {
            acc[qtag][category] = 0;
        }
        acc[qtag][category]++;
    });

    return acc;
}, {});

// Sum timeActive per category
const categoryTimeSpent = jsonData.data.reduce((acc, item) => {
    const category = item.data.siteInfo.categoryName;
    const timeActive = item.data.siteInfo.timeActive;

    if (!acc[category]) {
        acc[category] = 0;
    }
    acc[category] += timeActive;

    return acc;
}, {});

// Convert counts to an array of objects for easier processing
const qtagCategoryData = [];
for (const qtag in qtagCategoryCounts) {
    for (const category in qtagCategoryCounts[qtag]) {
        qtagCategoryData.push({
            qtag,
            category,
            count: qtagCategoryCounts[qtag][category]
        });
    }
}

// Convert time spent data to an array of objects for easier processing
const categoryTimeData = Object.keys(categoryTimeSpent).map(category => ({
    category,
    totalTimeSpent: categoryTimeSpent[category]
}));



// Convert to Excel
function convertToExcel(data, filename) {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    xlsx.writeFile(workbook, filename);
}


// Write Excel file for qtag category counts
convertToExcel(qtagCategoryData, path.join(outputDir, 'qtag_category_counts.xlsx'));

// Write Excel file for category time spent
convertToExcel(categoryTimeData, path.join(outputDir, 'category_time_spent.xlsx'));

console.log('Success. Excel files created');
