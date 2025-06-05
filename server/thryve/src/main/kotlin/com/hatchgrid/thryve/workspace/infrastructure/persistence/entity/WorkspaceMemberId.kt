package com.hatchgrid.thryve.workspace.infrastructure.persistence.entity

import java.util.UUID
import java.io.Serializable

/**
 * Represents the composite primary key for WorkspaceMemberEntity.
 */
data class WorkspaceMemberId(
    val workspaceId: UUID,
    val userId: UUID
) : Serializable

