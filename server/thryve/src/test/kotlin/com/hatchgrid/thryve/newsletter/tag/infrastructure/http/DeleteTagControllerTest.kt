package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.ControllerTest
import com.hatchgrid.thryve.newsletter.tag.application.delete.DeleteTagCommand
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.slot
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

internal class DeleteTagControllerTest : ControllerTest() {
    private lateinit var controller: DeleteTagController
    override lateinit var webTestClient: WebTestClient
    private val tagId = UUID.randomUUID().toString()
    private val workspaceId = UUID.randomUUID().toString()

    @BeforeEach
    fun setup() {
        controller = DeleteTagController(mediator)
        webTestClient = WebTestClient.bindToController(controller).build()
    }

    @Test
    fun `should delete tag when tag is found`() {
        val command = DeleteTagCommand(workspaceId = workspaceId, tagId = tagId)
        coEvery { mediator.send(command) } returns Unit

        webTestClient.delete()
            .uri("/api/workspace/$workspaceId/tag/$tagId")
            .exchange()
            .expectStatus().isOk
            .expectBody().isEmpty()

        val commandSlot = slot<DeleteTagCommand>()
        coVerify(exactly = 1) { mediator.send(capture(commandSlot)) }
        assertEquals(command, commandSlot.captured)
    }
}
