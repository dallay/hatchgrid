package com.hatchgrid.thryve.workspace.infrastructure.persistence.repository

import com.hatchgrid.thryve.workspace.infrastructure.persistence.entity.WorkspaceMemberEntity
import java.util.*
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

/**
 * R2DBC repository for workspace members.
 */
@Repository
interface WorkspaceMemberR2dbcRepository : CoroutineCrudRepository<WorkspaceMemberEntity, UUID> {
    /**
     * Finds all workspace members for a workspace.
     *
     * @param workspaceId The ID of the workspace.
     * @return A flux of workspace member entities.
     */
    suspend fun findByWorkspaceId(workspaceId: UUID): List<WorkspaceMemberEntity>

    /**
     * Finds all workspaces for a user.
     *
     * @param userId The ID of the user.
     * @return A flux of workspace member entities.
     */
    suspend fun findByUserId(userId: UUID): List<WorkspaceMemberEntity>

    /**
     * Checks if a user is a member of a workspace.
     *
     * @param workspaceId The ID of the workspace.
     * @param userId The ID of the user.
     * @return True if the user is a member of the workspace, false otherwise.
     */
    @Query("SELECT EXISTS(SELECT 1 FROM workspace_members WHERE workspace_id = :workspaceId AND user_id = :userId)")
    suspend fun existsByWorkspaceIdAndUserId(workspaceId: UUID, userId: UUID): Boolean
}
