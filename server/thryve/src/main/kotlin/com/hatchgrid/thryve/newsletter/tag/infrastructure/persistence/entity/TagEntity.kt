package com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.entity

import com.hatchgrid.common.domain.AuditableEntity
import java.time.LocalDateTime
import java.util.UUID
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.domain.Persistable
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

@Table("tags")
data class TagEntity(
    @Id
    @JvmField
    val id: UUID,
    val name: String,
    val color: String,
    val workspaceId: UUID,

    @CreatedDate
    @Column("created_at")
    override val createdAt: LocalDateTime,

    @CreatedBy
    @Column("created_by")
    override val createdBy: String = "system",

    @LastModifiedDate
    @Column("updated_at")
    override var updatedAt: LocalDateTime? = null,
    @LastModifiedBy
    @Column("updated_by")
    override var updatedBy: String? = null,
) : AuditableEntity(createdAt, createdBy,updatedAt, updatedBy), Persistable<UUID> {
    override fun getId(): UUID = id

    override fun isNew(): Boolean = createdAt == updatedAt
}
