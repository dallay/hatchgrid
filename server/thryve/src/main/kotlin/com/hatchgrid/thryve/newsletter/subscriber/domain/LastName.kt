package com.hatchgrid.thryve.newsletter.subscriber.domain

import com.hatchgrid.common.domain.BaseValidateValueObject
import com.hatchgrid.thryve.newsletter.subscriber.domain.exceptions.LastNameNotValidException

private const val NAME_LEN = 150

/**
 * Email value object
 * @param lastname last name value
 * @throws LastNameNotValidException if last name is not valid
 * @see BaseValidateValueObject
 * @see BaseValueObject
 * @see LastNameNotValidException
 */
data class LastName(val lastname: String) : BaseValidateValueObject<String>(lastname) {
    /**
     * Validate last name value object
     * @param value last name value
     * @throws LastNameNotValidException if last name is not valid
     */
    override fun validate(value: String) {
        val lastname = value.trim()
        if (lastname.isEmpty() || lastname.length > NAME_LEN) {
            throw LastNameNotValidException(value)
        }
    }

    override fun toString(): String = lastname
}
