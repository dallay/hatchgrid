package com.hatchgrid.thryve.form.infrastructure.persistence.entity

import com.hatchgrid.common.domain.AuditableEntity
import java.time.LocalDateTime
import java.util.*
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.domain.Persistable
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

@Table("forms")
data class FormEntity(
    @Id
    @JvmField
    val id: UUID,
    val name: String,
    val header: String,
    val description: String,
    val inputPlaceholder: String,
    val buttonText: String,
    val buttonColor: String,
    val backgroundColor: String,
    val textColor: String,
    val buttonTextColor: String,
    val workspaceId: UUID,
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
) : AuditableEntity(createdAt, createdBy, updatedAt, updatedBy), Persistable<UUID> {
    override fun getId(): UUID = id

    override fun isNew(): Boolean = createdAt == updatedAt
}
