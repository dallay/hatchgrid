package com.hatchgrid.thryve.workspace.application.security

import com.hatchgrid.common.domain.Service
import com.hatchgrid.thryve.workspace.domain.WorkspaceAuthorizationException
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import java.util.*

@Service
class WorkspaceAuthorizationService(
    private val workspaceMemberRepository: WorkspaceMemberRepository
) {
    suspend fun ensureAccess(workspaceId: UUID, userId: UUID) {
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw WorkspaceAuthorizationException("User $userId has no access to workspace $workspaceId")
        }
    }
    suspend fun ensureAccess(workspaceId: String, userId: String) {
        ensureAccess(UUID.fromString(workspaceId), UUID.fromString(userId))
    }
}
