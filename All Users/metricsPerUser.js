const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const { exit } = require('process');

// Function to load JSON data from multiple files
function loadJSONFiles(filePaths) {
    return filePaths.map(filePath => ({
        userId: path.basename(filePath, path.extname(filePath)), // Assume file name as user ID
        data: JSON.parse(fs.readFileSync(filePath))
    }));
}

// Function to calculate sum
function calculateSum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}

// Function to calculate average
function calculateAverage(arr) {
    return calculateSum(arr) / arr.length;
}

// Function to calculate median
function calculateMedian(arr) {
    const sortedArr = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sortedArr.length / 2);

    return sortedArr.length % 2 !== 0
        ? sortedArr[mid]
        : (sortedArr[mid - 1] + sortedArr[mid]) / 2;
}

// Function to count URLs by qtags for each user
// Function to count fields for each user
function countFields(jsonDataArray) {
    return jsonDataArray.map(userData => {
        const counts = userData.data.data.reduce((acc, item) => {
            const { timeActive, qtags, isExactBookmark, like, dislike } = item.data.siteInfo;

            if (timeActive) {
                acc.timeActive += timeActive;
            }
            // Count qtags
            if (qtags !== "no-qtag-yet") {
                acc.qtags++;
            }

            // Count bookmarks
            if (isExactBookmark) {
                acc.bookmarks++;
            }

            // Count likes
            if (like) {
                acc.likes++;
            }

            // Count dislikes
            if (dislike) {
                acc.dislikes++;
            }

            // Count items deleted
            // if (isDeleted) {
            //     acc.itemsDeleted++;
            // }
            // console.log(acc)
            // exit()
            return acc;
        }, { timeActive: 0, qtags: 0, bookmarks: 0, likes: 0, dislikes: 0 });
        // console.log({
        //     userId: userData.userId,
        //     qtags: counts.qtags,
        //     bookmarks: counts.bookmarks,
        //     likes: counts.likes,
        //     dislikes: counts.dislikes,
        //     itemsDeleted: counts.itemsDeleted
        // })
        return {
            userId: userData.userId,
            timeActive: counts.timeActive,
            qtags: counts.qtags,
            bookmarks: counts.bookmarks,
            likes: counts.likes,
            dislikes: counts.dislikes,
        };
    });
}

// Function to aggregate overall statistics
function aggregateStatistics(dataArray) {

    const totals = dataArray.reduce((acc, data) => {
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'userId') {
                if (!acc[key]) acc[key] = [];
                acc[key].push(value);
            }
        }
        return acc;
    }, {});

    const stats = {};
    for (const [key, values] of Object.entries(totals)) {
        stats[key] = {
            sum: calculateSum(values),
            average: calculateAverage(values),
            median: calculateMedian(values)
        };
    }

    return stats;
}

// Function to convert the data object to an array of objects
function convertDataToArray(data) {
    return Object.entries(data).map(([metric, values]) => ({
        metric,
        sum: values.sum,
        average: values.average,
        median: values.median
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
    const aggregatedDataPerUser = countFields(jsonDataArray);
    const finalStats = aggregateStatistics(aggregatedDataPerUser);
    console.log(finalStats)
    const statsArray = convertDataToArray(finalStats)

    // Write Excel file for aggregated data
    convertToExcel(aggregatedDataPerUser, path.join(outputDir, 'aggregatePerUser.xlsx'));
    convertToExcel(statsArray, path.join(outputDir, 'statsSummary.xlsx'));


    console.log('Data aggregation and conversion completed successfully.');
}

// Specify the file paths and output directory
const baseFileName = 'allDocuments';
const fileExtension = '.json';
// Adjust this to the number of files you expect
const numberOfFiles = 3;

const filePaths = [];

for (let i = 1; i <= numberOfFiles; i++) {
    const filePath = `${baseFileName}${String(i).padStart(2, '0')}${fileExtension}`;
    filePaths.push(filePath);
}
console.log(filePaths)
//Manually put in filepaths
//const filePaths = ['allDocuments01.json', 'allDocuments02.json', 'allDocuments03.json'];
// Create a new folder
const outputDir = path.join(__dirname, 'aggregate_metrics');
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

//Run the script
processFiles(filePaths, outputDir);
