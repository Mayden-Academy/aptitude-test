import {Test} from "./interfaces/Tests";
import {BaseUser} from "./interfaces/User";
import {Categories} from "./interfaces/Categories";

/**
 * Get all the test results from the API.
 */
async function getResults() {
    let baseUrl = getBaseUrl();
    let resultsArr = await fetch(baseUrl + "result", {method: 'get'})
    .then(function (data) {
        return data.json()
    });
    return resultsArr.data
};

/**
 * Gets users from the API.
 * Filters out users that have been soft-deleted from the database.
 * @return Array of user objects
 */
async function getUsers() {
    let baseUrl = getBaseUrl();
    let users = await fetch(baseUrl + "user", {method: 'get'})
        .then(function (data) {
            return data.json()
        });
    let filteredUsersArray = users.data.filter( function(value, index, arr) {
        return value.deleted == 0;
    });
    return filteredUsersArray
};

/**
 * Gets tests from the API.
 * 
 * @return Array of test objects
 */
async function getTests() {
    let baseUrl = getBaseUrl();
    let tests = await fetch(baseUrl + "test", {method: 'get'})
        .then(function (response) {
            return response.json()
        }).then(function(response) {
            return response.data
        });
    return tests
};

/**
 * Get all categories from the API.
 *
 * @return Array of category objects
 */
async function getCategories() {
    let baseUrl = getBaseUrl();
    let categories = await fetch(baseUrl + "category", {method: 'get'})
        .then(function (response) {
            return response.json()
        }).then(function(response) {
            return response.data
        });
    return categories
};

/**
 * Take a score and a total number of questions and calculate the score 
 * as a percentage.
 * @param {number} score The user's test score
 * @param {number} numOfQuestions The number of questions on the test
 * @return {number} The score represented as a percentage
 */
function calculatePercentage(score: number, numOfQuestions: number) {
    return Math.round((score / numOfQuestions) * 100)
};

/**
 * Take a time in seconds and convert it into minutes and seconds.
 * @param {number} time time in seconds
 * @return {number} Time in MM:SS format
 */
function secondsToMinutes(time: number) {
    return String(Math.floor(time / 60)).padStart(2,'0') + ':' + String((time % 60)).padStart(2,'0')
};

/**
 * This function finds the name of a test given its id and the list of tests from the db
 * 
 * @param {tests} Object the json of tests returned from the db, generated by getTests()
 * @param {testId} number the id of the test whose name we are trying to find
 * 
 * @return string the name of the test with the given id, as it appears in the database
 */
function findTestName(tests: Array<Test>, testId: number) {
    let testName = "None Assigned";
    tests.forEach(function(test) {
        if (testId === test.id) {
            testName = test.name;
        }
    });
    return testName;
};

function findCategoryName(categories: Array<Categories>, categoryId: number) {
    let categoryName = "None Assigned";
    categories.forEach(function(category) {
        if (categoryId === category.id) {
            categoryName = category.name;
        }
    });
    return categoryName;
};

/**
 * Prepares user objects for next step, createUserObject
 *
 * @return Array - containing the user objects
 */
async function getNameAndEmail(): Promise<Array<BaseUser>> {
    let users = await getUsers();
    let tests = await getTests();
    let categories = await getCategories();
    let userObjectArray: Array<BaseUser> = [];
    users.forEach(function(user: any) {
        let {id, email, name, time, test_id, canRetake, category_id} = user
        let testName = findTestName(tests, test_id)
        let categoryName = findCategoryName(categories, category_id)
        let obj: BaseUser = {
            id: id,
            name: name,
            email: email,
            categoryName: categoryName,
            categoryId: category_id,
            timeAllowed: time,
            testAllocated: testName,
            testId: test_id,
            canRetake: canRetake,
        }
        userObjectArray.push(obj)
    });
    return userObjectArray
};

/**
 * Combines the information used in a table row into a new object.
 * Returns a list of all of these user-result objects ready to be put into table rows.
 *
 * @return Object containing a success/fail state and an array of the user-result objects.
 */
async function createUsersObject() {
    let results = await getResults();
    let users = await getNameAndEmail();

    users.forEach(user => {
        let usersResults = results.filter(results => {
            return results.id === user.id
        })
        usersResults.sort((a, b) => {
            const dateA = new Date(a.dateCreated)
            const dateB = new Date(b.dateCreated)
            return dateB.getTime() - dateA.getTime() //sort by date descending
        })
        user.results = usersResults
        user['timeAllowed'] = secondsToMinutes(user.timeAllowed);
        user.results.forEach(result => {
            result['percentage'] = calculatePercentage(result.score, result.testLength);
            result['autoCompleted'] = parseInt(result.autoCompleted);
        })

        if (user.results.length === 0) {
            user['score'] = '';
            user['percentage'] = '';
            user['time'] = '';
            user['dateCreated'] = '1970-01-01 00:00:01';
            user['testNotTaken'] = 'Not Taken';
        }
    });
    return await {success: true, data: users}
};

