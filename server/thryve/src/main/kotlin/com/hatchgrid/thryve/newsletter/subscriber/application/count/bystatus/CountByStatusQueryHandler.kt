package com.hatchgrid.thryve.newsletter.subscriber.application.count.bystatus

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import org.slf4j.LoggerFactory

/**
 * Query handler for counting subscribers by their status.
 *
 * This class handles the [CountByStatusQuery] by using the [SubscriberCountByStatus] service
 * to retrieve the count of subscribers by their status.
 *
 * @property workspaceAuthorizationService The service used to authorize access to the workspace.
 * @property counter The service used to count subscribers by their status.
 * @created 8/9/24
 */
@Service
class CountByStatusQueryHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val counter: SubscriberCountByStatus
) :
    QueryHandler<CountByStatusQuery, SubscriberCountByStatusResponse> {

    /**
     * Handles the [CountByStatusQuery].
     *
     * This method processes the query to count subscribers by their status and returns
     * the result as a [SubscriberCountByStatusResponse].
     *
     * @param query The query to handle.
     * @return [SubscriberCountByStatusResponse] The response containing the count of subscribers by status.
     */
    override suspend fun handle(query: CountByStatusQuery): SubscriberCountByStatusResponse {
        log.debug("Counting subscribers by status for workspace {}", query.workspaceId)
        // Authorization: ensure current user has access to this workspace
        workspaceAuthorizationService.ensureAccess(query.workspaceId, query.userId)
        return SubscriberCountByStatusResponse(counter.count(query.workspaceId))
    }

    companion object {
        private val log = LoggerFactory.getLogger(CountByStatusQueryHandler::class.java)
    }
}
