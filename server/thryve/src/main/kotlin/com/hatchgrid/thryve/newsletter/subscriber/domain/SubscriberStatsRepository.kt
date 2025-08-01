package com.hatchgrid.thryve.newsletter.subscriber.domain

import com.hatchgrid.thryve.workspace.domain.WorkspaceId

/**
 * Repository interface for subscriber statistics.
 *
 * This interface defines methods for retrieving statistics about subscribers,
 * such as counting subscribers by their status.
 *
 * @created 8/9/24
 */
interface SubscriberStatsRepository {
    /**
     * Count subscribers by their status.
     *
     * This method returns a flow of pairs, where each pair consists of a status
     * (as a string) and the count of subscribers with that status (as an integer).
     *
     * @param workspaceId The ID of the workspace to count subscribers for.
     * @return List<Pair<String, Long>> A flow emitting pairs of status and count.
     */
    suspend fun countByStatus(workspaceId: WorkspaceId): List<Pair<String, Long>>

    /**
     * Count subscribers by tags.
     *
     * This method returns a flow of pairs, where each pair consists of a tag
     * (as a string) and the count of subscribers with that tag (as an integer).
     *
     * @param workspaceId The ID of the workspace to count subscribers for.
     * @return List<Pair<String, Long>> A flow emitting pairs of tag and count.
     */
    suspend fun countByTag(workspaceId: WorkspaceId): List<Pair<String, Long>>
}
