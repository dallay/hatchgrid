package com.hatchgrid.thryve.workspace.infrastructure.persistence.entity

import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime
import java.util.UUID

/**
 * R2DBC entity for workspace members.
 */
@Table("workspace_members")
data class WorkspaceMemberEntity(
    @Column("workspace_id")
    val workspaceId: UUID,

    @Column("user_id")
    val userId: UUID,

    @CreatedBy
    @Column("created_by")
    val createdBy: String? = null,

    @CreatedDate
    @Column("created_at")
    val createdAt: LocalDateTime? = null
) {
    // Composite primary key is defined in the database schema
}
