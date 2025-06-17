package com.hatchgrid.thryve.newsletter.tag.application.list

import com.hatchgrid.common.domain.Service
import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.domain.TagSearchRepository
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import org.slf4j.LoggerFactory

/**
 * Service class for searching all tags for a specific workspace.
 *
 * @property repository The repository to search tags.
 */
@Service
class AllTagSearcher(private val repository: TagSearchRepository) {

    /**
     * Searches all tags for a given workspace.
     *
     * @param workspaceId The ID of the workspace to search tags for.
     * @return A list of tags for the specified workspace.
     */
    suspend fun search(workspaceId: String): List<Tag> {
        log.debug("Searching all tags for workspace $workspaceId")
        return repository.findAllTagsByWorkspaceId(WorkspaceId(workspaceId))
    }

    companion object {
        private val log = LoggerFactory.getLogger(AllTagSearcher::class.java)
    }
}
