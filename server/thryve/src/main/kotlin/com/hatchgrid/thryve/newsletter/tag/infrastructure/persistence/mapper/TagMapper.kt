package com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.mapper

import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.domain.TagColor
import com.hatchgrid.thryve.newsletter.tag.domain.TagId
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.entity.TagEntity
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.entity.TagWithSubscribersEntity
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.common.domain.vo.email.Email

/**
 * Mapper object for converting between Tag domain objects and [TagEntity] persistence objects.
 */
object TagMapper {

    /**
     * Extension function to convert a Tag domain object to a [TagEntity] persistence object.
     *
     * @return The TagEntity representation of the Tag.
     */
    fun Tag.toEntity() = TagEntity(
        id = id.value,
        name = name,
        color = color.value,
        workspaceId = workspaceId.value,
        createdAt = createdAt,
        createdBy = createdBy,
        updatedAt = updatedAt,
        updatedBy = updatedBy,
    )

    /**
     * Extension function to convert a [TagEntity] persistence object to a Tag domain object.
     *
     * @return The Tag domain representation of the TagEntity.
     */
    fun TagEntity.toDomain() = Tag(
        id = TagId(id),
        name = name,
        color = TagColor.fromString(color),
        workspaceId = WorkspaceId(workspaceId),
        createdAt = createdAt,
        createdBy = createdBy,
        updatedAt = updatedAt,
        updatedBy = updatedBy,
    )

    /**
     * Extension function to convert a Tag domain object with subscribers
     * to a [TagWithSubscribersEntity] persistence object.
     *
     * @return The TagWithSubscribersEntity representation of the Tag.
     */
    fun Tag.toEntityWithSubscribers() = TagWithSubscribersEntity(
        id = id.value,
        name = name,
        color = color.value,
        workspaceId = workspaceId.value,
        subscribers = subscribers?.map { it.value }?.toSet(),
        createdAt = createdAt,
        createdBy = createdBy,
        updatedAt = updatedAt,
        updatedBy = updatedBy,
    )

    /**
     * Extension function to convert a [TagWithSubscribersEntity] persistence object to a Tag domain object.
     *
     * @return The Tag domain representation of the TagEntity.
     */
    fun TagWithSubscribersEntity.toDomain() = Tag(
        id = TagId(id),
        name = name,
        color = TagColor.fromString(color),
        workspaceId = WorkspaceId(workspaceId),
        subscribers = subscribers?.map { Email(it) }?.toMutableSet() ?: mutableSetOf(),
        createdAt = createdAt,
        createdBy = createdBy,
        updatedAt = updatedAt,
        updatedBy = updatedBy,
    )
}
