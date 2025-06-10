package com.hatchgrid.thryve.workspace.infrastructure.http

import com.hatchgrid.ControllerTest
import com.hatchgrid.thryve.workspace.WorkspaceStub
import com.hatchgrid.thryve.workspace.application.WorkspaceResponses
import com.hatchgrid.thryve.workspace.application.find.by.member.AllWorkspaceByMemberQuery
import com.hatchgrid.thryve.workspace.domain.Workspace
import io.mockk.coEvery
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockAuthentication
import org.springframework.test.web.reactive.server.WebTestClient

internal class GetAllWorkspaceControllerTest : ControllerTest() {
    private val controller: GetAllWorkspaceController = GetAllWorkspaceController(mediator)
    override val webTestClient: WebTestClient = buildWebTestClient(controller)

    private val workspaces: List<Workspace> =
        WorkspaceStub.dummyRandomWorkspaces(size = 6, ownerId = userId)

    @BeforeEach
    override fun setUp() {
        super.setUp()
        val query = AllWorkspaceByMemberQuery(userId.toString())
        coEvery { mediator.send(eq(query)) } returns WorkspaceResponses.from(workspaces)
    }

    @Test
    fun `should get all workspaces`() {
        val token = jwtAuthenticationToken()
        webTestClient
            .mutateWith(csrf())
            .mutateWith(mockAuthentication<SecurityMockServerConfigurers.JwtMutator>(token))
            .get()
            .uri("/api/workspace")
            .exchange()
            .expectBody()
            .jsonPath("$.data").isArray
            .jsonPath("$.data.length()").isEqualTo(workspaces.size)
    }
}
