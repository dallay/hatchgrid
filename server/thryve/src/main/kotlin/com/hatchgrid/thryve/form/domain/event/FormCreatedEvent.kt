package com.hatchgrid.thryve.form.domain.event

import com.hatchgrid.common.domain.bus.event.BaseDomainEvent

/**
 * Event that is triggered when a form is created
 *
 * @property formId The unique identifier of the created form.
 */
data class FormCreatedEvent(
    val formId: String,
) : BaseDomainEvent()
