package com.hatchgrid.thryve.workspace.infrastructure.persistence.entity

import com.hatchgrid.common.domain.AuditableEntity
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime
import java.util.UUID
import org.springframework.data.domain.Persistable

/**
 * R2DBC entity for workspaces.
 */
@Table("workspaces")
data class WorkspaceEntity(
    @Id
    @JvmField
    val id: UUID,

    @Column("name")
    val name: String,

    @Column("description")
    val description: String?,

    @Column("owner_id")
    val ownerId: UUID,

    @CreatedBy
    @Column("created_by")
    override val createdBy: String = "system",

    @CreatedDate
    @Column("created_at")
    override val createdAt: LocalDateTime,

    @LastModifiedBy
    @Column("updated_by")
    override var updatedBy: String? = null,

    @LastModifiedDate
    @Column("updated_at")
    override var updatedAt: LocalDateTime? = null
) : AuditableEntity(createdAt, createdBy,updatedAt, updatedBy), Persistable<UUID> {
    /**
     * This method returns the unique identifier of the workspace.
     *
     * @return The unique identifier of the workspace.
     */
    override fun getId(): UUID = id

    /**
     * This method checks if the workspace is new by comparing the creation and update timestamps.
     *
     * @return A boolean indicating whether the workspace is new.
     */
    override fun isNew(): Boolean = createdAt == updatedAt
}
