package com.hatchgrid.thryve.users.application.register

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.error.EmailNotValidException
import com.hatchgrid.common.domain.vo.credential.Credential
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import net.datafaker.Faker
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
class RegisterUserCommandHandlerTest {

    private val faker = Faker()

    @Test
    fun `should map command to value objects and delegate to UserRegistrator`(): Unit = runBlocking {
        // Given
        val userRegistrator: UserRegistrator = mockk(relaxed = true)
        val handler = RegisterUserCommandHandler(userRegistrator)

        val email = faker.internet().emailAddress()
        val password = Credential.generateRandomCredentialPassword()
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()

        val command = RegisterUserCommand(
            email = email,
            password = password,
            firstname = firstname,
            lastname = lastname,
        )

        // We can stub the call to ensure it doesn't throw
        coEvery { userRegistrator.registerNewUser(any(), any(), any(), any()) } returns Unit

        // When
        handler.handle(command)

        // Then - verify that the registrator is invoked with correctly mapped VOs
        coVerify(exactly = 1) {
            userRegistrator.registerNewUser(
                email = match { it.email == email },
                credential = match { it.credentialValue == password },
                firstName = match { it.firstname == firstname },
                lastName = match { it.lastname == lastname },
            )
        }
    }

    @Test
    fun `should not delegate and throw when command has invalid email`(): Unit = runBlocking {
        // Given
        val userRegistrator: UserRegistrator = mockk(relaxed = true)
        val handler = RegisterUserCommandHandler(userRegistrator)

        val invalidEmail = "invalid-email-without-at"
        val password = Credential.generateRandomCredentialPassword()
        val firstname = "John"
        val lastname = "Doe"

        val command = RegisterUserCommand(
            email = invalidEmail,
            password = password,
            firstname = firstname,
            lastname = lastname,
        )

        // When & Then - Email value object should fail validation before delegating
        assertThrows<EmailNotValidException> {
            runBlocking { handler.handle(command) }
        }

        // Ensure no delegation happened
        coVerify(exactly = 0) { userRegistrator.registerNewUser(any(), any(), any(), any()) }
    }
}
