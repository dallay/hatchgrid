package com.hatchgrid.thryve.newsletter.subscriber.application.search.email

import com.hatchgrid.thryve.newsletter.subscriber.application.SubscribersResponse
import com.hatchgrid.common.domain.bus.query.Query

/**
 * Query for retrieving all subscribers by their email addresses.
 *
 * @property emails The set of email addresses to search for.
 * @property workspaceId The identifier of the workspace the subscribers belong to.
 * @property userId The identifier of the user making the request.
 * @constructor Creates an instance of AllSubscribersByEmailQuery with the given list of email addresses.
 * @created 10/1/24
 */
data class AllSubscribersByEmailQuery(
    val workspaceId: String,
    val userId: String,
    val emails: Set<String>,
) : Query<SubscribersResponse>
