package com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.entity

import com.hatchgrid.common.domain.AuditableEntity
import java.time.LocalDateTime
import java.util.UUID
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.relational.core.mapping.Column

data class TagWithSubscribersEntity(
    val id: UUID,
    val name: String,
    val color: String,
    val workspaceId: UUID,
    val subscribers: Set<String>? = emptySet(),
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
) : AuditableEntity(createdAt, createdBy, updatedAt, updatedBy)
