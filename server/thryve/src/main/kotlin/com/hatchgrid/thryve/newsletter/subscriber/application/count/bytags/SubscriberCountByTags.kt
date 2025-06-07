package com.hatchgrid.thryve.newsletter.subscriber.application.count.bytags

import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatsRepository
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.common.domain.Service
import org.slf4j.LoggerFactory

/**
 * Service class for counting subscribers by their tag.
 *
 * This service interacts with the [SubscriberStatsRepository] to retrieve
 * and process subscriber statistics.
 *
 * @property repository The repository used to access subscriber statistics.
 */
@Service
class SubscriberCountByTags(private val repository: SubscriberStatsRepository) {

    /**
     * Count subscribers by their tag.
     *
     * This method retrieves subscriber counts by tag from the repository,
     * maps the results to [SubscriberCountByTagsResponse] objects, and returns
     * them as a list.
     *
     * @param workspaceId The ID of the workspace to count subscribers for.
     * @return A list of [SubscriberCountByTagsData] objects containing the tags and counts.
     */
    suspend fun count(workspaceId: String): List<SubscriberCountByTagsData> {
        log.debug("Counting subscribers by tag for workspace {}", workspaceId)
        return repository.countByTag(WorkspaceId(workspaceId)).map { (tag, count) ->
            SubscriberCountByTagsData(tag, count)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(SubscriberCountByTags::class.java)
    }
}
