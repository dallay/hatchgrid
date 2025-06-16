package com.hatchgrid.thryve.newsletter.subscriber.application.search.all

import com.hatchgrid.thryve.newsletter.subscriber.application.SubscriberResponse
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.common.domain.presentation.pagination.CursorPageResponse
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import org.slf4j.LoggerFactory

/**
 * This class represents a query handler to search all subscribers.
 *
 * @property workspaceAuthorizationService The service used to authorize access to the workspace.
 * @property searcher The [SearchAllSubscriberSearcher] to search subscribers.
 */
@Service
class SearchAllSubscribersQueryHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val searcher: SearchAllSubscriberSearcher,
) : QueryHandler<SearchAllSubscribersQuery, CursorPageResponse<SubscriberResponse>> {
    /**
     * Handles the given query.
     *
     * @param query The query to handle.
     * @return A CursorPageResponse containing the search results.
     */
    override suspend fun handle(query: SearchAllSubscribersQuery): CursorPageResponse<SubscriberResponse> {
        log.debug("Searching all subscribers")
        // Authorization: ensure current user has access to this workspace
        workspaceAuthorizationService.ensureAccess(query.workspaceId, query.userId)
        return searcher.search(query.criteria, query.size, query.cursor, query.sort)
    }
    companion object {
        private val log = LoggerFactory.getLogger(SearchAllSubscribersQueryHandler::class.java)
    }
}
