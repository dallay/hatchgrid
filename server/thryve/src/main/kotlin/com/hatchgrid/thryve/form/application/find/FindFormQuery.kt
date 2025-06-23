package com.hatchgrid.thryve.form.application.find

import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.thryve.form.application.FormResponse

/**
 * Query for finding a form by workspace and form ID.
 *
 * @property workspaceId The ID of the workspace containing the form.
 * @property formId The ID of the form to find.
 */
data class FindFormQuery(
    val workspaceId: String,
    val formId: String
) : Query<FormResponse>
