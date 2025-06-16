package com.hatchgrid.thryve.newsletter.subscriber.application.search.email

import com.hatchgrid.thryve.newsletter.subscriber.application.SubscribersResponse
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import org.slf4j.LoggerFactory

/**
 * Query handler for retrieving all subscribers by their email addresses.
 *
 * @property workspaceAuthorizationService The service used to authorize access to the workspace.
 * @property searcher The service used to search for subscribers by email.
 * @constructor Creates an instance of AllSubscribersByEmailQueryHandler with the given searcher service.
 * @created 10/1/24
 */
@Service
class AllSubscribersByEmailQueryHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val searcher: GetAllSubscribersByEmailService,
) : QueryHandler<AllSubscribersByEmailQuery, SubscribersResponse> {

    /**
     * Handles the query to search for all subscribers by their email addresses.
     *
     * @param query The query containing the list of email addresses to search for.
     * @return A list of SubscriberResponse objects representing the subscribers found.
     */
    override suspend fun handle(query: AllSubscribersByEmailQuery): SubscribersResponse {
        log.debug(
            "Handling AllSubscribersByEmailQuery for workspace: {} with emails: {}",
            query.workspaceId,
            query.emails
        )
        // Authorization: ensure current user has access to this workspace
        workspaceAuthorizationService.ensureAccess(query.workspaceId, query.userId)
        return searcher.searchAllByEmails(query.workspaceId, query.emails)
    }

    companion object {
        private val log = LoggerFactory.getLogger(AllSubscribersByEmailQueryHandler::class.java)
    }
}
