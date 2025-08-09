package com.hatchgrid.thryve.workspace.infrastructure.event.consumer

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.bus.command.CommandHandlerExecutionError
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.users.domain.event.UserCreatedEvent
import com.hatchgrid.thryve.workspace.WorkspaceStub
import com.hatchgrid.thryve.workspace.application.create.CreateWorkspaceCommand
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import io.kotest.common.runBlocking
import io.mockk.Runs
import io.mockk.clearAllMocks
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.just
import io.mockk.mockk
import java.util.*
import net.datafaker.Faker
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
class CreateDefaultWorkspaceOnUserCreationTest {

    private val workspaceFinderRepository: WorkspaceFinderRepository = mockk()
    private val mediator: Mediator = mockk()
    private val consumer = CreateDefaultWorkspaceOnUserCreation(workspaceFinderRepository, mediator)
    private val faker = Faker()

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    @Test
    fun `should create default workspace when user has no existing workspaces`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = firstname,
            lastName = lastname,
        )

        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } returns emptyList()
        coEvery { mediator.send(any<CreateWorkspaceCommand>()) } just Runs

        // When
        consumer.consume(userCreatedEvent)

        // Then
        coVerify(exactly = 1) { workspaceFinderRepository.findByOwnerId(UserId(userId)) }
        coVerify(exactly = 1) {
            mediator.send(
                match<CreateWorkspaceCommand> { command ->
                    command.ownerId == userId &&
                        command.name == "$firstname $lastname's Workspace" &&
                        command.description == "Default workspace created automatically upon user registration"
                },
            )
        }
    }

    @Test
    fun `should create default workspace with firstname only when lastname is null`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val firstname = faker.name().firstName()
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = firstname,
            lastName = null,
        )

        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } returns emptyList()
        coEvery { mediator.send(any<CreateWorkspaceCommand>()) } just Runs

        // When
        consumer.consume(userCreatedEvent)

        // Then
        coVerify(exactly = 1) {
            mediator.send(
                match<CreateWorkspaceCommand> { command ->
                    command.name == "$firstname's Workspace"
                },
            )
        }
    }

    @Test
    fun `should create default workspace with lastname only when firstname is null`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val lastname = faker.name().lastName()
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = null,
            lastName = lastname,
        )

        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } returns emptyList()
        coEvery { mediator.send(any<CreateWorkspaceCommand>()) } just Runs

        // When
        consumer.consume(userCreatedEvent)

        // Then
        coVerify(exactly = 1) {
            mediator.send(
                match<CreateWorkspaceCommand> { command ->
                    command.name == "$lastname's Workspace"
                },
            )
        }
    }

    @Test
    fun `should create default workspace with 'My Workspace' when both names are null`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = null,
            lastName = null,
        )

        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } returns emptyList()
        coEvery { mediator.send(any<CreateWorkspaceCommand>()) } just Runs

        // When
        consumer.consume(userCreatedEvent)

        // Then
        coVerify(exactly = 1) {
            mediator.send(
                match<CreateWorkspaceCommand> { command ->
                    command.name == "My Workspace"
                },
            )
        }
    }

    @Test
    fun `should create default workspace with 'My Workspace' when both names contain only whitespace`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val firstname = "   "
        val lastname = "  \t  \n  "
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = firstname,
            lastName = lastname,
        )

        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } returns emptyList()
        coEvery { mediator.send(any<CreateWorkspaceCommand>()) } just Runs

        // When
        consumer.consume(userCreatedEvent)

        // Then
        coVerify(exactly = 1) {
            mediator.send(
                match<CreateWorkspaceCommand> { command ->
                    command.name == "My Workspace"
                },
            )
        }
    }

    @Test
    fun `should not create workspace when user already has workspaces`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = faker.name().firstName(),
            lastName = faker.name().lastName(),
        )

        val existingWorkspaces = WorkspaceStub.dummyRandomWorkspaces(2, UUID.fromString(userId))
        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } returns existingWorkspaces

        // When
        consumer.consume(userCreatedEvent)

        // Then
        coVerify(exactly = 1) { workspaceFinderRepository.findByOwnerId(UserId(userId)) }
        coVerify(exactly = 0) { mediator.send(any<CreateWorkspaceCommand>()) }
    }

    @Test
    fun `should handle CommandHandlerExecutionError gracefully without throwing`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = faker.name().firstName(),
            lastName = faker.name().lastName(),
        )

        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } returns emptyList()
        coEvery { mediator.send(any<CreateWorkspaceCommand>()) } throws CommandHandlerExecutionError("Test error")

        // When & Then - should not throw exception
        assertDoesNotThrow {
            runBlocking {
                consumer.consume(userCreatedEvent)
            }
        }

        coVerify(exactly = 1) { workspaceFinderRepository.findByOwnerId(UserId(userId)) }
        coVerify(exactly = 1) { mediator.send(any<CreateWorkspaceCommand>()) }
    }

    @Test
    fun `should handle unexpected exceptions gracefully without throwing`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = faker.name().firstName(),
            lastName = faker.name().lastName(),
        )

        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } returns emptyList()
        coEvery { mediator.send(any<CreateWorkspaceCommand>()) } throws RuntimeException("Unexpected error")

        // When & Then - should not throw exception
        assertDoesNotThrow {
            runBlocking {
                consumer.consume(userCreatedEvent)
            }
        }

        coVerify(exactly = 1) { workspaceFinderRepository.findByOwnerId(UserId(userId)) }
        coVerify(exactly = 1) { mediator.send(any<CreateWorkspaceCommand>()) }
    }

    @Test
    fun `should handle repository exception gracefully without throwing`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = faker.name().firstName(),
            lastName = faker.name().lastName(),
        )

        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } throws RuntimeException("Repository error")

        // When & Then - should not throw exception
        assertDoesNotThrow {
            runBlocking {
                consumer.consume(userCreatedEvent)
            }
        }

        coVerify(exactly = 1) { workspaceFinderRepository.findByOwnerId(UserId(userId)) }
        coVerify(exactly = 0) { mediator.send(any<CreateWorkspaceCommand>()) }
    }

    @Test
    fun `should trim whitespace from names when generating workspace name`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val firstname = "  John  "
        val lastname = "  Doe  "
        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = faker.internet().emailAddress(),
            firstName = firstname,
            lastName = lastname,
        )

        coEvery { workspaceFinderRepository.findByOwnerId(UserId(userId)) } returns emptyList()
        coEvery { mediator.send(any<CreateWorkspaceCommand>()) } just Runs

        // When
        consumer.consume(userCreatedEvent)

        // Then
        coVerify(exactly = 1) {
            mediator.send(
                match<CreateWorkspaceCommand> { command ->
                    command.name == "John Doe's Workspace"
                },
            )
        }
    }
}
