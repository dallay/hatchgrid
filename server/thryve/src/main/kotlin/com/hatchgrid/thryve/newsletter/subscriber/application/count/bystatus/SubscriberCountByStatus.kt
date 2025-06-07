package com.hatchgrid.thryve.newsletter.subscriber.application.count.bystatus

import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatsRepository
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.common.domain.Service
import org.slf4j.LoggerFactory

/**
 * Service class for counting subscribers by their status.
 *
 * This service interacts with the [SubscriberStatsRepository] to retrieve
 * and process subscriber statistics.
 *
 * @property repository The repository used to access subscriber statistics.
 */
@Service
class SubscriberCountByStatus(private val repository: SubscriberStatsRepository) {

    /**
     * Count subscribers by their status.
     *
     * This method retrieves subscriber counts by status from the repository,
     * maps the results to [SubscriberCountByStatusResponse] objects, and returns
     * them as a list.
     *
     * @param workspaceId The ID of the workspace to count subscribers for.
     * @return A list of subscriber counts by status `List<SubscriberCountByStatusData>`.
     */
    suspend fun count(workspaceId: String): List<SubscriberCountByStatusData> {
        log.debug("Counting subscribers by status for workspace {}", workspaceId)
        return repository.countByStatus(WorkspaceId(workspaceId)).map { (status, count) ->
            SubscriberCountByStatusData(status, count)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(SubscriberCountByStatus::class.java)
    }
}
