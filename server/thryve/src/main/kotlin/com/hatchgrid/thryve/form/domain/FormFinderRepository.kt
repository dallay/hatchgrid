package com.hatchgrid.thryve.form.domain

import com.hatchgrid.common.domain.criteria.Criteria
import com.hatchgrid.common.domain.presentation.pagination.Cursor
import com.hatchgrid.common.domain.presentation.pagination.CursorPageResponse
import com.hatchgrid.common.domain.presentation.sort.Sort
import com.hatchgrid.thryve.workspace.domain.WorkspaceId

/**
 * This is an interface for a repository that finds or searches forms.
 */
interface FormFinderRepository {
    /**
     * This function is used to find a form by its id.
     *
     * @param id The id of the form to find.
     * @return The form if found, or null if not found.
     */
    suspend fun findById(id: FormId): Form?

    /**
     * Find a form by form id and workspace id.
     * @param formId The form id.
     * @param workspaceId The workspace id.
     * @return The form if found, or null if not found.
     */
    suspend fun findByFormIdAndWorkspaceId(formId: FormId, workspaceId: WorkspaceId): Form?

    /**
     * This function is used to search all [Form] by cursor.
     *
     * @param criteria The criteria to use for the search.
     * @param size The size of the page to return.
     * @param sort The sort order to use for the results.
     * @param cursor The cursor to use for the search.
     * @return A CursorPageResponse containing the search results.
     */
    suspend fun search(
        criteria: Criteria? = null,
        size: Int? = null,
        sort: Sort? = null,
        cursor: Cursor? = null,
    ): CursorPageResponse<Form>
}
