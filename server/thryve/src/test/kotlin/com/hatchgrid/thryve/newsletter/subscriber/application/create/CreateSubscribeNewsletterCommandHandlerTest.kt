package com.hatchgrid.thryve.newsletter.subscriber.application.create

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberRepository
import com.hatchgrid.thryve.newsletter.subscriber.domain.event.SubscriberCreatedEvent
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.mockkClass
import java.util.UUID
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class CreateSubscribeNewsletterCommandHandlerTest {
    private lateinit var eventPublisher: EventPublisher<SubscriberCreatedEvent>
    private lateinit var subscriberRepository: SubscriberRepository
    private lateinit var subscriberRegistrator: SubscriberRegistrator
    private lateinit var createSubscribeNewsletterCommandHandler: CreateSubscribeNewsletterCommandHandler
    private lateinit var email: String
    private lateinit var firstname: String
    private lateinit var lastname: String

    @BeforeEach
    fun setUp() {
        eventPublisher = mockk()
        subscriberRepository = mockkClass(SubscriberRepository::class)
        subscriberRegistrator = SubscriberRegistrator(subscriberRepository, eventPublisher)
        createSubscribeNewsletterCommandHandler = CreateSubscribeNewsletterCommandHandler(subscriberRegistrator)
        email = "john.doe@hatchgrid.com"
        firstname = "John"
        lastname = "Doe"

        coEvery { subscriberRepository.create(any(Subscriber::class)) } returns Unit
        coEvery { eventPublisher.publish(any(SubscriberCreatedEvent::class)) } returns Unit
    }

    @Test
    fun `should register a subscriber`() = runBlocking {
        // Given
        val subscriberId = UUID.randomUUID().toString()
        val command = SubscribeNewsletterCommand(
            id = subscriberId,
            email = email,
            firstname = firstname,
            lastname = lastname,
            workspaceId = UUID.randomUUID().toString(),
        )

        // When
        createSubscribeNewsletterCommandHandler.handle(command)

        // Then
        coVerify(exactly = 1) {
            subscriberRepository.create(
                withArg {
                    assert(it.id.value.toString() == subscriberId)
                    assert(it.email.value == email)
                    assert(it.name.firstName?.value == firstname)
                    assert(it.name.lastName?.value == lastname)
                },
            )
        }
        coVerify(exactly = 1) { eventPublisher.publish(ofType<SubscriberCreatedEvent>()) }
    }
}
