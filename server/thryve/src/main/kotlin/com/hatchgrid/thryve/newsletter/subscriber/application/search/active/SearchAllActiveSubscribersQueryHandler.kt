package com.hatchgrid.thryve.newsletter.subscriber.application.search.active

import com.hatchgrid.thryve.newsletter.subscriber.application.SubscribersResponse
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import org.slf4j.LoggerFactory

/**
 *
 * @created 9/1/24
 */
@Service
class SearchAllActiveSubscribersQueryHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val searcher: ActiveSubscriberSearcher,
) : QueryHandler<SearchAllActiveSubscribersQuery, SubscribersResponse> {
    override suspend fun handle(query: SearchAllActiveSubscribersQuery): SubscribersResponse {
        log.info("Searching all active subscribers")
        // Authorization: ensure current user has access to this workspace
        workspaceAuthorizationService.ensureAccess(query.workspaceId, query.userId)
        return searcher.search()
    }
    companion object {
        private val log = LoggerFactory.getLogger(SearchAllActiveSubscribersQueryHandler::class.java)
    }
}
