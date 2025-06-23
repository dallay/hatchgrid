package com.hatchgrid.thryve.form.application.create

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.FormRepository
import com.hatchgrid.thryve.form.domain.event.FormCreatedEvent
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceAuthorizationException
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.util.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class CreateFormCommandHandlerTest {
    private lateinit var eventPublisher: EventPublisher<FormCreatedEvent>
    private lateinit var formRepository: FormRepository
    private lateinit var formCreator: FormCreator
    private val workspaceMemberRepository: WorkspaceMemberRepository = mockk()
    private val workspaceAuthorizationService: WorkspaceAuthorizationService =
        WorkspaceAuthorizationService(workspaceMemberRepository)
    private lateinit var createFormCommandHandler: CreateFormCommandHandler
    private lateinit var form: Form
    private val userId = UserId(UUID.randomUUID())

    @BeforeEach
    fun setUp() {
        eventPublisher = mockk()
        formRepository = mockk()
        formCreator = FormCreator(formRepository, eventPublisher)
        createFormCommandHandler =
            CreateFormCommandHandler(workspaceAuthorizationService, formCreator)
        form = FormStub.generateRandomForm()

        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                eq(form.workspaceId.value),
                eq(userId.value),
            )
        } returns true

        coEvery { formRepository.create(any<Form>()) } returns Unit
        coEvery { eventPublisher.publish(any<FormCreatedEvent>()) } returns Unit
    }

    @Test
    fun `should create a form`() = runBlocking {
        // Given
        val formId = UUID.randomUUID().toString()
        val command = CreateFormCommand(
            id = formId,
            name = form.name,
            header = form.header,
            description = form.description,
            inputPlaceholder = form.inputPlaceholder,
            buttonText = form.buttonText,
            buttonColor = form.buttonColor.hex,
            backgroundColor = form.backgroundColor.hex,
            textColor = form.textColor.hex,
            buttonTextColor = form.buttonTextColor.hex,
            workspaceId = form.workspaceId.value.toString(),
            userId = userId.value.toString(),
        )

        // When
        createFormCommandHandler.handle(command)

        // Then
        coVerify(exactly = 1) {
            formRepository.create(
                withArg {
                    assertEquals(formId, it.id.value.toString())
                    assertEquals(form.name, it.name)
                    assertEquals(form.header, it.header)
                    assertEquals(form.description, it.description)
                    assertEquals(form.inputPlaceholder, it.inputPlaceholder)
                    assertEquals(form.buttonText, it.buttonText)
                    assertEquals(form.buttonColor.hex, it.buttonColor.hex)
                    assertEquals(form.backgroundColor.hex, it.backgroundColor.hex)
                    assertEquals(form.textColor.hex, it.textColor.hex)
                    assertEquals(form.buttonTextColor.hex, it.buttonTextColor.hex)
                    assertEquals(form.workspaceId.value.toString(), it.workspaceId.value.toString())
                },
            )
        }

        coVerify(exactly = 1) { eventPublisher.publish(ofType<FormCreatedEvent>()) }
    }

    @Test
    fun `should throw exception when workspace authorization fails`() = runBlocking {
        // Given
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                eq(form.workspaceId.value),
                eq(userId.value),
            )
        } returns false

        val command = CreateFormCommand(
            id = UUID.randomUUID().toString(),
            name = form.name,
            header = form.header,
            description = form.description,
            inputPlaceholder = form.inputPlaceholder,
            buttonText = form.buttonText,
            buttonColor = form.buttonColor.hex,
            backgroundColor = form.backgroundColor.hex,
            textColor = form.textColor.hex,
            buttonTextColor = form.buttonTextColor.hex,
            workspaceId = form.workspaceId.value.toString(),
            userId = userId.value.toString(),
        )

        // When & Then
        org.junit.jupiter.api.assertThrows<WorkspaceAuthorizationException> {
            createFormCommandHandler.handle(command)
        }

        coVerify(exactly = 0) { formRepository.create(any<Form>()) }
        coVerify(exactly = 0) { eventPublisher.publish(any<FormCreatedEvent>()) }
    }

    @Test
    fun `should throw exception when form repository creation throws an error`() = runBlocking {
        // Given
        val command = CreateFormCommand(
            id = UUID.randomUUID().toString(),
            name = form.name,
            header = form.header,
            description = form.description,
            inputPlaceholder = form.inputPlaceholder,
            buttonText = form.buttonText,
            buttonColor = form.buttonColor.hex,
            backgroundColor = form.backgroundColor.hex,
            textColor = form.textColor.hex,
            buttonTextColor = form.buttonTextColor.hex,
            workspaceId = form.workspaceId.value.toString(),
            userId = userId.value.toString(),
        )
        coEvery { formRepository.create(any<Form>()) } throws RuntimeException("Error creating form")

        // When & Then
        org.junit.jupiter.api.assertThrows<RuntimeException> {
            createFormCommandHandler.handle(command)
        }

        coVerify(exactly = 1) { formRepository.create(any<Form>()) }
        coVerify(exactly = 0) { eventPublisher.publish(any<FormCreatedEvent>()) }
    }

    @Test
    fun `should throw exception when event publishing fails`() = runBlocking {
        // Given
        val command = CreateFormCommand(
            id = UUID.randomUUID().toString(),
            name = form.name,
            header = form.header,
            description = form.description,
            inputPlaceholder = form.inputPlaceholder,
            buttonText = form.buttonText,
            buttonColor = form.buttonColor.hex,
            backgroundColor = form.backgroundColor.hex,
            textColor = form.textColor.hex,
            buttonTextColor = form.buttonTextColor.hex,
            workspaceId = form.workspaceId.value.toString(),
            userId = userId.value.toString(),
        )
        coEvery { eventPublisher.publish(any<FormCreatedEvent>()) } throws RuntimeException("Error publishing event")

        // When & Then
        org.junit.jupiter.api.assertThrows<RuntimeException> {
            createFormCommandHandler.handle(command)
        }

        coVerify(exactly = 1) { formRepository.create(any<Form>()) }
        coVerify(exactly = 1) { eventPublisher.publish(any<FormCreatedEvent>()) }
    }
}
