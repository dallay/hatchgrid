package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.ControllerTest
import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.subscriber.application.create.SubscribeNewsletterCommand
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http.request.SubscribeNewsletterRequest
import io.mockk.coEvery
import java.util.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

@UnitTest
internal class NewsletterSubscriberControllerTest : ControllerTest() {
    private val id = UUID.randomUUID().toString()
    private val workspaceId = UUID.randomUUID().toString()
    private val email = "john.doe@example.com"
    private val firstname = "John"
    private val lastname = "Doe"
    private val command =
        SubscribeNewsletterCommand(id, email, firstname, lastname, workspaceId = workspaceId)
    private val controller = NewsletterSubscriberController(mediator)
    override val webTestClient = WebTestClient.bindToController(controller).build()

    @BeforeEach
    override fun setUp() {
        coEvery { mediator.send(eq(command)) } returns Unit
    }

    @Test
    fun `should subscribe a new subscriber`() {
        val request = SubscribeNewsletterRequest(
            email = email,
            firstname = firstname,
            lastname = lastname,
        )

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/newsletter/subscriber/$id")
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated
            .expectBody().isEmpty

        coEvery { mediator.send(eq(command)) }
    }
}
