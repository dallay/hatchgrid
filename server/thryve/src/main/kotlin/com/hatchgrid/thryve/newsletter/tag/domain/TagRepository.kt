package com.hatchgrid.thryve.newsletter.tag.domain

import com.hatchgrid.thryve.workspace.domain.WorkspaceId

/**
 * Repository interface for managing Tag entities.
 */
interface TagRepository {
    /**
     * Creates a new tag in the repository.
     *
     * @param tag The Tag entity to be created.
     */
    suspend fun create(tag: Tag)

    /**
     * Updates a tag in the repository.
     *
     * @param tag The Tag entity to be updated.
     */
    suspend fun update(tag: Tag)

    /**
     * Deletes a tag from the repository.
     *
     * @param workspaceId The ID of the workspace to which the tag belongs.
     * @param tagId The ID of the Tag entity to be deleted.
     */
    suspend fun delete(workspaceId: WorkspaceId, tagId: TagId)
}
