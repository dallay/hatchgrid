package com.hatchgrid.thryve.authentication.infrastructure.http

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.thryve.authentication.application.query.GetUserSessionQuery
import com.hatchgrid.thryve.authentication.domain.UserSession
import com.hatchgrid.thryve.authentication.domain.error.InvalidTokenException
import com.hatchgrid.thryve.authentication.infrastructure.cookie.AuthCookieBuilder
import io.mockk.coEvery
import io.mockk.mockk
import java.util.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

@UnitTest
internal class SessionControllerTest {

    private lateinit var mediator: Mediator
    private lateinit var sessionController: SessionController
    private lateinit var webTestClient: WebTestClient

    @BeforeEach
    fun setUp() {
        mediator = mockk()
        sessionController = SessionController(mediator)
        webTestClient = WebTestClient.bindToController(sessionController).build()
    }

    @Test
    @DisplayName("should return session data when access token is valid")
    fun `should return session data when access token is valid`(): Unit = runBlocking {
        val accessToken = "valid-access-token"
        val expectedUserSession = UserSession(
            userId = UUID.randomUUID(),
            email = "test@example.com",
            roles = listOf("USER"),
        )

        coEvery { mediator.send(GetUserSessionQuery(accessToken)) } returns expectedUserSession

        webTestClient.get().uri("/api/session")
            .cookie(AuthCookieBuilder.ACCESS_TOKEN, accessToken)
            .exchange()
            .expectStatus().isOk
            .expectBody(UserSession::class.java)
            .isEqualTo(expectedUserSession)
    }

    @Test
    @DisplayName("should return 401 when access token is missing")
    fun `should return 401 when access token is missing`(): Unit = runBlocking {
        webTestClient.get().uri("/api/session")
            .exchange()
            .expectStatus().isUnauthorized
    }

    @Test
    @DisplayName("should return 401 when access token is invalid")
    @Suppress("MaxLineLength", "MaximumLineLength")
    fun `should return 401 when access token is invalid`(): Unit = runBlocking {
        val invalidAccessToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"

        coEvery {
            mediator.send(GetUserSessionQuery(invalidAccessToken))
        } throws InvalidTokenException("Invalid access token")

        webTestClient.get().uri("/api/session")
            .cookie(AuthCookieBuilder.ACCESS_TOKEN, invalidAccessToken)
            .exchange()
            .expectStatus().isUnauthorized
    }
}
