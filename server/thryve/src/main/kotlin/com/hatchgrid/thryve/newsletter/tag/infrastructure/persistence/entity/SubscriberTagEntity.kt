package com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.entity

import java.time.LocalDateTime
import java.util.UUID
import org.springframework.data.relational.core.mapping.Table

@Table("subscriber_tags")
data class SubscriberTagEntity(
    val subscriberId: UUID,
    val tagId: UUID,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val createdBy: String = "system",
    var updatedAt: LocalDateTime? = createdAt,
    var updatedBy: String? = null
)
