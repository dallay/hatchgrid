package com.hatchgrid.thryve.newsletter.subscriber.application.create

import com.hatchgrid.common.domain.bus.command.Command
import com.hatchgrid.thryve.newsletter.subscriber.domain.Attributes

/**
 * Data class representing the command to subscribe to a newsletter.
 *
 * @property id The unique identifier of the subscriber.
 * @property email The email address of the subscriber.
 * @property firstname The first name of the subscriber.
 * @property lastname The last name of the subscriber. This can be null.
 * @property attributes Additional attributes associated with the subscriber.
 * @property workspaceId The identifier of the workspace the subscriber belongs to.
 */
data class SubscribeNewsletterCommand(
    val id: String,
    val email: String,
    val firstname: String? = null,
    val lastname: String? = null,
    val attributes: Attributes? = Attributes(),
    val workspaceId: String
) : Command
