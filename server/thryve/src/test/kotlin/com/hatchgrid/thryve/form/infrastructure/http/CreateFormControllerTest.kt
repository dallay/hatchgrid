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
        val request = CreateFormRequest(
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
}
