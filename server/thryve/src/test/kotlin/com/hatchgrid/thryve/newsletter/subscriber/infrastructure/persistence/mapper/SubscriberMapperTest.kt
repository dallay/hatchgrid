package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.mapper

import com.hatchgrid.common.domain.vo.name.FirstName
import com.hatchgrid.common.domain.vo.name.LastName
import com.hatchgrid.thryve.newsletter.subscriber.domain.Attributes
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatus
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.SubscriberEntity
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.mapper.SubscriberMapper.toDomain
import java.time.LocalDateTime
import java.util.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class SubscriberMapperTest {
    private val baseEntity = SubscriberEntity(
        id = UUID.randomUUID(),
        email = "user@example.com",
        firstname = "John",
        lastname = "Doe",
        status = SubscriberStatus.ENABLED,
        attributes = Attributes(),
        workspaceId = UUID.randomUUID(),
        createdAt = LocalDateTime.now(),
        createdBy = "system",
        updatedAt = LocalDateTime.now(),
        updatedBy = "system",
    )

    @Test
    fun `should map valid names correctly`() {
        val domain = baseEntity.toDomain()
        assertEquals(FirstName("John"), domain.name.firstName)
        assertEquals(LastName("Doe"), domain.name.lastName)
    }

    @Test
    fun `should throw if firstname is null`() {
        val entity = baseEntity.copy(firstname = null)
        assertThrows<com.hatchgrid.common.domain.vo.name.FirstNameNotValidException> {
            entity.toDomain()
        }
    }

    @Test
    fun `should throw if firstname is blank`() {
        val entity = baseEntity.copy(firstname = "   ")
        assertThrows<com.hatchgrid.common.domain.vo.name.FirstNameNotValidException> {
            entity.toDomain()
        }
    }

    @Test
    fun `should map null lastname to null`() {
        val entity = baseEntity.copy(lastname = null)
        val domain = entity.toDomain()
        assertNull(domain.name.lastName)
    }

    @Test
    fun `should map blank lastname to null`() {
        val entity = baseEntity.copy(lastname = "   ")
        val domain = entity.toDomain()
        assertNull(domain.name.lastName)
    }

    @Test
    fun `should map valid lastname`() {
        val entity = baseEntity.copy(lastname = "Smith")
        val domain = entity.toDomain()
        assertEquals(LastName("Smith"), domain.name.lastName)
    }
}
