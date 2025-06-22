package com.hatchgrid.thryve.form.application.create

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.FormRepository
import com.hatchgrid.thryve.form.domain.event.FormCreatedEvent
import org.slf4j.LoggerFactory

/**
 * Service class responsible for creating forms.
 *
 * @property formRepository Repository for accessing form data.
 * @property eventPublisher Publisher for broadcasting form created events.
 */
@Service
class FormCreator(
    private val formRepository: FormRepository,
    eventPublisher: EventPublisher<FormCreatedEvent>
) {
    private val eventPublisher = EventBroadcaster<FormCreatedEvent>()

    init {
        this.eventPublisher.use(eventPublisher)
    }

    /**
     * Creates a form and publishes a [FormCreatedEvent] for each domain event pulled from the form.
     *
     * @param form The form to be created.
     */
    suspend fun create(form: Form) {
        log.debug("Creating form with name: ${form.name}")
        formRepository.create(form)
        val domainEvents = form.pullDomainEvents()
        log.debug("Pulling {} events from form", domainEvents.size)
        domainEvents.forEach {
            eventPublisher.publish(it as FormCreatedEvent)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(FormCreator::class.java)
    }
}
