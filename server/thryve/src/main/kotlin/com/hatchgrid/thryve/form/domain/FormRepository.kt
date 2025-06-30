package com.hatchgrid.thryve.form.domain

/**
 * Repository interface that handles form lifecycle operations: creation, updates, and deletion.
 * All operations are implemented as suspending functions for reactive processing.
 * The create and update operations take a Form object as a parameter, while delete
 * typically operates on a form identifier.
 */
interface FormRepository {
    /**
     * This function is used to create a new form.
     * It is a suspending function, meaning it can be paused and resumed at a later time.
     * This makes it suitable for use in a coroutine context, where it can be used for non-blocking IO operations.
     *
     * @param form The form to create.
     */
    suspend fun create(form: Form)

    /**
     * This function is used to update an existing form.
     * It is a suspending function, meaning it can be paused and resumed at a later time.
     * This makes it suitable for use in a coroutine context, where it can be used for non-blocking IO operations.
     *
     * @param form The form to update.
     */
    suspend fun update(form: Form)

    /**
     * Deletes a form with the given id.
     *
     * @param formId The id of the form to be deleted.
     */
    suspend fun delete(formId: FormId)
}
