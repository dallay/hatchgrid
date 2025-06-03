package com.hatchgrid.thryve.workspace.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockAuthentication
import org.springframework.test.context.jdbc.Sql

internal class GetAllWorkspaceControllerIntegrationTest : ControllerIntegrationTest() {

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/all-workspaces.sql",
    )
    @Sql(
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should get all workspaces`(): Unit = runBlocking {
        webTestClient
            .mutateWith(csrf())
            .mutateWith(mockAuthentication<SecurityMockServerConfigurers.JwtMutator>(jwt()))
            .get()
            .uri("/api/workspace")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data").isArray
            .jsonPath("$.data.length()").isEqualTo(2)
    }
}
