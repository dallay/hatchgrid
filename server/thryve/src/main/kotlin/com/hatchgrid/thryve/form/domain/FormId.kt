package com.hatchgrid.thryve.form.domain

import com.hatchgrid.common.domain.BaseId
import java.util.*

/**
 * Represents a unique identifier for a form in the Hatchgrid application.
 *
 * @property id The UUID value of the form identifier.
 * @constructor Creates a FormId instance using a UUID or a string representation of a UUID.
 */
data class FormId(private val id: UUID) : BaseId<UUID>(id) {

    /**
     * Secondary constructor to create a FormId from a string representation of a UUID.
     *
     * @param id The string representation of the UUID.
     */
    constructor(id: String) : this(UUID.fromString(id))

    companion object {
        /**
         * Factory method to create a new FormId with a randomly generated UUID.
         *
         * @return A new instance of FormId.
         */
        fun create() = FormId(UUID.randomUUID())
    }
}
