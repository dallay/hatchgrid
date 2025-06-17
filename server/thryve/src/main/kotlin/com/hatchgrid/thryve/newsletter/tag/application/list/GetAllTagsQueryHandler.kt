package com.hatchgrid.thryve.newsletter.tag.application.list

import com.hatchgrid.thryve.newsletter.tag.application.TagResponse
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.common.domain.presentation.PageResponse
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import org.slf4j.LoggerFactory

/**
 * Query handler for getting all tags for a specific workspace.
 *
 * @property workspaceAuthorizationService The service for checking workspace access permissions.
 * @property searcher The service used to search for tags.
 */
@Service
class GetAllTagsQueryHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val searcher: AllTagSearcher
) : QueryHandler<GetAllTagsQuery, PageResponse<TagResponse>> {

    /**
     * Handles the query to get all tags for a specific workspace.
     *
     * @param query The query containing the workspace ID.
     * @return A page response containing the list of tags.
     */
    override suspend fun handle(query: GetAllTagsQuery): PageResponse<TagResponse> {
        log.debug("Searching all tags for workspace ${query.workspaceId}")
        workspaceAuthorizationService.ensureAccess(query.workspaceId, query.userId)
        return PageResponse(searcher.search(query.workspaceId).map { TagResponse.from(it) })
    }

    companion object {
        private val log = LoggerFactory.getLogger(GetAllTagsQueryHandler::class.java)
    }
}
