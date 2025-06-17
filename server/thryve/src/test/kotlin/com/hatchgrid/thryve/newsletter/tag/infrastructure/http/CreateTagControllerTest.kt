package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.ControllerTest
import com.hatchgrid.thryve.newsletter.tag.TagStub
import com.hatchgrid.thryve.newsletter.tag.application.create.CreateTagCommand
import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.infrastructure.http.request.CreateTagRequest
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.slot
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

internal class CreateTagControllerTest : ControllerTest() {
    private val controller = CreateTagController(mediator)
    override val webTestClient: WebTestClient = buildWebTestClient(controller)
    private val subscriberEmails = setOf("newSubscriber@example.com")

    private val tag: Tag = TagStub.create()
    val workspaceId = tag.workspaceId.value
    val tagId = tag.id.value
    private val uri = "/api/workspace/$workspaceId/tag/$tagId"
    private val command = CreateTagCommand(
        id = tagId.toString(),
        name = tag.name,
        color = tag.color.value,
        workspaceId = workspaceId.toString(),
        userId = userId.toString(),
        subscribers = subscriberEmails,
    )

    @BeforeEach
    override fun setUp() {
        super.setUp()
        coEvery { mediator.send(any<CreateTagCommand>()) } returns Unit
    }

    @Test
    fun `should create a new tag`() {
        val request = CreateTagRequest(
            name = tag.name,
            color = tag.color.value,
            subscribers = subscriberEmails,
        )

        webTestClient.put()
            .uri(uri)
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated
            .expectBody().isEmpty
        val commandSlot = slot<CreateTagCommand>()
        coVerify(exactly = 1) { mediator.send(capture(commandSlot)) }
        assertEquals(command, commandSlot.captured)
    }

    @Test
    fun `should not create a new tag if name is empty`() {
        val request = CreateTagRequest(
            name = "",
            color = tag.color.value,
            subscribers = subscriberEmails,
        )

        webTestClient.put()
            .uri(uri)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.title").isEqualTo("Bad Request")
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.instance").isEqualTo(uri)
            .consumeWith(::println)
    }
}
