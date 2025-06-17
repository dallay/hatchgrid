package com.hatchgrid.thryve.newsletter.tag.application.list

import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.common.domain.presentation.PageResponse
import com.hatchgrid.thryve.newsletter.tag.application.TagResponse

/**
 * Query to get all tags for a specific workspace.
 *
 * @property workspaceId The ID of the workspace to get tags for.
 * @property userId The ID of the user making the request.
 */
data class GetAllTagsQuery(val workspaceId: String, val userId: String) : Query<PageResponse<TagResponse>>
