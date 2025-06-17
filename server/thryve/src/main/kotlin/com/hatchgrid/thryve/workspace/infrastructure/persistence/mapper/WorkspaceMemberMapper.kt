package com.hatchgrid.thryve.workspace.infrastructure.persistence.mapper

import com.hatchgrid.thryve.workspace.domain.WorkspaceMember
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberId
import com.hatchgrid.thryve.workspace.infrastructure.persistence.entity.WorkspaceMemberEntity

/**
 * Converts a [WorkspaceMemberEntity] to a [WorkspaceMember] domain object.
 */
fun WorkspaceMemberEntity.toDomain(): WorkspaceMember = WorkspaceMember(
    id = WorkspaceMemberId(workspaceId = this.workspaceId, userId = this.userId),
    role = this.role,
)
