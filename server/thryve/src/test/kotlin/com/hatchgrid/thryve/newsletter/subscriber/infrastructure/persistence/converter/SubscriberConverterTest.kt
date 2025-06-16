package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.converter

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatus
import io.mockk.every
import io.mockk.mockk
import io.r2dbc.spi.Row
import java.time.LocalDateTime
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

@UnitTest
internal class SubscriberConverterTest {
    private val subscriberId = UUID.randomUUID()
    private val workspaceId = UUID.randomUUID()
    private val now = LocalDateTime.now()
    private val email = "test@example.com"
    private val fullname = "John Doe"
    private val attributes = """{ "tags": ["tag1", "tag2"] }"""

    @Test
    fun `should convert Row to SubscriberEntity`() {
        val converter = SubscriberConverter()
        val (firstname, lastname) = fullname.split(" ")
        val mockRow: Row = mockk {
            every { get("id", UUID::class.java) } returns subscriberId
            every { get("email", String::class.java) } returns email
            every { get("firstname", String::class.java) } returns firstname
            every { get("lastname", String::class.java) } returns lastname
            every { get("status", SubscriberStatus::class.java) } returns SubscriberStatus.ENABLED
            every { get("attributes", String::class.java) } returns attributes
            every { get("workspace_id", UUID::class.java) } returns workspaceId
            every { get("created_at", LocalDateTime::class.java) } returns now
            every { get("created_by", String::class.java) } returns "system"
            every { get("updated_at", LocalDateTime::class.java) } returns now
            every { get("updated_by", String::class.java) } returns "system"
        }

        val result = converter.convert(mockRow)

        assertEquals(subscriberId, result.id)
        assertEquals(email, result.email)
        assertEquals(firstname, result.firstname)
        assertEquals(lastname, result.lastname)
        assertEquals(SubscriberStatus.ENABLED, result.status)
        assertEquals(listOf("tag1", "tag2"), result.attributes?.tags)
        assertEquals(workspaceId, result.workspaceId)
        assertEquals(now, result.createdAt)
        assertEquals("system", result.createdBy)
        assertEquals(now, result.updatedAt)
        assertEquals("system", result.updatedBy)
    }
}
