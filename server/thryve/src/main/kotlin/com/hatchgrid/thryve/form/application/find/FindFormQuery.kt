package com.hatchgrid.thryve.form.application.find

import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.thryve.form.application.FormResponse

data class FindFormQuery(
    val workspaceId: String,
    val formId: String
) : Query<FormResponse>
