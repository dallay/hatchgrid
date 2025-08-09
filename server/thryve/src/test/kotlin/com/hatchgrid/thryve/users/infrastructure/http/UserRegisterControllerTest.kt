package com.hatchgrid.thryve.users.infrastructure.http

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.bus.command.CommandHandlerExecutionError
import com.hatchgrid.common.domain.error.BusinessRuleValidationException
import com.hatchgrid.common.domain.vo.credential.CredentialException
import com.hatchgrid.thryve.users.application.register.RegisterUserCommand
import com.hatchgrid.thryve.users.infrastructure.http.request.RegisterUserRequest
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.util.UUID
import kotlinx.coroutines.runBlocking
import net.datafaker.Faker
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient

private const val ENDPOINT = "/api/register"

@UnitTest
@DisplayName("UserRegisterController Unit Tests")
class UserRegisterControllerTest {
    private val faker = Faker()
    private val email = faker.internet().emailAddress()
    private val password = faker.internet().password(8, 80, true, true, true)
    private val firstname = faker.name().firstName()
    private val lastname = faker.name().lastName()

    private val mediator: Mediator = mockk()
    private val userRegisterController = UserRegisterController(mediator)
    private val webTestClient = WebTestClient.bindToController(userRegisterController).build()

    @Nested
    @DisplayName("Successful Registration Tests")
    inner class SuccessfulRegistrationTests {
        @Test
        @DisplayName("Should register user successfully and return 201 with location header")
        fun `should register user successfully and return 201 with location header`(): Unit =
            runBlocking {
                // Given
                val expectedUserId = UUID.randomUUID()
                val request = RegisterUserRequest(email, password, firstname, lastname)
                coEvery { mediator.send(any<RegisterUserCommand>()) } returns expectedUserId

                // When & Then
                webTestClient.post().uri(ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .exchange()
                    .expectStatus().isCreated
                    .expectHeader().location("/users/$expectedUserId")
                    .expectBody().isEmpty

                // Verify the command was sent with correct parameters
                coVerify(exactly = 1) {
                    mediator.send(
                        match<RegisterUserCommand> { command ->
                            command.email == email &&
                                command.password == password &&
                                command.firstname == firstname &&
                                command.lastname == lastname
                        },
                    )
                }
            }
    }

    @Nested
    @DisplayName("Validation Error Tests")
    inner class ValidationErrorTests {
        @Test
        @DisplayName("Should handle password complexity validation error and return 400")
        fun `should handle password complexity validation error and return 400`(): Unit =
            runBlocking {
                // Given
                val request = RegisterUserRequest(email, "weakpassword", firstname, lastname)
                coEvery {
                    mediator.send(any<RegisterUserCommand>())
                } throws CredentialException("The password must have at least one number")

                // When & Then
                webTestClient.post().uri(ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .exchange()
                    .expectStatus().isBadRequest
                    .expectBody().isEmpty

                coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
            }

        @Test
        @DisplayName("Should handle business rule validation error and return 400")
        fun `should handle business rule validation error and return 400`(): Unit = runBlocking {
            // Given
            val request = RegisterUserRequest(email, password, firstname, lastname)
            val businessException =
                object : BusinessRuleValidationException("Invalid business rule") {}
            coEvery { mediator.send(any<RegisterUserCommand>()) } throws businessException

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isBadRequest
                .expectBody().isEmpty

            coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
        }

        @Test
        @DisplayName("Should handle data integrity violation and return 400")
        fun `should handle data integrity violation and return 400`(): Unit = runBlocking {
            // Given
            val request = RegisterUserRequest(email, password, firstname, lastname)
            coEvery { mediator.send(any<RegisterUserCommand>()) } throws DataIntegrityViolationException(
                "Duplicate key",
            )

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isBadRequest
                .expectBody().isEmpty

            coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
        }

        @Test
        @DisplayName("Should return 400 for invalid email format")
        fun `should return 400 for invalid email format`(): Unit = runBlocking {
            // Given
            val request = RegisterUserRequest(
                email = "invalid-email",
                password = password,
                firstname = firstname,
                lastname = lastname,
            )

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isBadRequest

            // Verify mediator was not called due to validation failure
            coVerify(exactly = 0) { mediator.send(any<RegisterUserCommand>()) }
        }

        @Test
        @DisplayName("Should return 400 for password too short")
        fun `should return 400 for password too short`(): Unit = runBlocking {
            // Given
            val request = RegisterUserRequest(
                email = email,
                password = "short", // Less than 8 characters
                firstname = firstname,
                lastname = lastname,
            )

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isBadRequest

            coVerify(exactly = 0) { mediator.send(any<RegisterUserCommand>()) }
        }

        @Test
        @DisplayName("Should return 400 for blank firstname")
        fun `should return 400 for blank firstname`(): Unit = runBlocking {
            // Given
            val request = RegisterUserRequest(
                email = email,
                password = password,
                firstname = "", // Blank firstname
                lastname = lastname,
            )

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isBadRequest

            coVerify(exactly = 0) { mediator.send(any<RegisterUserCommand>()) }
        }

        @Test
        @DisplayName("Should return 400 for blank lastname")
        fun `should return 400 for blank lastname`(): Unit = runBlocking {
            // Given
            val request = RegisterUserRequest(
                email = email,
                password = password,
                firstname = firstname,
                lastname = "", // Blank lastname
            )

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isBadRequest

            coVerify(exactly = 0) { mediator.send(any<RegisterUserCommand>()) }
        }
    }

    @Nested
    @DisplayName("Command Handler Error Tests")
    inner class CommandHandlerErrorTests {
        @Test
        @DisplayName("Should handle domain validation error from command and return 400")
        fun `should handle domain validation error from command and return 400`(): Unit =
            runBlocking {
                // Given
                val request = RegisterUserRequest(email, password, firstname, lastname)
                val errorMessage = "User already exists"
                coEvery { mediator.send(any<RegisterUserCommand>()) } throws CommandHandlerExecutionError(
                    errorMessage,
                )

                // When & Then
                webTestClient.post().uri(ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .exchange()
                    .expectStatus().isBadRequest
                    .expectBody().isEmpty

                coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
            }

        @Test
        @DisplayName("Should handle duplicate email validation error from command and return 400")
        fun `should handle duplicate email validation error from command and return 400`(): Unit =
            runBlocking {
                // Given
                val request = RegisterUserRequest(email, password, firstname, lastname)
                val errorMessage = "Email is invalid or duplicate"
                coEvery { mediator.send(any<RegisterUserCommand>()) } throws CommandHandlerExecutionError(
                    errorMessage,
                )

                // When & Then
                webTestClient.post().uri(ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .exchange()
                    .expectStatus().isBadRequest
                    .expectBody().isEmpty

                coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
            }

        @Test
        @DisplayName("Should handle constraint violation error from command and return 400")
        fun `should handle constraint violation error from command and return 400`(): Unit =
            runBlocking {
                // Given
                val request = RegisterUserRequest(email, password, firstname, lastname)
                val errorMessage = "Constraint validation failed"
                coEvery { mediator.send(any<RegisterUserCommand>()) } throws CommandHandlerExecutionError(
                    errorMessage,
                )

                // When & Then
                webTestClient.post().uri(ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .exchange()
                    .expectStatus().isBadRequest
                    .expectBody().isEmpty

                coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
            }

        @Test
        @DisplayName("Should handle password validation wrapped in CommandHandlerExecutionError")
        fun `should handle password validation wrapped in CommandHandlerExecutionError`(): Unit =
            runBlocking {
                // Given
                val request = RegisterUserRequest(email, password, firstname, lastname)
                val credentialException =
                    CredentialException("The password must have at least one number")
                coEvery {
                    mediator.send(any<RegisterUserCommand>())
                } throws CommandHandlerExecutionError(
                    "Command execution failed",
                    credentialException,
                )

                // When & Then
                webTestClient.post().uri(ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .exchange()
                    .expectStatus().isBadRequest
                    .expectBody().isEmpty

                coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
            }

        @Test
        @DisplayName("Should handle server error from command and return 500")
        fun `should handle server error from command and return 500`(): Unit = runBlocking {
            // Given
            val request = RegisterUserRequest(email, password, firstname, lastname)
            val errorMessage = "Database connection failed"
            coEvery { mediator.send(any<RegisterUserCommand>()) } throws CommandHandlerExecutionError(
                errorMessage,
            )

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().is5xxServerError
                .expectBody().isEmpty

            coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
        }

        @Test
        @DisplayName("Should handle unexpected error and return 500")
        fun `should handle unexpected error and return 500`(): Unit = runBlocking {
            // Given
            val request = RegisterUserRequest(email, password, firstname, lastname)
            coEvery { mediator.send(any<RegisterUserCommand>()) } throws RuntimeException("Unexpected error")

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().is5xxServerError
                .expectBody().isEmpty

            coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
        }
    }

    @Nested
    @DisplayName("Edge Case Tests")
    inner class EdgeCaseTests {
        @Test
        @DisplayName("Should handle maximum length valid inputs")
        fun `should handle maximum length valid inputs`(): Unit = runBlocking {
            // Given
            val longEmail = "very.long.email.address@very-long-domain-name.com"
            val longPassword = "ComplexPassword123!" + "x".repeat(50) // Long but valid password
            val longFirstname = "A".repeat(50)
            val longLastname = "B".repeat(50)
            val expectedUserId = UUID.randomUUID()
            val request = RegisterUserRequest(longEmail, longPassword, longFirstname, longLastname)

            coEvery { mediator.send(any<RegisterUserCommand>()) } returns expectedUserId

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isCreated
                .expectHeader().location("/users/$expectedUserId")

            coVerify(exactly = 1) { mediator.send(any<RegisterUserCommand>()) }
        }

        @Test
        @DisplayName("Should handle special characters in names")
        fun `should handle special characters in names`(): Unit = runBlocking {
            // Given
            val specialFirstname = "José-María"
            val specialLastname = "O'Connor-Smith"
            val expectedUserId = UUID.randomUUID()
            val request = RegisterUserRequest(email, password, specialFirstname, specialLastname)

            coEvery { mediator.send(any<RegisterUserCommand>()) } returns expectedUserId

            // When & Then
            webTestClient.post().uri(ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .exchange()
                .expectStatus().isCreated

            coVerify(exactly = 1) {
                mediator.send(
                    match<RegisterUserCommand> { command ->
                        command.firstname == specialFirstname && command.lastname == specialLastname
                    },
                )
            }
        }
    }
}
