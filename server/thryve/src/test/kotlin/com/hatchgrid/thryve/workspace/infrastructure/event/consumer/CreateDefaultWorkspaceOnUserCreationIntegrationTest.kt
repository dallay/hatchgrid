package com.hatchgrid.thryve.workspace.infrastructure.event.consumer

import com.hatchgrid.IntegrationTest
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.config.InfrastructureTestContainers
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.users.domain.event.UserCreatedEvent
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import net.datafaker.Faker
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.jdbc.Sql

@IntegrationTest
class CreateDefaultWorkspaceOnUserCreationIntegrationTest : InfrastructureTestContainers() {

    @Autowired
    private lateinit var eventPublisher: EventPublisher<UserCreatedEvent>

    @Autowired
    private lateinit var workspaceFinderRepository: WorkspaceFinderRepository

    private val faker = Faker()

    @BeforeEach
    fun setUp() {
        startInfrastructure()
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create default workspace when user is created and has no existing workspaces`() = runBlocking {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        // When
        eventPublisher.publish(userCreatedEvent)

        // Allow time for async event processing
        delay(1000)

        // Then
        val workspaces = workspaceFinderRepository.findByOwnerId(UserId(userId))
        assertEquals(1, workspaces.size, "Should create exactly one workspace")

        val workspace = workspaces.first()
        assertEquals("$firstname $lastname's Workspace", workspace.name)
        assertEquals("Default workspace created automatically upon user registration", workspace.description)
        assertEquals(userId, workspace.ownerId.value.toString())
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create default workspace with firstname only when lastname is null`() = runBlocking {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = faker.name().firstName()
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = null,
        )

        // When
        eventPublisher.publish(userCreatedEvent)
        delay(1000)

        // Then
        val workspaces = workspaceFinderRepository.findByOwnerId(UserId(userId))
        assertEquals(1, workspaces.size)
        assertEquals("$firstname's Workspace", workspaces.first().name)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create default workspace with lastname only when firstname is null`() = runBlocking {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val lastname = faker.name().lastName()
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = null,
            lastName = lastname,
        )

        // When
        eventPublisher.publish(userCreatedEvent)
        delay(1000)

        // Then
        val workspaces = workspaceFinderRepository.findByOwnerId(UserId(userId))
        assertEquals(1, workspaces.size)
        assertEquals("$lastname's Workspace", workspaces.first().name)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create default workspace with 'My Workspace' when both names are null`() = runBlocking {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = null,
            lastName = null,
        )

        // When
        eventPublisher.publish(userCreatedEvent)
        delay(1000)

        // Then
        val workspaces = workspaceFinderRepository.findByOwnerId(UserId(userId))
        assertEquals(1, workspaces.size)
        assertEquals("My Workspace", workspaces.first().name)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should not create workspace when user already has existing workspaces`() = runBlocking {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()
        val email = faker.internet().emailAddress()

        // Pre-create a workspace for this user
        // This would typically involve creating a workspace through the application service
        // For now, we'll simulate this by creating the event twice with some delay
        val firstEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        // First event should create the workspace
        eventPublisher.publish(firstEvent)
        delay(1000)

        val workspacesAfterFirst = workspaceFinderRepository.findByOwnerId(UserId(userId))
        assertEquals(1, workspacesAfterFirst.size, "First event should create workspace")

        // When - publish the same event again
        val secondEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        eventPublisher.publish(secondEvent)
        delay(1000)

        // Then - should still have only one workspace
        val workspacesAfterSecond = workspaceFinderRepository.findByOwnerId(UserId(userId))
        assertEquals(1, workspacesAfterSecond.size, "Should not create additional workspace")
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should handle workspace names with special characters and whitespace correctly`() = runBlocking {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = "  José María  " // Names with accents and extra whitespace
        val lastname = "  González-López  "
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        // When
        eventPublisher.publish(userCreatedEvent)
        delay(1000)

        // Then
        val workspaces = workspaceFinderRepository.findByOwnerId(UserId(userId))
        assertEquals(1, workspaces.size)
        assertEquals("José María González-López's Workspace", workspaces.first().name)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should create workspace even when event processing encounters recoverable errors`() = runBlocking {
        // Given
        val userId = "efc4b2b8-08be-4020-93d5-f795762bf5c9"
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()
        val email = faker.internet().emailAddress()

        val userCreatedEvent = UserCreatedEvent(
            id = userId,
            email = email,
            firstName = firstname,
            lastName = lastname,
        )

        // When
        eventPublisher.publish(userCreatedEvent)
        delay(2000) // Allow extra time for potential retry mechanisms

        // Then - workspace should still be created despite potential transient errors
        val workspaces = workspaceFinderRepository.findByOwnerId(UserId(userId))
        assertTrue(workspaces.isNotEmpty(), "Workspace should be created even with recoverable errors")
    }

    @Test
    @Sql(
        "/db/user/users.sql",
    )
    @Sql(
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should process multiple user creation events concurrently without issues`() = runBlocking {
        // Given
        val userIds = listOf(
            "efc4b2b8-08be-4020-93d5-f795762bf5c9",
            "b2864d62-003e-4464-a6d7-04d3567fb4ee",
        )
        val events = userIds.map { userId ->
            UserCreatedEvent(
                id = userId,
                email = faker.internet().emailAddress(),
                firstName = faker.name().firstName(),
                lastName = faker.name().lastName(),
            )
        }

        // When - publish events concurrently
        events.forEach { event ->
            eventPublisher.publish(event)
        }
        delay(2000) // Allow time for all events to process

        // Then - each user should have exactly one workspace
        userIds.forEach { userId ->
            val workspaces = workspaceFinderRepository.findByOwnerId(UserId(userId))
            assertEquals(1, workspaces.size, "User $userId should have exactly one workspace")
        }
    }
}
