package com.hatchgrid.thryve.workspace.infrastructure.persistence.entity

import com.hatchgrid.thryve.workspace.domain.WorkspaceRole
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime
import java.util.UUID
import org.springframework.data.domain.Persistable

/**
 * R2DBC entity for workspace members.
 */
@Table("workspace_members")
data class WorkspaceMemberEntity(

    val workspaceId: UUID,
    val userId: UUID,

    @Column("role")
    val role: WorkspaceRole = WorkspaceRole.EDITOR,

    @CreatedDate
    @Column("created_at")
    val createdAt: LocalDateTime? = null
) : Persistable<WorkspaceMemberId> {

    @Transient
    private var isNew: Boolean = true

    override fun getId(): WorkspaceMemberId? = WorkspaceMemberId(workspaceId, userId)

    override fun isNew(): Boolean = isNew

    fun markAsNotNew(): WorkspaceMemberEntity {
        this.isNew = false
        return this
    }
}
