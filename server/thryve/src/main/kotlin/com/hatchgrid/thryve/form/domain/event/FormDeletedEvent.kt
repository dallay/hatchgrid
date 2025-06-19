package com.hatchgrid.thryve.form.domain.event

import com.hatchgrid.common.domain.bus.event.BaseDomainEvent

/**
 * Represents an event that is triggered when a form is deleted in the Hatchgrid application.
 *
 * @property formId The unique identifier of the form that was deleted.
 */
data class FormDeletedEvent(
    val formId: String,
) : BaseDomainEvent()
