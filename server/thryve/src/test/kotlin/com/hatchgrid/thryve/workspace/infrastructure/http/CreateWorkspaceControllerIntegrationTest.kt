package com.hatchgrid.thryve.workspace.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import com.hatchgrid.thryve.workspace.WorkspaceStub
import com.hatchgrid.thryve.workspace.infrastructure.http.request.CreateWorkspaceRequest
import java.util.*
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.test.context.jdbc.Sql

private const val ENDPOINT = "/api/workspace"

internal class CreateWorkspaceControllerIntegrationTest : ControllerIntegrationTest() {
    @Test
    @Sql(
        "/db/workspace/all-workspaces.sql"
    )
    @Sql(
        "/db/workspace/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD
    )
    fun `should create a new workspace`() {
        // Use a fixed user ID that exists in the database for testing
        val ownerId = "efc4b2b8-08be-4020-93d5-f795762bf5c9" // This ID is from workspace.sql
        val request = CreateWorkspaceRequest(
            name = "Test Workspace",
            description = "Test Description",
            ownerId = ownerId
        )
        val id = UUID.randomUUID().toString()
        println("[DEBUG_LOG] Creating workspace with ID: $id and request: $request")

        try {
            val response = webTestClient.mutateWith(csrf()).put()
                .uri("$ENDPOINT/$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectBody(String::class.java)
                .returnResult()

            println("[DEBUG_LOG] Response status: ${response.status}")
            println("[DEBUG_LOG] Response body: ${response.responseBody}")

            webTestClient.mutateWith(csrf()).put()
                .uri("$ENDPOINT/$id")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isCreated
                .expectBody().isEmpty
        } catch (e: Exception) {
            println("[DEBUG_LOG] Exception: ${e.message}")
            e.printStackTrace()
            throw e
        }
    }

    @Test
    @Sql(
        "/db/workspace/workspace.sql",
    )
    @Sql(
        "/db/workspace/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should fail when the workspace already exists`() {
        val request: CreateWorkspaceRequest = WorkspaceStub.generateRequest()
        val id = "a0654720-35dc-49d0-b508-1f7df5d915f1"
        webTestClient.mutateWith(csrf()).put()
            .uri("$ENDPOINT/$id")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.type").isEqualTo("https://hatchgrid.com/errors/bad-request")
            .jsonPath("$.title").isEqualTo("Bad request")
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.detail").isEqualTo("Error creating workspace")
            .jsonPath("$.instance").isEqualTo("$ENDPOINT/$id")
            .jsonPath("$.errorCategory").isEqualTo("BAD_REQUEST")
            .jsonPath("$.timestamp").isNumber
    }
}
