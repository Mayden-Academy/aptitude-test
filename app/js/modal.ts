import {BaseUser} from "./interfaces/User";
import {Test} from "./interfaces/Tests";
import {Categories} from "./interfaces/Categories";

/**
 * Opens the modal dialog box.
 */
function openDialog() {
    document.querySelector<HTMLElement>('#modal').style.display = 'block'
    document.querySelector<HTMLElement>('.overlay').style.display = 'block'
}

/**
 * Closes the modal dialog box.
 */
function closeDialog() {
    document.querySelector<HTMLElement>('#modal').style.display = 'none';
    document.querySelector<HTMLElement>('.overlay').style.display = 'none'
}

function openDeleteUserModal() {
    document.querySelector<HTMLElement>('#delete_user_modal').style.display = 'block'
    document.querySelector<HTMLElement>('.overlay').style.display = 'block'
}

function closeDeleteUserModal() {
    document.querySelector<HTMLElement>('#delete_user_modal').style.display = 'none'
    document.querySelector<HTMLElement>('.overlay').style.display = 'none'
}

function openViewResultsModal() {
    document.querySelector<HTMLElement>('#view-results-modal').style.display = 'block';
    document.querySelector<HTMLElement>('.overlay').style.display = 'block';
}

function closeViewResultsModal() {
    document.querySelector<HTMLElement>('#view-results-modal').style.display = 'none';
    document.querySelector<HTMLElement>('.overlay').style.display = 'none';
}

function closeWarningModal() {
    document.querySelector<HTMLElement>('#warningModal').style.display = 'none';
    document.querySelector<HTMLElement>('.overlay').style.display = 'none';
}

/**
 *
 * Creates the modal with editModal handlebars template. 
 * Then calls function to fill modal fields with the users' data.
 * Then adds the submit button's event listener.
 * * removed the duplicate test from tests array and created default test in order to populate seleceted option on modal pop out.
 * @param userInfo Object containing info of the user to edit.
 * @param tests Object containing the array returned by the /test api endpoint
 */
function createEditModal(userInfo: BaseUser, tests: Array<Test>, categories: Array<Categories>) {
    let infoForTemplate = {
        tests: tests,
        categories: categories,
        user: userInfo,
        defaultTest: {},
        defaultCategory: {}
    };

    infoForTemplate.tests.forEach(test => {
        let index = infoForTemplate.tests.indexOf(test);
        if(test.id == infoForTemplate.user.dataTestId){
            infoForTemplate.defaultTest = test;
            infoForTemplate.tests.splice(index, 1)
        }
    });

    infoForTemplate.categories.forEach(category => {
        let index = infoForTemplate.categories.indexOf(category);
        if(category.id == infoForTemplate.user.dataCategoryId){
            infoForTemplate.defaultCategory = category;
            infoForTemplate.categories.splice(index, 1)
        }
    });

    getTemplateAjax('js/templates/editmodal.hbs').then(function (HBTemplate) {
        fillEditModalFields(HBTemplate, infoForTemplate)
    })
    .then(() => {
        addEditModalSubmitEventListener()
        document.querySelectorAll(".close-edit-user").forEach(button => button.addEventListener('click', closeDialog));
        // changeNewUserCategoryDropdown()
    })
}

/**
 * Fills the input fields in the edit modal with the current data of the 
 * user to be edited.
 * @param HBTemplate the handlebars template.
 * @param userInfo the object of all fields required in scores page.
 */
function fillEditModalFields(HBTemplate: string, userInfo: any) {
    let template: Function = Handlebars.compile(HBTemplate);
    let modal_content = document.querySelector("#modal-content");
    
    modal_content.innerHTML = "";

    if (userInfo.user.name && userInfo.user.email && userInfo.user.id && userInfo.user.timeMinutes && userInfo.user.timeSeconds) {
        let html = template(userInfo);
        modal_content.innerHTML += html
    } else {
        modal_content.innerHTML = "Please contact Admin, user list unavailable";
    }
}

/**
 * this is an event listener on the submit button (listens for click), 
 * it sends the object values through our validation functions.
 * If email exists in db then submit is not allowed. If original email 
 * matches current or email does not exist is db then user data is updated.
 */
function addEditModalSubmitEventListener() {
    document.querySelector('#editSubmit').addEventListener('click', function () {
        let name = document.querySelector<HTMLInputElement>("#firstName").value;
        let email = document.querySelector<HTMLInputElement>("#email").value;
        let timeMinutes = document.querySelector<HTMLInputElement>('#userMinutes').value;
        let timeSeconds = document.querySelector<HTMLInputElement>('#userSeconds').value;
        let timeTotal = document.querySelector<HTMLInputElement>('#time');
        let originalEmail = document.querySelector<HTMLInputElement>("#originalEmail").value;
        let errorField = document.querySelector('#modal_error');

        timeTotal.value = (convertToTotalTimeSeconds(timeMinutes, timeSeconds) as any as string);

        getExistingUsers().then(function (existingUsers) {
            if (isEmpty(name) &&
                isEmpty(email) &&
                nameValidation(name) &&
                isTimeTotalValid(timeTotal.value) &&
                isTimeMinutesValid(timeMinutes) &&
                isTimeSecondsValid(timeSeconds) &&
                isEmailValid(email)) {
                if (originalEmail == email || userExists(email, existingUsers) == false) {
                    errorField.innerHTML = '';
                    errorField.classList.add('alert-success');
                    errorField.classList.remove('alert-danger');
                    closeDialog();
                    postUserEdit(createObjectForDatabase('.editUserData'));
                    updateScoreTable()
                } else {
                    errorField.classList.remove('alert-success');
                    errorField.classList.add('alert-danger');
                    errorField.innerHTML = "Your email is not valid or already exists: Please provide a correct email";
                }
            } else {
                errorField.classList.remove('alert-success');
                errorField.classList.add('alert-danger');
                errorField.innerHTML = 'Test duration must be below an hour and minutes and seconds must be between 0 and 60.';
            }
        })
    })
}

/*
This query selector closes the edit user function if you don't want to save the results
 */

document.querySelector(".close-edit-user").addEventListener('click', closeDialog);
document.querySelector(".close-delete-user").addEventListener('click', closeDeleteUserModal);

/**
 * Creates the modal with deleteModal handlebars template.
 * Data id from the delete button is passed to the modal.
 * Listens for the functions relating to the 'yes' and 'no' buttons.
 * @param dataId Number containing id to identify the user or category
 * @param type String containing type of thing we want to delete, user or category
 */
function createDeleteModal(dataId: number, type: 'user'|'category'  = 'user') {
    let infoForTemplate = {
        type: type,
    };

    getTemplateAjax('js/templates/deleteModal.hbs').then(function (HBTemplate) {
        fillDeleteModalFields(HBTemplate, infoForTemplate)
    })
        .then(() => {
            addConfirmDeleteEventListeners(type, dataId);
            document.querySelector<HTMLButtonElement>("#cancelDelete").addEventListener('click', closeDeleteUserModal);
        })
}

/**
 * Compiles the handlebars template based on the userId
 * @param HBTemplate the handlebars template.
 * @param userInfo the object of all fields required in scores page.
 */
function fillDeleteModalFields(HBTemplate: string, userInfo: any) {
    let template: Function = Handlebars.compile(HBTemplate);
    let modal_content = document.querySelector("#delete_user_modal_content");

    modal_content.innerHTML = "";

    if (userInfo.type) {
        let html = template(userInfo);
        modal_content.innerHTML += html
    } else {
        modal_content.innerHTML = "Please contact Admin, user list unavailable";
    }
}