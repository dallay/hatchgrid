package com.hatchgrid.thryve.newsletter.subscriber.application.count.bystatus

import com.hatchgrid.common.domain.bus.query.Query

/**
 * Query class for counting subscribers by their status.
 *
 * This class represents a query to retrieve subscriber counts by status.
 * It implements the [Query] interface with a response type of [SubscriberCountByStatusResponse].
 * @param workspaceId The ID of the workspace for which to count subscribers.
 * @param userId The ID of the user making the request, used for authorization.
 */
data class CountByStatusQuery(val workspaceId: String, val userId: String) : Query<SubscriberCountByStatusResponse>
