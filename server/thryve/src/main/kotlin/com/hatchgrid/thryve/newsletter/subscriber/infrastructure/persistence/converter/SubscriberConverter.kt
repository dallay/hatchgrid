package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.converter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.hatchgrid.thryve.newsletter.subscriber.domain.Attributes
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatus
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.SubscriberEntity
import io.r2dbc.spi.Row
import java.time.LocalDateTime
import java.util.UUID
import org.springframework.core.convert.converter.Converter
import org.springframework.data.convert.ReadingConverter

/**
 * Object responsible for converting a Row object to a [SubscriberEntity] object.
 */
@ReadingConverter
class SubscriberConverter : Converter<Row, SubscriberEntity> {
    private val objectMapper = jacksonObjectMapper()
    /**
     * Convert the source object of type `S` to target type `T`.
     * @param source the source object to convert, which must be an instance of `S` (never `null`)
     * @return the converted object, which must be an instance of `T` (potentially `null`)
     * @throws IllegalArgumentException if the source cannot be converted to the desired target type
     */
    override fun convert(source: Row): SubscriberEntity {
        val sourceId = source.get("id", UUID::class.java)
        val sourceEmail = source.get("email", String::class.java)
        val sourceFirstname = source.get("firstname", String::class.java)
        val sourceLastname = source.get("lastname", String::class.java)
        val sourceStatus = source.get("status", SubscriberStatus::class.java)
        val attributes = source.get("attributes", String::class.java)?.let { objectMapper.readValue<Attributes>(it) }
        val workspaceId = source.get("workspace_id", UUID::class.java)
        val sourceCreatedAt = source.get("created_at", LocalDateTime::class.java)
        val sourceCreatedBy = source.get("created_by", String::class.java) ?: "system"
        val sourceUpdatedAt = source.get("updated_at", LocalDateTime::class.java)
        val sourceUpdatedBy = source.get("updated_by", String::class.java)
        return SubscriberEntity(
            id = sourceId!!,
            email = sourceEmail!!,
            firstname = sourceFirstname,
            lastname = sourceLastname,
            status = sourceStatus!!,
            attributes = attributes,
            workspaceId = workspaceId!!,
            createdAt = sourceCreatedAt!!,
            createdBy = sourceCreatedBy,
            updatedAt = sourceUpdatedAt!!,
            updatedBy = sourceUpdatedBy,
        )
    }
}
