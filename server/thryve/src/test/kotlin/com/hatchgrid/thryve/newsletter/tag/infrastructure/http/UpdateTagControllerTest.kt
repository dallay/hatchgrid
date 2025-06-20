package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.ControllerTest
import com.hatchgrid.thryve.newsletter.tag.TagStub
import com.hatchgrid.thryve.newsletter.tag.application.update.UpdateTagCommand
import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.infrastructure.http.request.UpdateTagRequest
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.slot
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

internal class UpdateTagControllerTest : ControllerTest() {
    private val controller = UpdateTagController(mediator)
    override val webTestClient: WebTestClient = buildWebTestClient(controller)
    private val tag: Tag = TagStub.create()
    private val uri = "/api/workspace/${tag.workspaceId.value}/tag/${tag.id.value}/update"
    private val subscriberEmails = setOf("test.updated@example.com", "test.updated1@example.com")
    private lateinit var command: UpdateTagCommand

    @BeforeEach
    override fun setUp() {
        super.setUp()
        command = UpdateTagCommand(
            id = tag.id.value.toString(),
            name = tag.name,
            color = tag.color.value,
            workspaceId = tag.workspaceId.value.toString(),
            userId = userId.toString(),
            subscribers = subscriberEmails,
        )
        coEvery { mediator.send(command) } returns Unit
    }

    @Test
    fun `should update a tag`() {
        val request = UpdateTagRequest(
            name = tag.name,
            color = tag.color.value,
            subscribers = subscriberEmails,
        )

        webTestClient.put()
            .uri(uri)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .consumeWith { response ->
                assertEquals("Tag updated", response.responseBody?.let { String(it) })
            }

        val commandSlot = slot<UpdateTagCommand>()
        coVerify(exactly = 1) { mediator.send(capture(commandSlot)) }
        assertEquals(command, commandSlot.captured)
    }
}
