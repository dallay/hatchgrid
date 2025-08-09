package com.hatchgrid.thryve.users.application.register

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.common.domain.vo.credential.Credential
import com.hatchgrid.common.domain.vo.email.Email
import com.hatchgrid.common.domain.vo.name.FirstName
import com.hatchgrid.common.domain.vo.name.LastName
import com.hatchgrid.thryve.users.domain.UserCreator
import com.hatchgrid.thryve.users.domain.event.UserCreatedEvent
import org.slf4j.LoggerFactory

/**
 * Service responsible for registering new users.
 *
 * @property userCreator The component responsible for creating user entities.
 * @property eventPublisher The publisher used to broadcast domain events.
 */
@Service
class UserRegistrator(
    private val userCreator: UserCreator,
    eventPublisher: EventPublisher<UserCreatedEvent>
) {
    private val eventBroadcaster = EventBroadcaster<UserCreatedEvent>()

    init {
        this.eventBroadcaster.use(eventPublisher)
    }

    /**
     * Registers a new user and broadcasts domain events.
     *
     * @param user The user entity to be registered.
     * @throws BusinessRuleValidationException If business rules are violated during user creation.
     * @throws Exception For any other unexpected errors during registration.
     */
    suspend fun registerNewUser(email: Email, credential: Credential, firstName: FirstName?, lastName: LastName?) {
        log.debug("Registering new user with email: {}", email.value)

        val createdUser = userCreator.create(
            email = email,
            credential = credential,
            firstName = firstName,
            lastName = lastName,
        )
        val domainEvents = createdUser.pullDomainEvents()
        log.debug("Pulling {} events from created user", domainEvents.size)

        domainEvents.filterIsInstance<UserCreatedEvent>().forEach {
            eventBroadcaster.publish(it)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(UserRegistrator::class.java)
    }
}
