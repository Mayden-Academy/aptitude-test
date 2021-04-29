function populateCategories() {
    document.querySelector('#categoriesContainer').innerHTML = '';
    populateHandlebars('#categoriesContainer', 'js/templates/categoryItem.hbs', 'category')
        .then(() => {
            document.querySelectorAll('.deleteCategory').forEach((button: HTMLElement) => {
                button.addEventListener('click', async(clickedBtn: MouseEvent) => {
                    const button = clickedBtn.target as HTMLButtonElement
                    const id = parseInt(button.dataset.id);
                    createDeleteModal(id, 'category')
                })
            })
        })
}

populateCategories();


