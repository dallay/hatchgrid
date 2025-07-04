package com.hatchgrid.thryve.workspace.infrastructure.event.consumer

import com.hatchgrid.thryve.config.InfrastructureTestContainers
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.users.domain.event.UserCreatedEvent
import com.hatchgrid.thryve.workspace.application.find.member.AllWorkspaceByMemberFinder
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import net.datafaker.Faker
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import java.util.*

/**
 * Integration test for CreateDefaultWorkspaceOnUserCreation event consumer.
 * 
 * This test verifies the end-to-end behavior of automatic workspace creation
 * when a UserCreatedEvent is published.
 */
@SpringBootTest
class CreateDefaultWorkspaceOnUserCreationIntegrationTest : InfrastructureTestContainers() {

    @Autowired
    private lateinit var consumer: CreateDefaultWorkspaceOnUserCreation

    @Autowired
    private lateinit var workspaceFinder: AllWorkspaceByMemberFinder

    private val faker = Faker()

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun dynamicProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") { postgreSQLContainer.jdbcUrl }
            registry.add("spring.datasource.username") { postgreSQLContainer.username }
            registry.add("spring.datasource.password") { postgreSQLContainer.password }
        }
    }

    @BeforeEach
    fun setUp() {
        startInfrastructure()
    }

    @Test
    fun `should create default workspace when user is created`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()
        val userCreatedEvent = UserCreatedEvent(
            userId = userId,
            email = faker.internet().emailAddress(),
            username = faker.internet().username(),
            firstname = firstname,
            lastname = lastname
        )

        // When
        consumer.consume(userCreatedEvent)

        // Allow some time for async processing
        delay(1000)

        // Then
        val workspaces = workspaceFinder.findAll(userId)
        
        assertEquals(1, workspaces.workspaces.size)
        val workspace = workspaces.workspaces.first()
        assertEquals("$firstname $lastname's Workspace", workspace.name)
        assertEquals("Default workspace created automatically upon user registration", workspace.description)
        assertEquals(userId, workspace.ownerId)
    }

    @Test
    fun `should not create workspace when user already has workspaces`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val firstname = faker.name().firstName()
        val lastname = faker.name().lastName()
        
        // First, create a user event that will create the first workspace
        val firstEvent = UserCreatedEvent(
            userId = userId,
            email = faker.internet().emailAddress(),
            username = faker.internet().username(),
            firstname = firstname,
            lastname = lastname
        )
        
        consumer.consume(firstEvent)
        delay(1000) // Wait for first workspace creation
        
        // Verify first workspace was created
        val workspacesAfterFirst = workspaceFinder.findAll(userId)
        assertEquals(1, workspacesAfterFirst.workspaces.size)

        // When - simulate another user created event (e.g., user sync from Keycloak)
        val secondEvent = UserCreatedEvent(
            userId = userId,
            email = faker.internet().emailAddress(),
            username = faker.internet().username(),
            firstname = firstname,
            lastname = lastname
        )
        
        consumer.consume(secondEvent)
        delay(1000) // Wait for potential second workspace creation

        // Then - should still have only one workspace
        val workspacesAfterSecond = workspaceFinder.findAll(userId)
        assertEquals(1, workspacesAfterSecond.workspaces.size)
    }

    @Test
    fun `should create workspace with 'My Workspace' name when names are missing`() = runBlocking {
        // Given
        val userId = UUID.randomUUID().toString()
        val userCreatedEvent = UserCreatedEvent(
            userId = userId,
            email = faker.internet().emailAddress(),
            username = faker.internet().username(),
            firstname = null,
            lastname = null
        )

        // When
        consumer.consume(userCreatedEvent)
        delay(1000)

        // Then
        val workspaces = workspaceFinder.findAll(userId)
        
        assertEquals(1, workspaces.workspaces.size)
        val workspace = workspaces.workspaces.first()
        assertEquals("My Workspace", workspace.name)
        assertEquals(userId, workspace.ownerId)
    }
}