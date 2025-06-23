package com.hatchgrid.thryve.form.infrastructure.persistence.entity

import com.hatchgrid.common.domain.AuditableEntity
import com.hatchgrid.thryve.AppConstants.HEXADECIMAL_COLOR_PATTERN
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
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
    @field:NotBlank(message = "Name cannot be blank")
    val name: String,
    @field:NotBlank(message = "Header cannot be blank")
    val header: String,
    @field:NotBlank(message = "Description cannot be blank")
    val description: String,
    @field:NotBlank(message = "Input placeholder cannot be blank")
    val inputPlaceholder: String,
    @field:NotBlank(message = "Button text cannot be blank")
    val buttonText: String,
    @field:NotBlank(message = "Button color cannot be blank")
    @field:Pattern(regexp = HEXADECIMAL_COLOR_PATTERN, message = "Button color must be a valid hexadecimal color")
    val buttonColor: String,
    @field:NotBlank(message = "Background color cannot be blank")
    @field:Pattern(regexp = HEXADECIMAL_COLOR_PATTERN, message = "Background color must be a valid hexadecimal color")
    val backgroundColor: String,
    @field:NotBlank(message = "Text color cannot be blank")
    @field:Pattern(regexp = HEXADECIMAL_COLOR_PATTERN, message = "Text color must be a valid hexadecimal color")
    val textColor: String,
    @field:NotBlank(message = "Button text color cannot be blank")
    @field:Pattern(regexp = HEXADECIMAL_COLOR_PATTERN, message = "Button text color must be a valid hexadecimal color")
    val buttonTextColor: String,
    @field:NotNull(message = "Workspace ID cannot be null")
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
