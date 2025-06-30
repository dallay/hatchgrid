package com.hatchgrid.thryve.form.application.details

import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.thryve.form.application.FormResponse

/**
 * Query for fetching form details.
 *
 * @property formId The ID of the form to fetch.
 */
data class DetailFormQuery(
    val formId: String
) : Query<FormResponse>
