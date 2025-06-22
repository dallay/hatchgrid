package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.application.FormResponse
import com.hatchgrid.thryve.form.application.find.FindFormQuery
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
internal class FindFormControllerTest {
    private val mediator: Mediator = mockk()
    private lateinit var controller: FindFormController
    private lateinit var webTestClient: WebTestClient
    private val formId = UUID.randomUUID().toString()
    private val workspaceId = UUID.randomUUID().toString()

    @BeforeEach
    fun setup() {
        controller = FindFormController(mediator)
        webTestClient = WebTestClient.bindToController(controller).build()
    }

    @Test
    fun `should return form when form is found`() {
        val form = FormStub.create(workspaceId = workspaceId, id = formId)
        val query = FindFormQuery(workspaceId = workspaceId, formId = formId)
        val response = FormResponse.from(form)
        coEvery { mediator.send(query) } returns response

        webTestClient.get()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .exchange()
            .expectStatus().isOk
            .expectBody(FormResponse::class.java)
            .isEqualTo(response)
        val querySlot = slot<FindFormQuery>()
        coVerify(exactly = 1) { mediator.send(capture(querySlot)) }
        assertEquals(query, querySlot.captured)
    }

    @Test
    fun `should return 404 when form is not found`() {
        val query = FindFormQuery(workspaceId = workspaceId, formId = formId)
        coEvery { mediator.send(query) } throws FormNotFoundException("Form not found")

        webTestClient.get()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .exchange()
            .expectStatus().isNotFound
    }
}
