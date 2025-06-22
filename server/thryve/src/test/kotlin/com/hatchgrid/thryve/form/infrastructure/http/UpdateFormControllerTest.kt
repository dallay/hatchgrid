package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.application.update.UpdateFormCommand
import com.hatchgrid.thryve.form.infrastructure.http.request.UpdateFormRequest
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.slot
import java.util.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

@UnitTest
internal class UpdateFormControllerTest {
    private val mediator = mockk<Mediator>()
    private val formId = UUID.randomUUID().toString()
    private val workspaceId = UUID.randomUUID().toString()
    private val form = FormStub.create(id = formId, workspaceId = workspaceId)
    private val command = UpdateFormCommand(
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
    private val controller = UpdateFormController(mediator)
    private val webTestClient = WebTestClient.bindToController(controller).build()

    @BeforeEach
    fun setUp() {
        coEvery { mediator.send(eq(command)) } returns Unit
    }

    @Test
    fun `should return 200 when form is updated successfully`() {
        val request = UpdateFormRequest(
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
            .uri("/api/workspace/$workspaceId/form/$formId/update")
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody(String::class.java)
            .isEqualTo("Form updated successfully")
        val commandSlot = slot<UpdateFormCommand>()
        coVerify(exactly = 1) { mediator.send(capture(commandSlot)) }
        assertEquals(command, commandSlot.captured)
    }
}
