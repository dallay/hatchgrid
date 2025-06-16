package com.hatchgrid.thryve.newsletter.tag.domain

import com.hatchgrid.thryve.workspace.domain.WorkspaceId

/**
 * Repository interface for searching tags.
 */
interface TagSearchRepository {

    /**
     * Finds all tags by the given workspace ID.
     *
     * @param workspaceId The ID of the workspace to find tags for.
     * @return A list of tags associated with the specified workspace ID.
     */
    suspend fun findAllTagsByWorkspaceId(workspaceId: WorkspaceId): List<Tag>
    /**
     * Finds a tag by its unique identifier.
     *
     * @param workspaceId The ID of the workspace to find the tag for.
     * @param tagId The unique identifier of the tag.
     * @return The tag with the specified ID, or null if no tag is found.
     */
    suspend fun findById(workspaceId: WorkspaceId, tagId: TagId): Tag?
}
