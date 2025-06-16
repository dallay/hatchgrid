package com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.mapper

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.domain.TagColor
import com.hatchgrid.thryve.newsletter.tag.domain.TagId
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.entity.TagEntity
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.entity.TagWithSubscribersEntity
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.mapper.TagMapper.toDomain
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.mapper.TagMapper.toEntity
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.mapper.TagMapper.toEntityWithSubscribers
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.common.domain.vo.email.Email
import java.time.LocalDateTime
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

@UnitTest
internal class TagMapperTest {

    @Test
    fun convertTagToEntity() {
        val tag = Tag(
            id = TagId(UUID.randomUUID()),
            name = "Test Tag",
            color = TagColor.RED,
            workspaceId = WorkspaceId(UUID.randomUUID()),
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
        )

        val tagEntity = tag.toEntity()

        assertEquals(tag.id.value, tagEntity.id)
        assertEquals(tag.name, tagEntity.name)
        assertEquals(tag.color.value, tagEntity.color)
        assertEquals(tag.workspaceId.value, tagEntity.workspaceId)
        assertEquals(tag.createdAt, tagEntity.createdAt)
        assertEquals(tag.updatedAt, tagEntity.updatedAt)
    }

    @Test
    fun convertTagEntityToDomain() {
        val tagEntity = TagEntity(
            id = UUID.randomUUID(),
            name = "Test Tag",
            color = "red",
            workspaceId = UUID.randomUUID(),
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
        )

        val tag = tagEntity.toDomain()

        assertEquals(tagEntity.id, tag.id.value)
        assertEquals(tagEntity.name, tag.name)
        assertEquals(tagEntity.color, tag.color.value)
        assertEquals(tagEntity.workspaceId, tag.workspaceId.value)
        assertEquals(tagEntity.createdAt, tag.createdAt)
        assertEquals(tagEntity.updatedAt, tag.updatedAt)
    }

    @Test
    fun convertTagWithSubscribersEntityToDomain() {
        val tagWithSubscribersEntity = TagWithSubscribersEntity(
            id = UUID.randomUUID(),
            name = "Test Tag",
            color = "red",
            workspaceId = UUID.randomUUID(),
            subscribers = setOf("john.doe@test.com", "jane.doe@test.com"),
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
        )

        val tag = tagWithSubscribersEntity.toDomain()

        assertEquals(tagWithSubscribersEntity.id, tag.id.value)
        assertEquals(tagWithSubscribersEntity.name, tag.name)
        assertEquals(tagWithSubscribersEntity.color, tag.color.value)
        assertEquals(tagWithSubscribersEntity.workspaceId, tag.workspaceId.value)
        assertEquals(
            tagWithSubscribersEntity.subscribers?.toSet(),
            tag.subscribers?.map { it.value }?.toSet(),
        )
        assertEquals(tagWithSubscribersEntity.createdAt, tag.createdAt)
        assertEquals(tagWithSubscribersEntity.updatedAt, tag.updatedAt)
    }

    @Test
    fun convertTagToEntityWithSubscribers() {
        val tag = Tag(
            id = TagId(UUID.randomUUID()),
            name = "Test Tag",
            color = TagColor.RED,
            workspaceId = WorkspaceId(UUID.randomUUID()),
            subscribers = mutableSetOf(Email("john.doe@test.com"), Email("jane.doe@test.com")),
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now(),
        )

        val tagWithSubscribersEntity = tag.toEntityWithSubscribers()

        assertEquals(tag.id.value, tagWithSubscribersEntity.id)
        assertEquals(tag.name, tagWithSubscribersEntity.name)
        assertEquals(tag.color.value, tagWithSubscribersEntity.color)
        assertEquals(tag.workspaceId.value, tagWithSubscribersEntity.workspaceId)
        assertEquals(
            tag.subscribers?.map { it.value }?.toSet(),
            tagWithSubscribersEntity.subscribers?.toSet(),
        )
        assertEquals(tag.createdAt, tagWithSubscribersEntity.createdAt)
        assertEquals(tag.updatedAt, tagWithSubscribersEntity.updatedAt)
    }
}
