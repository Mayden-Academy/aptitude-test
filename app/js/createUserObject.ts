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
        let {id, email, name, time, test_id, canRetake, canResume, answers, category_id} = user
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
            canResume: canResume,
            answers: answers
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

async function getAnswersToResume(uid, canResume) {
    let results = await getResults();
    let details = []
        results.forEach(function (result) {
            if (result.id == uid && canResume == 1) {
                let data = {};
                data['id'] = result.id;
                data['answers'] = JSON.parse(JSON.parse(result.answers));
                details.push(data)
            }
        })
    return details
}

getAnswersToResume(19, 1)


async function createUsersObject() {
    let results = await getResults();
    let users = await getNameAndEmail();
    let userDisplayArray = [];
    users.forEach(function(user) {
        let didTest = [];
        results.forEach(function(result) {
            let testEntryFound = [];
            if (result.id === user.id ) {
                let answers = JSON.parse(JSON.parse(result.answers));
                let numberOfQuestionsTaken = Object.keys(answers).length;
                let obj = {};
                obj['id'] = user.id;
                obj['name'] = user.name;
                obj['email'] = user.email;
                obj['score'] = result.score;
                obj['categoryName'] = user.categoryName;
                obj['categoryId'] = user.categoryId;
                obj['percentage'] = calculatePercentage(result.score, result.testLength);
                obj['testAllocated'] = user.testAllocated;
                obj['testId'] = user.testId;
                obj['time'] = result.time;
                obj['timeAllowed'] = secondsToMinutes(user.timeAllowed);
                obj['dateCreated'] = result.dateCreated;
                obj['canRetake'] = user.canRetake;
                obj['canResume'] = user.canResume;
                obj['autoCompleted'] = parseInt(result.autoCompleted);
                userDisplayArray.push(obj);
                testEntryFound.push('yes');
            }
            if (testEntryFound.length !== 0) {
                didTest.push(testEntryFound);
            }
        });
        if (didTest.length === 0) {
            let obj = {};
            obj['id'] = user.id;
            obj['name'] = user.name;
            obj['email'] = user.email;
            obj['categoryName'] = user.categoryName;
            obj['categoryId'] = user.categoryId;
            obj['score'] = '';
            obj['percentage'] = '';
            obj['testAllocated'] = user.testAllocated;
            obj['testId'] = user.testId;
            obj['time'] = '';
            obj['timeAllowed'] = secondsToMinutes(user.timeAllowed);
            obj['dateCreated'] = '1970-01-01 00:00:01';
            obj['testNotTaken'] = 'Not Taken';
            obj['canRetake'] = user.canRetake;
            obj['canResume'] = user.canResume;
            userDisplayArray.push(obj);
        }
    });
    return await {success: true, data: userDisplayArray}
};