package com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence

import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.domain.TagId
import com.hatchgrid.thryve.newsletter.tag.domain.TagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.TagSearchRepository
import com.hatchgrid.thryve.newsletter.tag.domain.exceptions.TagException
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.mapper.TagMapper.toDomain
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.mapper.TagMapper.toEntity
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.repository.TagReactiveR2dbcRepository
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import org.slf4j.LoggerFactory
import org.springframework.dao.DuplicateKeyException
import org.springframework.stereotype.Repository

/**
 * Repository implementation for managing Tag entities using R2DBC.
 *
 * @property tagReactiveR2dbcRepository The reactive repository for TagEntity.
 * @created 15/9/24
 */
@Repository
class TagR2dbcRepository(private val tagReactiveR2dbcRepository: TagReactiveR2dbcRepository) :
    TagRepository, TagSearchRepository {
    /**
     * Creates a new tag in the repository.
     *
     * @param tag The Tag entity to be created.
     * @throws TagException if a tag with the same ID already exists.
     */
    override suspend fun create(tag: Tag) {
        log.debug("Creating tag with id {}", tag.id)
        try {
            tagReactiveR2dbcRepository.save(tag.toEntity())
        } catch (e: DuplicateKeyException) {
            log.error("Tag already exists in the database: ${tag.id.value}")
            throw TagException("Error creating tag", e)
        }
    }

    /**
     * Updates a tag in the repository.
     * @param tag The Tag entity to be updated.
     */
    override suspend fun update(tag: Tag) {
        log.debug("Updating tag with id {}", tag.id)
        try {
            tagReactiveR2dbcRepository.save(tag.toEntity())
        } catch (e: org.springframework.dao.TransientDataAccessResourceException) {
            log.error("Error updating tag with id: ${tag.id.value}")
            throw TagException("Error updating tag", e)
        }
    }

    /**
     * Deletes a tag from the repository.
     *
     * @param workspaceId The ID of the workspace to which the tag belongs.
     * @param tagId The ID of the Tag entity to be deleted.
     */
    override suspend fun delete(workspaceId: WorkspaceId, tagId: TagId) {
        log.debug("Deleting tag with id {} for workspace {}", tagId.value, workspaceId.value)
        try {
            tagReactiveR2dbcRepository.deleteByWorkspaceIdAndId(workspaceId.value, tagId.value)
        } catch (e: org.springframework.dao.EmptyResultDataAccessException) {
            log.error("Error deleting tag with id: ${tagId.value}")
            throw TagException("Error deleting tag", e)
        }
    }

    override suspend fun findAllTagsByWorkspaceId(workspaceId: WorkspaceId): List<Tag> {
        log.debug("Searching all tags for workspace {}", workspaceId.value)
        return tagReactiveR2dbcRepository.findAllTagsByWorkspaceId(workspaceId.value)
            .map { it.toDomain() }
    }

    override suspend fun findById(workspaceId: WorkspaceId, id: TagId): Tag? {
        log.debug("Searching tag with id {} for workspace {}", id.value, workspaceId.value)
        return tagReactiveR2dbcRepository.findByIdWithSubscribers(
            workspaceId.value, id.value,
        )?.toDomain()
    }

    companion object {
        private val log = LoggerFactory.getLogger(TagR2dbcRepository::class.java)
    }
}
