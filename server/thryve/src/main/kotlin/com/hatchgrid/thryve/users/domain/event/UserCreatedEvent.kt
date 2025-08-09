package com.hatchgrid.thryve.users.domain.event

import com.hatchgrid.common.domain.bus.event.BaseDomainEvent

/**
 * Represents an event that is triggered when a user is created.
 *
 * This event contains the details of the newly created user, including their ID, email,
 * first name, and last name.
 *
 * @created 8/7/23
 * @property id The unique identifier of the user.
 * @property email The email address of the user.
 * @property firstname The first name of the user, nullable if not provided.
 * @property lastname The last name of the user, nullable if not provided.
 */
data class UserCreatedEvent(
    val id: String,
    val email: String,
    val firstname: String?,
    val lastname: String?
) : BaseDomainEvent()
