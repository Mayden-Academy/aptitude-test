/**
 * deletes category from database
 * @param {number} id the category id
 * @returns {Promise<*>} response from api
 */
async function deleteCategory(id: number) {
    return await sendData(undefined, `/category/delete/${id}`);
}
