package com.hatchgrid.common.domain.bus.event

import com.hatchgrid.common.domain.Generated
import java.time.LocalDateTime

/**
 * Represents a base domain event.
 *
 * All domain events in the system should extend this class.
 *
 * @property occuredOn The date and time when the event occured. Defaults to the current date and time if not specified.
 *
 *
 */
open class BaseDomainEvent(private val occuredOn: LocalDateTime = LocalDateTime.now()) : DomainEvent {
    private var eventVersion = 1

    /**
     * Returns the version of the event.
     *
     * @return The version of the event.
     */
    @Generated
    override fun eventVersion(): Int = eventVersion

    /**
     * Returns the LocalDateTime when this event occurred.
     *
     * @return the LocalDateTime when this event occurred
     */
    @Generated
    override fun occurredOn(): LocalDateTime = occuredOn
}
