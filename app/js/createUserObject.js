const numberOfQuestions = 30

/**
 * gets all users score results from api and add percentage values
 *
 * @return Array - containing the score results with percentage
 */
async function applyPercent() {
    let scoreArr = await fetch("http://localhost:8080/result", {method: 'get'})
        .then(function (data) {
            return data.json()
        })

    scoreArr.data.forEach(function (score) {
        score.percent = (score.score / numberOfQuestions * 100).toFixed(2)
    })
    return scoreArr.data
}

/**
 * gets all users name and email from API
 *
 * @return Array - containing the user info (Name and Email)
 */
async function getNameAndEmail() {
    let users = await fetch("http://localhost:8080/user", {method: 'get'})
        .then(function (data) {
            return data.json()
        })

    let usersArray = []
    users.data.forEach(function(user) {
        let obj = {}
        let {id, email, name, time} = user
        obj['id'] = id
        obj['name'] = name
        obj['email'] = email
        obj['timeAllowed'] = time
        usersArray.push(obj)
    })
    return usersArray
}

/**
 * combines user info (name and email) and result scores into the a new object
 *
 * @return Object - containing the user info and user results including percentage
 */
async function createUsersObject () {
    let results = await applyPercent()
    let users = await getNameAndEmail()
    let userDisplayArray = []

    results.forEach(function(result) {
        users.forEach(function(user) {
            if (result.id === user.id ) {
                let obj = {}

                obj['id'] = user.id
                obj['name'] = user.name
                obj['email'] = user.email
                obj['timeAllowed'] = user.timeAllowed
                obj['score'] = result.score
                obj['percentage'] = result.percent
                obj['time'] = result.time
                obj['dateCreated'] = result.dateCreated
                userDisplayArray.push(obj)
            }

        })
    })

    return await {success: true, data: userDisplayArray}
}