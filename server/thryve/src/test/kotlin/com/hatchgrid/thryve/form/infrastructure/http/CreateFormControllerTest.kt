package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.ControllerTest
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.application.create.CreateFormCommand
import com.hatchgrid.thryve.form.infrastructure.http.request.CreateFormRequest
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.slot
import java.util.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

internal class CreateFormControllerTest : ControllerTest() {
    private val formId = UUID.randomUUID().toString()
    private val workspaceId = UUID.randomUUID().toString()
    private val form = FormStub.create(id = formId, workspaceId = workspaceId)
    private val command = CreateFormCommand(
        id = formId,
        name = form.name,
        header = form.header,
        description = form.description,
        inputPlaceholder = form.inputPlaceholder,
        buttonText = form.buttonText,
        buttonColor = form.buttonColor.hex,
        backgroundColor = form.backgroundColor.hex,
        textColor = form.textColor.hex,
        buttonTextColor = form.buttonTextColor.hex,
        workspaceId = form.workspaceId.value.toString(),
        userId = userId.toString(),
    )
    private val controller = CreateFormController(mediator)
    override val webTestClient: WebTestClient = buildWebTestClient(controller)

    @BeforeEach
    override fun setUp() {
        super.setUp()
        coEvery { mediator.send(any<CreateFormCommand>()) } returns Unit
    }

    @Test
    fun `should create a new form`() {
        val request = createValidRequest()

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated
            .expectBody().isEmpty

        val commandSlot = slot<CreateFormCommand>()
        coVerify(exactly = 1) { mediator.send(capture(commandSlot)) }
        assertEquals(command, commandSlot.captured)
    }

    @Test
    fun `should return bad request when name is blank`() {
        val request = createValidRequest().copy(name = "")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request when header is blank`() {
        val request = createValidRequest().copy(header = "")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request when description is blank`() {
        val request = createValidRequest().copy(description = "")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request when inputPlaceholder is blank`() {
        val request = createValidRequest().copy(inputPlaceholder = "")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request when buttonText is blank`() {
        val request = createValidRequest().copy(buttonText = "")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request when buttonColor is blank`() {
        val request = createValidRequest().copy(buttonColor = "")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request when backgroundColor is blank`() {
        val request = createValidRequest().copy(backgroundColor = "")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request when textColor is blank`() {
        val request = createValidRequest().copy(textColor = "")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request when buttonTextColor is blank`() {
        val request = createValidRequest().copy(buttonTextColor = "")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request for invalid hex color format`() {
        val request = createValidRequest().copy(buttonColor = "invalid-color")

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request for invalid workspaceId format`() {
        val request = createValidRequest()

        webTestClient.put()
            .uri("/api/workspace/invalid-uuid/form/$formId")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should return bad request for invalid formId format`() {
        val request = createValidRequest()

        webTestClient.put()
            .uri("/api/workspace/$workspaceId/form/invalid-uuid")
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
    }

    private fun createValidRequest(): CreateFormRequest = CreateFormRequest(
        name = form.name,
        header = form.header,
        description = form.description,
        inputPlaceholder = form.inputPlaceholder,
        buttonText = form.buttonText,
        buttonColor = form.buttonColor.hex,
        backgroundColor = form.backgroundColor.hex,
        textColor = form.textColor.hex,
        buttonTextColor = form.buttonTextColor.hex,
    )
}
