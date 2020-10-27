
let newCategory: HTMLFormElement = document.querySelector<HTMLFormElement>('#addCategoryForm');

document.querySelector<HTMLFormElement>('form').addEventListener('submit', (e) => {
    e.preventDefault()

    if (newCategory.length > 255) {
        document.querySelector('#categorySubmissionConfirmation').textContent = "Error - Category Name Too Long"
    } else {

    let data = {"name": newCategory};
    let dataToSend = jsonToFormData(data);


    sendData(dataToSend, '/category').then((response) => {
        return response.json()
    }).then((data) => {
        if (data.success === 'true'){
        document.querySelector('#categorySubmissionConfirmation').textContent = "Success! Category added"
        } else {
            document.querySelector('#categorySubmissionConfirmation').textContent = "Error - Category Not Added"
        }
    })

    }
});
