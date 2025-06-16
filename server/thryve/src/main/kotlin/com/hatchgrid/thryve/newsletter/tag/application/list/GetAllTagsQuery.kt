package com.hatchgrid.thryve.newsletter.tag.application.list

import com.hatchgrid.thryve.newsletter.tag.application.TagResponse
import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.common.domain.presentation.PageResponse

/**
 * Query to get all tags for a specific workspace.
 *
 * @property workspaceId The ID of the workspace to get tags for.
 */
data class GetAllTagsQuery(val workspaceId: String) : Query<PageResponse<TagResponse>>
