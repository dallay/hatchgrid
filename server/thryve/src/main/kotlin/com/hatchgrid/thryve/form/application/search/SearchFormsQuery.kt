package com.hatchgrid.thryve.form.application.search

import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.common.domain.criteria.Criteria
import com.hatchgrid.common.domain.presentation.pagination.CursorPageResponse
import com.hatchgrid.common.domain.presentation.sort.Sort
import com.hatchgrid.thryve.form.application.FormResponse

/**
 * This class represents a query to search all forms.
 *
 * @param workspaceId The ID of the workspace to which the forms belong.
 * @property userId The ID of the user who is performing the search.
 * @property criteria The criteria to filter the forms. It can be null.
 * @property size The size of the page to return. It can be null.
 * @property cursor The cursor to paginate through the forms. It can be null.
 * @property sort The sort order for the forms. It can be null.
 */
class SearchFormsQuery(
    val workspaceId: String,
    val userId: String,
    val criteria: Criteria? = null,
    val size: Int? = null,
    val cursor: String? = null,
    val sort: Sort? = null
) :
    Query<CursorPageResponse<FormResponse>> {

    /**
     * Checks if the given object is equal to this instance.
     *
     * @param other The object to compare with this instance.
     * @return true if the given object is equal to this instance, false otherwise.
     */
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is SearchFormsQuery) return false
        return true
    }

    /**
     * Generates a hash code for this instance.
     *
     * @return The hash code of this instance.
     */
    override fun hashCode(): Int = javaClass.hashCode()
}
