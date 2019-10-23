/**
 * This function gets the user data and grabs all the percentage scores
 *
 * @returns will return an array of strings of percentage scores and passes it as a param in within a function call for categoriseData
 */
async function userScores(){
    let usersObject = await createUsersObject()
    let usersData = usersObject.data
    let percentagesArray = []
    usersData.forEach(function (element) {
        if (element.percentage !== "")
        percentagesArray.push(element.percentage)
    })
    categoriseData(percentagesArray)
}

/**
 * This function divides user scores into three categories
 *
 * @param userScores is the user percentage scores array generated by the userScores function
 *
 * @returns will return a single array giving the total number of users falling into each score category
 */

function categoriseData(userScores){
    let highscore = 0
    let pass = 0
    let notPass = 0
    userScores.forEach(function (element) {
        if (parseInt(element) >= 97){
            highscore += 1
        } else if (parseInt(element) >= 70 && parseInt(element) < 97) {
            pass += 1
        } else {
            notPass += 1
        }
    })
    let categorisedScores = [highscore, pass, notPass]
    console.log(categorisedScores)
    return categorisedScores
}

userScores()