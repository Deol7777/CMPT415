# CMPT415

JS Scripts for analyzing data

1. All Users Folder - Contains two script files for aggregate user analysis.
   a) metricsPerUser.js: gives sum, avg and median of various fields for multiple users.
   b) urlsInCategory.js: gives the total number of urls in each category for all the users.

2. Single User Folder - Contains one script file that generates two excel files.
   a) qtagCategoryTime: 1) Calculates time spent on each category for a single user. 2) Calculates qtags within different categories for a single user.

3. Excel Tables Folder - Sample excel files that the scripts in 'All Users' folder create.

4. Pictures - Sample Tableau graphs created from the excel files.

HOW TO USE SCRIPT FILES:

1. Make sure you have Node.js installed

2. Install the required package using 'npm install xlsx'

3. Each scipt has a filename variable ( for single files) OR a filepath array ( for multiple/All user) files. Modify this as needed to include the number of files needed. Make sure to have data files within the same category. More comments within files.

4. To run the JS file use 'node myfilename.js'

5. Running the file would create a folder within the same directory containing the excel files. To re-run the script file, delete this folder and try again.
