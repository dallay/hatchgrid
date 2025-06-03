package com.hatchgrid.thryve.workspace.infrastructure.persistence

import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.domain.Workspace
import com.hatchgrid.thryve.workspace.domain.WorkspaceException
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceRepository
import com.hatchgrid.thryve.workspace.infrastructure.persistence.entity.WorkspaceMemberEntity
import com.hatchgrid.thryve.workspace.infrastructure.persistence.mapper.WorkspaceMapper.toDomain
import com.hatchgrid.thryve.workspace.infrastructure.persistence.mapper.WorkspaceMapper.toEntity
import com.hatchgrid.thryve.workspace.infrastructure.persistence.repository.WorkspaceMemberR2dbcRepository
import com.hatchgrid.thryve.workspace.infrastructure.persistence.repository.WorkspaceR2dbcRepository
import kotlinx.coroutines.flow.toList
import org.slf4j.LoggerFactory
import org.springframework.dao.DuplicateKeyException
import org.springframework.dao.TransientDataAccessResourceException
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class WorkspaceStoreR2DbcRepository(
    private val workspaceRepository: WorkspaceR2dbcRepository,
    private val workspaceMemberRepository: WorkspaceMemberR2dbcRepository
) : WorkspaceRepository,
    WorkspaceFinderRepository{

    /**
     * Create a new workspace.
     *
     * @param workspace The workspace to be created.
     */
    @Transactional("connectionFactoryTransactionManager")
    override suspend fun create(workspace: Workspace) {
        log.debug("Creating workspace with id: {}", workspace.id)
        try {
            // Save workspace
            workspaceRepository.save(workspace.toEntity())
            // Save each member
            workspace.members.forEach { memberId ->
                workspaceMemberRepository.save(
                    WorkspaceMemberEntity(
                        workspaceId = workspace.id.value,
                        userId = memberId.value
                    )
                )
            }
        } catch (e: DuplicateKeyException) {
            log.error("Error creating workspace with id: {}", workspace.id, e)
            throw WorkspaceException("Error creating workspace", e)
        }
    }

    /**
     * Updates a workspace.
     *
     * @param workspace The workspace to be updated.
     */
    @Transactional("connectionFactoryTransactionManager")
    override suspend fun update(workspace: Workspace) {
        log.debug("Updating workspace with id: {}", workspace.id)
        try {
            // Update workspace
            workspaceRepository.save(workspace.toEntity())
        } catch (e: DuplicateKeyException) {
            log.error("Error updating workspace with id: {}", workspace.id, e)
            throw WorkspaceException("Error updating workspace", e)
        } catch (e: TransientDataAccessResourceException) {
            log.error("Error updating workspace with id: {}", workspace.id, e)
            throw WorkspaceException("Error updating form because it does not exist", e)
        }
    }

    /**
     * Find a workspace by its unique identifier.
     *
     * @param id The unique identifier of the workspace.
     * @return The workspace with the given unique identifier.
     */
    override suspend fun findById(id: WorkspaceId): Workspace? {
        log.debug("Finding workspace with id: {}", id)
        return workspaceRepository.findById(id.value)?.toDomain()
    }

    /**
     * Finds all workspaces.
     *
     * @return A flow of all workspaces.
     */
    override suspend fun findAll(): List<Workspace> {
        log.debug("Finding all workspaces")
        return workspaceRepository.findAll().toList().map { it.toDomain() }
    }

    /**
     * Finds all workspaces for a user.
     *
     * @param userId The ID of the user.
     * @return A flow of workspaces that the user is a member of.
     */
    override suspend fun findByMemberId(userId: UserId): List<Workspace> {
        log.debug("Finding workspaces by member id: {}", userId)
        return workspaceRepository.findByMemberId(userId.value).toList().map { it.toDomain() }
    }

    /**
     * Finds all workspaces owned by a user.
     *
     * @param userId The ID of the user.
     * @return A flow of workspaces that the user owns.
     */
    override suspend fun findByOwnerId(userId: UserId): List<Workspace> {
        log.debug("Finding workspaces by owner id: {}", userId)
        return workspaceRepository.findByOwnerId(userId.value).toList().map { it.toDomain() }
    }

    /**
     * Deletes a workspace.
     *
     * @param id The workspace id.
     */
    override suspend fun delete(id: WorkspaceId) {
        log.debug("Deleting workspace with id: {}", id)
        workspaceRepository.deleteById(id.value)
    }

    companion object {
        private val log = LoggerFactory.getLogger(WorkspaceStoreR2DbcRepository::class.java)
    }
}
