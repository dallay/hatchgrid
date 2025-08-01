package com.hatchgrid.thryve.authentication.infrastructure.http

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.CredentialGenerator.generateValidPassword
import com.hatchgrid.thryve.authentication.application.AuthenticateUserQueryHandler
import com.hatchgrid.thryve.authentication.application.UserAuthenticatorService
import com.hatchgrid.thryve.authentication.domain.AccessToken
import com.hatchgrid.thryve.authentication.domain.UserAuthenticationException
import com.hatchgrid.thryve.authentication.domain.UserAuthenticator
import com.hatchgrid.thryve.authentication.infrastructure.http.request.LoginRequest
import com.hatchgrid.thryve.controllers.GlobalExceptionHandler
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import net.datafaker.Faker
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient

private const val ENDPOINT = "/api/login"

@UnitTest
class UserAuthenticatorControllerTest {

    private val faker = Faker()
    private val accessToken = createAccessToken()

    private val userAuthenticator = mockk<UserAuthenticator>()
    private val authenticator = UserAuthenticatorService(userAuthenticator)
    private val authenticateUserQueryHandler = AuthenticateUserQueryHandler(authenticator)
    private val userAuthenticatorController = UserAuthenticatorController(authenticateUserQueryHandler)
    private val webTestClient = WebTestClient.bindToController(userAuthenticatorController)
        .controllerAdvice(GlobalExceptionHandler()) // Attach the global exception handler
        .build()

    @Test
    @DisplayName("should return access token when user logs in")
    fun `should return access token when user logs in`(): Unit = runBlocking {
        // Arrange
        val loginRequest = createLoginRequest()

        coEvery { userAuthenticator.authenticate(any(), any()) } returns accessToken

        // Act & Assert
        webTestClient.post().uri(ENDPOINT)
            .bodyValue(loginRequest)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.token").isEqualTo(accessToken.token)
            .jsonPath("$.expiresIn").isEqualTo(accessToken.expiresIn)
            .jsonPath("$.refreshToken").isEqualTo(accessToken.refreshToken)
            .jsonPath("$.refreshExpiresIn").isEqualTo(accessToken.refreshExpiresIn)
            .jsonPath("$.tokenType").isEqualTo(accessToken.tokenType)
            .jsonPath("$.notBeforePolicy").isEqualTo(accessToken.notBeforePolicy!!)
            .jsonPath("$.sessionState").isEqualTo(accessToken.sessionState!!)
            .jsonPath("$.scope").isEqualTo(accessToken.scope!!)

        // Verify
        coVerify { userAuthenticator.authenticate(any(), any()) }
    }

    @Test
    @DisplayName("should handle UserAuthenticationException")
    fun `should handle UserAuthenticationException`(): Unit = runBlocking {
        // Arrange
        val loginRequest = createLoginRequest()

        coEvery {
            userAuthenticator.authenticate(any(), any())
        } throws UserAuthenticationException("Invalid account. User probably hasn't verified email.")

        // Act & Assert
        webTestClient.post().uri(ENDPOINT)
            .bodyValue(loginRequest)
            .exchange()
            .expectStatus().isUnauthorized
            .expectBody()
            .jsonPath("$.title").isEqualTo("User authentication failed")
            .jsonPath("$.status").isEqualTo(401)
            .jsonPath("$.detail").isEqualTo("Invalid account. User probably hasn't verified email.")

        // Verify
        coVerify { userAuthenticator.authenticate(any(), any()) }
    }

    private fun createLoginRequest(
        username: String = faker.internet().emailAddress(),
        password: String? = null,
    ): LoginRequest {
        val finalPassword = password ?: generateValidPassword()
        return LoginRequest(
            username = username,
            password = finalPassword,
        )
    }

    private fun createAccessToken(): AccessToken = AccessToken(
        token = "token",
        expiresIn = 1L,
        refreshToken = "refreshToken",
        refreshExpiresIn = 1L,
        tokenType = "tokenType",
        notBeforePolicy = 1,
        sessionState = "sessionState",
        scope = "scope",
    )
}
