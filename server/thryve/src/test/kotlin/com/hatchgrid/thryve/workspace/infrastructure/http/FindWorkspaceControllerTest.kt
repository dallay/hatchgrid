package com.hatchgrid.thryve.workspace.infrastructure.http

import com.hatchgrid.ControllerTest
import com.hatchgrid.thryve.workspace.WorkspaceStub
import com.hatchgrid.thryve.workspace.application.WorkspaceResponse
import com.hatchgrid.thryve.workspace.application.find.FindWorkspaceQuery
import io.mockk.coEvery
import io.mockk.mockk
import java.util.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

internal class FindWorkspaceControllerTest : ControllerTest() {
    private var controller: FindWorkspaceController = FindWorkspaceController(mediator)
    override val webTestClient: WebTestClient = buildWebTestClient(controller)
    private val id = UUID.randomUUID().toString()

    @BeforeEach
    override fun setUp() {
        super.setUp()
        coEvery { mediator.send(any<FindWorkspaceQuery>()) } returns mockk()
    }

    @Test
    fun `should return workspace when workspace is found`() {
        val workspace = WorkspaceStub.create()
        val query = FindWorkspaceQuery(id)
        val response = WorkspaceResponse.from(workspace)
        coEvery { mediator.send(query) } returns response

        webTestClient.get()
            .uri("/api/workspace/$id")
            .exchange()
            .expectStatus().isOk
            .expectBody(WorkspaceResponse::class.java)
            .isEqualTo(response)
        coEvery { mediator.send(query) }
    }
}
